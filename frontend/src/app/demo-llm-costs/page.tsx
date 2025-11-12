'use client'

import { useState } from 'react'
import { LLMCostBreakdown, type LLMCost } from '@/components/ui/llm-cost-breakdown'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { 
  RefreshCw,
  DollarSign,
  Plus,
  Settings,
  Calculator,
  Activity,
  TrendingUp,
  TrendingDown,
  Zap,
  Target,
  AlertTriangle,
  CreditCard,
  BarChart3,
  PieChart,
  Coins,
  Wallet
} from 'lucide-react'

const sampleCosts: LLMCost[] = [
  {
    pack_id: 'PACK-2024-001',
    pack_name: 'AI Marketing Strategy Content',
    model: 'gpt-4o',
    input_tokens: 15420,
    output_tokens: 8930,
    total_cost_usd: 0.2891,
    timestamp: '2024-11-04T10:30:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-123'
  },
  {
    pack_id: 'PACK-2024-002',
    pack_name: 'Social Media Campaign',
    model: 'claude-3-sonnet',
    input_tokens: 12800,
    output_tokens: 6750,
    total_cost_usd: 0.1397,
    timestamp: '2024-11-04T11:15:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-456'
  },
  {
    pack_id: 'PACK-2024-003',
    pack_name: 'Product Description Suite',
    model: 'gpt-3.5-turbo',
    input_tokens: 8500,
    output_tokens: 4200,
    total_cost_usd: 0.0106,
    timestamp: '2024-11-04T09:45:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-789'
  },
  {
    pack_id: 'PACK-2024-004',
    pack_name: 'Email Newsletter Templates',
    model: 'claude-3-haiku',
    input_tokens: 6200,
    output_tokens: 3800,
    total_cost_usd: 0.0063,
    timestamp: '2024-11-04T12:00:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-012'
  },
  {
    pack_id: 'PACK-2024-005',
    pack_name: 'Technical Documentation',
    model: 'gpt-4',
    input_tokens: 22000,
    output_tokens: 18500,
    total_cost_usd: 1.770,
    timestamp: '2024-11-03T14:20:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-345'
  },
  {
    pack_id: 'PACK-2024-006',
    pack_name: 'Blog Post Series',
    model: 'claude-3-opus',
    input_tokens: 18900,
    output_tokens: 24600,
    total_cost_usd: 2.1285,
    timestamp: '2024-11-03T16:45:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-678'
  },
  {
    pack_id: 'PACK-2024-007',
    pack_name: 'SEO Article Collection',
    model: 'gemini-pro',
    input_tokens: 14300,
    output_tokens: 11200,
    total_cost_usd: 0.0240,
    timestamp: '2024-11-03T13:30:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-901'
  },
  {
    pack_id: 'PACK-2024-008',
    pack_name: 'Video Script Package',
    model: 'gpt-4o',
    input_tokens: 19500,
    output_tokens: 15800,
    total_cost_usd: 0.3345,
    timestamp: '2024-11-02T15:20:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-234'
  },
  {
    pack_id: 'PACK-2024-009',
    pack_name: 'Customer Support Templates',
    model: 'claude-3-sonnet',
    input_tokens: 9800,
    output_tokens: 5600,
    total_cost_usd: 0.1134,
    timestamp: '2024-11-02T11:10:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-567'
  },
  {
    pack_id: 'PACK-2024-010',
    pack_name: 'Press Release Collection',
    model: 'gpt-4',
    input_tokens: 16200,
    output_tokens: 12800,
    total_cost_usd: 1.254,
    timestamp: '2024-11-01T17:30:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-890'
  },
  {
    pack_id: 'PACK-2024-011',
    pack_name: 'Landing Page Copy',
    model: 'claude-3-haiku',
    input_tokens: 7100,
    output_tokens: 4900,
    total_cost_usd: 0.0084,
    timestamp: '2024-11-01T14:45:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-123'
  },
  {
    pack_id: 'PACK-2024-012',
    pack_name: 'Ad Copy Variations',
    model: 'gpt-3.5-turbo',
    input_tokens: 5400,
    output_tokens: 3200,
    total_cost_usd: 0.0075,
    timestamp: '2024-10-31T16:20:00Z',
    endpoint: '/api/ai/generate-content',
    user_id: 'user-456'
  }
]

