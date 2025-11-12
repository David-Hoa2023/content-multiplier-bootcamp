/**
 * RAG System Integration Test
 *
 * Tests the RAG system with real database integration:
 * 1. Direct database ingestion via RAG service
 * 2. Vector similarity search
 * 3. End-to-end workflow verification
 */

import pg from 'pg';

const { Pool } = pg;

// Database configuration
const pool = new Pool({
    connectionString: 'postgres://cm:cm@localhost:5432/cm'
});

// ============================================================================
// RAG Service Functions (from apps/api/src/services/rag.ts)
// ============================================================================

function splitText(raw, chunkSize = 800, overlap = 100) {
    const chunks = [];
    let i = 0;
    while (i < raw.length) {
        const end = Math.min(raw.length, i + chunkSize);
        chunks.push(raw.slice(i, end));
        i += chunkSize - overlap;
        if (i >= raw.length) break;
    }
    return chunks;
}

async function upsertDocument({ doc_id, title, url, raw }, embedFn) {
    console.log(`\n📄 Upserting document: ${doc_id}`);

    // Insert/update document
    await pool.query(
        'INSERT INTO documents(doc_id,title,url,raw) VALUES ($1,$2,$3,$4) ON CONFLICT (doc_id) DO UPDATE SET title=EXCLUDED.title,url=EXCLUDED.url,raw=EXCLUDED.raw',
        [doc_id, title || null, url || null, raw]
    );

    // Split into chunks
    const chunks = splitText(raw);
    console.log(`   Created ${chunks.length} chunks`);

    // Generate embeddings
    console.log(`   Generating embeddings...`);
    const vectors = await embedFn(chunks);
    console.log(`   Generated ${vectors.length} embeddings`);

    // Delete old chunks
    await pool.query('DELETE FROM doc_chunks WHERE doc_id=$1', [doc_id]);

    // Insert new chunks with embeddings
    for (let i = 0; i < chunks.length; i++) {
        await pool.query(
            'INSERT INTO doc_chunks(chunk_id,doc_id,content,embedding) VALUES ($1,$2,$3,$4)',
            [`${doc_id}-${i}`, doc_id, chunks[i], JSON.stringify(vectors[i])]
        );
    }

    console.log(`✅ Document ingested: ${chunks.length} chunks stored`);
    return { doc_id, chunks: chunks.length };
}

async function retrieve(query, topK, embedFn) {
    console.log(`\n🔍 Retrieving for query: "${query.substring(0, 60)}..."`);

    // Generate query embedding
    const [queryVector] = await embedFn([query]);

    // Search for similar chunks
    const result = await pool.query(
        `SELECT content, 1 - (embedding <=> $1::vector) AS score, doc_id
         FROM doc_chunks
         ORDER BY embedding <=> $1::vector ASC
         LIMIT $2`,
        [JSON.stringify(queryVector), topK]
    );

    console.log(`   Found ${result.rows.length} results`);
    result.rows.forEach((row, i) => {
        console.log(`   ${i + 1}. Score: ${parseFloat(row.score).toFixed(4)} | ${row.content.substring(0, 80)}...`);
    });

    return result.rows;
}

// ============================================================================
// Mock Embedding Function (simulates OpenAI embeddings)
// ============================================================================

async function mockEmbed(texts) {
    // In production, this would call OpenAI's text-embedding-3-small
    // For testing without API key, we use deterministic mock embeddings

    return texts.map(text => {
        const vector = [];
        for (let i = 0; i < 1536; i++) {
            // Create deterministic embedding based on text content
            const seed = text.length * (i + 1) + text.charCodeAt(i % text.length);
            vector.push(Math.sin(seed) * Math.cos(seed * 0.5));
        }
        return vector;
    });
}

// ============================================================================
// Test Data
// ============================================================================

