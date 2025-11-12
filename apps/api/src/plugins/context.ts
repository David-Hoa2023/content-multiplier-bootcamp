// apps/api/src/plugins/context.ts
import fp from 'fastify-plugin';

export default fp(async (app) => {
    app.addHook('onRequest', async (req) => {
        // Giả sử bạn đã có auth (JWT/cookie); nếu chưa, tạm thời mock user
        const user = (req.headers['x-user-id'] as string) || 'user_demo';
        const role = (req.headers['x-user-role'] as string) || 'WR'; // 'CL'|'WR'|'MOps'
        (req as any).actor_id = user;
        (req as any).actor_role = role;
        (req as any).request_id = req.id;                   // Fastify tự cấp
        (req as any).timezone = 'Asia/Bangkok';             // Hiển thị BI
    });
});
