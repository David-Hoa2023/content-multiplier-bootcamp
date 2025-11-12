"use client"

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  ChevronUp, 
  ChevronDown, 
  Download, 
  ExternalLink, 
  AlertTriangle,
  Clock,
  TrendingUp,
  Filter,
  Search,
  RefreshCw,
  Info
} from 'lucide-react'

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
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface Claim {
  id?: string
  claim_text: string
  source_url?: string
  retrieved_snippet: string
  confidence_score: number
  created_at?: string
  updated_at?: string
  category?: string
  verified?: boolean
}

export interface ClaimsLedgerTableProps {
  claims: Claim[]
  loading?: boolean
  showSearch?: boolean
  showFilter?: boolean
  showExport?: boolean
  showPagination?: boolean
  itemsPerPage?: number
  onClaimClick?: (claim: Claim) => void
  onSourceClick?: (url: string) => void
  onExport?: (claims: Claim[]) => void
  className?: string
}

type SortField = 'confidence_score' | 'created_at' | 'claim_text'
type SortOrder = 'asc' | 'desc'

// Animation variants
const tableVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      staggerChildren: 0.1
    }
  }
}

const rowVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.3 }
  },
  hover: {
    scale: 1.01,
    transition: { duration: 0.2 }
  }
}

// Utility functions
const getConfidenceBadge = (score: number) => {
  if (score >= 80) {
    return { variant: 'default' as const, color: 'bg-green-500 hover:bg-green-600', label: 'High' }
  } else if (score >= 50) {
    return { variant: 'secondary' as const, color: 'bg-yellow-500 hover:bg-yellow-600', label: 'Medium' }
  } else {
    return { variant: 'destructive' as const, color: 'bg-red-500 hover:bg-red-600', label: 'Low' }
  }
}

const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A'
  return new Date(dateString).toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateText = (text: string, maxLength: number = 100) => {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + '...'
}

