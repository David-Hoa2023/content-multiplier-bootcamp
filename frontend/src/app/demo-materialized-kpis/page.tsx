'use client'

import { useState } from 'react'
import { MaterializedKPIsDashboard, type KPIData } from '@/components/ui/materialized-kpis-dashboard'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { 
  RefreshCw,
  Database,
  Plus,
  Settings,
  BarChart3,
  Activity,
  Users,
  Target,
  Lightbulb,
  TrendingUp,
  Download,
  Eye,
  Calendar,
  Clock
} from 'lucide-react'

const sampleKPIs: KPIData[] = [
  {
    id: 'engagement-rate',
    name: 'Content Engagement Rate',
    value: 8.7,
    unit: '%',
    change: 12.5,
    changeType: 'increase',
    category: 'engagement',
    target: 10.0,
    description: 'Average engagement rate across all content pieces',
    lastUpdated: '2024-11-04T10:30:00Z',
    chartData: [
      { date: '2024-10-28', value: 7.2 },
      { date: '2024-10-29', value: 7.8 },
      { date: '2024-10-30', value: 8.1 },
      { date: '2024-10-31', value: 8.3 },
      { date: '2024-11-01', value: 8.5 },
      { date: '2024-11-02', value: 8.6 },
      { date: '2024-11-03', value: 8.7 }
    ],
    drillDownData: [
      { label: 'Blog Posts', value: 9.2, percentage: 45 },
      { label: 'Social Media', value: 8.1, percentage: 35 },
      { label: 'Email Newsletter', value: 8.9, percentage: 20 }
    ]
  },
  {
    id: 'content-production',
    name: 'Content Pieces Generated',
    value: 247,
    unit: 'pieces',
    change: 23.8,
    changeType: 'increase',
    category: 'content',
    target: 300,
    description: 'Total content pieces generated this month',
    lastUpdated: '2024-11-04T09:15:00Z',
    drillDownData: [
      { label: 'AI Generated', value: 156, percentage: 63 },
      { label: 'Human Written', value: 91, percentage: 37 }
    ]
  },
  {
    id: 'conversion-rate',
    name: 'Content to Lead Conversion',
    value: 4.2,
    unit: '%',
    change: -8.7,
    changeType: 'decrease',
    category: 'conversion',
    target: 5.0,
    description: 'Percentage of content viewers who become leads',
    lastUpdated: '2024-11-04T11:45:00Z',
    drillDownData: [
      { label: 'Landing Pages', value: 6.8, percentage: 40 },
      { label: 'Blog CTAs', value: 3.2, percentage: 35 },
      { label: 'Social Links', value: 2.1, percentage: 25 }
    ]
  },
  {
    id: 'audience-reach',
    name: 'Monthly Audience Reach',
    value: 125000,
    unit: 'people',
    change: 15.3,
    changeType: 'increase',
    category: 'audience',
    target: 150000,
    description: 'Total unique users reached this month',
    lastUpdated: '2024-11-04T08:00:00Z',
    drillDownData: [
      { label: 'Organic', value: 75000, percentage: 60 },
      { label: 'Paid Social', value: 35000, percentage: 28 },
      { label: 'Email', value: 15000, percentage: 12 }
    ]
  },
  {
    id: 'avg-time-on-content',
    name: 'Average Time on Content',
    value: 3.4,
    unit: 'minutes',
    change: 5.8,
    changeType: 'increase',
    category: 'engagement',
    target: 4.0,
    description: 'Average time users spend consuming content',
    lastUpdated: '2024-11-04T12:20:00Z',
    drillDownData: [
      { label: 'Long-form Articles', value: 5.2, percentage: 30 },
      { label: 'Video Content', value: 2.8, percentage: 45 },
      { label: 'Infographics', value: 1.9, percentage: 25 }
    ]
  },
  {
    id: 'content-roi',
    name: 'Content Marketing ROI',
    value: 320,
    unit: '%',
    change: 28.4,
    changeType: 'increase',
    category: 'conversion',
    target: 400,
    description: 'Return on investment for content marketing efforts',
    lastUpdated: '2024-11-04T13:30:00Z',
    drillDownData: [
      { label: 'Lead Generation', value: 180, percentage: 56 },
      { label: 'Brand Awareness', value: 85, percentage: 27 },
      { label: 'Customer Retention', value: 55, percentage: 17 }
    ]
  },
  {
    id: 'social-shares',
    name: 'Social Media Shares',
    value: 2847,
    unit: 'shares',
    change: 18.9,
    changeType: 'increase',
    category: 'engagement',
    target: 3000,
    description: 'Total social media shares across all platforms',
    lastUpdated: '2024-11-04T14:10:00Z',
    drillDownData: [
      { label: 'LinkedIn', value: 1420, percentage: 50 },
      { label: 'Twitter', value: 854, percentage: 30 },
      { label: 'Facebook', value: 573, percentage: 20 }
    ]
  },
  {
    id: 'content-velocity',
    name: 'Content Production Velocity',
    value: 12.3,
    unit: 'pieces/day',
    change: 31.2,
    changeType: 'increase',
    category: 'content',
    description: 'Average content pieces produced per day',
    lastUpdated: '2024-11-04T15:45:00Z',
    drillDownData: [
      { label: 'Automated Content', value: 8.7, percentage: 71 },
      { label: 'Manual Content', value: 3.6, percentage: 29 }
    ]
  },
  {
    id: 'subscriber-growth',
    name: 'Newsletter Subscriber Growth',
    value: 1250,
    unit: 'subscribers',
    change: 22.1,
    changeType: 'increase',
    category: 'audience',
    target: 1500,
    description: 'New newsletter subscribers this month',
    lastUpdated: '2024-11-04T16:00:00Z',
    drillDownData: [
      { label: 'Organic Signups', value: 780, percentage: 62 },
      { label: 'Lead Magnets', value: 320, percentage: 26 },
      { label: 'Referrals', value: 150, percentage: 12 }
    ]
  },
  {
    id: 'content-score',
    name: 'Average Content Quality Score',
    value: 8.1,
    unit: '/10',
    change: 3.8,
    changeType: 'increase',
    category: 'content',
    target: 8.5,
    description: 'AI-assessed content quality score',
    lastUpdated: '2024-11-04T17:30:00Z',
    drillDownData: [
      { label: 'SEO Optimization', value: 8.5, percentage: 35 },
      { label: 'Readability', value: 7.9, percentage: 30 },
      { label: 'Engagement Potential', value: 7.8, percentage: 35 }
    ]
  }
]

