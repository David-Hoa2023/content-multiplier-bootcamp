import { ensureValid } from '../../../../packages/utils/validate.ts';
import packSchema from '../../../../packages/schemas/content-pack.schema.json' assert { type: 'json' };
import { logEvent } from './telemetry';

type GuardrailContext = {
    actor_id?: string;
    actor_role?: string;
    request_id?: string;
    timezone?: string;
    pack_id?: string;
};

export function claimsHaveSources(claims: any[]): boolean {
    return (claims || []).every(c => Array.isArray(c.sources) && c.sources.length >= 1 && !!c.sources[0].url);
}

export function styleCheck(md: string, banned: string[] = []) {
    const fails = banned.filter(b => md.toLowerCase().includes(b.toLowerCase()));
    return { ok: fails.length === 0, fails };
}

export async function validatePack(pack: any, ctx?: GuardrailContext) {
    // Schema check
    try {
        ensureValid(packSchema, pack);
        await logEvent({
            event_type: 'guardrail.pass',
            actor_id: ctx?.actor_id,
            actor_role: ctx?.actor_role,
            pack_id: ctx?.pack_id,
            request_id: ctx?.request_id,
            timezone: ctx?.timezone,
            payload: { subtype: 'schema', ok: true, reasons: [] }
        });
    } catch (err: any) {
        await logEvent({
            event_type: 'guardrail.fail',
            actor_id: ctx?.actor_id,
            actor_role: ctx?.actor_role,
            pack_id: ctx?.pack_id,
            request_id: ctx?.request_id,
            timezone: ctx?.timezone,
            payload: { subtype: 'schema', ok: false, reasons: [String(err?.message || 'schema validation failed')] }
        });
        throw err;
    }

    // Citations check
    if (pack.claims_ledger) {
        const ok = claimsHaveSources(pack.claims_ledger);
        await logEvent({
            event_type: `guardrail.${ok ? 'pass' : 'fail'}`,
            actor_id: ctx?.actor_id,
            actor_role: ctx?.actor_role,
            pack_id: ctx?.pack_id,
            request_id: ctx?.request_id,
            timezone: ctx?.timezone,
            payload: { subtype: 'citations', ok, reasons: ok ? [] : ['orphan claim found'] }
        });
        if (!ok) throw new Error('Orphan claim without source');
    }

    return true;
}
