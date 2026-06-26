# AKP RAG Primitive Specification

**Version:** 0.1.0 · **Section:** 5 of SPEC.md

## Ingest Pipeline

```
Input text → embed(content) → vector → INSERT storage → observe(latency_ms) → id
```

## Search Pipelines

### Semantic Search
```
Query → embed(query) → cosine_distance(embedding, query_vec) → filter → ORDER BY similarity DESC
```

### Hybrid Search (RECOMMENDED)
```
Query → embed(query) → vector_results (with rank)
      → plainto_tsquery(query) → bm25_results (with rank)
      → RRF: score = 1/(60 + rank_vector) + 1/(60 + rank_bm25)
      → merge + dedup by id → ORDER BY RRF score DESC
```

## Required Operations

| Operation | Endpoint | Conformance |
|-----------|----------|-------------|
| Ingest single | `POST /rag/ingest` | REQUIRED |
| Ingest batch | `POST /rag/ingest/batch` | REQUIRED |
| Semantic search | `POST /rag/search` | REQUIRED |
| Hybrid search | `POST /rag/hybrid-search` | RECOMMENDED |
| List collections | `GET /rag/collections` | REQUIRED |
| Delete document | `DELETE /rag/:id` | REQUIRED |
| Observations | `GET /rag/observations` | RECOMMENDED |

## Observability

Implementations SHOULD record per-search observations:

```typescript
interface AKPRagObservation {
  query_text: string | null;   // null for ingest
  collection: string;
  results_count: number;
  top_similarity: number | null;
  latency_ms: number;           // Wall-clock embed + query time
  model_used: string;
  created_at: ISO8601;
}
```

**Why observability matters:** In retrieval-based AI, quality lives in the invisible middle. A silent retrieval failure corrupts every response downstream. Observing retrieval quality enables systematic improvement without changing the model.

## pgvector Index Recommendations

```sql
-- Up to ~100k documents
CREATE INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- 100k+ documents (requires pgvector 0.5+)
CREATE INDEX USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```
