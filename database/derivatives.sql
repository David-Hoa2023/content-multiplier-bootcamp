-- Create derivatives table to store multi-platform content variations
CREATE TABLE IF NOT EXISTS derivatives (
    id SERIAL PRIMARY KEY,
    pack_id VARCHAR(255) NOT NULL,
    content_plan_id INTEGER,
    platform VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    character_count INTEGER,
    hashtags TEXT[],
    mentions TEXT[],
    media_urls TEXT[],
    status VARCHAR(50) DEFAULT 'draft', -- draft, scheduled, published, archived
    scheduled_at TIMESTAMP,
    published_at TIMESTAMP,
    analytics JSONB, -- Store engagement metrics
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_content_plan FOREIGN KEY (content_plan_id) REFERENCES content_plans(id) ON DELETE CASCADE
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS idx_derivatives_pack_id ON derivatives(pack_id);
CREATE INDEX IF NOT EXISTS idx_derivatives_platform ON derivatives(platform);
CREATE INDEX IF NOT EXISTS idx_derivatives_status ON derivatives(status);
CREATE INDEX IF NOT EXISTS idx_derivatives_scheduled_at ON derivatives(scheduled_at);

-- Create derivative_templates table for reusable templates
CREATE TABLE IF NOT EXISTS derivative_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    template_content TEXT NOT NULL,
    variables JSONB, -- Store template variables
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create publishing_queue table
CREATE TABLE IF NOT EXISTS publishing_queue (
    id SERIAL PRIMARY KEY,
    derivative_id INTEGER NOT NULL,
    platform VARCHAR(50) NOT NULL,
    scheduled_time TIMESTAMP NOT NULL,
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_derivative FOREIGN KEY (derivative_id) REFERENCES derivatives(id) ON DELETE CASCADE
);

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_derivatives_updated_at BEFORE UPDATE ON derivatives
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_derivative_templates_updated_at BEFORE UPDATE ON derivative_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_publishing_queue_updated_at BEFORE UPDATE ON publishing_queue
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();