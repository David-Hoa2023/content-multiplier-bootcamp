/* scripts/seed.ts
 * Seed end-to-end: ideas -> select -> RAG ingest -> brief -> draft -> derivatives -> export -> publish
 * Yêu cầu: API đang chạy ở http://localhost:3001 và DB đã migrate
 */

const API_BASE = process.env.API_BASE || 'http://localhost:3001';
const HEADERS_CL = { 'Content-Type': 'application/json', 'x-user-id': 'alice', 'x-user-role': 'CL' };   // Content Lead
const HEADERS_WR = { 'Content-Type': 'application/json', 'x-user-id': 'bob', 'x-user-role': 'WR' };   // Writer/Researcher
const HEADERS_MOPS = { 'Content-Type': 'application/json', 'x-user-id': 'mops', 'x-user-role': 'MOps' };// Marketing Ops

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function postJSON(url: string, body: any, headers: Record<string, string>) {
    const res = await fetch(url, { method: 'POST', headers, body: JSON.stringify(body) });
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`POST ${url} -> ${res.status}: ${t}`);
    }
    try { return await res.json(); } catch { return null; }
}

async function getText(url: string, headers: Record<string, string>) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
        const t = await res.text().catch(() => '');
        throw new Error(`GET ${url} -> ${res.status}: ${t}`);
    }
    return await res.text();
}

async function main() {
    console.log('== Seed: start ==');

    // --- 1) Generate 10 ideas ---
    console.log('1) Generating ideas…');
    const ideas = await postJSON(`${API_BASE}/api/ideas/generate`, {
        persona: 'Content Lead',
        industry: 'SaaS',
        corpus_hints: 'automation, guardrails, RAG, JSON schema'
    }, HEADERS_CL);

    if (!Array.isArray(ideas) || ideas.length === 0) throw new Error('No ideas returned');
    const idea = ideas[0];
    console.log('   ✓ Got ideas. Selecting:', idea.idea_id, '-', idea.one_liner);

    // --- 2) Select an idea ---
    await postJSON(`${API_BASE}/api/ideas/${encodeURIComponent(idea.idea_id)}/select`, {}, HEADERS_CL);
    console.log('2) Selected idea:', idea.idea_id);

    // --- 3) Ingest two docs for RAG ---
    console.log('3) Ingesting RAG documents…');
    const doc1 = {
        doc_id: 'doc-seed-1',
        title: 'Company AI Policy 2025',
        url: 'https://example.com/ai-policy-2025',
        raw: `Our 2025 AI policy requires evidence-backed content with at least one credible source per non-obvious claim. 
          RAG retrieval is recommended. JSON schema must validate generated artifacts.`
    };
    const doc2 = {
        doc_id: 'doc-seed-2',
        title: 'Distribution Best Practices',
        url: 'https://example.com/distribution-best-practices',
        raw: `Always include UTM parameters for each channel. Create channel-native hooks and schedule consistently.`
    };
    await postJSON(`${API_BASE}/api/rag/ingest`, doc1, HEADERS_WR);
    await postJSON(`${API_BASE}/api/rag/ingest`, doc2, HEADERS_WR);
    console.log('   ✓ RAG docs ingested');

    // --- 4) Generate a brief from RAG ---
    const BRIEF_ID = 'BRF-SEED-001';
    console.log('4) Generating brief…');
    const brief = await postJSON(`${API_BASE}/api/briefs/generate`, {
        brief_id: BRIEF_ID,
        idea_id: idea.idea_id,
        query: 'AI guardrails, RAG evidence, JSON schema validation, distribution UTM'
    }, HEADERS_WR);
    if (!brief?.claims_ledger || brief.claims_ledger.length === 0) throw new Error('Brief has empty claims_ledger');
    console.log('   ✓ Brief created:', BRIEF_ID, `(claims: ${brief.claims_ledger.length})`);

    // --- 5) Draft from brief ---
    const PACK_ID = 'PACK-SEED-001';
    console.log('5) Creating draft…');
    const draftRes = await postJSON(`${API_BASE}/api/packs/draft`, {
        pack_id: PACK_ID,
        brief_id: BRIEF_ID,
        audience: 'Ops Director'
    }, HEADERS_WR);
    if (!draftRes?.draft_markdown) throw new Error('Draft missing markdown');
    console.log('   ✓ Draft created:', PACK_ID, `(length: ${draftRes.draft_markdown.length})`);

    // --- small pause to avoid rate-limit on LLM calls ---
    await sleep(1500);

    // --- 6) Derivatives & SEO ---
    console.log('6) Creating derivatives & SEO…');
    const deriv = await postJSON(`${API_BASE}/api/packs/derivatives`, { pack_id: PACK_ID }, HEADERS_WR);
    console.log('   ✓ Derivatives done (LI:', deriv?.derivatives?.linkedin?.length ?? 0, ', X:', deriv?.derivatives?.x?.length ?? 0, ')');

    // --- 7) Export CSV & ICS (to fire distribution.exported events) ---
    console.log('7) Exporting distribution CSV/ICS…');
    const csv = await getText(`${API_BASE}/api/events/distribution/${encodeURIComponent(PACK_ID)}.csv`, HEADERS_MOPS);
    const ics = await getText(`${API_BASE}/api/events/distribution/${encodeURIComponent(PACK_ID)}.ics`, HEADERS_MOPS);
    console.log('   ✓ CSV bytes:', csv.length, ' | ICS bytes:', ics.length);

    // --- 8) Publish (guardrails need to pass; brief/draft had claims_ledger) ---
    console.log('8) Publishing the pack…');
    await postJSON(`${API_BASE}/api/packs/publish`, { pack_id: PACK_ID }, HEADERS_CL);
    console.log('   ✓ Published:', PACK_ID);

    console.log('\n== Seed: completed successfully ==');
    console.log('Summary:');
    console.log('- idea_id  :', idea.idea_id);
    console.log('- brief_id :', BRIEF_ID);
    console.log('- pack_id  :', PACK_ID);
    console.log('\nYou can now query events in DB, or open the web UI.');
}

main().catch(err => {
    console.error('Seed failed:', err);
    process.exit(1);
});
