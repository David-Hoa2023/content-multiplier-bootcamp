-- Migration: Create content_packs table
-- Description: Creates content_packs table with UUID primary key, foreign key to briefs, and auto-updating timestamps
-- Run with: psql -U postgres -d ideas_db -f migrations/002_create_content_packs.sql

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create ENUM type for content_pack status
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'content_pack_status') THEN
        CREATE TYPE content_pack_status AS ENUM ('draft', 'review', 'approved', 'published');
    END IF;
END $$;

-- Create briefs table if it doesn't exist (required for foreign key)
-- Note: Adjust this based on your actual briefs table structure
CREATE TABLE IF NOT EXISTS briefs (
    brief_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(500),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create content_packs table
CREATE TABLE IF NOT EXISTS content_packs (
    pack_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    brief_id UUID NOT NULL,
    draft_content TEXT,
    word_count INTEGER DEFAULT 0,
    status content_pack_status DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_content_packs_brief FOREIGN KEY (brief_id) 
        REFERENCES briefs(brief_id) 
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Create index on brief_id for better query performance
CREATE INDEX IF NOT EXISTS idx_content_packs_brief_id ON content_packs(brief_id);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_content_packs_status ON content_packs(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_content_packs_created_at ON content_packs(created_at DESC);

-- Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_content_packs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row update
DROP TRIGGER IF EXISTS trigger_update_content_packs_updated_at ON content_packs;
CREATE TRIGGER trigger_update_content_packs_updated_at
    BEFORE UPDATE ON content_packs
    FOR EACH ROW
    EXECUTE FUNCTION update_content_packs_updated_at();

-- Add comment to table
COMMENT ON TABLE content_packs IS 'Stores content packs associated with briefs, tracking draft content, word count, and status';

-- Add comments to columns
COMMENT ON COLUMN content_packs.pack_id IS 'Primary key UUID for content pack';
COMMENT ON COLUMN content_packs.brief_id IS 'Foreign key UUID referencing briefs table';
COMMENT ON COLUMN content_packs.draft_content IS 'Draft content text';
COMMENT ON COLUMN content_packs.word_count IS 'Word count of the draft content';
COMMENT ON COLUMN content_packs.status IS 'Status of content pack: draft, review, approved, or published';
COMMENT ON COLUMN content_packs.created_at IS 'Timestamp when the content pack was created';
COMMENT ON COLUMN content_packs.updated_at IS 'Timestamp when the content pack was last updated (auto-updated)';








