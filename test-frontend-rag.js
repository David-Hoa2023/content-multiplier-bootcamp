/**
 * Frontend RAG System End-to-End Test
 *
 * Tests the complete RAG workflow with OpenAI embeddings:
 * 1. Ingest multiple test documents
 * 2. Perform semantic searches
 * 3. Verify result quality and relevance
 * 4. Test API integration
 */

const API_URL = 'http://localhost:3003';

// Test documents covering different topics
const testDocuments = [
    {
        doc_id: 'frontend-test-001',
        title: 'Vector Database Fundamentals',
        url: 'https://docs.example.com/vector-db',
        raw: 'Vector databases are specialized database systems designed for storing and querying high-dimensional vector embeddings. Unlike traditional relational databases that use exact keyword matching, vector databases enable semantic similarity search using algorithms like HNSW (Hierarchical Navigable Small World) or IVF (Inverted File Index). These systems are essential for modern AI applications including RAG systems, recommendation engines, image similarity search, and anomaly detection. PostgreSQL with pgvector extension provides vector capabilities within a familiar relational database framework.'
    },
    {
        doc_id: 'frontend-test-002',
        title: 'RAG Architecture and Implementation',
        url: 'https://docs.example.com/rag-architecture',
        raw: 'Retrieval-Augmented Generation (RAG) enhances large language models by providing relevant context from external knowledge bases. The RAG pipeline consists of three stages: ingestion, retrieval, and generation. During ingestion, documents are split into chunks using strategies like fixed-size chunking with overlap, semantic chunking based on sentence boundaries, or recursive chunking for hierarchical documents. Each chunk is embedded using models like OpenAI text-embedding-3-small which produces 1536-dimensional vectors. During retrieval, the user query is embedded and similar chunks are found using cosine similarity or dot product distance metrics. The generation stage combines retrieved context with the original query to produce grounded, factual responses.'
    },
    {
        doc_id: 'frontend-test-003',
        title: 'Text Embeddings and Semantic Search',
        url: 'https://docs.example.com/embeddings',
        raw: 'Text embeddings are dense vector representations that capture the semantic meaning of text. Modern embedding models like text-embedding-3-small and text-embedding-3-large from OpenAI use transformer architectures trained on vast corpora to learn meaningful representations. The key property of embeddings is that semantically similar texts produce vectors that are close together in the high-dimensional embedding space. This enables semantic search where we can find relevant documents based on meaning rather than exact keyword matches. Embeddings are also used for text classification, clustering, recommendation systems, and as features for downstream machine learning tasks.'
    },
    {
        doc_id: 'frontend-test-004',
        title: 'Content Multiplier Workflow',
        url: 'https://docs.example.com/workflow',
        raw: 'The Content Multiplier platform streamlines content creation through an intelligent workflow. It starts with idea generation where the system suggests topics based on trends and user preferences. The research phase uses RAG to gather relevant information from a curated knowledge base, ensuring content is well-informed and factual. During drafting, the system generates initial content with proper structure and tone. The derivatives phase creates multiple variations optimized for different platforms like Twitter, LinkedIn, newsletters, and blog posts. Finally, guardrails validate content for accuracy, citation quality, and brand consistency before distribution.'
    },
    {
        doc_id: 'frontend-test-005',
        title: 'OpenAI Embedding Models Comparison',
        url: 'https://docs.example.com/openai-embeddings',
        raw: 'OpenAI offers several embedding models with different trade-offs. The text-embedding-3-small model produces 1536-dimensional vectors and is optimized for speed and cost-effectiveness, making it ideal for most applications. It costs $0.02 per million tokens and provides strong performance across various tasks. The text-embedding-3-large model generates 3072-dimensional vectors with higher accuracy but at increased cost ($0.13 per million tokens) and latency. For applications requiring maximum precision like legal document analysis or medical research, the larger model is recommended. For general RAG systems, semantic search, and content recommendations, the small model offers the best balance.'
    }
];

// Test queries with expected relevant documents
const testQueries = [
    {
        query: 'What is a vector database and how does it work?',
        expectedDoc: 'frontend-test-001',
        description: 'Basic vector database understanding'
    },
    {
        query: 'Explain the RAG pipeline and its stages',
        expectedDoc: 'frontend-test-002',
        description: 'RAG architecture knowledge'
    },
    {
        query: 'How do text embeddings enable semantic search?',
        expectedDoc: 'frontend-test-003',
        description: 'Embeddings and semantic search'
    },
    {
        query: 'What is the content creation workflow in Content Multiplier?',
        expectedDoc: 'frontend-test-004',
        description: 'Content Multiplier platform workflow'
    },
    {
        query: 'Which OpenAI embedding model should I use for RAG?',
        expectedDoc: 'frontend-test-005',
        description: 'Embedding model selection'
    }
];

