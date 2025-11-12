"use client"

import React, { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  RefreshCw,
  Download,
  TrendingUp,
  TrendingDown,
  Lightbulb,
  FileText,
  PenTool,
  CheckCircle,
  Clock,
  AlertCircle,
  DollarSign,
  Zap,
  Filter,
  Calendar,
  Info
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface AnalyticsStats {
  overview: {
    totalIdeas: number
    totalBriefs: number
    totalDrafts: number
    publishedPacks: number
    ideaToPublishDays: number
  }
  statusDistribution: {
    draft: number
    review: number
    approved: number
    published: number
  }
  weeklyContent: Array<{
    week: string
    ideas: number
    briefs: number
    drafts: number
    published: number
  }>
  llmUsage: {
    totalCalls: number
    errors: number
    estimatedCost: number
    successRate: number
  }
  recentActivity: Array<{
    id: string
    title: string
    type: 'idea' | 'brief' | 'draft' | 'published'
    status: string
    createdAt: string
    updatedAt: string
  }>
}

export interface AnalyticsDashboardProps {
  stats?: AnalyticsStats
  onRefresh?: () => Promise<void> | void
  isLoading?: boolean
  className?: string
}

type TimeFilter = 'week' | 'month' | 'quarter' | 'year'

const timeFilterOptions = [
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year', label: 'Năm này' },
]

const statusColors = {
  draft: '#94a3b8',
  review: '#f59e0b',
  approved: '#10b981',
  published: '#3b82f6'
}

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

// Loading Skeleton Component
const DashboardSkeleton = () => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <LoadingSkeleton type="custom" count={4} height="h-32" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LoadingSkeleton type="custom" count={2} height="h-80" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <LoadingSkeleton type="custom" count={3} height="h-64" />
    </div>
  </div>
)

// Stats Card Component
interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: React.ComponentType<any>
  description?: string
  color?: string
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  change, 
  icon: Icon, 
  description, 
  color = "text-primary" 
}) => (
  <motion.div variants={cardVariants}>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className={cn("h-4 w-4", color)} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            {change > 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500" />
            ) : change < 0 ? (
              <TrendingDown className="h-3 w-3 text-red-500" />
            ) : null}
            <span className={cn(
              change > 0 && "text-green-500",
              change < 0 && "text-red-500"
            )}>
              {change > 0 ? '+' : ''}{change}%
            </span>
            <span>so với kỳ trước</span>
          </div>
        )}
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  </motion.div>
)

// Funnel Chart Component
interface FunnelChartProps {
  draft: number
  derivatives: number
  published: number
}