export function ClaimsLedgerTable({
  claims = [],
  loading = false,
  showSearch = true,
  showFilter = true,
  showExport = true,
  showPagination = true,
  itemsPerPage = 10,
  onClaimClick,
  onSourceClick,
  onExport,
  className
}: ClaimsLedgerTableProps) {
  const [sortField, setSortField] = React.useState<SortField>('confidence_score')
  const [sortOrder, setSortOrder] = React.useState<SortOrder>('desc')
  const [searchTerm, setSearchTerm] = React.useState('')
  const [confidenceFilter, setConfidenceFilter] = React.useState<string>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [selectedClaims, setSelectedClaims] = React.useState<Set<string>>(new Set())
  
  const { toast } = useToast()

  // Filter and sort claims
  const filteredClaims = React.useMemo(() => {
    let filtered = claims.filter(claim => {
      const matchesSearch = searchTerm === '' || 
        claim.claim_text.toLowerCase().includes(searchTerm.toLowerCase()) ||
        claim.retrieved_snippet.toLowerCase().includes(searchTerm.toLowerCase())
      
      const matchesConfidence = confidenceFilter === 'all' ||
        (confidenceFilter === 'high' && claim.confidence_score >= 80) ||
        (confidenceFilter === 'medium' && claim.confidence_score >= 50 && claim.confidence_score < 80) ||
        (confidenceFilter === 'low' && claim.confidence_score < 50) ||
        (confidenceFilter === 'no-source' && !claim.source_url)
      
      return matchesSearch && matchesConfidence
    })

    // Sort claims
    filtered.sort((a, b) => {
      let aValue: any = a[sortField]
      let bValue: any = b[sortField]
      
      if (sortField === 'created_at') {
        aValue = new Date(aValue || 0).getTime()
        bValue = new Date(bValue || 0).getTime()
      }
      
      if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }
      
      if (sortOrder === 'asc') {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    return filtered
  }, [claims, searchTerm, confidenceFilter, sortField, sortOrder])

  // Pagination
  const totalPages = Math.ceil(filteredClaims.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedClaims = showPagination 
    ? filteredClaims.slice(startIndex, startIndex + itemsPerPage)
    : filteredClaims

  // Handlers
  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortOrder('desc')
    }
  }

  const handleExport = () => {
    const dataToExport = selectedClaims.size > 0 
      ? filteredClaims.filter(claim => selectedClaims.has(claim.id || ''))
      : filteredClaims

    if (onExport) {
      onExport(dataToExport)
    } else {
      // Default CSV export
      const csvContent = [
        ['Claim Text', 'Source URL', 'Retrieved Snippet', 'Confidence Score', 'Created At'],
        ...dataToExport.map(claim => [
          `"${claim.claim_text.replace(/"/g, '""')}"`,
          claim.source_url || '',
          `"${claim.retrieved_snippet.replace(/"/g, '""')}"`,
          claim.confidence_score.toString(),
          claim.created_at || ''
        ])
      ].map(row => row.join(',')).join('\n')

      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `claims-ledger-${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: `${dataToExport.length} claims exported to CSV`,
      })
    }
  }

  const handleSourceClick = (url: string) => {
    if (onSourceClick) {
      onSourceClick(url)
    } else {
      window.open(url, '_blank', 'noopener,noreferrer')
    }
  }

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null
    return sortOrder === 'asc' ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />
  }

  const claimsWithoutSource = filteredClaims.filter(claim => !claim.source_url).length
  const avgConfidence = filteredClaims.length > 0 
    ? filteredClaims.reduce((sum, claim) => sum + claim.confidence_score, 0) / filteredClaims.length 
    : 0

  if (loading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <CardTitle>Loading Claims...</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex gap-4 p-4 border rounded-lg">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse" />
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4" />
                </div>
                <div className="w-20 h-6 bg-muted rounded animate-pulse" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <TooltipProvider>
      <motion.div
        variants={tableVariants}
        initial="hidden"
        animate="visible"
        className={cn("space-y-6", className)}
      >
        {/* Header with Stats and Controls */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Claims Ledger
                  <Badge variant="outline">{filteredClaims.length}</Badge>
                </CardTitle>
                <CardDescription className="flex items-center gap-4 mt-2">
                  <span>Avg. Confidence: {avgConfidence.toFixed(1)}%</span>
                  {claimsWithoutSource > 0 && (
                    <span className="flex items-center gap-1 text-orange-600">
                      <AlertTriangle className="h-3 w-3" />
                      {claimsWithoutSource} without source
                    </span>
                  )}
                </CardDescription>
              </div>
              
              {showExport && (
                <Button onClick={handleExport} variant="outline" className="gap-2">
                  <Download className="h-4 w-4" />
                  Export CSV
                  {selectedClaims.size > 0 && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedClaims.size}
                    </Badge>
                  )}
                </Button>
              )}
            </div>
          </CardHeader>

          {(showSearch || showFilter) && (
            <CardContent className="pt-0">
              <div className="flex flex-col sm:flex-row gap-4">
                {showSearch && (
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search claims or snippets..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                )}
                
                {showFilter && (
                  <Select value={confidenceFilter} onValueChange={setConfidenceFilter}>
                    <SelectTrigger className="w-48">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue placeholder="Filter by confidence" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Confidence</SelectItem>
                      <SelectItem value="high">High (≥80%)</SelectItem>
                      <SelectItem value="medium">Medium (50-79%)</SelectItem>
                      <SelectItem value="low">Low (<50%)</SelectItem>
                      <SelectItem value="no-source">No Source</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              </div>
            </CardContent>
          )}
        </Card>

        {/* Table */}
        <Card>
          <ScrollArea className="h-[600px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <input
                      type="checkbox"
                      checked={selectedClaims.size === filteredClaims.length && filteredClaims.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedClaims(new Set(filteredClaims.map(claim => claim.id || '')))
                        } else {
                          setSelectedClaims(new Set())
                        }
                      }}
                      className="rounded"
                    />
                  </TableHead>
                  
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('claim_text')}
                      className="h-auto p-0 font-medium"
                    >
                      Claim Text
                      {getSortIcon('claim_text')}
                    </Button>
                  </TableHead>
                  
                  <TableHead>Source URL</TableHead>
                  
                  <TableHead>Retrieved Snippet</TableHead>
                  
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('confidence_score')}
                      className="h-auto p-0 font-medium"
                    >
                      Confidence
                      {getSortIcon('confidence_score')}
                    </Button>
                  </TableHead>
                  
                  <TableHead>
                    <Button
                      variant="ghost"
                      onClick={() => handleSort('created_at')}
                      className="h-auto p-0 font-medium"
                    >
                      Created
                      {getSortIcon('created_at')}
                    </Button>
                  </TableHead>
                </TableRow>
              </TableHeader>
              
              <TableBody>
                <AnimatePresence>
                  {paginatedClaims.map((claim, index) => {
                    const confidenceBadge = getConfidenceBadge(claim.confidence_score)
                    const hasNoSource = !claim.source_url
                    
                    return (
                      <motion.tr
                        key={claim.id || index}
                        variants={rowVariants}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        whileHover="hover"
                        className={cn(
                          "border-b transition-colors hover:bg-muted/50",
                          hasNoSource && "bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800",
                          selectedClaims.has(claim.id || '') && "bg-blue-50 dark:bg-blue-950/20"
                        )}
                        onClick={() => onClaimClick?.(claim)}
                      >
                        <TableCell>
                          <input
                            type="checkbox"
                            checked={selectedClaims.has(claim.id || '')}
                            onChange={(e) => {
                              const newSelected = new Set(selectedClaims)
                              if (e.target.checked) {
                                newSelected.add(claim.id || '')
                              } else {
                                newSelected.delete(claim.id || '')
                              }
                              setSelectedClaims(newSelected)
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="rounded"
                          />
                        </TableCell>
                        
                        <TableCell className="font-medium max-w-md">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="cursor-pointer hover:text-blue-600">
                                {truncateText(claim.claim_text, 80)}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-lg">
                              <p>{claim.claim_text}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        
                        <TableCell>
                          {claim.source_url ? (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleSourceClick(claim.source_url!)
                              }}
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
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <p className="text-sm text-muted-foreground cursor-pointer">
                                {truncateText(claim.retrieved_snippet, 60)}
                              </p>
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-lg">
                              <p>{claim.retrieved_snippet}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        
                        <TableCell>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge 
                                variant={confidenceBadge.variant}
                                className="cursor-pointer"
                              >
                                {claim.confidence_score}% {confidenceBadge.label}
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Confidence level: {claim.confidence_score}%</p>
                            </TooltipContent>
                          </Tooltip>
                        </TableCell>
                        
                        <TableCell className="text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatDate(claim.created_at)}
                          </div>
                        </TableCell>
                      </motion.tr>
                    )
                  })}
                </AnimatePresence>
              </TableBody>
            </Table>
          </ScrollArea>
          
          {/* Pagination */}
          {showPagination && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredClaims.length)} of {filteredClaims.length} claims
              </div>
              
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.max(1, page - 1))}
                  disabled={currentPage === 1}
                >
                  Previous
                </Button>
                
                <div className="flex items-center gap-1">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
                    if (pageNum > totalPages) return null
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => setCurrentPage(pageNum)}
                        className="w-8 h-8"
                      >
                        {pageNum}
                      </Button>
                    )
                  })}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(page => Math.min(totalPages, page + 1))}
                  disabled={currentPage === totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </Card>

        {/* Empty State */}
        {filteredClaims.length === 0 && !loading && (
          <Card>
            <CardContent className="text-center py-12">
              <Info className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No claims found</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || confidenceFilter !== 'all' 
                  ? 'Try adjusting your search or filter criteria'
                  : 'No claims have been added yet'
                }
              </p>
              {(searchTerm || confidenceFilter !== 'all') && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setConfidenceFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </TooltipProvider>
  )
}

export default ClaimsLedgerTable