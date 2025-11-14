-- Create ideas table
CREATE TABLE IF NOT EXISTS ideas (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    persona VARCHAR(100),
    industry VARCHAR(100),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create content_plans table
CREATE TABLE IF NOT EXISTS content_plans (
    id SERIAL PRIMARY KEY,
    idea_id INTEGER NOT NULL,
    plan_content TEXT NOT NULL,
    target_audience VARCHAR(255),
    key_points TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_idea FOREIGN KEY (idea_id) REFERENCES ideas(id) ON DELETE CASCADE
);

-- Create index on idea_id for better query performance
CREATE INDEX IF NOT EXISTS idx_content_plans_idea_id ON content_plans(idea_id);

-- Create api_keys table for secure storage of API keys
CREATE TABLE IF NOT EXISTS api_keys (
    id SERIAL PRIMARY KEY,
    provider_name VARCHAR(50) NOT NULL UNIQUE,
    api_key_encrypted TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index on provider_name for better query performance
CREATE INDEX IF NOT EXISTS idx_api_keys_provider_name ON api_keys(provider_name);

-- Insert sample data
INSERT INTO ideas (title, description, persona, industry, status) VALUES
('Social Media Campaign', 'Tạo chiến dịch marketing trên social media cho sản phẩm mới', 'Marketing Manager', 'Technology', 'draft'),
('Video Tutorial Series', 'Series video hướng dẫn sử dụng sản phẩm', 'Content Creator', 'Education', 'in-progress');
