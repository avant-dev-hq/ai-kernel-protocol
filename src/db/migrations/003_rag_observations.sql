BEGIN;
CREATE TABLE IF NOT EXISTS meta.rag_observations (
  id SERIAL PRIMARY KEY, query_text TEXT,
  collection TEXT NOT NULL DEFAULT 'default', results_count INTEGER NOT NULL DEFAULT 0,
  top_similarity NUMERIC(6,4), latency_ms INTEGER NOT NULL,
  model_used TEXT NOT NULL DEFAULT 'text-embedding-3-small',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS rag_observations_collection_idx ON meta.rag_observations (collection);
CREATE INDEX IF NOT EXISTS rag_observations_created_idx ON meta.rag_observations (created_at DESC);
COMMIT;
