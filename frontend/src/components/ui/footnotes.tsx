'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  Copy, 
  CheckCircle, 
  ExternalLink, 
  BookOpen,
  FileText
} from 'lucide-react'

interface Citation {
  id: string
  title: string
  url: string
  snippet: string
  retrievedAt?: Date
}

interface FootnotesProps {
  citations: Citation[]
  className?: string
  title?: string
  highlightedCitation?: string | null
}

export function Footnotes({
  citations,
  className,
  title = 'Nguồn tham khảo',
  highlightedCitation,
}: FootnotesProps) {
  const [copiedUrls, setCopiedUrls] = useState<Set<string>>(new Set())
  const footnoteRefs = useRef<{ [key: string]: HTMLDivElement | null }>({})

  // Scroll to highlighted citation
  useEffect(() => {
    if (highlightedCitation && footnoteRefs.current[highlightedCitation]) {
      footnoteRefs.current[highlightedCitation]?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      })
    }
  }, [highlightedCitation])

  const handleCopyUrl = async (url: string, citationId: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setCopiedUrls(prev => new Set(prev.add(citationId)))
      setTimeout(() => {
        setCopiedUrls(prev => {
          const newSet = new Set(prev)
          newSet.delete(citationId)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const truncateSnippet = (snippet: string, maxLength: number = 150) => {
    if (snippet.length <= maxLength) return snippet
    return snippet.substring(0, maxLength) + '...'
  }

  if (!citations.length) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mb-4 opacity-50" />
            <p className="text-sm">Chưa có nguồn tham khảo</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {title}
          <Badge variant="secondary" className="ml-auto">
            {citations.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Accordion type="single" collapsible className="w-full">
          {citations.map((citation) => (
            <AccordionItem 
              key={citation.id} 
              value={citation.id}
              ref={(el) => { footnoteRefs.current[citation.id] = el; }}
              className={cn(
                'transition-all duration-300',
                highlightedCitation === citation.id && 'bg-primary/5 border-primary/20 rounded-lg'
              )}
            >
              <AccordionTrigger className="hover:no-underline py-4">
                <div className="flex items-start gap-3 text-left flex-1">
                  <Badge 
                    variant="outline" 
                    className={cn(
                      'text-xs font-mono mt-0.5',
                      highlightedCitation === citation.id && 'bg-primary text-primary-foreground'
                    )}
                  >
                    {citation.id}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-sm leading-tight line-clamp-2 text-foreground">
                      {citation.title}
                    </h4>
                    <div className="flex items-center gap-2 mt-2">
                      <ExternalLink className="h-3 w-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground font-mono truncate">
                        {citation.url}
                      </span>
                    </div>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="pb-4">
                <div className="ml-12 space-y-4">
                  {/* Snippet */}
                  <div className="rounded-lg bg-muted/50 p-4 border-l-4 border-primary/50">
                    <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                      Trích đoạn
                    </h5>
                    <p className="text-sm text-foreground/90 leading-relaxed">
                      "{citation.snippet}"
                    </p>
                  </div>
                  
                  {/* URL and Actions */}
                  <div className="space-y-3">
                    <div>
                      <h5 className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">
                        Liên kết
                      </h5>
                      <div className="flex items-center gap-2 p-3 bg-background border rounded-md">
                        <code className="flex-1 text-xs text-foreground font-mono break-all">
                          {citation.url}
                        </code>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleCopyUrl(citation.url, citation.id)}
                            className="h-8 w-8 p-0"
                            title="Copy URL"
                          >
                            {copiedUrls.has(citation.id) ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => window.open(citation.url, '_blank')}
                            className="h-8 w-8 p-0"
                            title="Open in new tab"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {citation.retrievedAt && (
                      <div>
                        <h5 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                          Ngày truy cập
                        </h5>
                        <p className="text-xs text-muted-foreground">
                          {citation.retrievedAt.toLocaleDateString('vi-VN', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </CardContent>
    </Card>
  )
}

export default Footnotes