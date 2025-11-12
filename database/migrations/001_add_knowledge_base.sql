-- Enable pgvector extension
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

-- Create documents table for uploaded files
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL, -- pdf, docx, txt, md
    file_size BIGINT NOT NULL,
    content_text TEXT, -- Extracted text content
    metadata JSONB DEFAULT '{}', -- Additional metadata like tags, categories
    status VARCHAR(50) DEFAULT 'processing', -- processing, ready, error
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document chunks table for RAG
CREATE TABLE IF NOT EXISTS document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL, -- Order of chunk in document
    token_count INTEGER, -- Number of tokens in chunk
    embedding vector(1536), -- OpenAI ada-002 embeddings (1536 dimensions)
    metadata JSONB DEFAULT '{}', -- Chunk-specific metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table for document organization
CREATE TABLE IF NOT EXISTS document_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document-category junction table (many-to-many)
CREATE TABLE IF NOT EXISTS document_category_assignments (
    document_id UUID REFERENCES documents(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES document_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_documents_user_id ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_documents_file_type ON documents(file_type);
CREATE INDEX IF NOT EXISTS idx_documents_created_at ON documents(created_at);

CREATE INDEX IF NOT EXISTS idx_document_chunks_document_id ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_chunk_index ON document_chunks(chunk_index);

-- Create HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Create GIN index for metadata search
CREATE INDEX IF NOT EXISTS idx_documents_metadata ON documents USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_document_chunks_metadata ON document_chunks USING gin(metadata);

-- Insert default document categories
INSERT INTO document_categories (name, description, color) VALUES 
('Research', 'Research papers and academic content', '#10B981'),
('Brand Guidelines', 'Brand voice, style guides, and company standards', '#8B5CF6'),
('Product Info', 'Product specifications and documentation', '#F59E0B'),
('Marketing Materials', 'Previous campaigns and marketing content', '#EF4444'),
('Industry Knowledge', 'Industry reports and market analysis', '#3B82F6'),
('Company Policies', 'Internal policies and procedures', '#6B7280')
ON CONFLICT (name) DO NOTHING;