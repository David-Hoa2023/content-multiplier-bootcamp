-- Twitter Bot Enhancement Migration
-- Adds support for automated Twitter content generation and scheduling

-- Twitter content templates
CREATE TABLE twitter_content_templates (
    template_id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    prompt TEXT NOT NULL,
    topics TEXT[] NOT NULL,
    tone TEXT NOT NULL DEFAULT 'professional', -- 'professional', 'casual', 'humorous', 'educational'
    max_length INTEGER DEFAULT 280,
    hashtags TEXT[],
    mentions TEXT[],
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Insert default templates
INSERT INTO twitter_content_templates (template_id, name, prompt, topics, tone, hashtags) VALUES
('tech_tips', 'Tech Tips', 'Create a helpful tech tip about {topic} in a {tone} tone. Make it actionable and under {max_length} characters. Include relevant hashtags.', 
 ARRAY['AI', 'programming', 'technology', 'software'], 'educational', 
 ARRAY['#TechTip', '#Programming', '#AI', '#Tech']),

('ai_insights', 'AI Insights', 'Share an interesting insight about {topic} in the field of artificial intelligence. Use a {tone} tone and keep it under {max_length} characters.',
 ARRAY['AI', 'machine learning', 'deep learning', 'neural networks'], 'professional',
 ARRAY['#AI', '#MachineLearning', '#TechInsights', '#Innovation']),

('startup_wisdom', 'Startup Wisdom', 'Share practical startup advice about {topic}. Use a {tone} tone and make it valuable for entrepreneurs. Keep under {max_length} characters.',
 ARRAY['startups', 'entrepreneurship', 'business', 'funding'], 'professional',
 ARRAY['#Startup', '#Entrepreneur', '#Business', '#StartupTips']),

('coding_tips', 'Coding Tips', 'Share a useful coding tip or best practice about {topic}. Use a {tone} tone and make it helpful for developers. Under {max_length} characters.',
 ARRAY['JavaScript', 'Python', 'React', 'Node.js', 'programming', 'web development'], 'casual',
 ARRAY['#CodingTips', '#WebDev', '#Programming', '#DevTips']);

-- Default Twitter bot configuration
INSERT INTO platform_configurations (config_id, platform, configuration, is_active) VALUES
('twitter_bot_default', 'twitter_bot', '{
    "enabled": false,
    "interval_hours": 12,
    "prompt_template": "Create an engaging tweet about {topic} with a {tone} tone. Keep it under {max_length} characters.",
    "content_topics": ["AI", "technology", "programming", "startups", "web development"],
    "max_tweets_per_day": 3,
    "schedule_times": ["09:00", "15:00", "21:00"]
}', true);

-- Add indexes for performance
CREATE INDEX ON twitter_content_templates(topics);
CREATE INDEX ON twitter_content_templates(is_active);

-- Add new event types for Twitter bot
INSERT INTO events (event_type, created_at) VALUES 
('twitter_bot.started', now()),
('twitter_bot.stopped', now()),
('twitter_bot.post_published', now()),
('twitter_bot.post_failed', now())
ON CONFLICT DO NOTHING;