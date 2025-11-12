'use client'

import { EmbeddingChunkInspector, type ChunkData } from '@/components/ui'

const mockChunks: ChunkData[] = [
  {
    chunk_index: 0,
    start_offset: 0,
    end_offset: 512,
    content: 'This is the first chunk of text. It demonstrates how the Embedding Chunk Inspector component displays chunked documents with their embedding metadata. This component is useful for debugging RAG systems and understanding how documents are split for vectorization. The chunk shows various metadata including offsets, dimensions, and identifiers that help track the chunk through the system.',
    embedding_dim: 1536,
    doc_id: 'doc_123456789',
    chunk_id: 'chunk_001'
  },
  {
    chunk_index: 1,
    start_offset: 512,
    end_offset: 1024,
    content: 'This is the second chunk of the document. It continues from where the first chunk ended. Each chunk has its own unique identifiers and maintains context about its position in the original document. The embedding dimension indicates the size of the vector representation for semantic search capabilities.',
    embedding_dim: 1536,
    doc_id: 'doc_123456789',
    chunk_id: 'chunk_002'
  },
  {
    chunk_index: 2,
    start_offset: 1024,
    end_offset: 1536,
    content: 'The third chunk demonstrates how longer documents are broken down into manageable pieces. This is essential for processing large documents efficiently while maintaining semantic coherence. The chunk inspector allows developers to verify that chunking strategies are working correctly and producing meaningful segments.',
    embedding_dim: 1536,
    doc_id: 'doc_123456789',
    chunk_id: 'chunk_003'
  },
  {
    chunk_index: 3,
    start_offset: 1536,
    end_offset: 2048,
    content: 'Finally, this fourth chunk shows how the component handles multiple chunks seamlessly. It provides clear visual separation and displays all relevant metadata in an organized, easy-to-read format. The scrollable interface ensures that even documents with many chunks remain manageable to inspect and debug.',
    embedding_dim: 1536,
    doc_id: 'doc_123456789',
    chunk_id: 'chunk_004'
  }
]

export default function EmbeddingChunkInspectorDemo() {
  return (
    <div className="container mx-auto py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Embedding chunk inspector demo</h1>
        <p className="text-muted-foreground">
          This component visualizes how documents are chunked for embedding and RAG systems.
        </p>
      </div>
      <EmbeddingChunkInspector chunks={mockChunks} />
    </div>
  )
}


