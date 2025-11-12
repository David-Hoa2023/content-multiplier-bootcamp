-- Platform Integration Database Schema
-- This extends the existing schema to support multiple platform integrations

-- Create platform configurations table
CREATE TABLE IF NOT EXISTS platform_configurations (
    id SERIAL PRIMARY KEY,
    user_id INTEGER DEFAULT 1, -- For future multi-user support
    platform_type VARCHAR(50) NOT NULL, -- 'twitter', 'mailchimp', 'wordpress', etc.
    platform_name VARCHAR(100) NOT NULL, -- User-defined name "Marketing WordPress"
    configuration JSONB NOT NULL, -- Platform-specific configuration
    credentials JSONB, -- Encrypted authentication data  
    is_active BOOLEAN DEFAULT true,
    is_connected BOOLEAN DEFAULT false, -- Connection status
    last_tested_at TIMESTAMP, -- Last connection test
    test_result TEXT, -- Last test result message
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_platform_configurations_user_id ON platform_configurations(user_id);
CREATE INDEX IF NOT EXISTS idx_platform_configurations_type ON platform_configurations(platform_type);
CREATE INDEX IF NOT EXISTS idx_platform_configurations_active ON platform_configurations(is_active);

-- Add platform configuration reference to derivatives
ALTER TABLE derivatives ADD COLUMN IF NOT EXISTS platform_config_id INTEGER;
ALTER TABLE derivatives ADD COLUMN IF NOT EXISTS publication_metadata JSONB;
ALTER TABLE derivatives ADD COLUMN IF NOT EXISTS publication_url TEXT;
ALTER TABLE derivatives ADD COLUMN IF NOT EXISTS platform_response JSONB;

-- Add foreign key constraint
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_derivatives_platform_config'
    ) THEN
        ALTER TABLE derivatives 
        ADD CONSTRAINT fk_derivatives_platform_config 
        FOREIGN KEY (platform_config_id) 
        REFERENCES platform_configurations(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Create platform templates table for reusable configurations
CREATE TABLE IF NOT EXISTS platform_templates (
    id SERIAL PRIMARY KEY,
    platform_type VARCHAR(50) NOT NULL,
    template_name VARCHAR(100) NOT NULL,
    description TEXT,
    default_configuration JSONB NOT NULL,
    is_system_template BOOLEAN DEFAULT false, -- System vs user templates
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create platform analytics table for tracking performance
CREATE TABLE IF NOT EXISTS platform_analytics (
    id SERIAL PRIMARY KEY,
    derivative_id INTEGER NOT NULL,
    platform_config_id INTEGER NOT NULL,
    event_type VARCHAR(50) NOT NULL, -- 'published', 'clicked', 'opened', 'shared'
    event_data JSONB, -- Platform-specific event data
    occurred_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (derivative_id) REFERENCES derivatives(id) ON DELETE CASCADE,
    FOREIGN KEY (platform_config_id) REFERENCES platform_configurations(id) ON DELETE CASCADE
);

-- Create indexes for analytics
CREATE INDEX IF NOT EXISTS idx_platform_analytics_derivative ON platform_analytics(derivative_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_platform ON platform_analytics(platform_config_id);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_event_type ON platform_analytics(event_type);
CREATE INDEX IF NOT EXISTS idx_platform_analytics_occurred_at ON platform_analytics(occurred_at DESC);

-- Insert default platform templates
INSERT INTO platform_templates (platform_type, template_name, description, default_configuration, is_system_template) VALUES 
-- Email Templates
('mailchimp', 'Marketing Newsletter', 'Standard marketing newsletter template', '{
    "listId": "",
    "templateId": "",
    "fromName": "Your Company",
    "fromEmail": "marketing@yourcompany.com", 
    "replyTo": "noreply@yourcompany.com",
    "trackOpens": true,
    "trackClicks": true,
    "segmentTags": [],
    "subjectPrefix": "",
    "footerText": "Unsubscribe | Update Preferences"
}', true),

('mailchimp', 'Product Updates', 'Product announcement and updates', '{
    "listId": "",
    "templateId": "",
    "fromName": "Product Team",
    "fromEmail": "product@yourcompany.com",
    "replyTo": "product@yourcompany.com", 
    "trackOpens": true,
    "trackClicks": true,
    "segmentTags": ["product-updates"],
    "subjectPrefix": "[Product Update]",
    "footerText": "Unsubscribe | Product Feedback"
}', true),

-- WordPress Templates  
('wordpress', 'Blog Post', 'Standard blog post configuration', '{
    "siteUrl": "",
    "authType": "application_password",
    "defaultCategory": "Blog",
    "defaultTags": [],
    "defaultStatus": "draft",
    "postFormat": "standard",
    "allowComments": true,
    "seoOptimization": true,
    "featuredImageAutoSet": true
}', true),

('wordpress', 'News Article', 'News and announcement posts', '{
    "siteUrl": "",
    "authType": "application_password", 
    "defaultCategory": "News",
    "defaultTags": ["news", "announcements"],
    "defaultStatus": "pending",
    "postFormat": "standard",
    "allowComments": false,
    "seoOptimization": true,
    "featuredImageAutoSet": true
}', true),

-- Social Media Templates
('twitter', 'Marketing Tweets', 'Standard marketing Twitter posts', '{
    "defaultHashtags": ["#marketing", "#digital"],
    "mentionAccounts": [],
    "scheduleTimezone": "UTC",
    "autoRepost": false,
    "threadSupport": true,
    "mediaOptimization": true
}', true),

('linkedin', 'Professional Updates', 'LinkedIn business posts', '{
    "defaultHashtags": ["#business", "#professional"],
    "mentionAccounts": [],
    "scheduleTimezone": "UTC",
    "autoRepost": false,
    "articleFormat": true,
    "networkSharing": true
}', true),

('facebook', 'Brand Content', 'Facebook page posts', '{
    "defaultHashtags": [],
    "mentionAccounts": [],
    "scheduleTimezone": "UTC", 
    "autoRepost": false,
    "crossPostInstagram": false,
    "storySharing": true
}', true),

('instagram', 'Visual Content', 'Instagram posts with visual focus', '{
    "defaultHashtags": ["#instagram", "#visual"],
    "mentionAccounts": [],
    "scheduleTimezone": "UTC",
    "autoRepost": false,
    "storySharing": true,
    "reelsOptimization": true,
    "locationTagging": true
}', true),

('tiktok', 'Short Content', 'TikTok short-form content', '{
    "defaultHashtags": ["#fyp", "#content"],
    "mentionAccounts": [],
    "scheduleTimezone": "UTC",
    "autoRepost": false,
    "trendOptimization": true,
    "soundSelection": true
}', true)

ON CONFLICT DO NOTHING;

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_platform_configurations_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_platform_configurations_updated_at 
    BEFORE UPDATE ON platform_configurations
    FOR EACH ROW 
    EXECUTE FUNCTION update_platform_configurations_updated_at();

CREATE TRIGGER update_platform_templates_updated_at 
    BEFORE UPDATE ON platform_templates
    FOR EACH ROW 
    EXECUTE FUNCTION update_platform_configurations_updated_at();

-- Sample data for testing
INSERT INTO platform_configurations (platform_type, platform_name, configuration, is_active, is_connected) VALUES 
('twitter', 'Main Twitter Account', '{
    "characterLimit": 280,
    "defaultHashtags": ["#content", "#marketing"],
    "scheduleTimezone": "UTC"
}', true, false),

('linkedin', 'Company LinkedIn', '{
    "characterLimit": 3000, 
    "defaultHashtags": ["#business", "#professional"],
    "scheduleTimezone": "UTC"
}', true, false),

('mailchimp', 'Marketing List', '{
    "listId": "",
    "fromName": "Marketing Team",
    "fromEmail": "marketing@company.com",
    "trackOpens": true,
    "trackClicks": true
}', true, false),

('wordpress', 'Company Blog', '{
    "siteUrl": "https://blog.company.com",
    "defaultCategory": "Updates", 
    "defaultStatus": "draft",
    "seoOptimization": true
}', true, false)

ON CONFLICT DO NOTHING;