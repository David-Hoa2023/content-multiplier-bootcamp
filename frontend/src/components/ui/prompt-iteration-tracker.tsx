'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Clock,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Eye,
  Copy,
  Download,
  FileJson,
  FileSpreadsheet,
  Play,
  GitCompare,
  StickyNote,
  Zap,
  History,
  RotateCcw,
  ChevronDown,
  ChevronRight,
  Calendar,
  Activity,
  Lightbulb,
  Target,
  Sparkles
} from 'lucide-react'

export interface PromptIteration {
  id: string
  prompt: string
  timestamp: string
  output: string
  status: 'success' | 'needs_improvement' | 'failed'
  notes?: string
  model?: string
  tokens_used?: number
  execution_time?: number
}

export interface PromptIterationTrackerProps {
  iterations: PromptIteration[]
  onSelect?: (iteration: PromptIteration) => void
  onRerun?: (iteration: PromptIteration) => void
  onCompare?: (iteration1: PromptIteration, iteration2: PromptIteration) => void
  onUpdateNotes?: (iterationId: string, notes: string) => void
  onExportJSON?: () => void
  onExportCSV?: () => void
  className?: string
}

const statusConfig = {
  success: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Success',
    tooltip: 'Prompt hiệu quả và cho kết quả tốt'
  },
  needs_improvement: {
    icon: <AlertTriangle className="h-3 w-3" />,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    label: 'Needs Improvement',
    tooltip: 'Cần cải thiện để có kết quả tốt hơn'
  },
  failed: {
    icon: <XCircle className="h-3 w-3" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'Failed',
    tooltip: 'Prompt không cho kết quả mong muốn'
  }
}

