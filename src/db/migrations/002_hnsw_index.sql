BEGIN;
DROP INDEX IF EXISTS meta.rag_documents_embedding_idx;
CREATE INDEX IF NOT EXISTS rag_documents_embedding_hnsw_idx
  ON meta.rag_documents USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
COMMIT;