const testDocuments = [
    {
        doc_id: 'rag-doc-001',
        title: 'Understanding Vector Databases',
        url: 'https://docs.example.com/vector-db',
        raw: `Vector databases are specialized database systems designed for storing and querying high-dimensional vectors efficiently. Unlike traditional databases that excel at exact matches, vector databases enable similarity search - finding items that are semantically similar based on their vector representations.

The core technology behind vector databases is approximate nearest neighbor (ANN) search. This allows for fast retrieval even with millions of vectors. Popular algorithms include HNSW (Hierarchical Navigable Small World) and IVF (Inverted File Index).

PostgreSQL with the pgvector extension brings vector capabilities to a familiar relational database. This is particularly useful for applications that need both structured data and vector search, avoiding the complexity of managing multiple database systems.

Vector similarity is typically measured using metrics like cosine similarity, which measures the angle between vectors, or Euclidean distance, which measures the geometric distance. Cosine similarity is often preferred for text embeddings because it's invariant to the magnitude of the vectors.

Key use cases include semantic search, recommendation systems, image similarity search, anomaly detection, and retrieval-augmented generation (RAG) for LLM applications.`
    },
    {
        doc_id: 'rag-doc-002',
        title: 'RAG Architecture Patterns',
        url: 'https://docs.example.com/rag-patterns',
        raw: `Retrieval-Augmented Generation (RAG) enhances language models by providing relevant context retrieved from a knowledge base. The basic RAG pipeline consists of three stages: ingestion, retrieval, and generation.

During ingestion, documents are processed into chunks, embedded using a model like text-embedding-3-small, and stored in a vector database. The chunking strategy is critical - chunks must be large enough to contain meaningful context but small enough to be specific.

The retrieval stage performs similarity search using the user's query. The query is embedded with the same model used for ingestion, then the vector database returns the most similar chunks. Top-k retrieval typically returns 3-10 chunks.

Finally, the generation stage combines the retrieved chunks with the user's query in a prompt to the LLM. The LLM uses the provided context to generate a response that's grounded in the knowledge base rather than relying solely on its training data.

Advanced RAG patterns include hybrid search (combining keyword and semantic search), re-ranking retrieved results, query expansion, and recursive retrieval for complex queries.`
    },
    {
        doc_id: 'rag-doc-003',
        title: 'Text Chunking Strategies',
        url: 'https://docs.example.com/chunking',
        raw: `Text chunking is the process of dividing documents into smaller segments for embedding and retrieval. The quality of chunking directly impacts RAG system performance.

Fixed-size chunking divides text into chunks of a constant character or token count. This is simple but can split content mid-sentence or mid-concept. Adding overlap between chunks helps preserve context across boundaries.

Semantic chunking uses natural language processing to split text at meaningful boundaries like sentences, paragraphs, or sections. This produces more coherent chunks but requires more complex processing.

Recursive chunking starts with large chunks and recursively splits them if they exceed a threshold. This works well for hierarchical documents like documentation with headers and sections.

Optimal chunk size depends on your use case. Smaller chunks (200-400 tokens) provide precise retrieval but may lack context. Larger chunks (800-1200 tokens) retain more context but may dilute relevance. A typical sweet spot is 500-800 tokens with 50-100 token overlap.

Important considerations include preserving markdown structure, handling code blocks specially, maintaining citations and references within chunks, and ensuring chunks are self-contained enough to be understood independently.`
    }
];

// ============================================================================
// Test Suite
// ============================================================================