const FunnelChart: React.FC<FunnelChartProps> = ({ draft, derivatives, published }) => {
  const maxValue = Math.max(draft, derivatives, published)
  
  const funnelSteps = [
    { label: 'Draft', value: draft, color: 'bg-blue-500', percentage: 100 },
    { 
      label: 'Derivatives', 
      value: derivatives, 
      color: 'bg-purple-500',
      percentage: maxValue > 0 && draft > 0 ? (derivatives / draft) * 100 : 0
    },
    { 
      label: 'Published', 
      value: published, 
      color: 'bg-green-500',
      percentage: maxValue > 0 && draft > 0 ? (published / draft) * 100 : 0
    },
  ]

  return (
    <div className="space-y-4">
      {funnelSteps.map((step, index) => (
        <div key={step.label} className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{step.label}</span>
              <Badge variant="secondary">{step.value}</Badge>
            </div>
            <span className="text-sm text-muted-foreground">
              {step.percentage.toFixed(1)}%
            </span>
          </div>
          <div className="relative h-8 bg-muted rounded-md overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${step.percentage}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
              className={cn("h-full", step.color)}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 border-t">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Conversion Rate</span>
          <span className="font-semibold">
            {draft > 0 ? ((published / draft) * 100).toFixed(1) : 0}%
          </span>
        </div>
      </div>
    </div>
  )
}

export function AnalyticsDashboard({
  stats,
  onRefresh,
  isLoading = false,
  className
}: AnalyticsDashboardProps) {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('month')
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return
    
    setIsRefreshing(true)
    try {
      await onRefresh()
      toast({
        title: "Đã cập nhật",
        description: "Dữ liệu analytics đã được cập nhật thành công.",
      })
    } catch (error) {
      toast({
        title: "Lỗi cập nhật",
        description: "Không thể cập nhật dữ liệu. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleExportCSV = () => {
    if (!stats) return

    const csvData = [
      ['Metric', 'Value'],
      ['Total Ideas', stats.overview.totalIdeas],
      ['Total Briefs', stats.overview.totalBriefs],
      ['Total Drafts', stats.overview.totalDrafts],
      ['Published Packs', stats.overview.publishedPacks],
      ['Avg. Days to Publish', stats.overview.ideaToPublishDays],
      ['LLM Total Calls', stats.llmUsage.totalCalls],
      ['LLM Errors', stats.llmUsage.errors],
      ['LLM Estimated Cost', `$${stats.llmUsage.estimatedCost}`],
      ['LLM Success Rate', `${stats.llmUsage.successRate}%`],
    ]

    const csvContent = csvData.map(row => row.join(',')).join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${new Date().toISOString().split('T')[0]}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    toast({
      title: "Export thành công",
      description: "Dữ liệu analytics đã được tải xuống dưới dạng CSV.",
    })
  }

  // Prepare chart data based on time filter
  const chartData = useMemo(() => {
    if (!stats) return []
    
    return stats.weeklyContent.map(item => ({
      ...item,
      total: item.ideas + item.briefs + item.drafts + item.published
    }))
  }, [stats, timeFilter])

  const statusData = useMemo(() => {
    if (!stats) return []
    
    return [
      { name: 'Nháp', value: stats.statusDistribution.draft, color: statusColors.draft },
      { name: 'Đang xem xét', value: stats.statusDistribution.review, color: statusColors.review },
      { name: 'Đã duyệt', value: stats.statusDistribution.approved, color: statusColors.approved },
      { name: 'Đã xuất bản', value: stats.statusDistribution.published, color: statusColors.published },
    ]
  }, [stats])

  if (isLoading || !stats) {
    return <DashboardSkeleton />
  }

  return (
    <TooltipProvider>
      <div className={cn("space-y-6", className)}>
        {/* Header */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={cardVariants}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Analytics Dashboard</h2>
            <p className="text-muted-foreground">
              Tổng quan về hiệu suất content và sử dụng AI
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Select value={timeFilter} onValueChange={(value) => setTimeFilter(value as TimeFilter)}>
              <SelectTrigger className="w-32">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {timeFilterOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            
            <Button variant="outline" onClick={handleExportCSV} className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            
            <Button 
              variant="outline" 
              onClick={handleRefresh} 
              disabled={isRefreshing}
              className="gap-2"
            >
              <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
              {isRefreshing ? 'Đang cập nhật...' : 'Refresh'}
            </Button>
          </div>
        </motion.div>

        {/* Overview Stats */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <StatsCard
            title="Tổng số Ideas"
            value={stats.overview.totalIdeas.toLocaleString()}
            change={12}
            icon={Lightbulb}
            color="text-yellow-500"
            description="Ideas được tạo trong kỳ"
          />
          
          <StatsCard
            title="Briefs đã tạo"
            value={stats.overview.totalBriefs.toLocaleString()}
            change={8}
            icon={FileText}
            color="text-blue-500"
            description="Briefs được tạo từ ideas"
          />
          
          <StatsCard
            title="Drafts hoàn thành"
            value={stats.overview.totalDrafts.toLocaleString()}
            change={-3}
            icon={PenTool}
            color="text-purple-500"
            description="Content drafts đã viết"
          />
          
          <StatsCard
            title="Packs đã publish"
            value={stats.overview.publishedPacks.toLocaleString()}
            change={15}
            icon={CheckCircle}
            color="text-green-500"
            description="Content packs đã xuất bản"
          />
        </motion.div>

        {/* Key Metrics Row */}
        <motion.div
          initial="hidden"
          animate="visible"
          variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Thời gian TB</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Thời gian trung bình từ idea đến publish</p>
                  </TooltipContent>
                </Tooltip>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.overview.ideaToPublishDays}</div>
                <p className="text-xs text-muted-foreground">ngày từ idea → publish</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">LLM API Calls</CardTitle>
                <Zap className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.llmUsage.totalCalls.toLocaleString()}</div>
                <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                  <span>{stats.llmUsage.errors} lỗi</span>
                  <Separator orientation="vertical" className="h-3" />
                  <span className="text-green-500">{stats.llmUsage.successRate}% thành công</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Chi phí ước tính</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.llmUsage.estimatedCost}</div>
                <p className="text-xs text-muted-foreground">Chi phí LLM API trong kỳ</p>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div variants={cardVariants}>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tỷ lệ thành công</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.llmUsage.successRate}%</div>
                <p className="text-xs text-muted-foreground">API calls thành công</p>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>

        {/* Funnel Chart */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>Content Funnel</CardTitle>
              <CardDescription>
                Tỷ lệ chuyển đổi từ Draft → Derivatives → Publish
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelChart
                draft={stats.statusDistribution.draft}
                derivatives={stats.overview.totalDrafts}
                published={stats.statusDistribution.published}
              />
            </CardContent>
          </Card>
        </motion.div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Weekly Content Chart */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle>Nội dung theo tuần</CardTitle>
                <CardDescription>
                  Số lượng content được tạo trong 8 tuần gần nhất
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="week" />
                    <YAxis />
                    <RechartsTooltip />
                    <Legend />
                    <Area
                      type="monotone"
                      dataKey="ideas"
                      stackId="1"
                      stroke="#f59e0b"
                      fill="#f59e0b"
                      fillOpacity={0.6}
                      name="Ideas"
                    />
                    <Area
                      type="monotone"
                      dataKey="briefs"
                      stackId="1"
                      stroke="#3b82f6"
                      fill="#3b82f6"
                      fillOpacity={0.6}
                      name="Briefs"
                    />
                    <Area
                      type="monotone"
                      dataKey="drafts"
                      stackId="1"
                      stroke="#8b5cf6"
                      fill="#8b5cf6"
                      fillOpacity={0.6}
                      name="Drafts"
                    />
                    <Area
                      type="monotone"
                      dataKey="published"
                      stackId="1"
                      stroke="#10b981"
                      fill="#10b981"
                      fillOpacity={0.6}
                      name="Published"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Status Distribution */}
          <motion.div variants={cardVariants} initial="hidden" animate="visible">
            <Card>
              <CardHeader>
                <CardTitle>Phân phối trạng thái</CardTitle>
                <CardDescription>
                  Tỷ lệ content packs theo trạng thái
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={120}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>

        {/* Recent Activity */}
        <motion.div variants={cardVariants} initial="hidden" animate="visible">
          <Card>
            <CardHeader>
              <CardTitle>Hoạt động gần đây</CardTitle>
              <CardDescription>
                Các content được tạo và cập nhật gần đây
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stats.recentActivity.slice(0, 5).map((activity, index) => (
                  <motion.div
                    key={activity.id}
                    variants={itemVariants}
                    initial="hidden"
                    animate="visible"
                    transition={{ delay: index * 0.1 }}
                    className="flex items-center gap-4 p-3 rounded-lg border"
                  >
                    <div className="flex-shrink-0">
                      {activity.type === 'idea' && <Lightbulb className="h-4 w-4 text-yellow-500" />}
                      {activity.type === 'brief' && <FileText className="h-4 w-4 text-blue-500" />}
                      {activity.type === 'draft' && <PenTool className="h-4 w-4 text-purple-500" />}
                      {activity.type === 'published' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{activity.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(activity.updatedAt).toLocaleDateString('vi-VN')}
                      </p>
                    </div>
                    
                    <Badge variant="outline" className="flex-shrink-0">
                      {activity.status}
                    </Badge>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </TooltipProvider>
  )
}

export default AnalyticsDashboard