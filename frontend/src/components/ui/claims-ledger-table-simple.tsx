"use client"

import * as React from 'react'
import { motion } from 'framer-motion'
import { ExternalLink, AlertTriangle, Clock } from 'lucide-react'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

export interface Claim {
  id?: string
  claim_text: string
  source_url?: string
  retrieved_snippet: string
  confidence_score: number
  created_at?: string
}

export interface ClaimsLedgerTableProps {
  claims: Claim[]
  loading?: boolean
  className?: string
}

const getConfidenceBadge = (score: number) => {
  if (score >= 80) {
    return { variant: 'default' as const, color: 'bg-green-500', label: 'High' }
  } else if (score >= 50) {
    return { variant: 'secondary' as const, color: 'bg-yellow-500', label: 'Medium' }
  } else {
    return { variant: 'destructive' as const, color: 'bg-red-500', label: 'Low' }
  }
}

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function ClaimsLedgerTable({
  claims = [],
  loading = false,
  className
}: ClaimsLedgerTableProps) {
  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle>Loading Claims...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className={cn("space-y-6", className)}>
      <Card>
        <CardHeader>
          <CardTitle>Claims Ledger</CardTitle>
          <CardDescription>
            AI-extracted claims với confidence scores và source verification
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Claim Text</TableHead>
                  <TableHead>Source URL</TableHead>
                  <TableHead>Retrieved Snippet</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Created</TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                {claims.map((claim, index) => {
                  const confidenceBadge = getConfidenceBadge(claim.confidence_score)
                  const hasNoSource = !claim.source_url
                  
                  return (
                    <TableRow
                      key={claim.id || index}
                      className={cn(
                        "border-b transition-colors hover:bg-muted/50",
                        hasNoSource && "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800"
                      )}
                    >
                      <TableCell className="font-medium max-w-md">
                        <p>{truncateText(claim.claim_text, 80)}</p>
                      </TableCell>
                      
                      <TableCell>
                        {claim.source_url ? (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => window.open(claim.source_url!, '_blank')}
                            className="h-auto p-1 text-blue-600 hover:text-blue-800"
                          >
                            <ExternalLink className="h-3 w-3 mr-1" />
                            View Source
                          </Button>
                        ) : (
                          <div className="flex items-center gap-1 text-orange-600">
                            <AlertTriangle className="h-3 w-3" />
                            <span className="text-xs">No source</span>
                          </div>
                        )}
                      </TableCell>
                      
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground">
                          {truncateText(claim.retrieved_snippet, 60)}
                        </p>
                      </TableCell>
                      
                      <TableCell>
                        <Badge variant={confidenceBadge.variant}>
                          {claim.confidence_score}% {confidenceBadge.label}
                        </Badge>
                      </TableCell>
                      
                      <TableCell className="text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {claim.created_at ? new Date(claim.created_at).toLocaleDateString() : 'N/A'}
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

export default ClaimsLedgerTable