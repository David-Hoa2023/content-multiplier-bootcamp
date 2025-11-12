import { q } from '../db.ts';
import { env } from '../env.ts';

// simple splitter
export function splitText(raw: string, chunkSize = 800, overlap = 100) {
    const chunks: string[] = [];
    let i = 0;
    while (i < raw.length) {
        const end = Math.min(raw.length, i + chunkSize);
        chunks.push(raw.slice(i, end));
        i += chunkSize - overlap;
        if (i >= raw.length) break;
    }
    return chunks;
}

export async function upsertDocument({ doc_id, title, url, raw }: { doc_id: string, title?: string, url?: string, raw: string }, embed: (t: string[]) => Promise<number[][]>) {
    await q('INSERT INTO documents(doc_id,title,url,raw) VALUES ($1,$2,$3,$4) ON CONFLICT (doc_id) DO UPDATE SET title=EXCLUDED.title,url=EXCLUDED.url,raw=EXCLUDED.raw', [doc_id, title || null, url || null, raw]);
    const chunks = splitText(raw);
    const vectors = await embed(chunks);
    await q('DELETE FROM doc_chunks WHERE doc_id=$1', [doc_id]);
    for (let i = 0; i < chunks.length; i++) {
        // PostgreSQL pg driver expects array format for vector type
        await q('INSERT INTO doc_chunks(chunk_id,doc_id,content,embedding) VALUES ($1,$2,$3,$4::vector)', [
            `${doc_id}-${i}`, doc_id, chunks[i], JSON.stringify(vectors[i])
        ]);
    }
    return { doc_id, chunks: chunks.length };
}

export async function retrieve(query: string, topK = 5, embed: (t: string[]) => Promise<number[][]>) {
    const [v] = await embed([query]);
    const rows = await q(`
    SELECT content, 1 - (embedding <=> $1::vector) AS score, doc_id
    FROM doc_chunks
    ORDER BY embedding <=> $1::vector ASC
    LIMIT $2
  `, [JSON.stringify(v), topK]);
    return rows;
}
