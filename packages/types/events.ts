// packages/types/events.ts
export type EventBase = {
    event_type: string;               // taxonomy above
    version: 1;
    actor_id?: string;
    actor_role?: 'CL' | 'WR' | 'MOps' | 'system';
    idea_id?: string;
    brief_id?: string;
    pack_id?: string;
    request_id?: string;
    timezone?: string;                // 'UTC' | 'Asia/Bangkok'
    payload?: Record<string, any>;
};

export type GuardrailPayload = {
    subtype: 'schema' | 'plagiarism' | 'citations' | 'style';
    ok: boolean;
    reasons?: string[];
    score?: number;
};

export type DistributionExportPayload = {
    export_type: 'csv' | 'ics';
    items: number;
};

export type ReviewPayload = {
    reviewer_id: string;
    edit_distance: number; // characters changed
    comments: number;
};