export default function DemoLLMCostsPage() {
  const [costs, setCosts] = useState<LLMCost[]>(sampleCosts)
  const [budgetLimit, setBudgetLimit] = useState<number>(10.0)
  const { toast } = useToast()

  const handleViewDetails = (cost: LLMCost) => {
    console.log('Viewing details for:', cost.pack_id)
    toast({
      title: "Cost Details",
      description: `Viewing detailed breakdown for ${cost.pack_name || cost.pack_id}`,
    })
  }

  const handleExportCSV = () => {
    console.log('Exporting costs to CSV...')
    toast({
      title: "CSV Export",
      description: "LLM cost breakdown exported to CSV successfully",
    })
  }

  const handleExportPDF = () => {
    console.log('Exporting costs to PDF...')
    toast({
      title: "PDF Export",
      description: "Advanced PDF report generation would be implemented here",
    })
  }

  const addRandomCost = () => {
    const models = ['gpt-4o', 'gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'claude-3-haiku', 'gemini-pro']
    const packTypes = [
      'Blog Post Series',
      'Social Media Package',
      'Email Campaign',
      'Product Descriptions',
      'Technical Docs',
      'Marketing Copy',
      'SEO Articles',
      'Press Releases'
    ]
    
    const model = models[Math.floor(Math.random() * models.length)]
    const packType = packTypes[Math.floor(Math.random() * packTypes.length)]
    const inputTokens = Math.floor(Math.random() * 20000) + 1000
    const outputTokens = Math.floor(Math.random() * 15000) + 500
    
    // Calculate cost based on model rates
    const modelRates = {
      'gpt-4o': { input: 0.005, output: 0.015 },
      'gpt-4': { input: 0.03, output: 0.06 },
      'gpt-3.5-turbo': { input: 0.0005, output: 0.0015 },
      'claude-3-opus': { input: 0.015, output: 0.075 },
      'claude-3-sonnet': { input: 0.003, output: 0.015 },
      'claude-3-haiku': { input: 0.00025, output: 0.00125 },
      'gemini-pro': { input: 0.0005, output: 0.0015 }
    }
    
    const rates = modelRates[model as keyof typeof modelRates]
    const totalCost = (inputTokens / 1000) * rates.input + (outputTokens / 1000) * rates.output
    
    const newCost: LLMCost = {
      pack_id: `PACK-2024-${String(costs.length + 1).padStart(3, '0')}`,
      pack_name: `${packType} (Generated)`,
      model,
      input_tokens: inputTokens,
      output_tokens: outputTokens,
      total_cost_usd: totalCost,
      timestamp: new Date().toISOString(),
      endpoint: '/api/ai/generate-content',
      user_id: `user-${Math.floor(Math.random() * 1000)}`
    }
    
    setCosts(prev => [newCost, ...prev])
    toast({
      title: "Cost Record Added",
      description: `New ${model} cost record added: $${totalCost.toFixed(4)}`,
    })
  }

  const updateBudget = (increase: boolean) => {
    const newBudget = increase ? budgetLimit + 5 : Math.max(0, budgetLimit - 5)
    setBudgetLimit(newBudget)
    toast({
      title: "Budget Updated",
      description: `Budget limit ${increase ? 'increased' : 'decreased'} to $${newBudget.toFixed(2)}`,
    })
  }

  const resetDemo = () => {
    setCosts(sampleCosts)
    setBudgetLimit(10.0)
    toast({
      title: "Demo Reset",
      description: "LLM cost breakdown has been reset to original state",
    })
  }

  // Statistics
  const stats = {
    total: costs.length,
    totalCost: costs.reduce((sum, cost) => sum + cost.total_cost_usd, 0),
    totalTokens: costs.reduce((sum, cost) => sum + cost.input_tokens + cost.output_tokens, 0),
    models: new Set(costs.map(c => c.model)).size,
    mostExpensive: costs.reduce((max, cost) => cost.total_cost_usd > max.total_cost_usd ? cost : max, costs[0] || { total_cost_usd: 0 }),
    averageCost: costs.length > 0 ? costs.reduce((sum, cost) => sum + cost.total_cost_usd, 0) / costs.length : 0
  }

  const budgetUsage = (stats.totalCost / budgetLimit) * 100
  const isOverBudget = stats.totalCost > budgetLimit

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">LLMCostBreakdown Demo</h1>
            <p className="text-muted-foreground">
              Demo component theo dõi và phân tích chi phí sử dụng LLM theo content pack với budget tracking và cost visualization.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <DollarSign className="h-3 w-3" />
              ${stats.totalCost.toFixed(2)} Total
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
                Test các tính năng của LLMCostBreakdown component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={addRandomCost} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Random Cost
                </Button>
                <Button onClick={() => updateBudget(true)} variant="outline" className="gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Increase Budget (+$5)
                </Button>
                <Button onClick={() => updateBudget(false)} variant="outline" className="gap-2">
                  <TrendingDown className="h-4 w-4" />
                  Decrease Budget (-$5)
                </Button>
              </div>
              
              <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm font-medium">Current Budget:</span>
                  <span className="text-lg font-bold">${budgetLimit.toFixed(2)}</span>
                </div>
                <Separator orientation="vertical" className="h-6" />
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Usage:</span>
                  <span className={`text-sm font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                    {budgetUsage.toFixed(1)}%
                  </span>
                  {isOverBudget && <AlertTriangle className="h-4 w-4 text-red-600" />}
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Filter costs theo model, date range, hoặc search pack</p>
                <p>• Sort columns bằng cách click vào column headers</p>
                <p>• View model breakdown với percentage distribution</p>
                <p>• Budget tracking với visual progress bars</p>
                <p>• Export data to CSV hoặc PDF formats</p>
                <p>• Real-time cost calculations và token formatting</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <LLMCostBreakdown
            costs={costs}
            budgetLimit={budgetLimit}
            onViewDetails={handleViewDetails}
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
                  <Activity className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Detailed cost breakdown table với sorting</li>
                  <li>• Model badges với provider information</li>
                  <li>• Token usage formatting (K, M notation)</li>
                  <li>• Real-time cost calculations</li>
                  <li>• Multi-currency support (USD, EUR, VND)</li>
                  <li>• Dark mode support hoàn toàn</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Analytics Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Cost visualization by model</li>
                  <li>• Budget tracking với progress indicators</li>
                  <li>• Statistical summary cards</li>
                  <li>• Date range filtering</li>
                  <li>• Model và pack filtering</li>
                  <li>• Budget alerts khi vượt ngưỡng</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-purple-500" />
                  Supported Models
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-1 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span><strong>OpenAI:</strong> GPT-4o, GPT-4, GPT-3.5-turbo</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                    <span><strong>Anthropic:</strong> Claude-3 Opus, Sonnet, Haiku</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                    <span><strong>Google:</strong> Gemini Pro</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-orange-500" />
                  Export & Reporting
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• CSV export với detailed data</li>
                  <li>• PDF reports với charts</li>
                  <li>• Search và filtering capabilities</li>
                  <li>• Sortable columns</li>
                  <li>• Real-time cost updates</li>
                  <li>• Budget monitoring alerts</li>
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
                <CardTitle className="text-sm font-medium">Total Cost</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalCost.toFixed(4)}</div>
                <p className="text-xs text-muted-foreground">
                  Across all packs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Packs</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Content packs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tokens</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.totalTokens >= 1000000 ? `${(stats.totalTokens / 1000000).toFixed(1)}M` :
                   stats.totalTokens >= 1000 ? `${(stats.totalTokens / 1000).toFixed(1)}K` :
                   stats.totalTokens.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Input + output
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Models Used</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.models}</div>
                <p className="text-xs text-muted-foreground">
                  Different LLMs
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Budget Analysis</CardTitle>
                <CardDescription>
                  Current budget usage và spending patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Budget Limit</span>
                    <span className="font-medium">${budgetLimit.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Current Spending</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      ${stats.totalCost.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Usage Percentage</span>
                    <span className={`font-medium ${isOverBudget ? 'text-red-600' : 'text-green-600'}`}>
                      {budgetUsage.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-3">
                    <div 
                      className={`rounded-full h-3 transition-all duration-300 ${
                        isOverBudget ? 'bg-red-500' : 
                        budgetUsage > 80 ? 'bg-yellow-500' : 'bg-green-500'
                      }`}
                      style={{ width: `${Math.min(budgetUsage, 100)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Remaining Budget</span>
                    <span className={`font-medium ${budgetLimit - stats.totalCost < 0 ? 'text-red-600' : 'text-green-600'}`}>
                      ${Math.max(0, budgetLimit - stats.totalCost).toFixed(4)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Cost Insights</CardTitle>
                <CardDescription>
                  Key metrics và cost analysis
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Average Cost per Pack</span>
                    <span className="font-medium">${stats.averageCost.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Expensive Pack</span>
                    <span className="font-medium">${stats.mostExpensive?.total_cost_usd?.toFixed(4) || '0'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Cheapest Model</span>
                    <span className="font-medium text-green-600">claude-3-haiku</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Most Expensive Model</span>
                    <span className="font-medium text-red-600">claude-3-opus</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Total Pack Types</span>
                    <span className="font-medium">{new Set(costs.map(c => c.pack_name?.split(' ')[0] || '')).size}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Usage</CardTitle>
              <CardDescription>
                Cách sử dụng LLMCostBreakdown trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { LLMCostBreakdown, type LLMCost } from '@/components/ui/llm-cost-breakdown'

const costData: LLMCost[] = [
  {
    pack_id: 'PACK-001',
    pack_name: 'Marketing Campaign',
    model: 'gpt-4o',
    input_tokens: 15420,
    output_tokens: 8930,
    total_cost_usd: 0.2891,
    timestamp: '2024-11-04T10:30:00Z'
  }
]

function MyComponent() {
  const handleViewDetails = (cost) => {
    console.log('Viewing cost details:', cost.pack_id)
  }

  return (
    <LLMCostBreakdown
      costs={costData}
      budgetLimit={100.0}
      onViewDetails={handleViewDetails}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Export Functions</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`<LLMCostBreakdown
  costs={costs}
  budgetLimit={50.0}
  currency="USD"
  onViewDetails={handleViewDetails}
  onExportCSV={() => {
    // Custom CSV export with additional formatting
    exportCostsToCSV(costs)
  }}
  onExportPDF={() => {
    // Generate detailed PDF report
    generateCostReport(costs)
  }}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface LLMCostBreakdownProps {
  costs: LLMCost[]                         // Required: Array of cost records
  onExportCSV?: () => void                 // Optional: CSV export handler
  onExportPDF?: () => void                 // Optional: PDF export handler
  onViewDetails?: (cost: LLMCost) => void  // Optional: Detail view handler
  budgetLimit?: number                     // Optional: Budget limit for tracking
  currency?: 'USD' | 'EUR' | 'VND'        // Optional: Display currency
  className?: string                       // Optional: Additional CSS classes
}

interface LLMCost {
  pack_id: string                          // Required: Content pack identifier
  pack_name?: string                       // Optional: Human-readable pack name
  model: string                            // Required: LLM model used
  input_tokens: number                     // Required: Input token count
  output_tokens: number                    // Required: Output token count
  total_cost_usd: number                   // Required: Total cost in USD
  timestamp?: string                       // Optional: ISO timestamp
  endpoint?: string                        // Optional: API endpoint used
  user_id?: string                         // Optional: User identifier
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