export function PromptIterationTracker({
  iterations,
  onSelect,
  onRerun,
  onCompare,
  onUpdateNotes,
  onExportJSON,
  onExportCSV,
  className = ''
}: PromptIterationTrackerProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [selectedForComparison, setSelectedForComparison] = useState<string[]>([])
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [tempNotes, setTempNotes] = useState<string>('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const { toast } = useToast()

  // Sort iterations by timestamp (newest first)
  const sortedIterations = useMemo(() => {
    return [...iterations]
      .filter(iteration => filterStatus === 'all' || iteration.status === filterStatus)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [iterations, filterStatus])

  const handleSelect = (iteration: PromptIteration) => {
    if (onSelect) {
      onSelect(iteration)
      toast({
        title: "Iteration Selected",
        description: `Selected prompt iteration from ${new Date(iteration.timestamp).toLocaleString('vi-VN')}`,
      })
    }
  }

  const handleRerun = (iteration: PromptIteration) => {
    if (onRerun) {
      onRerun(iteration)
      toast({
        title: "Prompt Re-run",
        description: "Prompt is being executed with the same parameters",
      })
    }
  }

  const handleCompareSelect = (iteration: PromptIteration) => {
    const newSelection = [...selectedForComparison]
    const index = newSelection.indexOf(iteration.id)
    
    if (index > -1) {
      newSelection.splice(index, 1)
    } else if (newSelection.length < 2) {
      newSelection.push(iteration.id)
    } else {
      newSelection[1] = iteration.id
    }
    
    setSelectedForComparison(newSelection)
    
    if (newSelection.length === 2 && onCompare) {
      const iter1 = iterations.find(i => i.id === newSelection[0])
      const iter2 = iterations.find(i => i.id === newSelection[1])
      if (iter1 && iter2) {
        onCompare(iter1, iter2)
        toast({
          title: "Comparison Ready",
          description: "Two iterations selected for comparison",
        })
      }
    }
  }

  const handleUpdateNotes = (iteration: PromptIteration) => {
    if (onUpdateNotes) {
      onUpdateNotes(iteration.id, tempNotes)
      setEditingNotes(null)
      setTempNotes('')
      toast({
        title: "Notes Updated",
        description: "Iteration notes have been saved",
      })
    }
  }

  const handleExportJSON = () => {
    if (onExportJSON) {
      onExportJSON()
    } else {
      // Default JSON export
      const jsonData = JSON.stringify(sortedIterations, null, 2)
      const blob = new Blob([jsonData], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompt-iterations-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "JSON Export",
        description: "Prompt iterations exported to JSON successfully",
      })
    }
  }

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV()
    } else {
      // Default CSV export
      const csvContent = [
        ['ID', 'Timestamp', 'Status', 'Model', 'Tokens Used', 'Execution Time', 'Prompt', 'Output', 'Notes'],
        ...sortedIterations.map(iteration => [
          iteration.id,
          iteration.timestamp,
          iteration.status,
          iteration.model || 'N/A',
          iteration.tokens_used?.toString() || 'N/A',
          iteration.execution_time?.toString() || 'N/A',
          `"${iteration.prompt.replace(/"/g, '""')}"`,
          `"${iteration.output.replace(/"/g, '""')}"`,
          `"${(iteration.notes || '').replace(/"/g, '""')}"`
        ])
      ].map(row => row.join(',')).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `prompt-iterations-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "CSV Export",
        description: "Prompt iterations exported to CSV successfully",
      })
    }
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return timestamp
    }
  }

  const getRelativeTime = (timestamp: string) => {
    try {
      const now = new Date()
      const iterationTime = new Date(timestamp)
      const diffMs = now.getTime() - iterationTime.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMinutes < 1) return 'Vừa xong'
      if (diffMinutes < 60) return `${diffMinutes} phút trước`
      if (diffHours < 24) return `${diffHours} giờ trước`
      if (diffDays < 7) return `${diffDays} ngày trước`
      
      return formatTimestamp(timestamp)
    } catch {
      return timestamp
    }
  }

  const truncateText = (text: string, maxLength: number) => {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  const startEditNotes = (iteration: PromptIteration) => {
    setEditingNotes(iteration.id)
    setTempNotes(iteration.notes || '')
  }

  const cancelEditNotes = () => {
    setEditingNotes(null)
    setTempNotes('')
  }

  // Statistics
  const stats = useMemo(() => {
    const total = sortedIterations.length
    const success = sortedIterations.filter(i => i.status === 'success').length
    const needsImprovement = sortedIterations.filter(i => i.status === 'needs_improvement').length
    const failed = sortedIterations.filter(i => i.status === 'failed').length
    const successRate = total > 0 ? (success / total) * 100 : 0
    
    return { total, success, needsImprovement, failed, successRate }
  }, [sortedIterations])

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <History className="h-5 w-5" />
              Prompt Iteration Tracker
            </h3>
            <p className="text-sm text-muted-foreground">
              Track and manage your AI prompt iterations and their results
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="needs_improvement">Needs Improvement</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleExportJSON} className="gap-2">
              <FileJson className="h-4 w-4" />
              JSON
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </Button>
          </div>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Iterations</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.success}</div>
              <p className="text-xs text-muted-foreground">Successful</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.needsImprovement}</div>
              <p className="text-xs text-muted-foreground">Need Work</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.successRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Success Rate</p>
            </CardContent>
          </Card>
        </div>

        {/* Comparison Actions */}
        {selectedForComparison.length > 0 && (
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <GitCompare className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">
                    {selectedForComparison.length} iteration(s) selected for comparison
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {selectedForComparison.length === 2 && (
                    <Button size="sm" className="gap-2">
                      <GitCompare className="h-3 w-3" />
                      Compare
                    </Button>
                  )}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => setSelectedForComparison([])}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Iterations Timeline */}
        <Card>
          <CardContent className="p-0">
            {sortedIterations.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Prompt Iterations</h3>
                <p className="text-center">
                  No prompt iterations found for the selected filter.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-96 w-full p-6">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-6">
                    <AnimatePresence>
                      {sortedIterations.map((iteration, index) => {
                        const statusInfo = statusConfig[iteration.status]
                        const isExpanded = expandedItems.has(iteration.id)
                        const isSelected = selectedForComparison.includes(iteration.id)
                        const isEditingNotesForThis = editingNotes === iteration.id
                        
                        return (
                          <motion.div
                            key={iteration.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="relative flex items-start gap-4"
                          >
                            {/* Timeline Node */}
                            <div className="relative z-10 flex-shrink-0">
                              <div className={`w-12 h-12 rounded-full border-2 border-border flex items-center justify-center ${
                                isSelected ? 'bg-blue-100 border-blue-500' : 'bg-background'
                              }`}>
                                {statusInfo.icon}
                              </div>
                            </div>
                            
                            {/* Iteration Content */}
                            <motion.div 
                              className="flex-1 pb-6"
                              whileHover={{ scale: 1.01 }}
                            >
                              <Card className={`shadow-sm hover:shadow-md transition-shadow ${
                                isSelected ? 'ring-2 ring-blue-500' : ''
                              }`}>
                                <CardHeader className="pb-3">
                                  <div className="flex items-start justify-between">
                                    <div className="space-y-2 flex-1">
                                      <div className="flex items-center gap-2">
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Badge className={statusInfo.color}>
                                              <div className="flex items-center gap-1">
                                                {statusInfo.icon}
                                                {statusInfo.label}
                                              </div>
                                            </Badge>
                                          </TooltipTrigger>
                                          <TooltipContent>{statusInfo.tooltip}</TooltipContent>
                                        </Tooltip>
                                        
                                        <span className="text-xs text-muted-foreground">
                                          {getRelativeTime(iteration.timestamp)}
                                        </span>
                                        
                                        {iteration.model && (
                                          <Badge variant="outline" className="text-xs">
                                            {iteration.model}
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                        <Calendar className="h-3 w-3" />
                                        <span>{formatTimestamp(iteration.timestamp)}</span>
                                        
                                        {iteration.tokens_used && (
                                          <>
                                            <Separator orientation="vertical" className="h-4" />
                                            <Zap className="h-3 w-3" />
                                            <span>{iteration.tokens_used} tokens</span>
                                          </>
                                        )}
                                        
                                        {iteration.execution_time && (
                                          <>
                                            <Separator orientation="vertical" className="h-4" />
                                            <Clock className="h-3 w-3" />
                                            <span>{iteration.execution_time}ms</span>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    
                                    <div className="flex items-center gap-2">
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleCompareSelect(iteration)}
                                            className={isSelected ? 'bg-blue-100 text-blue-600' : ''}
                                          >
                                            <GitCompare className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                          {isSelected ? 'Remove from comparison' : 'Add to comparison'}
                                        </TooltipContent>
                                      </Tooltip>
                                      
                                      {onRerun && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant="ghost"
                                              size="sm"
                                              onClick={() => handleRerun(iteration)}
                                            >
                                              <Play className="h-3 w-3" />
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>Re-run this prompt</TooltipContent>
                                        </Tooltip>
                                      )}
                                      
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleSelect(iteration)}
                                      >
                                        <Eye className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </CardHeader>
                                
                                <CardContent className="space-y-4">
                                  {/* Prompt Preview */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <MessageSquare className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">Prompt:</span>
                                    </div>
                                    <div className="bg-muted p-3 rounded-lg">
                                      <p className="text-sm leading-relaxed">
                                        {truncateText(iteration.prompt, 200)}
                                        {iteration.prompt.length > 200 && (
                                          <Button
                                            variant="link"
                                            size="sm"
                                            className="h-auto p-0 ml-1"
                                            onClick={() => {
                                              const newExpanded = new Set(expandedItems)
                                              if (isExpanded) {
                                                newExpanded.delete(iteration.id)
                                              } else {
                                                newExpanded.add(iteration.id)
                                              }
                                              setExpandedItems(newExpanded)
                                            }}
                                          >
                                            {isExpanded ? 'Show less' : 'Show more'}
                                          </Button>
                                        )}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Output Preview */}
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                                      <span className="text-sm font-medium">Output:</span>
                                    </div>
                                    <div className="bg-muted p-3 rounded-lg">
                                      <p className="text-sm leading-relaxed">
                                        {truncateText(iteration.output, 200)}
                                      </p>
                                    </div>
                                  </div>
                                  
                                  {/* Notes Section */}
                                  <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <StickyNote className="h-4 w-4 text-muted-foreground" />
                                        <span className="text-sm font-medium">Notes:</span>
                                      </div>
                                      {onUpdateNotes && !isEditingNotesForThis && (
                                        <Button
                                          variant="ghost"
                                          size="sm"
                                          onClick={() => startEditNotes(iteration)}
                                        >
                                          {iteration.notes ? 'Edit' : 'Add'}
                                        </Button>
                                      )}
                                    </div>
                                    
                                    {isEditingNotesForThis ? (
                                      <div className="space-y-2">
                                        <Textarea
                                          value={tempNotes}
                                          onChange={(e) => setTempNotes(e.target.value)}
                                          placeholder="Add notes about this iteration..."
                                          className="resize-none"
                                          rows={3}
                                        />
                                        <div className="flex items-center gap-2">
                                          <Button
                                            size="sm"
                                            onClick={() => handleUpdateNotes(iteration)}
                                          >
                                            Save
                                          </Button>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={cancelEditNotes}
                                          >
                                            Cancel
                                          </Button>
                                        </div>
                                      </div>
                                    ) : (
                                      <div className="text-sm text-muted-foreground">
                                        {iteration.notes || 'No notes added yet'}
                                      </div>
                                    )}
                                  </div>
                                  
                                  {/* Expanded Content */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                      >
                                        <Separator className="my-4" />
                                        <div className="space-y-4">
                                          <div>
                                            <h4 className="text-sm font-medium mb-2">Full Prompt:</h4>
                                            <div className="bg-muted p-3 rounded-lg">
                                              <pre className="text-sm whitespace-pre-wrap font-mono">
                                                {iteration.prompt}
                                              </pre>
                                            </div>
                                          </div>
                                          
                                          <div>
                                            <h4 className="text-sm font-medium mb-2">Full Output:</h4>
                                            <div className="bg-muted p-3 rounded-lg">
                                              <pre className="text-sm whitespace-pre-wrap">
                                                {iteration.output}
                                              </pre>
                                            </div>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </CardContent>
                              </Card>
                            </motion.div>
                          </motion.div>
                        )
                      })}
                    </AnimatePresence>
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}