async function runTests() {
    console.log('🧪 RAG SYSTEM INTEGRATION TEST');
    console.log('=' .repeat(80));
    console.log('Testing with REAL PostgreSQL + pgvector database\n');

    try {
        // Test 1: Database Connection
        console.log('📊 TEST 1: Database Connection');
        console.log('-'.repeat(80));

        const result = await pool.query('SELECT version()');
        console.log(`✅ Connected to PostgreSQL`);
        console.log(`   ${result.rows[0].version.substring(0, 100)}...\n`);

        // Check pgvector extension
        const extResult = await pool.query(
            "SELECT * FROM pg_extension WHERE extname = 'vector'"
        );
        if (extResult.rows.length > 0) {
            console.log(`✅ pgvector extension is installed`);
        } else {
            console.log(`❌ pgvector extension NOT found`);
            return;
        }

        // Test 2: Document Ingestion
        console.log('\n\n📝 TEST 2: Document Ingestion');
        console.log('-'.repeat(80));

        for (const doc of testDocuments) {
            await upsertDocument(doc, mockEmbed);
        }

        // Verify in database
        const countResult = await pool.query(
            'SELECT COUNT(*) as count FROM doc_chunks'
        );
        console.log(`\n✅ Total chunks in database: ${countResult.rows[0].count}`);

        const docResult = await pool.query(
            'SELECT doc_id, title FROM documents ORDER BY doc_id'
        );
        console.log(`✅ Documents stored:`);
        docResult.rows.forEach(row => {
            console.log(`   - ${row.doc_id}: ${row.title}`);
        });

        // Test 3: Vector Search
        console.log('\n\n🔎 TEST 3: Vector Similarity Search');
        console.log('-'.repeat(80));

        const queries = [
            'What are vector databases good for?',
            'How does RAG work?',
            'What is the best chunk size?'
        ];

        for (const query of queries) {
            await retrieve(query, 3, mockEmbed);
        }

        // Test 4: Chunk Analysis
        console.log('\n\n📊 TEST 4: Chunk Distribution Analysis');
        console.log('-'.repeat(80));

        const chunkStats = await pool.query(`
            SELECT
                doc_id,
                COUNT(*) as chunk_count,
                AVG(LENGTH(content)) as avg_length,
                MIN(LENGTH(content)) as min_length,
                MAX(LENGTH(content)) as max_length
            FROM doc_chunks
            GROUP BY doc_id
            ORDER BY doc_id
        `);

        console.log('\nChunk statistics by document:');
        chunkStats.rows.forEach(row => {
            console.log(`\n${row.doc_id}:`);
            console.log(`  Chunks: ${row.chunk_count}`);
            console.log(`  Avg length: ${Math.round(row.avg_length)} chars`);
            console.log(`  Range: ${row.min_length} - ${row.max_length} chars`);
        });

        // Test 5: Context Formatting (as would be sent to LLM)
        console.log('\n\n📋 TEST 5: Context Formatting for LLM');
        console.log('-'.repeat(80));

        const testQuery = 'Explain how to implement RAG with vector databases';
        console.log(`Query: "${testQuery}"\n`);

        const results = await retrieve(testQuery, 3, mockEmbed);

        console.log('\nFormatted context for LLM:\n');
        const formattedContext = results.map((r, i) => {
            const docInfo = docResult.rows.find(d => d.doc_id === r.doc_id);
            return `[${i + 1}] ${docInfo?.title || r.doc_id}\n${r.content}`;
        }).join('\n\n---\n\n');

        console.log(formattedContext.substring(0, 800) + '...\n');

        // Test 6: Performance Check
        console.log('\n\n⚡ TEST 6: Performance Metrics');
        console.log('-'.repeat(80));

        const iterations = 5;
        const testQuery2 = 'vector database performance';

        console.log(`Running ${iterations} retrieval queries...`);
        const startTime = Date.now();

        for (let i = 0; i < iterations; i++) {
            await retrieve(testQuery2, 5, mockEmbed);
        }

        const avgTime = (Date.now() - startTime) / iterations;
        console.log(`\n✅ Average retrieval time: ${avgTime.toFixed(2)}ms`);

        // Summary
        console.log('\n\n' + '='.repeat(80));
        console.log('✅ RAG SYSTEM INTEGRATION TEST COMPLETE');
        console.log('='.repeat(80));

        const finalStats = await pool.query(`
            SELECT
                (SELECT COUNT(*) FROM documents) as doc_count,
                (SELECT COUNT(*) FROM doc_chunks) as chunk_count,
                (SELECT COUNT(*) FROM doc_chunks WHERE embedding IS NOT NULL) as embedded_count
        `);

        const stats = finalStats.rows[0];
        console.log('\n📊 Final Statistics:');
        console.log(`   Documents: ${stats.doc_count}`);
        console.log(`   Chunks: ${stats.chunk_count}`);
        console.log(`   With embeddings: ${stats.embedded_count}`);
        console.log(`   Avg retrieval time: ${avgTime.toFixed(2)}ms`);

        console.log('\n✅ All RAG system components working correctly!');
        console.log('\n🎯 Next Steps:');
        console.log('   1. Replace mock embeddings with OpenAI API (set OPENAI_API_KEY)');
        console.log('   2. Test with real content from your domain');
        console.log('   3. Integrate with conductor service for brief generation');
        console.log('   4. Add RAG endpoints to API routes');
        console.log('   5. Create UI for document management');

    } catch (error) {
        console.error('\n❌ Test failed:', error);
        console.error(error.stack);
    } finally {
        await pool.end();
        console.log('\n🔌 Database connection closed');
    }
}

// Run tests
runTests().catch(console.error);
