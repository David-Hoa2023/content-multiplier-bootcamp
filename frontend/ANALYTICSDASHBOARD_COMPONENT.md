# AnalyticsDashboard Component Documentation

## Tổng quan

`AnalyticsDashboard` là một component React được xây dựng với **Tailwind CSS** và **shadcn/ui**, cung cấp dashboard analytics tổng quan với charts, metrics và visualization cho idea management application.

## Features

- ✅ **Comprehensive Analytics**: Overview stats, LLM usage, content metrics
- ✅ **Interactive Charts**: Area charts, pie charts với Recharts
- ✅ **Real-time Data**: Refresh functionality với loading states
- ✅ **Export Functionality**: CSV export cho analytics data
- ✅ **Time Filtering**: Week, month, quarter, year filters
- ✅ **Loading States**: Skeleton screens và loading indicators
- ✅ **Responsive Design**: Mobile-friendly grid layout
- ✅ **Smooth Animations**: Framer Motion transitions
- ✅ **Dark Mode Support**: Automatic theme adaptation
- ✅ **Recent Activity**: Timeline của content updates
- ✅ **Toast Notifications**: Success/error feedback

## Installation

### Dependencies

```bash
npm install recharts framer-motion lucide-react
```

### shadcn/ui Components

```bash
npx shadcn@latest add card button badge separator select tooltip
```

## Basic Usage

### Simple Implementation

```tsx
import { AnalyticsDashboard, type AnalyticsStats } from '@/components/ui/analytics-dashboard'
import { useState, useEffect } from 'react'

function Dashboard() {
  const [stats, setStats] = useState<AnalyticsStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    setIsLoading(true)
    try {
      const data = await api.getAnalytics()
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchStats()
  }, [])

  return (
    <AnalyticsDashboard
      stats={stats}
      onRefresh={fetchStats}
      isLoading={isLoading}
    />
  )
}
```

### With Error Handling

```tsx
const [error, setError] = useState(null)

const handleRefresh = async () => {
  try {
    setIsLoading(true)
    setError(null)
    const data = await api.getAnalytics()
    setStats(data)
  } catch (error) {
    setError(error.message)
    toast({
      title: "Lỗi tải dữ liệu",
      description: "Không thể tải analytics. Vui lòng thử lại.",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}
```

## Props

### AnalyticsDashboard Props

```tsx
interface AnalyticsDashboardProps {
  stats?: AnalyticsStats           // Analytics data (optional)
  onRefresh?: () => Promise<void> | void  // Refresh handler (optional)
  isLoading?: boolean             // Loading state (optional)
  className?: string              // Additional CSS classes (optional)
}
```

### AnalyticsStats Interface

```tsx
interface AnalyticsStats {
  overview: {
    totalIdeas: number            // Tổng số ideas
    totalBriefs: number           // Tổng số briefs
    totalDrafts: number           // Tổng số drafts
    publishedPacks: number        // Số content packs đã publish
    ideaToPublishDays: number     // Trung bình ngày từ idea → publish
  }
  statusDistribution: {
    draft: number                 // Số content ở trạng thái draft
    review: number                // Số content đang review
    approved: number              // Số content đã approve
    published: number             // Số content đã publish
  }
  weeklyContent: Array<{
    week: string                  // Label tuần (T1, T2, ...)
    ideas: number                 // Số ideas trong tuần
    briefs: number                // Số briefs trong tuần
    drafts: number                // Số drafts trong tuần
    published: number             // Số published trong tuần
  }>
  llmUsage: {
    totalCalls: number            // Tổng API calls
    errors: number                // Số lỗi
    estimatedCost: number         // Chi phí ước tính ($)
    successRate: number           // Tỷ lệ thành công (%)
  }
  recentActivity: Array<{
    id: string                    // Unique ID
    title: string                 // Tiêu đề content
    type: 'idea' | 'brief' | 'draft' | 'published'  // Loại content
    status: string                // Trạng thái hiện tại
    createdAt: string             // Ngày tạo (ISO string)
    updatedAt: string             // Ngày cập nhật (ISO string)
  }>
}
```

