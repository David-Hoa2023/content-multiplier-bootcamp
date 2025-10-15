CREATE EXTENSION IF NOT EXISTS vector;

-- Core tables
CREATE TABLE ideas (
  idea_id TEXT PRIMARY KEY,
  one_liner TEXT NOT NULL,
  angle TEXT,
  personas TEXT[] NOT NULL,
  why_now TEXT[],
  evidence JSONB,         -- [{title,url,quote}]
  scores JSONB,           -- {novelty,demand,fit,white_space}
  status TEXT NOT NULL DEFAULT 'proposed',
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE briefs (
  brief_id TEXT PRIMARY KEY,
  idea_id TEXT NOT NULL REFERENCES ideas(idea_id) ON DELETE CASCADE,
  key_points JSONB,
  counterpoints JSONB,
  outline JSONB,
  claims_ledger JSONB,    -- [{claim,sources:[{url}],confidence}]
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE content_packs (
  pack_id TEXT PRIMARY KEY,
  brief_id TEXT NOT NULL REFERENCES briefs(brief_id) ON DELETE CASCADE,
  draft_markdown TEXT,
  claims_ledger JSONB,
  seo JSONB,              -- {title,slug,meta_desc,schema_org}
  derivatives JSONB,      -- newsletter, video_script_60s, linkedin[], x[]
  distribution_plan JSONB, -- {items:[{channel,asset,datetime}],utm:[...]}
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- RAG: documents & chunks
CREATE TABLE documents (
  doc_id TEXT PRIMARY KEY,
  title TEXT,
  url TEXT,
  raw TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE doc_chunks (
  chunk_id TEXT PRIMARY KEY,
  doc_id TEXT REFERENCES documents(doc_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536)   -- adjust dim to your embedding model
);

-- Analytics events
CREATE TABLE events (
  event_id BIGSERIAL PRIMARY KEY,
  event_type TEXT NOT NULL,
  pack_id TEXT,
  idea_id TEXT,
  brief_id TEXT,
  payload JSONB,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Basic indexes
CREATE INDEX ON ideas((scores->>'novelty'));
CREATE INDEX ON content_packs((seo->>'slug'));
CREATE INDEX ON events(event_type);
