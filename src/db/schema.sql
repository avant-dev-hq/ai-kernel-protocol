BEGIN;
CREATE EXTENSION IF NOT EXISTS vector;
CREATE TABLE IF NOT EXISTS meta.rag_documents (
  id SERIAL PRIMARY KEY, org_id INTEGER, collection TEXT NOT NULL DEFAULT 'default',
  title TEXT, content TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}', embedding vector(1536),
  model_used TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rag_documents_embedding_idx ON meta.rag_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE INDEX IF NOT EXISTS rag_documents_collection_idx ON meta.rag_documents (collection);
CREATE INDEX IF NOT EXISTS rag_documents_tags_idx ON meta.rag_documents USING gin(tags);
CREATE TABLE IF NOT EXISTS meta.rag_documents_mistral (
  id SERIAL PRIMARY KEY, org_id INTEGER, collection TEXT NOT NULL DEFAULT 'default',
  title TEXT, content TEXT NOT NULL, metadata JSONB NOT NULL DEFAULT '{}',
  tags TEXT[] NOT NULL DEFAULT '{}', embedding vector(1024),
  model_used TEXT NOT NULL DEFAULT 'mistral-embed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rag_mistral_embedding_idx ON meta.rag_documents_mistral USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
CREATE TABLE IF NOT EXISTS meta.assistant_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(), user_id TEXT NOT NULL,
  org_id INTEGER, title TEXT, agent_id INTEGER,
  model_provider TEXT NOT NULL DEFAULT 'anthropic', model_name TEXT, system_prompt TEXT,
  metadata JSONB NOT NULL DEFAULT '{}', tags TEXT[] NOT NULL DEFAULT '{}',
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived','deleted')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS assistant_sessions_user_idx ON meta.assistant_sessions (user_id);
CREATE INDEX IF NOT EXISTS assistant_sessions_status_idx ON meta.assistant_sessions (status);
CREATE TABLE IF NOT EXISTS meta.assistant_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES meta.assistant_sessions(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user','assistant','system','tool')),
  content TEXT NOT NULL, tool_calls JSONB, tool_results JSONB,
  tokens_used INTEGER, cost_cents NUMERIC(10,4), model_used TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS assistant_messages_session_idx ON meta.assistant_messages (session_id, created_at);
CREATE TABLE IF NOT EXISTS meta.skills (
  id SERIAL PRIMARY KEY, org_id INTEGER, name TEXT NOT NULL UNIQUE,
  description TEXT NOT NULL DEFAULT '', tool_schema JSONB NOT NULL DEFAULT '{}',
  executor TEXT NOT NULL, tags TEXT[] NOT NULL DEFAULT '{}', enabled BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(), updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
COMMIT;