## Dashboard Sections

### 1. Overview Stats Cards

4 stat cards hiển thị metrics chính:

```tsx
// Metrics được hiển thị
- Tổng số Ideas (với trend +12%)
- Briefs đã tạo (với trend +8%)
- Drafts hoàn thành (với trend -3%)
- Packs đã publish (với trend +15%)
```

### 2. Key Metrics Row

4 cards bổ sung cho metrics chi tiết:

```tsx
// Thời gian trung bình từ idea → publish
- Hiển thị: {ideaToPublishDays} ngày
- Tooltip: "Thời gian trung bình từ idea đến publish"

// LLM API Calls
- Hiển thị: Tổng calls, số lỗi, tỷ lệ thành công
- Format: "15,687 calls | 234 lỗi | 98.5% thành công"

// Chi phí ước tính
- Hiển thị: $487.52
- Mô tả: "Chi phí LLM API trong kỳ"

// Tỷ lệ thành công
- Hiển thị: 98.5%
- Mô tả: "API calls thành công"
```

### 3. Charts Section

#### Weekly Content Area Chart

```tsx
// Stacked area chart với 4 layers
- Ideas (màu vàng #f59e0b)
- Briefs (màu xanh #3b82f6)  
- Drafts (màu tím #8b5cf6)
- Published (màu xanh lá #10b981)

// Features:
- CartesianGrid với strokeDasharray="3 3"
- XAxis: week labels (T1, T2, ...)
- YAxis: tự động scale
- Tooltip: hiển thị values
- Legend: tên các series
```

#### Status Distribution Pie Chart

```tsx
// Donut chart với inner radius
- Nháp (màu xám #94a3b8)
- Đang xem xét (màu vàng #f59e0b)
- Đã duyệt (màu xanh lá #10b981)
- Đã xuất bản (màu xanh #3b82f6)

// Features:
- innerRadius: 60, outerRadius: 120
- paddingAngle: 5
- Tooltip với values
- Legend tự động
```

### 4. Recent Activity

Timeline hiển thị 5 activities gần nhất:

```tsx
// Mỗi activity item có:
- Icon dựa trên type (Lightbulb, FileText, PenTool, CheckCircle)
- Title (truncated nếu quá dài)
- Date (format: Vietnamese locale)
- Status badge

// Staggered animation với delay 0.1s cho mỗi item
```

## Features Detail

### Time Filter

```tsx
const timeFilterOptions = [
  { value: 'week', label: 'Tuần này' },
  { value: 'month', label: 'Tháng này' },
  { value: 'quarter', label: 'Quý này' },
  { value: 'year', label: 'Năm này' },
]

// Sử dụng:
<Select value={timeFilter} onValueChange={setTimeFilter}>
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
```

### Refresh Functionality

```tsx
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

// Button với loading state
<Button 
  variant="outline" 
  onClick={handleRefresh} 
  disabled={isRefreshing}
  className="gap-2"
>
  <RefreshCw className={cn("h-4 w-4", isRefreshing && "animate-spin")} />
  {isRefreshing ? 'Đang cập nhật...' : 'Refresh'}
</Button>
```

### CSV Export

```tsx
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
```

### Loading Skeleton

```tsx
const DashboardSkeleton = () => (
  <div className="space-y-6">
    {/* Stats cards skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <LoadingSkeleton type="custom" count={4} height="h-32" />
    </div>
    
    {/* Charts skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <LoadingSkeleton type="custom" count={2} height="h-80" />
    </div>
    
    {/* Activity skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <LoadingSkeleton type="custom" count={3} height="h-64" />
    </div>
  </div>
)

// Usage
if (isLoading || !stats) {
  return <DashboardSkeleton />
}
```

