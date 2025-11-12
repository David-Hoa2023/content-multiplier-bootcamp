'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Loader2, FileText } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Citation {
  id: string
  title: string
  url: string
  snippet: string
}

interface DraftEditorProps {
  content: string
  isStreaming: boolean
  className?: string
  title?: string
  citations?: Citation[]
  onCitationClick?: (citationId: string) => void
}

export function DraftEditor({ 
  content, 
  isStreaming, 
  className,
  title = 'Draft Content',
  citations = [],
  onCitationClick
}: DraftEditorProps) {
  
  // Function to render inline citations
  const renderWithCitations = (text: string) => {
    if (!citations.length) return text
    
    const citationRegex = /\[(\d+)\]/g
    const parts = []
    let lastIndex = 0
    let match
    
    while ((match = citationRegex.exec(text)) !== null) {
      const [fullMatch, citationNum] = match
      const citation = citations.find(c => c.id === citationNum)
      
      // Add text before citation
      if (match.index > lastIndex) {
        parts.push(text.slice(lastIndex, match.index))
      }
      
      // Add citation badge
      if (citation) {
        parts.push(
          <TooltipProvider key={`citation-${citationNum}`}>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge 
                  variant="outline" 
                  className="mx-1 cursor-pointer hover:bg-primary/10 text-xs"
                  onClick={() => onCitationClick?.(citationNum)}
                >
                  {citationNum}
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1">
                  <p className="font-medium text-sm">{citation.title}</p>
                  <p className="text-xs text-muted-foreground">{citation.snippet}</p>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )
      } else {
        parts.push(fullMatch)
      }
      
      lastIndex = match.index + fullMatch.length
    }
    
    // Add remaining text
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex))
    }
    
    return parts.length > 1 ? parts : text
  }
  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {title}
        </CardTitle>
        {isStreaming && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>Đang tạo nội dung...</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[600px] w-full rounded-md border bg-background/50 p-4">
          {content ? (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              <ReactMarkdown
                components={{
                  // Custom rendering for headings
                  h1: ({ children }) => (
                    <h1 className="text-2xl font-bold mb-4 text-foreground">{children}</h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-xl font-semibold mb-3 mt-6 text-foreground">{children}</h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-lg font-medium mb-2 mt-4 text-foreground">{children}</h3>
                  ),
                  // Custom rendering for paragraphs with citation support
                  p: ({ children }) => {
                    if (typeof children === 'string') {
                      return (
                        <p className="mb-4 text-foreground/90 leading-relaxed">
                          {renderWithCitations(children)}
                        </p>
                      )
                    }
                    return (
                      <p className="mb-4 text-foreground/90 leading-relaxed">{children}</p>
                    )
                  },
                  // Custom rendering for lists
                  ul: ({ children }) => (
                    <ul className="mb-4 ml-6 list-disc space-y-2 text-foreground/90">{children}</ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="mb-4 ml-6 list-decimal space-y-2 text-foreground/90">{children}</ol>
                  ),
                  li: ({ children }) => (
                    <li className="text-foreground/90">{children}</li>
                  ),
                  // Custom rendering for code blocks
                  code: ({ className, children, ...props }) => {
                    const match = /language-(\w+)/.exec(className || '')
                    const isInline = !match
                    
                    if (isInline) {
                      return (
                        <code className="px-1.5 py-0.5 rounded-sm bg-muted font-mono text-sm text-foreground">
                          {children}
                        </code>
                      )
                    }
                    
                    return (
                      <pre className="mb-4 p-4 rounded-lg bg-muted overflow-x-auto">
                        <code className="font-mono text-sm text-foreground">
                          {children}
                        </code>
                      </pre>
                    )
                  },
                  // Custom rendering for blockquotes
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-primary/50 pl-4 my-4 italic text-foreground/80">
                      {children}
                    </blockquote>
                  ),
                  // Custom rendering for horizontal rules
                  hr: () => (
                    <hr className="my-8 border-t border-border" />
                  ),
                  // Custom rendering for links
                  a: ({ href, children }) => (
                    <a 
                      href={href} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      {children}
                    </a>
                  ),
                  // Custom rendering for strong/bold text
                  strong: ({ children }) => (
                    <strong className="font-semibold text-foreground">{children}</strong>
                  ),
                  // Custom rendering for emphasis/italic text
                  em: ({ children }) => (
                    <em className="italic">{children}</em>
                  ),
                  // Custom rendering for tables
                  table: ({ children }) => (
                    <div className="mb-4 overflow-x-auto">
                      <table className="w-full border-collapse">
                        {children}
                      </table>
                    </div>
                  ),
                  thead: ({ children }) => (
                    <thead className="border-b-2 border-border">
                      {children}
                    </thead>
                  ),
                  tbody: ({ children }) => (
                    <tbody className="divide-y divide-border">
                      {children}
                    </tbody>
                  ),
                  tr: ({ children }) => (
                    <tr className="hover:bg-muted/50 transition-colors">
                      {children}
                    </tr>
                  ),
                  th: ({ children }) => (
                    <th className="px-4 py-2 text-left font-semibold text-foreground">
                      {children}
                    </th>
                  ),
                  td: ({ children }) => (
                    <td className="px-4 py-2 text-foreground/90">
                      {children}
                    </td>
                  ),
                }}
              >
                {content}
              </ReactMarkdown>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[400px] text-muted-foreground">
              <FileText className="h-12 w-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">Chưa có nội dung</p>
              <p className="text-sm mt-1">Nhấn "Tạo draft content" để bắt đầu</p>
            </div>
          )}
          
          {/* Streaming indicator at the bottom */}
          {isStreaming && content && (
            <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-100" />
              <div className="h-2 w-2 rounded-full bg-primary animate-bounce delay-200" />
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}

export default DraftEditor