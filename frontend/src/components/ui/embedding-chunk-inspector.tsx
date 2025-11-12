import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface ChunkData {
  chunk_index: number
  start_offset: number
  end_offset: number
  content: string
  embedding_dim: number
  doc_id: string
  chunk_id: string
}

export interface EmbeddingChunkInspectorProps {
  chunks: ChunkData[]
}

export const EmbeddingChunkInspector: React.FC<EmbeddingChunkInspectorProps> = ({ chunks }) => {
  const truncateContent = (content: string, maxLength: number = 500): string => {
    if (content.length <= maxLength) return content
    return content.slice(0, maxLength) + '...'
  }

  return (
    <div className="w-full space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Embedding chunk inspector</h2>
        <Badge variant="secondary" className="text-sm">
          {chunks.length} chunks
        </Badge>
      </div>
      
      <ScrollArea className="h-[600px] w-full">
        <div className="space-y-4 pr-4">
          {chunks.map((chunk) => (
            <Card key={chunk.chunk_id} className="w-full">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">
                    Chunk #{chunk.chunk_index}
                  </CardTitle>
                  <div className="flex gap-2">
                    <Badge variant="outline" className="text-xs">
                      {chunk.start_offset} - {chunk.end_offset}
                    </Badge>
                    <Badge variant="secondary" className="text-xs">
                      {chunk.embedding_dim}D vector
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground">Content</div>
                  <div className="p-3 bg-muted rounded-md text-sm leading-relaxed">
                    {truncateContent(chunk.content)}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground">Document ID</div>
                    <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {chunk.doc_id}
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="font-medium text-muted-foreground">Chunk ID</div>
                    <div className="font-mono text-xs bg-muted px-2 py-1 rounded">
                      {chunk.chunk_id}
                    </div>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Offset range: {chunk.start_offset} → {chunk.end_offset}</span>
                    <span>Length: {chunk.end_offset - chunk.start_offset} chars</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
      
      {chunks.length === 0 && (
        <Card className="w-full">
          <CardContent className="flex items-center justify-center py-12">
            <div className="text-center space-y-2">
              <div className="text-muted-foreground">No chunks available</div>
              <div className="text-sm text-muted-foreground">
                Load embedding data to inspect chunks
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default EmbeddingChunkInspector