## Animations

### Card Entry Animation

```tsx
const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
}

// Usage với stagger
<motion.div
  initial="hidden"
  animate="visible"
  variants={{ visible: { transition: { staggerChildren: 0.1 } } }}
  className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
>
  {statsCards.map((card, index) => (
    <motion.div key={index} variants={cardVariants}>
      <StatsCard {...card} />
    </motion.div>
  ))}
</motion.div>
```

### Activity Item Animation

```tsx
const itemVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.3, ease: "easeOut" }
  }
}

// Staggered animation cho activity items
{stats.recentActivity.slice(0, 5).map((activity, index) => (
  <motion.div
    key={activity.id}
    variants={itemVariants}
    initial="hidden"
    animate="visible"
    transition={{ delay: index * 0.1 }}
  >
    {/* Activity content */}
  </motion.div>
))}
```

## Responsive Design

### Grid Breakpoints

```tsx
// Stats cards
className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"

// Charts
className="grid grid-cols-1 lg:grid-cols-2 gap-6"

// Header actions
className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
```

### Mobile Optimization

- Charts sử dụng `ResponsiveContainer` từ Recharts
- Text scaling với responsive classes
- Touch-friendly button sizes
- Stacked layout trên mobile devices

## Usage Patterns

### With API Integration

```tsx
function AnalyticsPage() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/analytics')
      if (!response.ok) throw new Error('Failed to fetch')
      
      const data = await response.json()
      setStats(data)
    } catch (err) {
      setError(err.message)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <AnalyticsDashboard
      stats={stats}
      onRefresh={fetchAnalytics}
      isLoading={isLoading}
    />
  )
}
```

### With React Query

```tsx
import { useQuery } from '@tanstack/react-query'

function AnalyticsWithQuery() {
  const {
    data: stats,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => api.getAnalytics(),
    refetchInterval: 60000, // Auto-refresh every minute
  })

  const handleRefresh = async () => {
    await refetch()
  }

  return (
    <AnalyticsDashboard
      stats={stats}
      onRefresh={handleRefresh}
      isLoading={isLoading}
    />
  )
}
```

### With Time Filter Integration

```tsx
function AnalyticsWithFilters() {
  const [timeFilter, setTimeFilter] = useState('month')
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const fetchAnalyticsWithFilter = async (filter) => {
    setIsLoading(true)
    try {
      const data = await api.getAnalytics({ timeRange: filter })
      setStats(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalyticsWithFilter(timeFilter)
  }, [timeFilter])

  return (
    <div className="space-y-6">
      {/* Custom time filter */}
      <Select value={timeFilter} onValueChange={setTimeFilter}>
        <SelectTrigger className="w-48">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="week">This Week</SelectItem>
          <SelectItem value="month">This Month</SelectItem>
          <SelectItem value="quarter">This Quarter</SelectItem>
          <SelectItem value="year">This Year</SelectItem>
        </SelectContent>
      </Select>

      <AnalyticsDashboard
        stats={stats}
        onRefresh={() => fetchAnalyticsWithFilter(timeFilter)}
        isLoading={isLoading}
      />
    </div>
  )
}
```

## Advanced Examples

### Real-time Dashboard

```tsx
function RealTimeDashboard() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)

  const fetchStats = async () => {
    try {
      const data = await api.getAnalytics()
      setStats(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Auto-refresh every 5 minutes
  useEffect(() => {
    fetchStats()
    const interval = setInterval(fetchStats, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1>Real-time Analytics</h1>
        {lastUpdated && (
          <span className="text-sm text-muted-foreground">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </span>
        )}
      </div>
      
      <AnalyticsDashboard
        stats={stats}
        onRefresh={fetchStats}
        isLoading={isLoading}
      />
    </div>
  )
}
```

### Dashboard with Alerts

