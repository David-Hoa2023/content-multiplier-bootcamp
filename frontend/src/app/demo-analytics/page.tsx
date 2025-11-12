'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { AnalyticsDashboard, type AnalyticsStats } from '@/components/ui/analytics-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'
import { 
  BarChart3,
  RefreshCw,
  TrendingUp,
  Users,
  Zap,
  DollarSign,
  Clock,
  Target
} from 'lucide-react'

// Sample analytics data
const sampleStats: AnalyticsStats = {
  overview: {
    totalIdeas: 1247,
    totalBriefs: 892,
    totalDrafts: 634,
    publishedPacks: 423,
    ideaToPublishDays: 12.5
  },
  statusDistribution: {
    draft: 145,
    review: 89,
    approved: 156,
    published: 423
  },
  weeklyContent: [
    { week: 'T1', ideas: 45, briefs: 32, drafts: 28, published: 15 },
    { week: 'T2', ideas: 52, briefs: 41, drafts: 35, published: 22 },
    { week: 'T3', ideas: 48, briefs: 38, drafts: 31, published: 18 },
    { week: 'T4', ideas: 61, briefs: 47, drafts: 39, published: 25 },
    { week: 'T5', ideas: 55, briefs: 43, drafts: 37, published: 21 },
    { week: 'T6', ideas: 67, briefs: 51, drafts: 42, published: 28 },
    { week: 'T7', ideas: 72, briefs: 58, drafts: 48, published: 32 },
    { week: 'T8', ideas: 78, briefs: 62, drafts: 51, published: 35 }
  ],
  llmUsage: {
    totalCalls: 15687,
    errors: 234,
    estimatedCost: 487.52,
    successRate: 98.5
  },
  recentActivity: [
    {
      id: '1',
      title: 'Chiến lược Content Marketing cho ngành F&B',
      type: 'published',
      status: 'published',
      createdAt: '2024-01-15T10:30:00Z',
      updatedAt: '2024-01-16T14:20:00Z'
    },
    {
      id: '2',
      title: 'Ứng dụng AI trong Healthcare',
      type: 'draft',
      status: 'review',
      createdAt: '2024-01-14T14:20:00Z',
      updatedAt: '2024-01-16T09:15:00Z'
    },
    {
      id: '3',
      title: 'Sustainable Fashion Trends',
      type: 'brief',
      status: 'approved',
      createdAt: '2024-01-13T09:15:00Z',
      updatedAt: '2024-01-15T16:30:00Z'
    },
    {
      id: '4',
      title: 'Digital Banking for Seniors',
      type: 'idea',
      status: 'draft',
      createdAt: '2024-01-12T16:45:00Z',
      updatedAt: '2024-01-15T11:20:00Z'
    },
    {
      id: '5',
      title: 'Remote Work Productivity Tips',
      type: 'published',
      status: 'published',
      createdAt: '2024-01-11T11:30:00Z',
      updatedAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '6',
      title: 'Cryptocurrency Investment Guide',
      type: 'draft',
      status: 'draft',
      createdAt: '2024-01-10T13:20:00Z',
      updatedAt: '2024-01-13T10:30:00Z'
    }
  ]
}

// Alternative stats for demo switching
const alternativeStats: AnalyticsStats = {
  overview: {
    totalIdeas: 1534,
    totalBriefs: 1123,
    totalDrafts: 789,
    publishedPacks: 567,
    ideaToPublishDays: 9.8
  },
  statusDistribution: {
    draft: 178,
    review: 112,
    approved: 198,
    published: 567
  },
  weeklyContent: [
    { week: 'T1', ideas: 58, briefs: 45, drafts: 38, published: 22 },
    { week: 'T2', ideas: 62, briefs: 48, drafts: 41, published: 28 },
    { week: 'T3', ideas: 71, briefs: 55, drafts: 46, published: 31 },
    { week: 'T4', ideas: 68, briefs: 52, drafts: 43, published: 29 },
    { week: 'T5', ideas: 85, briefs: 67, drafts: 55, published: 38 },
    { week: 'T6', ideas: 92, briefs: 73, drafts: 61, published: 42 },
    { week: 'T7', ideas: 89, briefs: 71, drafts: 58, published: 40 },
    { week: 'T8', ideas: 95, briefs: 76, drafts: 63, published: 45 }
  ],
  llmUsage: {
    totalCalls: 19234,
    errors: 156,
    estimatedCost: 623.87,
    successRate: 99.2
  },
  recentActivity: sampleStats.recentActivity.map(activity => ({
    ...activity,
    updatedAt: new Date().toISOString()
  }))
}

