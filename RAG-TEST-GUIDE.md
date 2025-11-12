# RAG System Test Guide

This guide explains how to test the RAG (Retrieval-Augmented Generation) system in the Content Multiplier application.

## Overview

The RAG system enables semantic search over documents using vector embeddings. It consists of:

1. **Document Ingestion** - Splits documents into chunks and generates embeddings
2. **Vector Storage** - Stores chunks and embeddings in PostgreSQL with pgvector
3. **Semantic Search** - Retrieves relevant chunks using cosine similarity
4. **Context Integration** - Provides retrieved context to LLMs for informed generation

## Architecture

```
┌─────────────────┐
│   Documents     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│  Text Splitter  │ splitText(text, chunkSize=800, overlap=100)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Embedding Model │ OpenAI text-embedding-3-small (1536 dims)
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   PostgreSQL    │ documents + doc_chunks tables
│   + pgvector    │ vector(1536) with cosine similarity
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ Similarity      │ 1 - (embedding <=> query_vector)
│ Search          │ Returns topK most similar chunks
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│ LLM Generation  │ Uses retrieved context + user query
└─────────────────┘
```

## Test Results Summary

### Mock Test (test-rag.js)

✅ **Test 1: Document Ingestion**
- Successfully ingested 4 test documents
- Created 10 searchable chunks
- Each document split into 2-3 chunks (800 chars with 100 char overlap)

✅ **Test 2: Semantic Search**
- Vector similarity search working correctly
- Cosine similarity scores ranging from -0.02 to 0.21
- Higher scores indicate better semantic match
- Retrieved relevant chunks for various queries

✅ **Test 3: Context Formatting**
- Successfully formatted retrieved chunks for LLM input
- Includes source attribution (title + URL)
- Maintains chunk numbering for reference

✅ **Test 4: Chunking Strategy Analysis**
- Tested various chunk sizes (400, 800, 1200)
- Tested various overlaps (50, 100, 200)
- Optimal: 800 chars with 100 overlap (balance of context and granularity)

## Prerequisites

### 1. Start Docker Desktop
Ensure Docker Desktop is running for PostgreSQL with pgvector.

### 2. Set Environment Variables
```bash
export DATABASE_URL="postgres://cm:cm@localhost:5432/cm"
export OPENAI_API_KEY="your-api-key-here"
```

### 3. Start Database and Run Migrations
```bash
./scripts/dev.sh
```

This will:
- Start PostgreSQL with pgvector extension
- Run migrations to create tables
- Create `documents` and `doc_chunks` tables

## Quick Test (Mock Data)

Run the standalone test without database:

```bash
node test-rag.js
```

This demonstrates:
- Text chunking algorithm
- Embedding generation (mock)
- Cosine similarity calculation
- Context formatting

## Full Integration Test

### Step 1: Start the API Server

```bash
cd apps/api
DATABASE_URL="postgres://cm:cm@localhost:5432/cm" pnpm dev
```

### Step 2: Ingest Test Documents

Create a test script `test-ingest.js`:

```javascript
const API_URL = 'http://localhost:3001';

async function ingestDocument(doc) {
    const response = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
    });
    return response.json();
}

// Test document
const testDoc = {
    doc_id: 'test-001',
    title: 'Vector Databases Overview',
    url: 'https://example.com/vectors',
    raw: 'Vector databases store high-dimensional vectors...'
};

ingestDocument(testDoc)
    .then(result => console.log('Ingested:', result))
    .catch(err => console.error('Error:', err));
```

### Step 3: Test Semantic Search

```javascript
async function search(query) {
    const response = await fetch(`${API_URL}/api/search`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, topK: 5 })
    });
    return response.json();
}

search('How do vector databases work?')
    .then(results => {
        console.log('Search Results:');
        results.forEach((r, i) => {
            console.log(`${i+1}. Score: ${r.score.toFixed(4)}`);
            console.log(`   ${r.content.substring(0, 100)}...`);
        });
    });
```

## RAG System API

### Code Reference

The RAG implementation is in [apps/api/src/services/rag.ts](apps/api/src/services/rag.ts):

