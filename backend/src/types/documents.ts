export interface Document {
  id: number
  title: string
  author?: string
  published_date?: string
  tags?: string[]
  content: string
  file_path?: string
  file_type?: string
  file_size?: number
  status: 'processing' | 'ready' | 'error'
  created_at: string
  updated_at: string
}

export interface DocumentChunk {
  id: number
  document_id: number
  chunk_index: number
  content: string
  embedding?: number[]
  token_count?: number
  created_at: string
}

export interface CreateDocumentRequest {
  title: string
  author?: string
  published_date?: string
  tags?: string[]
  content: string
  file_path?: string
  file_type?: string
  file_size?: number
}

export interface SearchDocumentsRequest {
  query?: string
  author?: string
  tags?: string[]
  limit?: number
  offset?: number
}

export interface SearchResult {
  document: Document
  chunks: DocumentChunk[]
  similarity_score?: number
}

export interface DocumentSearchResponse {
  results: SearchResult[]
  total: number
  page: number
  limit: number
}