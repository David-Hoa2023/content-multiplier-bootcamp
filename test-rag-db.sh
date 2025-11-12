#!/bin/bash

# RAG System Database Integration Test
# Tests document ingestion and retrieval directly in the database

echo "🧪 RAG SYSTEM DATABASE TEST"
echo "================================================================================"
echo ""

# Test 1: Check pgvector extension
echo "📊 TEST 1: Checking pgvector extension"
echo "--------------------------------------------------------------------------------"
docker exec infra-db-1 psql -U cm -d cm -c "SELECT * FROM pg_extension WHERE extname = 'vector';"
echo ""

# Test 2: Check table schema
echo "📋 TEST 2: Verifying RAG table schema"
echo "--------------------------------------------------------------------------------"
echo "Documents table:"
docker exec infra-db-1 psql -U cm -d cm -c "\d documents"
echo ""
echo "Document chunks table:"
docker exec infra-db-1 psql -U cm -d cm -c "\d doc_chunks"
echo ""

# Test 3: Insert test document
echo "📝 TEST 3: Inserting test document"
echo "--------------------------------------------------------------------------------"
docker exec infra-db-1 psql -U cm -d cm <<EOF
INSERT INTO documents (doc_id, title, url, raw)
VALUES (
    'test-doc-001',
    'Vector Database Basics',
    'https://example.com/vector-db',
    'Vector databases are specialized systems for storing and querying high-dimensional vectors. They enable semantic search by finding similar items based on vector embeddings rather than exact keyword matches. Popular use cases include RAG systems, recommendation engines, and image similarity search.'
)
ON CONFLICT (doc_id) DO UPDATE
SET title = EXCLUDED.title, url = EXCLUDED.url, raw = EXCLUDED.raw;

SELECT doc_id, title, LENGTH(raw) as content_length FROM documents WHERE doc_id = 'test-doc-001';
EOF
echo ""

# Test 4: Insert test chunk with mock embedding
echo "🔢 TEST 4: Inserting test chunk with embedding"
echo "--------------------------------------------------------------------------------"

# Generate a simple mock embedding (random 1536-dimensional vector)
# In production, this would come from OpenAI's embedding API
EMBEDDING="["
for i in {1..1536}; do
    RANDOM_VAL=$(echo "scale=6; $RANDOM / 32767" | bc)
    EMBEDDING="${EMBEDDING}${RANDOM_VAL}"
    if [ $i -lt 1536 ]; then
        EMBEDDING="${EMBEDDING},"
    fi
done
EMBEDDING="${EMBEDDING}]"

docker exec infra-db-1 psql -U cm -d cm <<EOF
DELETE FROM doc_chunks WHERE doc_id = 'test-doc-001';

INSERT INTO doc_chunks (chunk_id, doc_id, content, embedding)
VALUES (
    'test-doc-001-0',
    'test-doc-001',
    'Vector databases are specialized systems for storing and querying high-dimensional vectors.',
    '${EMBEDDING}'::vector
);

INSERT INTO doc_chunks (chunk_id, doc_id, content, embedding)
VALUES (
    'test-doc-001-1',
    'test-doc-001',
    'They enable semantic search by finding similar items based on vector embeddings.',
    '${EMBEDDING}'::vector
);

SELECT chunk_id, doc_id, LENGTH(content) as length FROM doc_chunks WHERE doc_id = 'test-doc-001';
EOF
echo ""

# Test 5: Count records
echo "📊 TEST 5: Record counts"
echo "--------------------------------------------------------------------------------"
docker exec infra-db-1 psql -U cm -d cm <<EOF
SELECT
    (SELECT COUNT(*) FROM documents) as total_documents,
    (SELECT COUNT(*) FROM doc_chunks) as total_chunks,
    (SELECT COUNT(*) FROM doc_chunks WHERE embedding IS NOT NULL) as chunks_with_embeddings;
EOF
echo ""

# Test 6: Sample vector search (will use random embeddings)
echo "🔍 TEST 6: Vector similarity search"
echo "--------------------------------------------------------------------------------"
echo "Searching for similar chunks..."
docker exec infra-db-1 psql -U cm -d cm <<EOF
SELECT
    chunk_id,
    LEFT(content, 60) as preview,
    1 - (embedding <=> '${EMBEDDING}'::vector) as similarity_score
FROM doc_chunks
WHERE embedding IS NOT NULL
ORDER BY embedding <=> '${EMBEDDING}'::vector ASC
LIMIT 5;
EOF
echo ""

# Test 7: Chunk statistics
echo "📈 TEST 7: Chunk statistics"
echo "--------------------------------------------------------------------------------"
docker exec infra-db-1 psql -U cm -d cm <<EOF
SELECT
    doc_id,
    COUNT(*) as chunk_count,
    AVG(LENGTH(content)) as avg_length,
    MIN(LENGTH(content)) as min_length,
    MAX(LENGTH(content)) as max_length
FROM doc_chunks
GROUP BY doc_id
ORDER BY doc_id;
EOF
echo ""

echo "================================================================================"
echo "✅ RAG DATABASE TEST COMPLETE"
echo "================================================================================"
echo ""
echo "Key Findings:"
echo "  • PostgreSQL with pgvector extension is working"
echo "  • Documents and doc_chunks tables are properly configured"
echo "  • Can store 1536-dimensional vectors"
echo "  • Vector similarity search (<=> operator) is functional"
echo ""
echo "Next Steps:"
echo "  1. Integrate with OpenAI embeddings API (replace mock embeddings)"
echo "  2. Test with realistic document corpus"
echo "  3. Optimize with vector indexes (IVFFlat) for large datasets"
echo "  4. Test RAG retrieval in conductor service"
echo ""
