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

-- Create derivatives table for platform-specific content
CREATE TABLE IF NOT EXISTS derivatives (
    id SERIAL PRIMARY KEY,
    pack_id UUID NOT NULL,
    content_plan_id INTEGER,
    platform VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    character_count INTEGER,
    hashtags TEXT[],
    mentions TEXT[],
    media_urls TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    analytics JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_content_plan FOREIGN KEY (content_plan_id) REFERENCES content_plans(id) ON DELETE CASCADE
);

-- Create index on pack_id for better query performance
CREATE INDEX IF NOT EXISTS idx_derivatives_pack_id ON derivatives(pack_id);
CREATE INDEX IF NOT EXISTS idx_derivatives_platform ON derivatives(platform);
CREATE INDEX IF NOT EXISTS idx_derivatives_status ON derivatives(status);

-- Create publishing_queue table for scheduled publishing
CREATE TABLE IF NOT EXISTS publishing_queue (
    id SERIAL PRIMARY KEY,
    derivative_id INTEGER NOT NULL,
    platform VARCHAR(100) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    retry_count INTEGER DEFAULT 0,
    last_error TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_derivative FOREIGN KEY (derivative_id) REFERENCES derivatives(id) ON DELETE CASCADE
);

-- Create index on scheduled_time for queue processing
CREATE INDEX IF NOT EXISTS idx_publishing_queue_scheduled ON publishing_queue(scheduled_time);
CREATE INDEX IF NOT EXISTS idx_publishing_queue_status ON publishing_queue(status);

-- Create platform_analytics table for tracking platform performance
CREATE TABLE IF NOT EXISTS platform_analytics (
    id SERIAL PRIMARY KEY,
    platform_config_id INTEGER,
    derivative_id INTEGER,
    event_type VARCHAR(50),
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    event_data JSONB,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for platform_analytics
CREATE INDEX IF NOT EXISTS idx_platform_analytics_config ON platform_analytics(platform_config_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_derivative ON platform_analytics(derivative_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_event ON platform_analytics(event_type);

-- Insert sample data
INSERT INTO ideas (title, description, persona, industry, status) VALUES
('Social Media Campaign', 'Tạo chiến dịch marketing trên social media cho sản phẩm mới', 'Marketing Manager', 'Technology', 'draft'),
('Video Tutorial Series', 'Series video hướng dẫn sử dụng sản phẩm', 'Content Creator', 'Education', 'in-progress');