export default function DemoAnalyticsPage() {
  const [currentStats, setCurrentStats] = useState<AnalyticsStats>(sampleStats)
  const [isLoading, setIsLoading] = useState(false)
  const [refreshCount, setRefreshCount] = useState(0)

  const handleRefresh = async () => {
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Toggle between different datasets
    const newStats = refreshCount % 2 === 0 ? alternativeStats : sampleStats
    setCurrentStats(newStats)
    setRefreshCount(prev => prev + 1)
    setIsLoading(false)
  }

  const simulateLoading = () => {
    setIsLoading(true)
    setTimeout(() => setIsLoading(false), 2000)
  }

  const resetDemo = () => {
    setCurrentStats(sampleStats)
    setRefreshCount(0)
    setIsLoading(false)
  }

  return (
    <AppLayout
      pageTitle="Analytics Demo"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Demos', href: '#' },
        { label: 'Analytics Demo' },
      ]}
    >
      <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">AnalyticsDashboard Demo</h1>
            <p className="text-muted-foreground">
              Demo component AnalyticsDashboard với charts, metrics và interactive features.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Refreshes: {refreshCount}
            </Badge>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="dashboard">Live Dashboard</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="usage">Usage Examples</TabsTrigger>
        </TabsList>

        {/* Live Dashboard Tab */}
        <TabsContent value="dashboard" className="space-y-6">
          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle>Demo Controls</CardTitle>
              <CardDescription>
                Test các tính năng của AnalyticsDashboard
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={simulateLoading} variant="outline" className="gap-2">
                  <Clock className="h-4 w-4" />
                  Test Loading State
                </Button>
                
                <Button onClick={handleRefresh} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Simulate Data Refresh
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Click "Test Loading State" để xem skeleton loading</p>
                <p>• Click "Simulate Data Refresh" để test refresh functionality với data mới</p>
                <p>• Sử dụng time filter và export CSV trên dashboard</p>
                <p>• Hover vào các chart elements để xem tooltips</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Dashboard */}
          <AnalyticsDashboard
            stats={currentStats}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Charts & Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Area Chart cho weekly content trends</li>
                  <li>• Pie Chart cho status distribution</li>
                  <li>• Responsive charts với Recharts</li>
                  <li>• Interactive tooltips và legends</li>
                  <li>• Dark mode support cho charts</li>
                  <li>• Animated chart transitions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Key Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Overview stats với trend indicators</li>
                  <li>• LLM API usage và cost tracking</li>
                  <li>• Average time from idea to publish</li>
                  <li>• Success rate calculations</li>
                  <li>• Recent activity timeline</li>
                  <li>• Tooltips cho metric explanations</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  User Experience
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Loading skeleton khi fetch data</li>
                  <li>• Smooth animations với Framer Motion</li>
                  <li>• Responsive grid layout</li>
                  <li>• Time filter (week/month/quarter/year)</li>
                  <li>• Manual refresh với feedback</li>
                  <li>• Export to CSV functionality</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-orange-500" />
                  Technical Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• TypeScript với full type safety</li>
                  <li>• Memoized chart data calculations</li>
                  <li>• Error handling với toast feedback</li>
                  <li>• Performance optimized re-renders</li>
                  <li>• Accessible chart components</li>
                  <li>• Mobile-friendly responsive design</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Examples Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>
                Các ví dụ sử dụng AnalyticsDashboard trong different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Basic Implementation</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`import { AnalyticsDashboard } from '@/components/ui/analytics-dashboard'

function Dashboard() {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = async () => {
    const data = await api.getAnalytics()
    setStats(data)
    setIsLoading(false)
  }

  return (
    <AnalyticsDashboard
      stats={stats}
      onRefresh={fetchStats}
      isLoading={isLoading}
    />
  )
}`}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">With Error Handling</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`const handleRefresh = async () => {
  try {
    setIsLoading(true)
    const data = await api.getAnalytics()
    setStats(data)
  } catch (error) {
    toast({
      title: "Error loading analytics",
      variant: "destructive"
    })
  } finally {
    setIsLoading(false)
  }
}`}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Custom Time Filter</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`const [timeFilter, setTimeFilter] = useState('month')

const fetchStatsWithFilter = async (filter) => {
  const data = await api.getAnalytics({
    timeRange: filter
  })
  return data
}

// Dashboard sẽ tự động filter data
// dựa trên timeFilter selection`}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Real-time Updates</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`useEffect(() => {
  const interval = setInterval(() => {
    if (!isLoading) {
      fetchStats()
    }
  }, 60000) // Refresh every minute

  return () => clearInterval(interval)
}, [isLoading])`}</code>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <h4 className="font-medium mb-3">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm">
                  <code>{`interface AnalyticsDashboardProps {
  stats?: AnalyticsStats           // Analytics data
  onRefresh?: () => Promise<void>  // Refresh handler
  isLoading?: boolean             // Loading state
  className?: string              // Additional styles
}

interface AnalyticsStats {
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
}`}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
      </div>
    </AppLayout>
  )
}