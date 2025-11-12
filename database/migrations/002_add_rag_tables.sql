-- Create knowledge_documents table (separate from existing documents table)
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL DEFAULT 1, -- Default to user 1
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

-- Create knowledge document chunks table for RAG
CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL, -- Order of chunk in document
    token_count INTEGER, -- Number of tokens in chunk
    embedding vector(1536), -- OpenAI ada-002 embeddings (1536 dimensions)
    metadata JSONB DEFAULT '{}', -- Chunk-specific metadata
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document categories table for organization
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6', -- Hex color for UI
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create document-category junction table (many-to-many)
CREATE TABLE IF NOT EXISTS knowledge_document_categories (
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES knowledge_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, category_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_user_id ON knowledge_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_file_type ON knowledge_documents(file_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created_at ON knowledge_documents(created_at);

CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_chunk_index ON knowledge_chunks(chunk_index);

-- Create HNSW index for vector similarity search
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Create GIN index for metadata search
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_metadata ON knowledge_documents USING gin(metadata);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_metadata ON knowledge_chunks USING gin(metadata);

-- Insert default document categories
INSERT INTO knowledge_categories (name, description, color) VALUES 
('Research', 'Research papers and academic content', '#10B981'),
('Brand Guidelines', 'Brand voice, style guides, and company standards', '#8B5CF6'),
('Product Info', 'Product specifications and documentation', '#F59E0B'),
('Marketing Materials', 'Previous campaigns and marketing content', '#EF4444'),
('Industry Knowledge', 'Industry reports and market analysis', '#3B82F6'),
('Company Policies', 'Internal policies and procedures', '#6B7280')
ON CONFLICT (name) DO NOTHING;