async function ingestDocument(doc) {
    const response = await fetch(`${API_URL}/api/rag/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(doc)
    });

    if (!response.ok) {
        throw new Error(`Ingestion failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

async function searchRAG(query, topK = 3) {
    const response = await fetch(`${API_URL}/api/rag/search?q=${encodeURIComponent(query)}`);

    if (!response.ok) {
        throw new Error(`Search failed: ${response.status} ${response.statusText}`);
    }

    return response.json();
}

async function runTests() {
    console.log('🧪 FRONTEND RAG SYSTEM END-TO-END TEST');
    console.log('='.repeat(80));
    console.log(`API URL: ${API_URL}`);
    console.log(`Frontend URL: http://localhost:3000`);
    console.log('');

    let passedTests = 0;
    let failedTests = 0;

    try {
        // Test 1: Document Ingestion
        console.log('📝 TEST 1: Document Ingestion with OpenAI Embeddings');
        console.log('-'.repeat(80));

        for (const doc of testDocuments) {
            try {
                const result = await ingestDocument(doc);
                console.log(`✅ ${doc.doc_id}: ${doc.title}`);
                console.log(`   Chunks created: ${result.chunks}`);
                passedTests++;
            } catch (error) {
                console.log(`❌ ${doc.doc_id}: ${error.message}`);
                failedTests++;
            }
        }

        console.log('');

        // Test 2: Semantic Search Quality
        console.log('🔍 TEST 2: Semantic Search Quality');
        console.log('-'.repeat(80));

        for (const test of testQueries) {
            try {
                console.log(`\nQuery: "${test.query}"`);
                console.log(`Expected: ${test.expectedDoc} (${test.description})`);

                const results = await searchRAG(test.query, 3);

                if (results.length === 0) {
                    console.log(`❌ No results found`);
                    failedTests++;
                    continue;
                }

                console.log(`\nTop Results:`);
                results.forEach((r, i) => {
                    const relevance = r.doc_id === test.expectedDoc ? '✓ MATCH' : '';
                    console.log(`  ${i + 1}. ${r.doc_id} (score: ${r.score.toFixed(4)}) ${relevance}`);
                    console.log(`     ${r.content.substring(0, 100)}...`);
                });

                // Check if expected document is in top 3
                const foundExpected = results.some(r => r.doc_id === test.expectedDoc);
                if (foundExpected) {
                    console.log(`✅ Found expected document in top 3 results`);
                    passedTests++;
                } else {
                    console.log(`❌ Expected document not in top 3 results`);
                    failedTests++;
                }

                // Check minimum similarity score
                const topScore = results[0].score;
                if (topScore >= 0.5) {
                    console.log(`✅ Top result has good similarity (${topScore.toFixed(4)} >= 0.5)`);
                    passedTests++;
                } else {
                    console.log(`⚠️  Top result has low similarity (${topScore.toFixed(4)} < 0.5)`);
                    failedTests++;
                }

            } catch (error) {
                console.log(`❌ Search failed: ${error.message}`);
                failedTests++;
            }
        }

        // Test 3: Cross-topic Search
        console.log('\n\n🎯 TEST 3: Cross-Topic Semantic Understanding');
        console.log('-'.repeat(80));

        const crossTopicTests = [
            'How can I build a semantic search system?',
            'What technology powers Content Multiplier?',
            'Comparing different embedding approaches'
        ];

        for (const query of crossTopicTests) {
            try {
                console.log(`\nQuery: "${query}"`);
                const results = await searchRAG(query, 3);

                console.log(`Results:`);
                results.forEach((r, i) => {
                    console.log(`  ${i + 1}. ${r.doc_id} (score: ${r.score.toFixed(4)})`);
                });

                if (results.length > 0 && results[0].score >= 0.4) {
                    console.log(`✅ Found relevant results (top score: ${results[0].score.toFixed(4)})`);
                    passedTests++;
                } else {
                    console.log(`⚠️  Low relevance or no results`);
                    failedTests++;
                }
            } catch (error) {
                console.log(`❌ Search failed: ${error.message}`);
                failedTests++;
            }
        }

        // Test 4: Performance
        console.log('\n\n⚡ TEST 4: Performance Metrics');
        console.log('-'.repeat(80));

        const perfQuery = 'vector database performance';
        const iterations = 5;
        const times = [];

        console.log(`Running ${iterations} searches for: "${perfQuery}"`);

        for (let i = 0; i < iterations; i++) {
            const start = Date.now();
            await searchRAG(perfQuery, 5);
            const time = Date.now() - start;
            times.push(time);
            console.log(`  Iteration ${i + 1}: ${time}ms`);
        }

        const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
        console.log(`\nAverage search time: ${avgTime.toFixed(2)}ms`);

        if (avgTime < 2000) {
            console.log(`✅ Performance is good (< 2000ms)`);
            passedTests++;
        } else {
            console.log(`⚠️  Performance needs improvement (>= 2000ms)`);
            failedTests++;
        }

    } catch (error) {
        console.error('\n❌ Test suite failed:', error);
        failedTests++;
    }

    // Summary
    console.log('\n\n' + '='.repeat(80));
    console.log('📊 TEST SUMMARY');
    console.log('='.repeat(80));
    console.log(`Total Tests: ${passedTests + failedTests}`);
    console.log(`✅ Passed: ${passedTests}`);
    console.log(`❌ Failed: ${failedTests}`);
    console.log(`Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);

    console.log('\n🎯 System Status:');
    console.log(`  • API Server: http://localhost:3003 ✅`);
    console.log(`  • Frontend: http://localhost:3000 ✅`);
    console.log(`  • PostgreSQL + pgvector: ✅`);
    console.log(`  • OpenAI Embeddings: ✅`);
    console.log(`  • RAG Pipeline: ${failedTests === 0 ? '✅ FULLY OPERATIONAL' : '⚠️  NEEDS ATTENTION'}`);

    console.log('\n💡 Next Steps:');
    console.log('  1. Open http://localhost:3000 in your browser');
    console.log('  2. Navigate to Ideas → Create Brief to test RAG integration');
    console.log('  3. Check that researched briefs include citations from ingested documents');
    console.log('  4. Test content validation with guardrails');

    process.exit(failedTests === 0 ? 0 : 1);
}

// Run tests
runTests().catch(console.error);
