import { FastifyPluginAsync } from 'fastify';
import { q } from '../db.ts';
import packSchema from '../../../../packages/schemas/content-pack.schema.json' assert { type: 'json' };
import { ensureValid } from '../../../../packages/utils/validate.ts';
import { llm } from '../services/llm.ts';
import { logEvent } from '../services/telemetry.ts';

const routes: FastifyPluginAsync = async (app) => {
    app.get('/', async (req: any) => {
        const packs = await q(`
            SELECT pack_id, status, draft_markdown, derivatives, seo, created_at, brief_id
            FROM content_packs 
            ORDER BY created_at DESC
        `)

        const safeParse = (val: any) => {
            if (!val) return null
            if (typeof val === 'string') return JSON.parse(val)
            return val
        }

        return packs.map((p: any) => ({
            pack_id: p.pack_id,
            status: p.status,
            draft_markdown: p.draft_markdown,
            derivatives: safeParse(p.derivatives),
            seo: safeParse(p.seo),
            created_at: p.created_at,
            brief_id: p.brief_id
        }))
    });

    app.get('/:pack_id', async (req: any) => {
        const { pack_id } = req.params
        const [p] = await q('SELECT * FROM content_packs WHERE pack_id=$1', [pack_id])
        if (!p) return { error: 'Pack not found' }

        const safeParse = (val: any) => {
            if (!val) return null
            if (typeof val === 'string') return JSON.parse(val)
            return val
        }

        return {
            ...p,
            claims_ledger: safeParse(p.claims_ledger),
            derivatives: safeParse(p.derivatives),
            seo: safeParse(p.seo),
            distribution_plan: safeParse(p.distribution_plan)
        }
    });

    app.patch('/:pack_id', async (req: any) => {
        const { pack_id } = req.params
        const { draft_markdown, derivatives, seo } = req.body

        console.log('PATCH /packs/:pack_id - Received draft_markdown length:', draft_markdown?.length)
        console.log('PATCH /packs/:pack_id - First 200 chars:', draft_markdown?.substring(0, 200))

        const updates: string[] = []
        const values: any[] = []
        let paramCount = 1

        if (draft_markdown !== undefined) {
            updates.push(`draft_markdown=$${paramCount++}`)
            values.push(draft_markdown)
        }
        if (derivatives !== undefined) {
            updates.push(`derivatives=$${paramCount++}`)
            values.push(JSON.stringify(derivatives))
        }
        if (seo !== undefined) {
            updates.push(`seo=$${paramCount++}`)
            values.push(JSON.stringify(seo))
        }

        if (updates.length > 0) {
            values.push(pack_id)
            await q(`UPDATE content_packs SET ${updates.join(', ')} WHERE pack_id=$${paramCount}`, values)
        }

        return { ok: true, updated: updates.length }
    });

    app.post('/draft', async (req: any) => {
        const { pack_id, brief_id, audience, language = 'en' } = req.body;
        const [rawBrief] = await q('SELECT * FROM briefs WHERE brief_id=$1', [brief_id]);

        const safeParse = (val: any) => {
            if (!val) return []
            if (typeof val === 'string') return JSON.parse(val)
            return val
        }

        const brief = {
            ...rawBrief,
            key_points: safeParse(rawBrief.key_points),
            outline: safeParse(rawBrief.outline),
            claims_ledger: safeParse(rawBrief.claims_ledger)
        }

        const system = language === 'vn'
            ? 'Bạn là một nhà văn nội dung. Viết một bài báo 1200-1600 từ ở định dạng markdown. Sử dụng cấp độ đọc ≤10. Bao gồm tất cả các tuyên bố từ bản tóm tắt với nguồn.'
            : 'You are a content writer. Write a 1200-1600 word article in markdown format. Use grade ≤10 reading level. Include all claims from the brief with sources.';

        const user = language === 'vn'
            ? `Bản tóm tắt:\nĐiểm chính: ${JSON.stringify(brief.key_points)}\nDàn ý: ${JSON.stringify(brief.outline)}\nTuyên bố: ${JSON.stringify(brief.claims_ledger)}\n\nĐối tượng: ${audience}\n\nViết bài báo ở định dạng JSON: {"draft_markdown":"...nội dung markdown...","claims_ledger":[...cùng tuyên bố từ bản tóm tắt...]}`
            : `Brief:\nKey Points: ${JSON.stringify(brief.key_points)}\nOutline: ${JSON.stringify(brief.outline)}\nClaims: ${JSON.stringify(brief.claims_ledger)}\n\nAudience: ${audience}\n\nWrite the article in JSON format: {"draft_markdown":"...markdown content...","claims_ledger":[...same claims from brief...]}`;

        const result = await llm.completeJSON({
            model: process.env.LLM_MODEL!, system, user, jsonSchema: {
                type: 'object', required: ['draft_markdown', 'claims_ledger'],
                properties: {
                    draft_markdown: { type: 'string' },
                    claims_ledger: { type: 'array', items: { type: 'object' } }
                }
            }
        });

        const draft = result.draft || result
        console.log('Draft created, length:', draft.draft_markdown?.length || 0)

        await q('INSERT INTO content_packs(pack_id, brief_id, draft_markdown, claims_ledger, status) VALUES ($1,$2,$3,$4,$5) ON CONFLICT (pack_id) DO UPDATE SET draft_markdown=$3,claims_ledger=$4,status=$5', [
            pack_id, brief_id, draft.draft_markdown, JSON.stringify(draft.claims_ledger || []), 'draft'
        ]);

        await logEvent({
            event_type: 'pack.draft_created',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            brief_id,
            pack_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone,
            payload: { length: draft.draft_markdown?.length || 0 }
        });

        return { pack_id, ...draft };
    });

    app.post('/derivatives', async (req: any, reply) => {
        try {
            const { pack_id, language = 'en' } = req.body
            console.log('Generating derivatives for pack:', pack_id)

            const [pack] = await q('SELECT * FROM content_packs WHERE pack_id=$1', [pack_id])
            if (!pack) {
                return reply.status(404).send({ ok: false, error: 'Pack not found' })
            }
            if (!pack.draft_markdown) {
                return reply.status(400).send({ ok: false, error: 'No draft content available' })
            }

            console.log('Pack found, draft length:', pack.draft_markdown.length)

            const derivativesSchema = {
                type: 'object',
                required: ['newsletter', 'linkedin', 'x'],
                properties: {
                    newsletter: { type: 'string' },
                    video_script: { type: 'string' },
                    linkedin: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 },
                    x: { type: 'array', items: { type: 'string' }, minItems: 3, maxItems: 3 }
                }
            }

            const system = language === 'vn'
                ? 'Bạn là một người tái sử dụng nội dung. Tạo nội dung đa kênh từ bài báo.'
                : 'You are a content repurposer. Create multi-channel content from the article.';

            const user = language === 'vn'
                ? `Bài báo:\n${pack.draft_markdown}\n\nTạo JSON với:\n- newsletter: phiên bản email (300-500 từ)\n- video_script: kịch bản 60 giây\n- linkedin: mảng chính xác 3 bài đăng LinkedIn (mỗi bài 100-150 từ)\n- x: mảng chính xác 3 bài đăng X/Twitter (mỗi bài <280 ký tự)`
                : `Article:\n${pack.draft_markdown}\n\nCreate JSON with:\n- newsletter: email version (300-500 words)\n- video_script: 60-second script\n- linkedin: array of exactly 3 LinkedIn posts (each 100-150 words)\n- x: array of exactly 3 X/Twitter posts (each <280 chars)`

            console.log('Calling LLM for derivatives...')
            const derivatives = await llm.completeJSON({ model: process.env.LLM_MODEL!, system, user, jsonSchema: derivativesSchema })
            console.log('Derivatives generated:', derivatives)

            const seoSystem = 'Generate SEO metadata.'
            const seoUser = `Article:\n${pack.draft_markdown}\n\nCreate JSON with: {title: string (50-60 chars), description: string (150-160 chars), keywords: array of strings}`
            console.log('Calling LLM for SEO...')
            const seo = await llm.completeJSON({
                model: process.env.LLM_MODEL!, system: seoSystem, user: seoUser, jsonSchema: {
                    type: 'object',
                    required: ['title', 'description'],
                    properties: {
                        title: { type: 'string' },
                        description: { type: 'string' },
                        keywords: { type: 'array', items: { type: 'string' } }
                    }
                }
            })
            console.log('SEO generated:', seo)

            console.log('Derivatives created:', { linkedin: derivatives.linkedin?.length, x: derivatives.x?.length })

            await q('UPDATE content_packs SET derivatives=$2, seo=$3, status=$4 WHERE pack_id=$1', [pack_id, JSON.stringify(derivatives), JSON.stringify(seo), 'ready_for_review']);

            const nLi = Array.isArray(derivatives.linkedin) ? derivatives.linkedin.length : 0;
            const nX = Array.isArray(derivatives.x) ? derivatives.x.length : 0;
            try {
                await logEvent({
                    event_type: 'pack.derivatives_created',
                    actor_id: (req as any).actor_id,
                    actor_role: (req as any).actor_role,
                    pack_id,
                    request_id: (req as any).request_id,
                    timezone: (req as any).timezone,
                    payload: { linkedin: nLi, x: nX }
                });
            } catch (e) {
                console.warn('Telemetry log failed for pack.derivatives_created:', e)
                // Non-fatal: continue to return success to the client
            }
            return { pack_id, derivatives, seo };
        } catch (err: any) {
            console.error('Derivatives generation error:', err)

            // Check if it's an API key issue
            if (err.message?.includes('API key') || err.message?.includes('authentication') || err.message?.includes('401')) {
                return reply.status(500).send({
                    ok: false,
                    error: 'LLM API key not configured. Please go to Settings page to configure your API key.',
                    details: err.message
                })
            }

            return reply.status(500).send({ ok: false, error: 'Failed to generate derivatives', details: err.message })
        }
    });

    app.post('/publish', async (req: any, reply) => {
        try {
            const { pack_id } = req.body
            const [p] = await q('SELECT * FROM content_packs WHERE pack_id=$1', [pack_id])

            // basic checks
            if (!p) {
                return reply.status(404).send({ ok: false, error: 'Pack not found' })
            }
            if (!p.draft_markdown) {
                return reply.status(400).send({ ok: false, error: 'No draft content available' })
            }

            const safeParse = (val: any) => {
                if (!val) return []
                if (typeof val === 'string') {
                    try {
                        return JSON.parse(val)
                    } catch (e) {
                        console.error('Failed to parse claims_ledger:', e)
                        return []
                    }
                }
                return val
            }

            const ledger = safeParse(p.claims_ledger)
            console.log('Publishing pack:', pack_id, 'claims_ledger type:', typeof p.claims_ledger, 'parsed length:', ledger.length)

            if (!Array.isArray(ledger) || ledger.length === 0) {
                return reply.status(400).send({ ok: false, error: 'Empty claims ledger - content must have verifiable claims' })
            }

            console.log('Publishing pack:', pack_id, 'with', ledger.length, 'claims')
            // style guard (example)
            // const sc = styleCheck(p.draft_markdown, ['banned term 1']); if(!sc.ok) throw new Error('Style check fail: '+sc.fails.join(','));
            await q('UPDATE content_packs SET status=$2 WHERE pack_id=$1', [pack_id, 'published']);
            await logEvent({
                event_type: 'pack.published',
                actor_id: (req as any).actor_id,
                actor_role: (req as any).actor_role,
                pack_id,
                request_id: (req as any).request_id,
                timezone: (req as any).timezone
            });
            return { ok: true };
        } catch (err: any) {
            console.error('Publish error:', err)
            return reply.status(500).send({ ok: false, error: 'Internal server error', details: err.message })
        }
    });

};
export default routes;
