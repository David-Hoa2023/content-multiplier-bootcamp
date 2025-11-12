'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { useToast } from '@/hooks/use-toast'
import {
  BarChart3,
  LineChart,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  Target,
  DollarSign,
  Clock,
  Calendar,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  RefreshCw,
  Eye,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  Lightbulb,
  Copy,
  Send,
  Archive,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export interface KPIData {
  id: string
  name: string
  value: number
  unit: string
  change: number
  changeType: 'increase' | 'decrease' | 'neutral'
  category: 'engagement' | 'content' | 'conversion' | 'audience'
  target?: number
  description: string
  lastUpdated: string
  chartData?: Array<{ date: string; value: number }>
  drillDownData?: Array<{ label: string; value: number; percentage: number }>
}

export interface MaterializedKPIsDashboardProps {
  kpis: KPIData[]
  loading?: boolean
  onRefresh?: () => void
  onDrillDown?: (kpiId: string) => void
  onExportCSV?: () => void
  onExportPDF?: () => void
  className?: string
}

const timeRanges = [
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
  { value: '90d', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' }
]

const categoryConfig = {
  engagement: {
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    icon: <Activity className="h-4 w-4" />
  },
  content: {
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    icon: <Lightbulb className="h-4 w-4" />
  },
  conversion: {
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    icon: <Target className="h-4 w-4" />
  },
  audience: {
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    icon: <Users className="h-4 w-4" />
  }
}

export function MaterializedKPIsDashboard({
  kpis,
  loading = false,
  onRefresh,
  onDrillDown,
  onExportCSV,
  onExportPDF,
  className = ''
}: MaterializedKPIsDashboardProps) {
  const [selectedTimeRange, setSelectedTimeRange] = useState('30d')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null)
  const { toast } = useToast()

  // Filter KPIs based on category
  const filteredKPIs = useMemo(() => {
    if (selectedCategory === 'all') return kpis
    return kpis.filter(kpi => kpi.category === selectedCategory)
  }, [kpis, selectedCategory])

  // Get unique categories
  const uniqueCategories = useMemo(() => {
    return Array.from(new Set(kpis.map(kpi => kpi.category)))
  }, [kpis])

  // Calculate summary statistics
  const stats = useMemo(() => {
    const totalKPIs = filteredKPIs.length
    const targetsMet = filteredKPIs.filter(kpi => kpi.target && kpi.value >= kpi.target).length
    const trending = filteredKPIs.filter(kpi => kpi.changeType === 'increase').length
    const declining = filteredKPIs.filter(kpi => kpi.changeType === 'decrease').length
    
    return { totalKPIs, targetsMet, trending, declining }
  }, [filteredKPIs])

  const handleRefresh = () => {
    if (onRefresh) {
      onRefresh()
      toast({
        title: "Dashboard Refreshed",
        description: "KPI data has been updated with latest information",
      })
    }
  }

  const handleDrillDown = (kpi: KPIData) => {
    if (onDrillDown) {
      onDrillDown(kpi.id)
      setExpandedKPI(expandedKPI === kpi.id ? null : kpi.id)
      toast({
        title: "Drill Down",
        description: `Showing detailed analytics for ${kpi.name}`,
      })
    }
  }

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV()
    } else {
      // Default CSV export
      const csvContent = [
        ['KPI Name', 'Value', 'Unit', 'Change %', 'Category', 'Target', 'Last Updated'],
        ...filteredKPIs.map(kpi => [
          kpi.name,
          kpi.value.toString(),
          kpi.unit,
          kpi.change.toString(),
          kpi.category,
          kpi.target?.toString() || 'N/A',
          kpi.lastUpdated
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `kpis-dashboard-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "CSV Export",
        description: "KPI data exported to CSV successfully",
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

  const formatValue = (value: number, unit: string) => {
    if (unit === '%') return `${value.toFixed(1)}%`
    if (unit === 'currency') return `$${value.toLocaleString()}`
    if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`
    return value.toLocaleString()
  }

  const getChangeIcon = (changeType: string, change: number) => {
    if (changeType === 'increase') {
      return <TrendingUp className="h-3 w-3 text-green-600" />
    } else if (changeType === 'decrease') {
      return <TrendingDown className="h-3 w-3 text-red-600" />
    }
    return <Activity className="h-3 w-3 text-gray-600" />
  }

  const getTargetStatus = (kpi: KPIData) => {
    if (!kpi.target) return null
    const percentage = (kpi.value / kpi.target) * 100
    
    if (percentage >= 100) {
      return { icon: <CheckCircle className="h-4 w-4 text-green-600" />, text: 'Target Met', color: 'text-green-600' }
    } else if (percentage >= 80) {
      return { icon: <AlertCircle className="h-4 w-4 text-yellow-600" />, text: 'Near Target', color: 'text-yellow-600' }
    } else {
      return { icon: <XCircle className="h-4 w-4 text-red-600" />, text: 'Below Target', color: 'text-red-600' }
    }
  }

  const renderKPICard = (kpi: KPIData, index: number) => {
    const categoryInfo = categoryConfig[kpi.category]
    const targetStatus = getTargetStatus(kpi)
    const isExpanded = expandedKPI === kpi.id

    return (
      <motion.div
        key={kpi.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        className="group"
      >
        <Card className="relative overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer"
              onClick={() => handleDrillDown(kpi)}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Badge className={categoryInfo.color}>
                    <div className="flex items-center gap-1">
                      {categoryInfo.icon}
                      {kpi.category}
                    </div>
                  </Badge>
                  {targetStatus && (
                    <Tooltip>
                      <TooltipTrigger>
                        <div className={`flex items-center gap-1 ${targetStatus.color}`}>
                          {targetStatus.icon}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>{targetStatus.text}</TooltipContent>
                    </Tooltip>
                  )}
                </div>
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {kpi.name}
                </CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Eye className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="flex items-end justify-between">
              <div>
                <div className="text-2xl font-bold">
                  {formatValue(kpi.value, kpi.unit)}
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {getChangeIcon(kpi.changeType, kpi.change)}
                  <span className={`font-medium ${
                    kpi.changeType === 'increase' ? 'text-green-600' : 
                    kpi.changeType === 'decrease' ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {kpi.change > 0 ? '+' : ''}{kpi.change.toFixed(1)}%
                  </span>
                  <span className="text-muted-foreground">vs last period</span>
                </div>
              </div>
              
              {kpi.target && (
                <div className="text-right text-sm">
                  <div className="text-muted-foreground">Target</div>
                  <div className="font-medium">{formatValue(kpi.target, kpi.unit)}</div>
                  <div className="text-xs text-muted-foreground">
                    {((kpi.value / kpi.target) * 100).toFixed(1)}% achieved
                  </div>
                </div>
              )}
            </div>

            {kpi.target && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.min(((kpi.value / kpi.target) * 100), 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`rounded-full h-2 transition-all duration-500 ${
                      kpi.value >= kpi.target ? 'bg-green-500' : 'bg-blue-500'
                    }`}
                    style={{ width: `${Math.min(((kpi.value / kpi.target) * 100), 100)}%` }}
                  />
                </div>
              </div>
            )}

            <AnimatePresence>
              {isExpanded && kpi.drillDownData && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="border-t pt-4"
                >
                  <h4 className="text-sm font-medium mb-3">Breakdown</h4>
                  <div className="space-y-2">
                    {kpi.drillDownData.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <span>{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{formatValue(item.value, kpi.unit)}</span>
                          <span className="text-muted-foreground">({item.percentage.toFixed(1)}%)</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="flex items-center justify-between text-xs text-muted-foreground pt-2 border-t">
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Updated {new Date(kpi.lastUpdated).toLocaleString('vi-VN')}
              </div>
              {onDrillDown && (
                <div className="flex items-center gap-1 group-hover:text-foreground transition-colors">
                  <ArrowUpRight className="h-3 w-3" />
                  Drill down
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-24 mb-2" />
                <Skeleton className="h-4 w-20 mb-4" />
                <Skeleton className="h-2 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              KPIs Dashboard
            </h3>
            <p className="text-sm text-muted-foreground">
              Materialized view from PostgreSQL • {filteredKPIs.length} indicators
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
              <FileText className="h-4 w-4" />
              Export PDF
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters & Time Range
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Time Range</label>
                <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {timeRanges.map(range => (
                      <SelectItem key={range.value} value={range.value}>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          {range.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Category</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {uniqueCategories.map(category => {
                      const config = categoryConfig[category as keyof typeof categoryConfig]
                      return (
                        <SelectItem key={category} value={category}>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            {category}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.totalKPIs}</div>
              <p className="text-xs text-muted-foreground">Total KPIs</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.targetsMet}</div>
              <p className="text-xs text-muted-foreground">Targets Met</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-blue-600">{stats.trending}</div>
              <p className="text-xs text-muted-foreground">Trending Up</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.declining}</div>
              <p className="text-xs text-muted-foreground">Declining</p>
            </CardContent>
          </Card>
        </div>

        {/* KPI Cards Grid */}
        {filteredKPIs.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BarChart3 className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No KPIs Found</h3>
              <p className="text-center">
                No KPIs match your current filters. Try adjusting your criteria or refresh the data.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredKPIs.map((kpi, index) => renderKPICard(kpi, index))}
          </div>
        )}
      </div>
    </TooltipProvider>
  )
}