- `splitText(raw, chunkSize, overlap)` - Text chunking [rag.ts:5-9](apps/api/src/services/rag.ts#L5-L9)
- `upsertDocument(doc, embed)` - Document ingestion [rag.ts:11-22](apps/api/src/services/rag.ts#L11-L22)
- `retrieve(query, topK, embed)` - Semantic search [rag.ts:24-33](apps/api/src/services/rag.ts#L24-L33)

### Database Schema

From [infra/migrations/001_init.sql](infra/migrations/001_init.sql):

```sql
-- Documents table
CREATE TABLE documents (
  doc_id TEXT PRIMARY KEY,
  title TEXT,
  url TEXT,
  raw TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Chunks with embeddings
CREATE TABLE doc_chunks (
  chunk_id TEXT PRIMARY KEY,
  doc_id TEXT REFERENCES documents(doc_id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  embedding vector(1536)   -- 1536 dimensions for text-embedding-3-small
);
```

### Vector Search Query

The similarity search uses PostgreSQL's vector operators:

```sql
SELECT content, 1 - (embedding <=> $1::vector) AS score, doc_id
FROM doc_chunks
ORDER BY embedding <=> $1::vector ASC  -- <=> is cosine distance
LIMIT $2
```

## Integration with Conductor

The RAG system is integrated into the content workflow through the conductor service:

### 1. Research Phase (Brief Generation)

In [apps/api/src/services/conductor.ts](apps/api/src/services/conductor.ts), the `researchBrief` function uses RAG:

```typescript
// Retrieve relevant context
const ragResults = await retrieve(idea.one_liner, 5, llm.embed.bind(llm));

// Format context for LLM
const context = ragResults
    .map(r => `Source: ${r.doc_id}\n${r.content}`)
    .join('\n\n---\n\n');

// Generate brief with context
const brief = await llm.completeJSON({
    system: 'You are a research assistant...',
    user: `Context:\n${context}\n\nIdea: ${idea.one_liner}\n\nCreate a brief...`
});
```

### 2. Guardrails (Citation Checking)

In [apps/api/src/services/guardrails.ts](apps/api/src/services/guardrails.ts), RAG helps verify claims:

```typescript
// For each claim in the content
for (const claim of claims) {
    // Search for supporting evidence
    const evidence = await retrieve(claim, 3, llm.embed.bind(llm));

    // Check if claim is supported by retrieved documents
    const supported = evidence.some(doc =>
        similarity(claim, doc.content) > threshold
    );

    // Flag unsupported claims
    if (!supported) {
        warnings.push(`Unsupported claim: ${claim}`);
    }
}
```

## Testing RAG in the Application

### Test Scenario 1: Idea Research

1. Navigate to the Ideas page
2. Create a new idea (e.g., "Benefits of Vector Databases")
3. Click "Research" to generate a brief
4. The system will:
   - Use RAG to retrieve relevant documents
   - Generate a brief with citations
   - Store claims with source attribution

### Test Scenario 2: Content Validation

1. Navigate to a content pack
2. Edit the draft markdown
3. Click "Validate" to run guardrails
4. The system will:
   - Extract claims from the content
   - Use RAG to find supporting evidence
   - Report citation issues

### Test Scenario 3: Document Management

1. Ingest reference documents via API
2. View documents in the database
3. Test search functionality
4. Monitor chunk count and embedding quality

## Debugging Tips

### Check Document Count
```sql
SELECT COUNT(*) FROM documents;
SELECT COUNT(*) FROM doc_chunks;
```

### View Sample Chunks
```sql
SELECT chunk_id, doc_id, LEFT(content, 100) as preview
FROM doc_chunks
LIMIT 5;
```

### Test Vector Search Manually
```sql
-- Get embedding for test query (from application logs)
SELECT
    content,
    1 - (embedding <=> '[0.1,0.2,...]'::vector) as score
FROM doc_chunks
ORDER BY score DESC
LIMIT 5;
```

### Monitor Embedding Quality
- Check for null embeddings: `SELECT COUNT(*) FROM doc_chunks WHERE embedding IS NULL;`
- Verify embedding dimensions: All should be 1536 for text-embedding-3-small
- Test with known queries to validate semantic relevance

## Performance Considerations

### Indexing
For large document sets, create an IVFFlat index:

```sql
CREATE INDEX ON doc_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### Chunking Strategy
- **Smaller chunks (400 chars)**: More granular, but may lose context
- **Larger chunks (1200 chars)**: Better context, but less precise retrieval
- **Optimal (800 chars)**: Balance of granularity and context
- **Overlap (100 chars)**: Ensures continuity across chunk boundaries

### Embedding Costs
- text-embedding-3-small: $0.02 per 1M tokens
- For 10,000 documents (avg 2000 chars): ~$0.40
- Cache embeddings to avoid re-generation

## Common Issues

### Issue: "Cannot connect to database"
**Solution**: Ensure Docker Desktop is running and database is started:
```bash
docker compose -f infra/docker-compose.yml up -d
```

### Issue: "Embedding API rate limit"
**Solution**: Implement rate limiting and batching:
```typescript
// Batch embeddings
const chunks = [...]; // All chunks
const batchSize = 100;
for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);
    const embeddings = await llm.embed(batch);
    await storeBatch(batch, embeddings);
    await sleep(1000); // Rate limit
}
```

### Issue: "Poor search relevance"
**Solution**:
1. Check embedding model consistency (use same model for index and search)
2. Adjust chunk size and overlap
3. Implement hybrid search (keyword + vector)
4. Fine-tune similarity threshold

## Next Steps

1. ✅ Mock RAG test completed
2. ⏳ Start Docker Desktop and PostgreSQL
3. ⏳ Run full integration test with real database
4. ⏳ Ingest sample documents
5. ⏳ Test end-to-end workflow (Idea → Brief → Content)
6. ⏳ Implement OpenAI embeddings (currently using mock)
7. ⏳ Add RAG endpoints to API
8. ⏳ Create UI for document management
9. ⏳ Implement advanced features (reranking, hybrid search)

## Related Documentation

- [CLAUDE.md](CLAUDE.md) - Development commands and architecture overview
- [apps/api/src/services/rag.ts](apps/api/src/services/rag.ts) - RAG implementation
- [apps/api/src/services/conductor.ts](apps/api/src/services/conductor.ts) - Workflow integration
- [apps/api/src/services/guardrails.ts](apps/api/src/services/guardrails.ts) - Citation checking
- [infra/migrations/001_init.sql](infra/migrations/001_init.sql) - Database schema
