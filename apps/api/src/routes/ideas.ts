import { FastifyPluginAsync } from 'fastify';
import { randomUUID } from 'crypto';
import { q } from '../db.ts';
import { llm } from '../services/llm.ts';
import { logEvent } from '../services/telemetry.ts';
import ideaSchema from '../../../../packages/schemas/idea.schema.json' assert { type: 'json' };
import { ensureValid } from '../../../../packages/utils/validate.ts';

const routes: FastifyPluginAsync = async (app) => {
    // List ideas (with optional tag filter)
    app.get('/', async (req: any) => {
        const { tags } = req.query;
        if (tags) {
            // Filter by tags - supports comma-separated list
            const tagArray = Array.isArray(tags) ? tags : tags.split(',');
            return q('SELECT * FROM ideas WHERE tags && $1 ORDER BY created_at DESC', [tagArray]);
        }
        return q('SELECT * FROM ideas ORDER BY created_at DESC');
    });

    // Generate 10 ideas
    app.post('/generate', async (req: any) => {
        const { persona, industry, corpus_hints, language = 'en' } = req.body;
        const system = language === 'vn'
            ? 'Bạn là một chiến lược gia nội dung. Tạo ra những ý tưởng nội dung sáng tạo, dựa trên dữ liệu.'
            : 'You are a content strategist. Generate innovative, data-driven content ideas.';

        const user = language === 'vn'
            ? `Tạo ra chính xác 10 ý tưởng nội dung cho:
Persona: ${persona}
Ngành: ${industry}
Gợi ý corpus: ${corpus_hints || 'không có'}

Mỗi ý tưởng phải là một đối tượng JSON với các trường bắt buộc:
- idea_id: chuỗi ID duy nhất (ví dụ: "idea-uuid")
- one_liner: tiêu đề ngắn gọn
- angle: góc nhìn độc đáo tùy chọn
- personas: mảng chuỗi đối tượng mục tiêu
- why_now: mảng lý do thời gian/liên quan
- evidence: mảng đối tượng với {url, quote, title?}
- scores: đối tượng với {novelty: 0-5, demand: 0-5, fit: 0-5, white_space: 0-5}
- status: "proposed"
- tags: mảng các thẻ phân loại tùy chọn (ví dụ: ["AI", "startup", "tech"])

Trả về mảng JSON của 10 ý tưởng.`
            : `Generate exactly 10 content ideas for:
Persona: ${persona}
Industry: ${industry}
Corpus hints: ${corpus_hints || 'n/a'}

Each idea must be a JSON object with these required fields:
- idea_id: unique string ID (e.g., "idea-uuid")
- one_liner: concise headline
- angle: optional unique perspective
- personas: array of target audience strings
- why_now: array of timing/relevance reasons
- evidence: array of objects with {url, quote, title?}
- scores: object with {novelty: 0-5, demand: 0-5, fit: 0-5, white_space: 0-5}
- status: "proposed"
- tags: optional array of categorization tags (e.g., ["AI", "startup", "tech"])

Return JSON with format: {"ideas": [array of 10 idea objects]}`;
        const result = await llm.completeJSON({
            model: process.env.LLM_MODEL, system, user, jsonSchema: {
                type: 'object',
                required: ['ideas'],
                properties: { ideas: { type: 'array', items: ideaSchema } }
            }
        });
        const rawIdeas = Array.isArray(result) ? result : (result?.ideas || result?.data || []);
        const ideas = Array.isArray(rawIdeas) ? rawIdeas : [];
        console.log('LLM returned:', ideas.length, 'ideas (pre-validate)');
        // persist
        let savedCount = 0;
        for (const it of ideas) {
            try {
                const normalized = {
                    idea_id: it?.idea_id || `idea-${randomUUID()}`,
                    one_liner: it?.one_liner || 'Untitled idea',
                    angle: it?.angle || null,
                    personas: Array.isArray(it?.personas) ? it.personas : [],
                    why_now: Array.isArray(it?.why_now) ? it.why_now : [],
                    evidence: Array.isArray(it?.evidence) ? it.evidence : [],
                    scores: it?.scores || { novelty: 3, demand: 3, fit: 3, white_space: 3 },
                    status: it?.status || 'proposed',
                    tags: Array.isArray(it?.tags) ? it.tags : []
                };
                ensureValid(ideaSchema, normalized);
                await q(
                    'INSERT INTO ideas(idea_id, one_liner, angle, personas, why_now, evidence, scores, status, tags) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (idea_id) DO NOTHING',
                    [
                        normalized.idea_id,
                        normalized.one_liner,
                        normalized.angle,
                        normalized.personas,
                        normalized.why_now,
                        JSON.stringify(normalized.evidence),
                        JSON.stringify(normalized.scores),
                        normalized.status,
                        normalized.tags
                    ]
                );
                savedCount += 1;
            } catch (e) {
                console.error('Failed to save idea:', e);
            }
        }
        console.log('Ideas saved:', savedCount);
        await logEvent({
            event_type: 'idea.generated',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone,
            payload: { count: savedCount }
        });
        return ideas;
    });
    // Update tags for an idea
    app.patch('/:idea_id/tags', async (req: any) => {
        const { idea_id } = req.params;
        const { tags } = req.body;

        if (!Array.isArray(tags)) {
            return { ok: false, error: 'Tags must be an array' };
        }

        await q('UPDATE ideas SET tags=$2 WHERE idea_id=$1', [idea_id, tags]);
        await logEvent({
            event_type: 'idea.tags_updated',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            idea_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone,
            payload: { tags }
        });
        return { ok: true, tags };
    });

    // Select an idea
    app.post('/:idea_id/select', async (req: any) => {
        const { idea_id } = req.params;
        await q('UPDATE ideas SET status=$2 WHERE idea_id=$1', [idea_id, 'selected']);
        await logEvent({
            event_type: 'idea.selected',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            idea_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone
        });
        return { ok: true };
    });

    // Delete an idea
    app.delete('/:idea_id', async (req: any, reply) => {
        const { idea_id } = req.params;
        const res = await q('DELETE FROM ideas WHERE idea_id=$1 RETURNING idea_id', [idea_id]);
        if ((res as any)?.rowCount === 0) {
            return reply.status(404).send({ ok: false, error: 'Idea not found' });
        }
        await logEvent({
            event_type: 'idea.deleted',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            idea_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone
        });
        return { ok: true };
    });
};
export default routes;
