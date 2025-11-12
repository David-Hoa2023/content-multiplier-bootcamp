'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Filter,
  Download,
  FileSpreadsheet,
  FileText,
  Calendar,
  Search,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Zap,
  Target,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Eye,
  Calculator,
  CreditCard,
  Coins,
  Wallet
} from 'lucide-react'

export interface LLMCost {
  pack_id: string
  pack_name?: string
  model: string
  input_tokens: number
  output_tokens: number
  total_cost_usd: number
  timestamp?: string
  endpoint?: string
  user_id?: string
}

export interface LLMCostBreakdownProps {
  costs: LLMCost[]
  onExportCSV?: () => void
  onExportPDF?: () => void
  onViewDetails?: (cost: LLMCost) => void
  budgetLimit?: number
  currency?: 'USD' | 'EUR' | 'VND'
  className?: string
}

const modelConfig = {
  'gpt-4o': {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    provider: 'OpenAI',
    inputRate: 0.005, // per 1K tokens
    outputRate: 0.015
  },
  'gpt-4': {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    provider: 'OpenAI',
    inputRate: 0.03,
    outputRate: 0.06
  },
  'gpt-3.5-turbo': {
    color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900 dark:text-cyan-200',
    provider: 'OpenAI',
    inputRate: 0.0005,
    outputRate: 0.0015
  },
  'claude-3-opus': {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    provider: 'Anthropic',
    inputRate: 0.015,
    outputRate: 0.075
  },
  'claude-3-sonnet': {
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    provider: 'Anthropic',
    inputRate: 0.003,
    outputRate: 0.015
  },
  'claude-3-haiku': {
    color: 'bg-violet-100 text-violet-800 dark:bg-violet-900 dark:text-violet-200',
    provider: 'Anthropic',
    inputRate: 0.00025,
    outputRate: 0.00125
  },
  'gemini-pro': {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    provider: 'Google',
    inputRate: 0.0005,
    outputRate: 0.0015
  }
}

const currencySymbols = {
  USD: '$',
  EUR: '€',
  VND: '₫'
}

const currencyRates = {
  USD: 1,
  EUR: 0.85,
  VND: 24000
}

