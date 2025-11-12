import { q } from '../db';
type State = 'idea' | 'brief' | 'draft' | 'derivatives' | 'ready_for_review' | 'published';
export async function setState(pack_id: string, state: State) {
    await q('UPDATE content_packs SET status=$2 WHERE pack_id=$1', [pack_id, state]);
    await q('INSERT INTO events(event_type, pack_id) VALUES ($1,$2)', [state, pack_id]);
}
