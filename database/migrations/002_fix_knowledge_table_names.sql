-- Fix table names to match knowledgeService expectations
-- The service expects: knowledge_documents, knowledge_categories, knowledge_chunks
-- The original migration created: documents, document_categories, document_chunks

-- Rename tables if they exist with old names
DO $$
BEGIN
    -- Rename documents to knowledge_documents
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'documents' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_documents' AND table_schema = 'public') THEN
        ALTER TABLE documents RENAME TO knowledge_documents;
    END IF;

    -- Rename document_chunks to knowledge_chunks
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_chunks' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_chunks' AND table_schema = 'public') THEN
        ALTER TABLE document_chunks RENAME TO knowledge_chunks;
    END IF;

    -- Rename document_categories to knowledge_categories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_categories' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_categories' AND table_schema = 'public') THEN
        ALTER TABLE document_categories RENAME TO knowledge_categories;
    END IF;

    -- Rename document_category_assignments to knowledge_document_categories
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'document_category_assignments' AND table_schema = 'public')
       AND NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'knowledge_document_categories' AND table_schema = 'public') THEN
        ALTER TABLE document_category_assignments RENAME TO knowledge_document_categories;
    END IF;
END $$;

-- Create tables if they don't exist (fresh install)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create users table if not exists (for user_id references)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default user if not exists
INSERT INTO users (username, email) VALUES ('admin', 'admin@localhost')
ON CONFLICT (username) DO NOTHING;

-- Create knowledge_documents table
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL DEFAULT 1 REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    content TEXT,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'processing',
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP
);

-- Create knowledge_chunks table for RAG
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id SERIAL PRIMARY KEY,
    document_id INTEGER NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    token_count INTEGER,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create knowledge_categories table
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create knowledge_document_categories junction table (many-to-many)
CREATE TABLE IF NOT EXISTS knowledge_document_categories (
    document_id INTEGER REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES knowledge_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, category_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_user_id ON knowledge_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_file_type ON knowledge_documents(file_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_at ON knowledge_documents(created_at);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_chunk_index ON knowledge_chunks(chunk_index);

-- Create HNSW index for vector similarity search (if pgvector is available)
DO $$
BEGIN
    CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks
    USING hnsw (embedding vector_cosine_ops);
EXCEPTION WHEN OTHERS THEN
    RAISE NOTICE 'Could not create vector index. Make sure pgvector extension is installed.';
END $$;

-- Insert default categories
INSERT INTO knowledge_categories (name, description, color) VALUES
('Research', 'Research papers and academic content', '#10B981'),
('Brand Guidelines', 'Brand voice, style guides, and company standards', '#8B5CF6'),
('Product Info', 'Product specifications and documentation', '#F59E0B'),
('Marketing Materials', 'Previous campaigns and marketing content', '#EF4444'),
('Industry Knowledge', 'Industry reports and market analysis', '#3B82F6'),
('Company Policies', 'Internal policies and procedures', '#6B7280')
ON CONFLICT (name) DO NOTHING;
