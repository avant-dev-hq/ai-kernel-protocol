# AKP RAG Primitive Specification
**Version:** 0.1.0 · **Section:** 5 of SPEC.md

## Ingest Pipeline
```
text → embed(content) → vector → INSERT storage → observe(latency) → id
```

## Semantic Search
```
query → embed(query) → cosine_distance → filter(threshold, collection) → ORDER BY similarity
```

## Hybrid Search (RECOMMENDED)
```
query → embed(query) → vector_results[rank]
      → plainto_tsquery(query) → bm25_results[rank]
      → RRF: score = 1/(60 + rank_v) + 1/(60 + rank_bm25)
      → dedup by id → ORDER BY RRF score
```

## Observability

```typescript
interface AKPRagObservation {
  query_text: string | null;  // null = ingest operation
  collection: string;
  results_count: number;
  top_similarity: number | null;
  latency_ms: number;          // embed + query wall-clock time
  model_used: string;
  created_at: string;
}
```

In retrieval-based AI, quality lives in the invisible middle. A silent retrieval failure corrupts every downstream response.

## pgvector Indexes

```sql
-- ≤100k docs:
CREATE INDEX USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- >100k docs (pgvector 0.5+):
CREATE INDEX USING hnsw (embedding vector_cosine_ops) WITH (m = 16, ef_construction = 64);
```
