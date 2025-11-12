-- Railway PostgreSQL Migration Script
-- This script sets up the complete database schema for production

-- Enable pgvector extension for RAG functionality
CREATE EXTENSION IF NOT EXISTS vector;

-- Create main tables
CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    description TEXT,
    persona VARCHAR(200),
    industry VARCHAR(200),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS content_plans (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER REFERENCES ideas(id) ON DELETE CASCADE,
    plan_content TEXT,
    target_audience TEXT,
    key_points TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform configuration tables
CREATE TABLE IF NOT EXISTS platform_configurations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL DEFAULT 1,
    platform_type VARCHAR(50) NOT NULL,
    platform_name VARCHAR(100) NOT NULL,
    configuration JSONB DEFAULT '{}',
    credentials JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT true,
    is_connected BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Derivatives table for platform-specific content
CREATE TABLE IF NOT EXISTS derivatives (
    id SERIAL PRIMARY KEY,
    pack_id VARCHAR(100),
    content_plan_id INTEGER REFERENCES content_plans(id) ON DELETE SET NULL,
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    character_count INTEGER DEFAULT 0,
    hashtags TEXT[],
    mentions TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Platform analytics table
CREATE TABLE IF NOT EXISTS platform_analytics (
    id SERIAL PRIMARY KEY,
    platform_config_id INTEGER REFERENCES platform_configurations(id) ON DELETE CASCADE,
    derivative_id INTEGER REFERENCES derivatives(id) ON DELETE SET NULL,
    event_type VARCHAR(50) NOT NULL,
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB DEFAULT '{}'
);

-- Knowledge Base tables for RAG functionality
CREATE TABLE IF NOT EXISTS knowledge_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id INTEGER NOT NULL DEFAULT 1,
    title VARCHAR(255) NOT NULL,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    file_size BIGINT NOT NULL,
    content_text TEXT,
    metadata JSONB DEFAULT '{}',
    status VARCHAR(50) DEFAULT 'processing',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS knowledge_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    chunk_text TEXT NOT NULL,
    chunk_index INTEGER NOT NULL,
    token_count INTEGER,
    embedding vector(1536),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ideas_status ON ideas(status);
CREATE INDEX IF NOT EXISTS idx_ideas_created_at ON ideas(created_at);
CREATE INDEX IF NOT EXISTS idx_content_plans_idea_id ON content_plans(idea_id);
CREATE INDEX IF NOT EXISTS idx_derivatives_pack_id ON derivatives(pack_id);
CREATE INDEX IF NOT EXISTS idx_derivatives_platform ON derivatives(platform);
CREATE INDEX IF NOT EXISTS idx_derivatives_status ON derivatives(status);
CREATE INDEX IF NOT EXISTS idx_platform_configs_user_id ON platform_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_configs_type ON platform_configurations(platform_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_user_id ON knowledge_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_document_id ON knowledge_chunks(document_id);

-- Vector similarity search index (HNSW for better performance)
CREATE INDEX IF NOT EXISTS idx_knowledge_chunks_embedding ON knowledge_chunks 
USING hnsw (embedding vector_cosine_ops);

-- Create knowledge categories table
CREATE TABLE IF NOT EXISTS knowledge_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    color VARCHAR(7) DEFAULT '#3B82F6',
    user_id INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Junction table for document categories
CREATE TABLE IF NOT EXISTS knowledge_document_categories (
    document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES knowledge_categories(id) ON DELETE CASCADE,
    PRIMARY KEY (document_id, category_id)
);

-- Insert default platform configurations
INSERT INTO platform_configurations (platform_type, platform_name, is_active, is_connected) 
VALUES 
    ('twitter', 'Twitter', true, false),
    ('linkedin', 'LinkedIn', true, false),
    ('facebook', 'Facebook', true, false),
    ('instagram', 'Instagram', true, false),
    ('tiktok', 'TikTok', true, false),
    ('mailchimp', 'MailChimp', true, false),
    ('wordpress', 'WordPress', true, false)
ON CONFLICT DO NOTHING;

-- Insert sample knowledge categories
INSERT INTO knowledge_categories (name, description, color, user_id)
VALUES 
    ('Brand Guidelines', 'Company brand and style guidelines', '#3B82F6', 1),
    ('Product Information', 'Product specs and documentation', '#10B981', 1),
    ('Marketing Materials', 'Marketing assets and campaigns', '#8B5CF6', 1),
    ('Industry Research', 'Market research and industry insights', '#F59E0B', 1)
ON CONFLICT DO NOTHING;

-- Set up update triggers for timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_ideas_updated_at BEFORE UPDATE ON ideas 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_platform_configurations_updated_at BEFORE UPDATE ON platform_configurations 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_derivatives_updated_at BEFORE UPDATE ON derivatives 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_documents_updated_at BEFORE UPDATE ON knowledge_documents 
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();