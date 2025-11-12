import { FastifyPluginAsync } from 'fastify';
import { toCSV, toICS } from '../services/distribution.ts';
import { q } from '../db.ts';
import { logEvent } from '../services/telemetry.ts';

const routes: FastifyPluginAsync = async (app) => {
    app.get('/distribution/:pack_id.csv', async (req: any, reply: any) => {
        const { pack_id } = req.params;
        const [p] = await q('SELECT distribution_plan FROM content_packs WHERE pack_id=$1', [pack_id]);
        const plan = p.distribution_plan || { items: [] };
        const csv = toCSV(plan);
        await logEvent({
            event_type: 'distribution.exported',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            pack_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone,
            payload: { export_type: 'csv', items: (plan.items || []).length }
        });
        reply.headers({ 'Content-Type': 'text/csv' }).send(csv);
    });
    app.get('/distribution/:pack_id.ics', async (req: any, reply: any) => {
        const { pack_id } = req.params;
        const [p] = await q('SELECT distribution_plan FROM content_packs WHERE pack_id=$1', [pack_id]);
        const plan = p.distribution_plan || { items: [] };
        const ics = toICS(plan);
        await logEvent({
            event_type: 'distribution.exported',
            actor_id: (req as any).actor_id,
            actor_role: (req as any).actor_role,
            pack_id,
            request_id: (req as any).request_id,
            timezone: (req as any).timezone,
            payload: { export_type: 'ics', items: (plan.items || []).length }
        });
        reply.headers({ 'Content-Type': 'text/calendar' }).send(ics);
    });
};
export default routes;
