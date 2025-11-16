-- Change embedding dimension from 1536 (OpenAI) to 768 (Gemini text-embedding-004)

-- Drop the old column and recreate with new dimension
ALTER TABLE knowledge_chunks DROP COLUMN IF EXISTS embedding;
ALTER TABLE knowledge_chunks ADD COLUMN embedding vector(768);

-- Recreate the HNSW index for the new dimension
DROP INDEX IF EXISTS idx_knowledge_chunks_embedding;
CREATE INDEX idx_knowledge_chunks_embedding ON knowledge_chunks
USING hnsw (embedding vector_cosine_ops);
