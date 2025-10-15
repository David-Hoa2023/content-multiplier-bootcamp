-- Publishing Integrations Schema
-- This migration adds support for external publishing platforms

-- OAuth tokens and credentials for external services
CREATE TABLE publishing_credentials (
    credential_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL, -- Future: link to users table
    platform TEXT NOT NULL, -- 'twitter', 'linkedin', 'facebook', 'instagram', 'sendgrid', 'mailchimp', 'wordpress', 'medium'
    credential_type TEXT NOT NULL, -- 'oauth', 'api_key', 'webhook'
    encrypted_credentials JSONB NOT NULL, -- Encrypted OAuth tokens, API keys, etc.
    metadata JSONB, -- Additional platform-specific data
    is_active BOOLEAN DEFAULT true,
    expires_at TIMESTAMPTZ, -- For OAuth tokens
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Publishing queue for async processing
CREATE TABLE publishing_queue (
    queue_id BIGSERIAL PRIMARY KEY,
    pack_id TEXT NOT NULL REFERENCES content_packs(pack_id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    content_type TEXT NOT NULL, -- 'post', 'article', 'newsletter', 'video_script'
    content_data JSONB NOT NULL, -- Platform-specific content format
    status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'published', 'failed', 'cancelled'
    scheduled_at TIMESTAMPTZ DEFAULT now(),
    published_at TIMESTAMPTZ,
    error_message TEXT,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Publishing results and analytics
CREATE TABLE publishing_results (
    result_id BIGSERIAL PRIMARY KEY,
    queue_id BIGINT NOT NULL REFERENCES publishing_queue(queue_id) ON DELETE CASCADE,
    platform TEXT NOT NULL,
    external_id TEXT, -- ID from external platform (tweet ID, post ID, etc.)
    external_url TEXT, -- URL to published content
    metrics JSONB, -- Likes, shares, views, etc.
    published_at TIMESTAMPTZ DEFAULT now(),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook configurations for custom integrations
CREATE TABLE webhook_configurations (
    webhook_id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    url TEXT NOT NULL,
    secret TEXT NOT NULL, -- For webhook signature verification
    events TEXT[] NOT NULL, -- ['pack.published', 'derivatives.created', etc.]
    headers JSONB, -- Custom headers to send
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Webhook delivery logs
CREATE TABLE webhook_deliveries (
    delivery_id BIGSERIAL PRIMARY KEY,
    webhook_id TEXT NOT NULL REFERENCES webhook_configurations(webhook_id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT NOT NULL, -- 'pending', 'delivered', 'failed'
    response_code INTEGER,
    response_body TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    next_retry_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Platform-specific configurations
CREATE TABLE platform_configurations (
    config_id TEXT PRIMARY KEY,
    platform TEXT NOT NULL,
    configuration JSONB NOT NULL, -- Platform-specific settings
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes for performance
CREATE INDEX ON publishing_credentials(user_id, platform);
CREATE INDEX ON publishing_credentials(platform, is_active);
CREATE INDEX ON publishing_queue(status, scheduled_at);
CREATE INDEX ON publishing_queue(pack_id);
CREATE INDEX ON publishing_results(platform, published_at);
CREATE INDEX ON webhook_deliveries(webhook_id, status);
CREATE INDEX ON webhook_deliveries(next_retry_at) WHERE status = 'pending';

-- Add publishing status to content_packs
ALTER TABLE content_packs ADD COLUMN publishing_status TEXT DEFAULT 'not_published';
ALTER TABLE content_packs ADD COLUMN last_published_at TIMESTAMPTZ;
ALTER TABLE content_packs ADD COLUMN publishing_errors JSONB;

-- Update events table for publishing events
INSERT INTO events (event_type, created_at) VALUES 
('publishing.started', now()),
('publishing.completed', now()),
('publishing.failed', now()),
('webhook.triggered', now()),
('webhook.delivered', now()),
('webhook.failed', now())
ON CONFLICT DO NOTHING;

