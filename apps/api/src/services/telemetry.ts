// apps/api/src/services/telemetry.ts
import { q } from '../db.ts';

export async function logEvent(e: {
    event_type: string;
    actor_id?: string;
    actor_role?: string;
    idea_id?: string;
    brief_id?: string;
    pack_id?: string;
    request_id?: string;
    timezone?: string;
    version?: number;
    payload?: any;
}) {
    const row = {
        ...e,
        version: e.version ?? 1,
        timezone: e.timezone ?? 'UTC',
    };
    await q(
        `INSERT INTO events(event_type, actor_id, actor_role, idea_id, brief_id, pack_id, request_id, timezone, version, payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [row.event_type, row.actor_id, row.actor_role, row.idea_id, row.brief_id, row.pack_id, row.request_id, row.timezone, row.version, JSON.stringify(row.payload || {})]
    );
}
