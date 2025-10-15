import { FastifyPluginAsync } from 'fastify';
import { upsertDocument, retrieve } from '../services/rag.ts';
import { llm } from '../services/llm.ts';

const routes: FastifyPluginAsync = async (app) => {
    app.post('/ingest', async (req: any) => {
        const { doc_id, title, url, raw } = req.body;
        return upsertDocument({ doc_id, title, url, raw }, llm.embed);
    });
    app.get('/search', async (req: any) => {
        const { q } = req.query;
        return retrieve(q, 5, llm.embed);
    });
};
export default routes;
