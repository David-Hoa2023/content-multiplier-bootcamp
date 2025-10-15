-- 002_events_extensions.sql
ALTER TABLE events
  ADD COLUMN actor_id TEXT,
  ADD COLUMN actor_role TEXT,          -- 'CL'|'WR'|'MOps'|'system'
  ADD COLUMN version SMALLINT DEFAULT 1,
  ADD COLUMN timezone TEXT DEFAULT 'UTC',
  ADD COLUMN request_id TEXT;

-- Helpful partial index by event_type & date
CREATE INDEX IF NOT EXISTS idx_events_type_date ON events (event_type, created_at);
CREATE INDEX IF NOT EXISTS idx_events_pack ON events (pack_id);
CREATE INDEX IF NOT EXISTS idx_events_idea ON events (idea_id);
CREATE INDEX IF NOT EXISTS idx_events_brief ON events (brief_id);
