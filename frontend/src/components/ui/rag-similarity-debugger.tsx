import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'

export interface RAGResult {
  doc_id: string
  chunk_index: number
  content: string
  similarity_score: number
}

export interface RAGSimilarityDebuggerProps {
  query: string
  results: RAGResult[]
}

export const RAGSimilarityDebugger: React.FC<RAGSimilarityDebuggerProps> = ({
  query,
  results
}) => {
  const [selectedChunk, setSelectedChunk] = useState<RAGResult | null>(null)

  const highlightQuery = (content: string, query: string): React.ReactNode => {
    if (!query.trim()) return content
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0)
    let highlightedContent = content
    
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi')
      highlightedContent = highlightedContent.replace(regex, '|||HIGHLIGHT_START|||$1|||HIGHLIGHT_END|||')
    })
    
    const parts = highlightedContent.split(/(|||HIGHLIGHT_START|||.*?|||HIGHLIGHT_END|||)/)
    
    return parts.map((part, index) => {
      if (part.startsWith('|||HIGHLIGHT_START|||') && part.endsWith('|||HIGHLIGHT_END|||')) {
        const text = part.replace(/|||HIGHLIGHT_START|||/, '').replace(/|||HIGHLIGHT_END|||/, '')
        return (
          <span key={index} className="bg-yellow-200 dark:bg-yellow-800 px-1 py-0.5 rounded">
            {text}
          </span>
        )
      }
      return part
    })
  }

  const truncateContent = (content: string, maxLength: number = 500): string => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const getScoreColor = (score: number): string => {
    if (score >= 0.8) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
    if (score >= 0.6) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
    if (score >= 0.4) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-semibold">RAG similarity debugger</CardTitle>
          <div className="text-sm text-muted-foreground">
            <span className="font-medium">Query:</span> 
            <span className="ml-2 font-mono bg-muted px-2 py-1 rounded">{query}</span>
          </div>
          <div className="text-sm text-muted-foreground">
            Found {results.length} results
          </div>
        </CardHeader>
      </Card>

      <div className="space-y-4">
        {results.map((result, index) => (
          <Card key={`${result.doc_id}-${result.chunk_index}`} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <Badge 
                    className={`font-mono ${getScoreColor(result.similarity_score)}`}
                  >
                    {result.similarity_score.toFixed(3)}
                  </Badge>
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium">Doc:</span> {result.doc_id} | 
                    <span className="font-medium ml-2">Chunk:</span> {result.chunk_index}
                  </div>
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setSelectedChunk(result)}
                    >
                      Inspect
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle>Chunk details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Document ID:</span>
                          <span className="ml-2 font-mono">{selectedChunk?.doc_id}</span>
                        </div>
                        <div>
                          <span className="font-medium">Chunk index:</span>
                          <span className="ml-2 font-mono">{selectedChunk?.chunk_index}</span>
                        </div>
                        <div>
                          <span className="font-medium">Similarity score:</span>
                          <Badge className={`ml-2 ${selectedChunk ? getScoreColor(selectedChunk.similarity_score) : ''}`}>
                            {selectedChunk?.similarity_score.toFixed(6)}
                          </Badge>
                        </div>
                        <div>
                          <span className="font-medium">Content length:</span>
                          <span className="ml-2">{selectedChunk?.content.length} characters</span>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">Full content:</h4>
                        <ScrollArea className="h-96 w-full border rounded-md p-4">
                          <div className="text-sm whitespace-pre-wrap">
                            {selectedChunk && highlightQuery(selectedChunk.content, query)}
                          </div>
                        </ScrollArea>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              
              <div className="text-sm leading-relaxed">
                {highlightQuery(truncateContent(result.content), query)}
              </div>
              
              {result.content.length > 500 && (
                <div className="text-xs text-muted-foreground mt-2">
                  Content truncated. Click "Inspect" to see full content.
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        
        {results.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <div className="text-muted-foreground">
                No results found for the query "{query}"
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default RAGSimilarityDebugger


