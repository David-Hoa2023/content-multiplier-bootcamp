import pg from 'pg';
export const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
export async function q<T = any>(text: string, params: any[] = []) { const r = await pool.query<T>(text, params); return r.rows; }