export function LLMCostBreakdown({
  costs,
  onExportCSV,
  onExportPDF,
  onViewDetails,
  budgetLimit,
  currency = 'USD',
  className = ''
}: LLMCostBreakdownProps) {
  const [sortField, setSortField] = useState<keyof LLMCost>('total_cost_usd')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')
  const [filterModel, setFilterModel] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [dateRange, setDateRange] = useState<string>('all')
  const { toast } = useToast()

  // Get unique models for filtering
  const uniqueModels = useMemo(() => {
    return Array.from(new Set(costs.map(cost => cost.model)))
  }, [costs])

  // Filter and sort costs
  const filteredAndSortedCosts = useMemo(() => {
    let filtered = costs.filter(cost => {
      const matchesModel = filterModel === 'all' || cost.model === filterModel
      const matchesSearch = !searchFilter || 
        cost.pack_id.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (cost.pack_name && cost.pack_name.toLowerCase().includes(searchFilter.toLowerCase())) ||
        cost.model.toLowerCase().includes(searchFilter.toLowerCase())
      
      let matchesDate = true
      if (dateRange !== 'all' && cost.timestamp) {
        const costDate = new Date(cost.timestamp)
        const now = new Date()
        switch (dateRange) {
          case '7d':
            matchesDate = (now.getTime() - costDate.getTime()) <= 7 * 24 * 60 * 60 * 1000
            break
          case '30d':
            matchesDate = (now.getTime() - costDate.getTime()) <= 30 * 24 * 60 * 60 * 1000
            break
          case '90d':
            matchesDate = (now.getTime() - costDate.getTime()) <= 90 * 24 * 60 * 60 * 1000
            break
        }
      }
      
      return matchesModel && matchesSearch && matchesDate
    })

    return filtered.sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue
      }
      
      const aStr = String(aValue).toLowerCase()
      const bStr = String(bValue).toLowerCase()
      
      if (sortDirection === 'asc') {
        return aStr.localeCompare(bStr)
      } else {
        return bStr.localeCompare(aStr)
      }
    })
  }, [costs, sortField, sortDirection, filterModel, searchFilter, dateRange])

  const handleSort = (field: keyof LLMCost) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  const formatCurrency = (amount: number) => {
    const converted = amount * currencyRates[currency]
    const symbol = currencySymbols[currency]
    
    if (currency === 'VND') {
      return `${symbol}${Math.round(converted).toLocaleString()}`
    }
    
    return `${symbol}${converted.toFixed(4)}`
  }

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000000) {
      return `${(tokens / 1000000).toFixed(1)}M`
    }
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}K`
    }
    return tokens.toLocaleString()
  }

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV()
    } else {
      // Default CSV export
      const csvContent = [
        ['Pack ID', 'Pack Name', 'Model', 'Input Tokens', 'Output Tokens', 'Total Cost (USD)', 'Timestamp'],
        ...filteredAndSortedCosts.map(cost => [
          cost.pack_id,
          cost.pack_name || '',
          cost.model,
          cost.input_tokens.toString(),
          cost.output_tokens.toString(),
          cost.total_cost_usd.toString(),
          cost.timestamp || ''
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `llm-costs-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "CSV Export",
        description: "LLM cost breakdown exported to CSV successfully",
      })
    }
  }

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF()
    } else {
      toast({
        title: "PDF Export",
        description: "PDF export feature coming soon",
        variant: "destructive",
      })
    }
  }

  const getSortIcon = (field: keyof LLMCost) => {
    if (sortField !== field) {
      return <ArrowUpDown className="h-3 w-3 opacity-50" />
    }
    return sortDirection === 'asc' ? 
      <ArrowUp className="h-3 w-3" /> : 
      <ArrowDown className="h-3 w-3" />
  }

  // Calculate statistics
  const stats = useMemo(() => {
    const totalCost = filteredAndSortedCosts.reduce((sum, cost) => sum + cost.total_cost_usd, 0)
    const totalInputTokens = filteredAndSortedCosts.reduce((sum, cost) => sum + cost.input_tokens, 0)
    const totalOutputTokens = filteredAndSortedCosts.reduce((sum, cost) => sum + cost.output_tokens, 0)
    const totalTokens = totalInputTokens + totalOutputTokens
    const avgCostPerPack = filteredAndSortedCosts.length > 0 ? totalCost / filteredAndSortedCosts.length : 0
    const mostExpensivePack = filteredAndSortedCosts.reduce((max, cost) => 
      cost.total_cost_usd > max.total_cost_usd ? cost : max, 
      filteredAndSortedCosts[0] || { total_cost_usd: 0 }
    )
    
    const budgetUsage = budgetLimit ? (totalCost / budgetLimit) * 100 : 0
    const isOverBudget = budgetLimit ? totalCost > budgetLimit : false
    
    return {
      totalCost,
      totalInputTokens,
      totalOutputTokens,
      totalTokens,
      avgCostPerPack,
      mostExpensivePack,
      budgetUsage,
      isOverBudget,
      totalPacks: filteredAndSortedCosts.length
    }
  }, [filteredAndSortedCosts, budgetLimit])

  // Model breakdown for charts
  const modelBreakdown = useMemo(() => {
    const breakdown = filteredAndSortedCosts.reduce((acc, cost) => {
      if (!acc[cost.model]) {
        acc[cost.model] = { cost: 0, count: 0, tokens: 0 }
      }
      acc[cost.model].cost += cost.total_cost_usd
      acc[cost.model].count += 1
      acc[cost.model].tokens += cost.input_tokens + cost.output_tokens
      return acc
    }, {} as Record<string, { cost: number; count: number; tokens: number }>)
    
    return Object.entries(breakdown).map(([model, data]) => ({
      model,
      ...data,
      percentage: (data.cost / stats.totalCost) * 100
    })).sort((a, b) => b.cost - a.cost)
  }, [filteredAndSortedCosts, stats.totalCost])

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              LLM Cost Breakdown
            </h3>
            <p className="text-sm text-muted-foreground">
              Track and analyze your AI model usage costs across content packs
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={currency} onValueChange={() => {}}>
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="VND">VND</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>

        {/* Budget Alert */}
        {budgetLimit && stats.isOverBudget && (
          <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <span className="text-sm font-medium text-red-600">
                  Budget exceeded! Current spending: {formatCurrency(stats.totalCost)} 
                  (Budget: {formatCurrency(budgetLimit)})
                </span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search packs or models..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Model</label>
                <Select value={filterModel} onValueChange={setFilterModel}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All models</SelectItem>
                    {uniqueModels.map(model => (
                      <SelectItem key={model} value={model}>
                        {model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Date Range</label>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                    <SelectItem value="30d">Last 30 days</SelectItem>
                    <SelectItem value="90d">Last 90 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Actions</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchFilter('')
                      setFilterModel('all')
                      setDateRange('all')
                    }}
                  >
                    Clear
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</div>
              <p className="text-xs text-muted-foreground">Total Cost</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatTokens(stats.totalTokens)}</div>
              <p className="text-xs text-muted-foreground">Total Tokens</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalPacks}</div>
              <p className="text-xs text-muted-foreground">Content Packs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{formatCurrency(stats.avgCostPerPack)}</div>
              <p className="text-xs text-muted-foreground">Avg per Pack</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{uniqueModels.length}</div>
              <p className="text-xs text-muted-foreground">Models Used</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        {budgetLimit && (
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-4 w-4" />
                Budget Tracking
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  {formatCurrency(stats.totalCost)} / {formatCurrency(budgetLimit)}
                </span>
                <span className="text-sm text-muted-foreground">
                  {stats.budgetUsage.toFixed(1)}% used
                </span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className={`rounded-full h-2 transition-all duration-300 ${
                    stats.isOverBudget ? 'bg-red-500' : 
                    stats.budgetUsage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                  }`}
                  style={{ width: `${Math.min(stats.budgetUsage, 100)}%` }}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Model Breakdown Chart */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              Cost by Model
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {modelBreakdown.map((item, index) => {
              const modelInfo = modelConfig[item.model as keyof typeof modelConfig]
              return (
                <div key={item.model} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={modelInfo?.color || 'bg-gray-100 text-gray-800'}>
                        {item.model}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {item.count} packs
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {formatCurrency(item.cost)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary rounded-full h-2 transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>

        {/* Cost Table */}
        <Card>
          <CardContent className="p-0">
            {filteredAndSortedCosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calculator className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Cost Data</h3>
                <p className="text-center">
                  No LLM costs match your current filters.
                </p>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('pack_id')}
                      >
                        <div className="flex items-center gap-2">
                          Pack ID
                          {getSortIcon('pack_id')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50"
                        onClick={() => handleSort('model')}
                      >
                        <div className="flex items-center gap-2">
                          Model
                          {getSortIcon('model')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('input_tokens')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Input Tokens
                          {getSortIcon('input_tokens')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('output_tokens')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Output Tokens
                          {getSortIcon('output_tokens')}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 text-right"
                        onClick={() => handleSort('total_cost_usd')}
                      >
                        <div className="flex items-center justify-end gap-2">
                          Total Cost
                          {getSortIcon('total_cost_usd')}
                        </div>
                      </TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredAndSortedCosts.map((cost, index) => {
                        const modelInfo = modelConfig[cost.model as keyof typeof modelConfig]
                        const totalTokens = cost.input_tokens + cost.output_tokens
                        
                        return (
                          <motion.tr
                            key={`${cost.pack_id}-${cost.model}-${index}`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.02 }}
                            className="group hover:bg-muted/50"
                          >
                            <TableCell>
                              <div className="space-y-1">
                                <div className="font-medium font-mono text-sm">
                                  {cost.pack_id}
                                </div>
                                {cost.pack_name && (
                                  <div className="text-xs text-muted-foreground">
                                    {cost.pack_name}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="space-y-1">
                                <Badge className={modelInfo?.color || 'bg-gray-100 text-gray-800'}>
                                  {cost.model}
                                </Badge>
                                {modelInfo && (
                                  <div className="text-xs text-muted-foreground">
                                    {modelInfo.provider}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {formatTokens(cost.input_tokens)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {((cost.input_tokens / totalTokens) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <div className="font-medium">
                                  {formatTokens(cost.output_tokens)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {((cost.output_tokens / totalTokens) * 100).toFixed(1)}%
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="space-y-1">
                                <div className="font-bold text-green-600">
                                  {formatCurrency(cost.total_cost_usd)}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {formatTokens(totalTokens)} total
                                </div>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              {onViewDetails && (
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => onViewDetails(cost)}
                                    >
                                      <Eye className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>View details</TooltipContent>
                                </Tooltip>
                              )}
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}