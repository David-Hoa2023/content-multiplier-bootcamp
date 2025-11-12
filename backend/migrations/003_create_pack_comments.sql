-- Migration: Create pack_comments table
-- Description: Creates pack_comments table for review feedback and comments
-- Run with: psql -U postgres -d ideas_db -f migrations/003_create_pack_comments.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create pack_comments table
CREATE TABLE IF NOT EXISTS pack_comments (
    comment_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pack_id UUID NOT NULL,
    comment_text TEXT NOT NULL,
    author VARCHAR(255) DEFAULT 'Reviewer',
    status VARCHAR(50) DEFAULT 'pending', -- pending, resolved
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pack_comments_pack FOREIGN KEY (pack_id) 
        REFERENCES content_packs(pack_id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Create index on pack_id for better query performance
CREATE INDEX IF NOT EXISTS idx_pack_comments_pack_id ON pack_comments(pack_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_pack_comments_created_at ON pack_comments(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_pack_comments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_pack_comments_updated_at ON pack_comments;
CREATE TRIGGER trigger_update_pack_comments_updated_at
    BEFORE UPDATE ON pack_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_pack_comments_updated_at();

-- Add comments to table
COMMENT ON TABLE pack_comments IS 'Stores review comments and feedback for content packs';
COMMENT ON COLUMN pack_comments.comment_id IS 'Primary key UUID for comment';
COMMENT ON COLUMN pack_comments.pack_id IS 'Foreign key UUID referencing content_packs table';
COMMENT ON COLUMN pack_comments.comment_text IS 'Comment text content';
COMMENT ON COLUMN pack_comments.author IS 'Author of the comment';
COMMENT ON COLUMN pack_comments.status IS 'Status of comment: pending or resolved';
COMMENT ON COLUMN pack_comments.created_at IS 'Timestamp when the comment was created';
COMMENT ON COLUMN pack_comments.updated_at IS 'Timestamp when the comment was last updated (auto-updated)';





