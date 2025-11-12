import { FastifyPluginAsync } from 'fastify';
import { q } from '../db.ts';
import briefSchema from '../../../../packages/schemas/brief.schema.json' assert { type: 'json' };
import { ensureValid } from '../../../../packages/utils/validate.ts';
import { llm } from '../services/llm.ts';
import { retrieve } from '../services/rag.ts';
import { logEvent } from '../services/telemetry.ts';

const routes: FastifyPluginAsync = async (app) => {
    app.get('/:brief_id', async (req: any) => {
        const { brief_id } = req.params
        const [b] = await q('SELECT * FROM briefs WHERE brief_id=$1', [brief_id])
        if (!b) return { error: 'Brief not found' }

        const safeParse = (val: any) => {
            if (!val) return []
            if (typeof val === 'string') return JSON.parse(val)
            return val
        }

        return {
            ...b,
            key_points: safeParse(b.key_points),
            counterpoints: safeParse(b.counterpoints),
            outline: safeParse(b.outline),
            claims_ledger: safeParse(b.claims_ledger)
        }
    });

    app.post('/generate', async (req: any) => {
        const { brief_id, idea_id, query, language = 'en' } = req.body;
        let snippets = []
        try {
            const hits = await retrieve(query, 8, llm.embed);
            snippets = hits.map((h: any) => ({ url: `doc:${h.doc_id}`, quote: h.content.slice(0, 300) }));
        } catch (err) {
            console.log('RAG retrieval skipped (no docs):', err)
            snippets = [{ url: 'placeholder', quote: 'No knowledge base documents available' }]
        }

        const contentSchema = {
            type: 'object',
            required: ['outline', 'claims_ledger'],
            properties: {
                key_points: briefSchema.properties.key_points,
                counterpoints: briefSchema.properties.counterpoints,
                outline: briefSchema.properties.outline,
                claims_ledger: briefSchema.properties.claims_ledger
            }
        }

        const system = language === 'vn'
            ? 'Bạn là một nhà nghiên cứu. Xây dựng một bản tóm tắt với dàn ý và sổ cái tuyên bố. Định dạng: {"key_points":[],"outline":[{h2:"",bullets:[]}],"claims_ledger":[{claim:"",sources:[{url:""}]}]}'
            : 'You are a researcher. Build a brief with outline and a claims_ledger. Format: {"key_points":[],"outline":[{h2:"",bullets:[]}],"claims_ledger":[{claim:"",sources:[{url:""}]}]}';

        const user = language === 'vn'
            ? `Chủ đề: ${query}\nÝ tưởng: ${idea_id}\nBằng chứng:\n${JSON.stringify(snippets, null, 2)}\n\nTạo một bản tóm tắt nghiên cứu ở định dạng JSON.`
            : `Topic: ${query}\nIdea: ${idea_id}\nEvidence:\n${JSON.stringify(snippets, null, 2)}\n\nCreate a research brief in JSON format.`;
        
        let brief;
        try {
            const result = await llm.completeJSON({ model: process.env.LLM_MODEL!, system, user, jsonSchema: contentSchema });
            brief = result.brief || result;
        } catch (error) {
            console.log('LLM failed, using fallback brief:', error);
            // Fallback brief when LLM fails
            brief = {
                key_points: [
                    `Research topic: ${query}`,
                    "Key insights to be developed",
                    "Supporting evidence analysis",
                    "Strategic implications"
                ],
                counterpoints: [
                    "Alternative perspectives to consider",
                    "Potential limitations or challenges"
                ],
                outline: [
                    { h2: "Introduction", bullets: ["Overview of the topic", "Current landscape"] },
                    { h2: "Key Findings", bullets: ["Primary insights", "Supporting data"] },
                    { h2: "Analysis", bullets: ["Deep dive into implications", "Comparison with alternatives"] },
                    { h2: "Conclusion", bullets: ["Summary of recommendations", "Next steps"] }
                ],
                claims_ledger: [
                    { claim: "This is a placeholder claim about the topic", sources: [{ url: "placeholder" }] }
                ]
            };
        }
        console.log('Generated brief:', JSON.stringify(brief).slice(0, 200))
        ensureValid(contentSchema, brief);
        await q('INSERT INTO briefs(brief_id, idea_id, key_points, counterpoints, outline, claims_ledger) VALUES ($1,$2,$3,$4,$5,$6) ON CONFLICT (brief_id) DO UPDATE SET key_points=$3,counterpoints=$4,outline=$5,claims_ledger=$6', [
            brief_id, idea_id, JSON.stringify(brief.key_points || []), JSON.stringify(brief.counterpoints || []), JSON.stringify(brief.outline || []), JSON.stringify(brief.claims_ledger || [])
        ]);
        await logEvent({
            event_type: 'brief.created',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            idea_id,
            brief_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone,
            payload: { claims: (brief.claims_ledger || []).length }
        });
        return brief;
    });

    app.post('/:brief_id/approve', async (req: any) => {
        const { brief_id } = req.params;
        await logEvent({
            event_type: 'brief.approved',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            brief_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone
        });
        return { ok: true };
    });
};
export default routes;
