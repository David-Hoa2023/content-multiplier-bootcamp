import Fastify from 'fastify';
import ideas from './routes/ideas.ts';
import briefs from './routes/briefs.ts';
import packs from './routes/packs.ts';
import rag from './routes/rag.ts';
import events from './routes/events.ts';
import settings from './routes/settings.ts';
import publishing from './routes/publishing.ts';
import twitterBot from './routes/twitter-bot.ts';
import { env } from './env.ts';
import { logEvent } from './services/telemetry.ts';

const app = Fastify({ logger: true });

// Add CORS headers manually
app.addHook('preHandler', async (request, reply) => {
    reply.header('Access-Control-Allow-Origin', 'http://localhost:3001');
    reply.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    reply.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    reply.header('Access-Control-Allow-Credentials', 'true');
    
    if (request.method === 'OPTIONS') {
        reply.status(200).send();
        return;
    }
});

app.register(ideas, { prefix: '/api/ideas' });
app.register(briefs, { prefix: '/api/briefs' });
app.register(packs, { prefix: '/api/packs' });
app.register(rag, { prefix: '/api/rag' });
app.register(events, { prefix: '/api/events' });
app.register(settings, { prefix: '/api/settings' });
app.register(publishing, { prefix: '/api/publishing' });
app.register(twitterBot);

app.setErrorHandler(async (err, req, reply) => {
    console.error('Error:', err);
    try {
        await logEvent({
            event_type: 'error.occurred',
            actor_role: 'system',
            request_id: (req as any).request_id || req.id,
            timezone: 'UTC',
            payload: {
                route: req.routeOptions?.url || req.url,
                code: (err as any).code || 'ERR',
                msg: (err?.message || '').slice(0, 500)
            }
        });
    } catch { }
    reply.status(500).send({ ok: false, error: 'internal_error' });
});

app.listen({ port: Number(env.PORT || 3001), host: '0.0.0.0' })
    .catch((e) => { app.log.error(e); process.exit(1); });

// apps/api/src/index.ts
import contextPlugin from './plugins/context.ts';
app.register(contextPlugin);