```tsx
function DashboardWithAlerts() {
  const [stats, setStats] = useState(null)
  const [alerts, setAlerts] = useState([])

  const checkAlerts = (data) => {
    const newAlerts = []
    
    if (data.llmUsage.successRate < 95) {
      newAlerts.push({
        type: 'warning',
        message: 'LLM success rate is below 95%'
      })
    }
    
    if (data.llmUsage.estimatedCost > 1000) {
      newAlerts.push({
        type: 'error',
        message: 'Monthly LLM cost exceeds $1000'
      })
    }
    
    setAlerts(newAlerts)
  }

  const fetchStats = async () => {
    try {
      const data = await api.getAnalytics()
      setStats(data)
      checkAlerts(data)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className={cn(
                "p-3 rounded-lg border",
                alert.type === 'warning' && "bg-yellow-50 border-yellow-200",
                alert.type === 'error' && "bg-red-50 border-red-200"
              )}
            >
              {alert.message}
            </div>
          ))}
        </div>
      )}

      <AnalyticsDashboard
        stats={stats}
        onRefresh={fetchStats}
        isLoading={isLoading}
      />
    </div>
  )
}
```

## Customization

### Custom Stats Cards

```tsx
// Override default trend calculations
const customStats = {
  ...stats,
  overview: {
    ...stats.overview,
    totalIdeas: stats.overview.totalIdeas,
    // Add custom trend calculation
    ideasTrend: calculateTrend(stats.weeklyContent, 'ideas')
  }
}

const calculateTrend = (weeklyData, metric) => {
  const lastWeek = weeklyData[weeklyData.length - 1][metric]
  const prevWeek = weeklyData[weeklyData.length - 2][metric]
  return ((lastWeek - prevWeek) / prevWeek * 100).toFixed(1)
}
```

### Custom Colors

```tsx
const customStatusColors = {
  draft: '#6b7280',
  review: '#f59e0b',
  approved: '#10b981',
  published: '#3b82f6',
  archived: '#ef4444'  // Additional status
}
```

### Custom Chart Types

```tsx
// Bar chart instead of area chart
<BarChart data={chartData}>
  <CartesianGrid strokeDasharray="3 3" />
  <XAxis dataKey="week" />
  <YAxis />
  <RechartsTooltip />
  <Legend />
  <Bar dataKey="ideas" fill="#f59e0b" />
  <Bar dataKey="briefs" fill="#3b82f6" />
  <Bar dataKey="drafts" fill="#8b5cf6" />
  <Bar dataKey="published" fill="#10b981" />
</BarChart>
```

## Best Practices

1. **Data Management**:
   - Cache analytics data appropriately
   - Handle loading states gracefully
   - Implement proper error boundaries

2. **Performance**:
   - Use useMemo for chart data calculations
   - Optimize re-renders with React.memo
   - Lazy load chart components if needed

3. **User Experience**:
   - Provide visual feedback for all actions
   - Handle empty states gracefully
   - Implement proper loading sequences

4. **Accessibility**:
   - Ensure charts have proper ARIA labels
   - Provide alternative text for visualizations
   - Support keyboard navigation

5. **Responsive Design**:
   - Test on various screen sizes
   - Optimize touch interactions
   - Consider mobile-specific layouts

## Troubleshooting

### Charts không hiển thị
- Kiểm tra data format matching với Recharts
- Verify ResponsiveContainer có đủ height
- Check console cho errors

### Performance issues
- Use React.memo cho expensive components
- Optimize animation performance
- Consider virtualizing large datasets

### Data không update
- Verify refresh function được call đúng
- Check network requests trong DevTools
- Ensure proper state management

## Demo

Truy cập `/demo-analytics` để xem demo đầy đủ tính năng của AnalyticsDashboard component.

---

## Support

Component này được xây dựng với:
- **Next.js 14** - App Router
- **Tailwind CSS** - Styling
- **shadcn/ui** - Base components
- **Recharts** - Data visualization
- **Framer Motion** - Animations
- **Lucide React** - Icons