-- Migration: Increase VARCHAR limits to accommodate longer values
-- Run this with: psql -U postgres -d ideas_db -f migrations/001_increase_varchar_limits.sql

-- Increase title limit from 255 to 500 characters
ALTER TABLE ideas ALTER COLUMN title TYPE VARCHAR(500);

-- Increase persona limit from 100 to 200 characters
ALTER TABLE ideas ALTER COLUMN persona TYPE VARCHAR(200);

-- Increase industry limit from 100 to 200 characters
ALTER TABLE ideas ALTER COLUMN industry TYPE VARCHAR(200);

-- Increase target_audience limit from 255 to 500 characters
ALTER TABLE content_plans ALTER COLUMN target_audience TYPE VARCHAR(500);

-- Add comment
COMMENT ON COLUMN ideas.title IS 'Idea title (max 500 characters)';
COMMENT ON COLUMN ideas.persona IS 'Target persona (max 200 characters)';
COMMENT ON COLUMN ideas.industry IS 'Industry sector (max 200 characters)';
COMMENT ON COLUMN content_plans.target_audience IS 'Target audience (max 500 characters)';

