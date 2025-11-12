-- Migration: Add tags column to ideas table
-- Date: 2025-10-25
-- Description: Add TEXT[] column to store tags/labels for ideas

ALTER TABLE ideas
ADD COLUMN tags TEXT[] DEFAULT '{}';

-- Create GIN index for efficient array operations (contains, overlap, etc.)
CREATE INDEX idx_ideas_tags ON ideas USING GIN(tags);

-- Optional: Add comment to document the column
COMMENT ON COLUMN ideas.tags IS 'Array of tags/labels for categorizing and filtering ideas';