export default function DemoMaterializedKPIsPage() {
  const [kpis, setKPIs] = useState<KPIData[]>(sampleKPIs)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleRefresh = () => {
    setLoading(true)
    setTimeout(() => {
      // Simulate data refresh with slight random variations
      const updatedKPIs = kpis.map(kpi => ({
        ...kpi,
        value: kpi.value + (Math.random() - 0.5) * kpi.value * 0.1,
        change: (Math.random() - 0.5) * 40,
        changeType: (Math.random() > 0.3 ? 'increase' : Math.random() > 0.5 ? 'decrease' : 'neutral') as 'increase' | 'decrease' | 'neutral',
        lastUpdated: new Date().toISOString()
      }))
      setKPIs(updatedKPIs)
      setLoading(false)
      toast({
        title: "Data Refreshed",
        description: "KPI dashboard has been updated with latest data from PostgreSQL",
      })
    }, 2000)
  }

  const handleDrillDown = (kpiId: string) => {
    const kpi = kpis.find(k => k.id === kpiId)
    console.log('Drilling down into KPI:', kpi?.name)
    toast({
      title: "Drill Down Analytics",
      description: `Detailed breakdown for ${kpi?.name} is now expanded`,
    })
  }

  const handleExportCSV = () => {
    console.log('Exporting KPIs to CSV...')
    toast({
      title: "CSV Export",
      description: "KPI data has been exported to CSV format",
    })
  }

  const handleExportPDF = () => {
    console.log('Exporting KPIs to PDF...')
    toast({
      title: "PDF Export",
      description: "Advanced PDF report generation would be implemented here",
    })
  }

  const addRandomKPI = () => {
    const categories = ['engagement', 'content', 'conversion', 'audience'] as const
    const units = ['%', 'pieces', 'people', 'minutes', 'currency']
    const names = [
      'Click-through Rate',
      'Video Watch Time',
      'Email Open Rate',
      'Brand Mention Volume',
      'Content Virality Score',
      'User Retention Rate'
    ]
    
    const category = categories[Math.floor(Math.random() * categories.length)]
    const unit = units[Math.floor(Math.random() * units.length)]
    const name = names[Math.floor(Math.random() * names.length)]
    
    const newKPI: KPIData = {
      id: `kpi-${Date.now()}`,
      name: `${name} (Generated)`,
      value: Math.random() * 100,
      unit,
      change: (Math.random() - 0.5) * 50,
      changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
      category,
      target: Math.random() * 120,
      description: `Randomly generated KPI for demo purposes`,
      lastUpdated: new Date().toISOString(),
      drillDownData: [
        { label: 'Source A', value: Math.random() * 50, percentage: Math.random() * 40 + 30 },
        { label: 'Source B', value: Math.random() * 30, percentage: Math.random() * 30 + 20 },
        { label: 'Source C', value: Math.random() * 20, percentage: Math.random() * 30 + 10 }
      ]
    }
    
    setKPIs(prev => [newKPI, ...prev])
    toast({
      title: "KPI Added",
      description: `New ${category} KPI "${name}" has been added to the dashboard`,
    })
  }

  const resetDemo = () => {
    setKPIs(sampleKPIs)
    toast({
      title: "Demo Reset",
      description: "Dashboard has been reset to original sample data",
    })
  }

  // Calculate summary statistics
  const stats = {
    total: kpis.length,
    categories: new Set(kpis.map(k => k.category)).size,
    targetsMet: kpis.filter(k => k.target && k.value >= k.target).length,
    trending: kpis.filter(k => k.changeType === 'increase').length
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MaterializedKPIsDashboard Demo</h1>
            <p className="text-muted-foreground">
              Demo component hiển thị KPIs từ PostgreSQL materialized view với charts, filtering và export functionality.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Database className="h-3 w-3" />
              PostgreSQL Source
            </Badge>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Demo Controls
              </CardTitle>
              <CardDescription>
                Test các tính năng của MaterializedKPIsDashboard component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={handleRefresh} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Simulate Data Refresh
                </Button>
                <Button onClick={addRandomKPI} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Random KPI
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Sử dụng time range filter để thay đổi period</p>
                <p>• Filter theo category (engagement, content, conversion, audience)</p>
                <p>• Click vào KPI cards để drill down và xem breakdown data</p>
                <p>• Export data to CSV hoặc PDF format</p>
                <p>• Progress bars hiển thị % completion so với targets</p>
                <p>• Real-time animations và responsive design</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <MaterializedKPIsDashboard
            kpis={kpis}
            loading={loading}
            onRefresh={handleRefresh}
            onDrillDown={handleDrillDown}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• KPI cards với progress indicators</li>
                  <li>• Real-time data from PostgreSQL materialized views</li>
                  <li>• Category-based filtering system</li>
                  <li>• Time range selection (7d, 30d, 90d, custom)</li>
                  <li>• Target vs actual performance tracking</li>
                  <li>• Dark mode support hoàn toàn</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Drill-down capability với breakdown data</li>
                  <li>• Export functionality (CSV/PDF)</li>
                  <li>• Loading skeletons với animation</li>
                  <li>• Toast notifications cho user feedback</li>
                  <li>• Responsive grid layout</li>
                  <li>• Smooth hover effects và transitions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-500" />
                  KPI Categories
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Activity className="h-3 w-3 text-blue-500" />
                    Engagement
                  </div>
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-3 w-3 text-green-500" />
                    Content
                  </div>
                  <div className="flex items-center gap-2">
                    <Target className="h-3 w-3 text-purple-500" />
                    Conversion
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-3 w-3 text-orange-500" />
                    Audience
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-orange-500" />
                  Data Visualization
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Progress bars cho target achievement</li>
                  <li>• Trend indicators (increase/decrease/neutral)</li>
                  <li>• Color-coded categories và status</li>
                  <li>• Percentage change calculations</li>
                  <li>• Drill-down pie charts và breakdowns</li>
                  <li>• Responsive number formatting</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total KPIs</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Tracked indicators
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Categories</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.categories}</div>
                <p className="text-xs text-muted-foreground">
                  Different categories
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Targets Met</CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.targetsMet}</div>
                <p className="text-xs text-muted-foreground">
                  Goals achieved
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trending Up</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.trending}</div>
                <p className="text-xs text-muted-foreground">
                  Improving metrics
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>KPI Performance Overview</CardTitle>
              <CardDescription>
                Distribution của KPIs theo performance và category
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['engagement', 'content', 'conversion', 'audience'].map(category => {
                  const categoryKPIs = kpis.filter(k => k.category === category)
                  const avgChange = categoryKPIs.reduce((acc, k) => acc + k.change, 0) / categoryKPIs.length
                  const targetsMet = categoryKPIs.filter(k => k.target && k.value >= k.target).length
                  
                  return (
                    <div key={category} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 capitalize">
                          <span className="text-sm font-medium">{category}</span>
                          <Badge variant="outline">{categoryKPIs.length} KPIs</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {targetsMet}/{categoryKPIs.length} targets met • {avgChange.toFixed(1)}% avg change
                        </div>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${(targetsMet / categoryKPIs.length) * 100}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Usage</CardTitle>
              <CardDescription>
                Cách sử dụng MaterializedKPIsDashboard trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { MaterializedKPIsDashboard, type KPIData } from '@/components/ui/materialized-kpis-dashboard'

const kpiData: KPIData[] = [
  {
    id: 'engagement-rate',
    name: 'Content Engagement Rate',
    value: 8.7,
    unit: '%',
    change: 12.5,
    changeType: 'increase',
    category: 'engagement',
    target: 10.0,
    description: 'Average engagement rate across all content',
    lastUpdated: '2024-11-04T10:30:00Z',
    drillDownData: [
      { label: 'Blog Posts', value: 9.2, percentage: 45 },
      { label: 'Social Media', value: 8.1, percentage: 35 }
    ]
  }
]

function MyDashboard() {
  const handleDrillDown = (kpiId) => {
    console.log('Drilling down:', kpiId)
  }

  return (
    <MaterializedKPIsDashboard
      kpis={kpiData}
      onDrillDown={handleDrillDown}
      onRefresh={() => fetchLatestData()}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Export Functions</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`<MaterializedKPIsDashboard
  kpis={kpiData}
  loading={isLoading}
  onRefresh={handleRefresh}
  onDrillDown={handleDrillDown}
  onExportCSV={() => {
    // Custom CSV export with additional formatting
    exportToCSV(filteredData)
  }}
  onExportPDF={() => {
    // Generate PDF report with charts
    generatePDFReport(kpiData)
  }}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface MaterializedKPIsDashboardProps {
  kpis: KPIData[]                           // Required: Array of KPI data
  loading?: boolean                          // Optional: Loading state
  onRefresh?: () => void                     // Optional: Refresh handler
  onDrillDown?: (kpiId: string) => void      // Optional: Drill-down handler
  onExportCSV?: () => void                   // Optional: CSV export handler
  onExportPDF?: () => void                   // Optional: PDF export handler
  className?: string                         // Optional: Additional CSS classes
}

interface KPIData {
  id: string                                 // Required: Unique identifier
  name: string                               // Required: KPI display name
  value: number                              // Required: Current value
  unit: string                               // Required: Unit (%, currency, pieces, etc.)
  change: number                             // Required: Percentage change
  changeType: 'increase' | 'decrease' | 'neutral'  // Required: Change direction
  category: 'engagement' | 'content' | 'conversion' | 'audience'  // Required: Category
  target?: number                            // Optional: Target value
  description: string                        // Required: KPI description
  lastUpdated: string                        // Required: ISO timestamp
  chartData?: Array<{date: string; value: number}>  // Optional: Time series data
  drillDownData?: Array<{label: string; value: number; percentage: number}>  // Optional: Breakdown data
}`}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}