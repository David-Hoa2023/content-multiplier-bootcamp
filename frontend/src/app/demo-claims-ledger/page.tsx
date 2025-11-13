'use client'

import { useState, useEffect } from 'react'
import { ClaimsLedgerTable, type Claim } from '@/components/ui/claims-ledger-table-simple'
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
  Trash2,
  FileText,
  AlertCircle,
  CheckCircle,
  TrendingUp,
  Settings
} from 'lucide-react'

// Sample claims data for demonstration
const sampleClaims: Claim[] = [
  {
    id: '1',
    claim_text: 'Việt Nam có GDP tăng trưởng 8.02% trong quý III/2023',
    source_url: 'https://vneconomy.vn/gdp-viet-nam-tang-truong-8-02-trong-quy-iii-2023.htm',
    retrieved_snippet: 'Tổng sản phẩm trong nước (GDP) quý III/2023 ước tính tăng 5.33% so với cùng kỳ năm trước, tính chung 9 tháng đầu năm 2023 tăng 5.32% so với cùng kỳ năm 2022.',
    confidence_score: 92,
    created_at: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    claim_text: 'OpenAI đã phát hành GPT-4 Turbo với khả năng xử lý 128K tokens',
    source_url: 'https://openai.com/blog/new-models-and-developer-products-announced-at-devday',
    retrieved_snippet: 'GPT-4 Turbo is our most capable model, featuring improved instruction following, JSON mode, reproducible outputs, parallel function calling, and more.',
    confidence_score: 88,
    created_at: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    claim_text: 'Việt Nam xuất khẩu gạo đạt 4.5 triệu tấn trong 6 tháng đầu năm 2023',
    source_url: '',
    retrieved_snippet: 'Theo số liệu thống kê từ Hiệp hội Lương thực Việt Nam, xuất khẩu gạo của Việt Nam trong 6 tháng đầu năm đạt 4.2 triệu tấn.',
    confidence_score: 75,
    created_at: '2024-01-13T09:15:00Z'
  },
  {
    id: '4',
    claim_text: 'React 18 đã chính thức được phát hành với Concurrent Features',
    source_url: 'https://react.dev/blog/2022/03/29/react-v18',
    retrieved_snippet: 'React 18 is now available on npm! In our last post, we shared step-by-step instructions for upgrading your app to React 18.',
    confidence_score: 95,
    created_at: '2024-01-12T16:45:00Z'
  },
  {
    id: '5',
    claim_text: 'Tỷ lệ thất nghiệp ở Việt Nam giảm xuống 2.1% trong quý II/2023',
    source_url: 'https://www.gso.gov.vn/px-web-2/?pxid=V0203&theme=Lao%20động%20-%20Việc%20làm',
    retrieved_snippet: 'Tỷ lệ thất nghiệp trong độ tuổi lao động quý II/2023 ở khu vực thành thị là 3.02%, khu vực nông thôn là 1.52%.',
    confidence_score: 82,
    created_at: '2024-01-11T11:30:00Z'
  },
  {
    id: '6',
    claim_text: 'TypeScript 5.0 giới thiệu Decorators và Template Literal Types mới',
    source_url: '',
    retrieved_snippet: 'TypeScript 5.0 brings many new features including decorators, const assertions, and improved template literal types for better type checking.',
    confidence_score: 45,
    created_at: '2024-01-10T13:20:00Z'
  },
  {
    id: '7',
    claim_text: 'Xuất khẩu cà phê Việt Nam tăng 12% trong 10 tháng đầu năm 2023',
    source_url: 'https://baochinhphu.vn/xuat-khau-ca-phe-viet-nam-tang-12-trong-10-thang-dau-nam-2023-102231030084557894.htm',
    retrieved_snippet: 'Theo Hiệp hội Cà phê Ca cao Việt Nam, xuất khẩu cà phê 10 tháng đầu năm 2023 ước đạt 1.4 triệu tấn, tăng 12.5% so với cùng kỳ năm trước.',
    confidence_score: 91,
    created_at: '2024-01-09T08:45:00Z'
  },
  {
    id: '8',
    claim_text: 'Next.js 14 phát hành với App Router stable và Server Components',
    source_url: 'https://nextjs.org/blog/next-14',
    retrieved_snippet: 'Next.js 14 is here with performance improvements, new features including Turbopack, Server Actions stable, and more.',
    confidence_score: 89,
    created_at: '2024-01-08T15:30:00Z'
  },
  {
    id: '9',
    claim_text: 'Lạm phát cơ bản của Việt Nam duy trì ở mức 3.2% trong tháng 11/2023',
    source_url: '',
    retrieved_snippet: 'Chỉ số giá tiêu dùng (CPI) tháng 11/2023 tăng 0.33% so với tháng trước và tăng 4.37% so với cùng kỳ năm trước.',
    confidence_score: 38,
    created_at: '2024-01-07T12:15:00Z'
  },
  {
    id: '10',
    claim_text: 'Anthropic đã công bố Claude 3 với khả năng multimodal và context window 200K',
    source_url: 'https://www.anthropic.com/news/claude-3-family',
    retrieved_snippet: `Today, we are announcing the Claude 3 model family, which sets new industry benchmarks across a wide range of cognitive tasks.`,
    confidence_score: 94,
    created_at: '2024-01-06T09:20:00Z'
  },
  {
    id: '11',
    claim_text: 'Việt Nam đạt kim ngạch xuất khẩu 371.85 tỷ USD trong 11 tháng đầu năm 2023',
    source_url: 'https://www.haiquanonline.com.vn/kim-ngach-xuat-khau-11-thang-dau-nam-2023-dat-371-85-ty-usd-176914.html',
    retrieved_snippet: 'Tổng Kim ngạch xuất nhập khẩu hàng hóa của cả nước 11 tháng đầu năm 2023 ước đạt 686.8 tỷ USD, giảm 11.9% so với cùng kỳ năm trước.',
    confidence_score: 87,
    created_at: '2024-01-05T14:40:00Z'
  },
  {
    id: '12',
    claim_text: 'Meta giới thiệu Llama 2 với 70B parameters và commercial license',
    source_url: '',
    retrieved_snippet: 'Meta has released Llama 2, a collection of pretrained and fine-tuned large language models ranging in scale from 7B to 70B parameters.',
    confidence_score: 62,
    created_at: '2024-01-04T16:25:00Z'
  }
]

export default function DemoClaimsLedgerPage() {
  const [claims, setClaims] = useState<Claim[]>(sampleClaims)
  const [loading, setLoading] = useState(false)
  const [selectedClaims, setSelectedClaims] = useState<Claim[]>([])
  const { toast } = useToast()

  const handleClaimClick = (claim: Claim) => {
    setSelectedClaims(prev => {
      const exists = prev.find(c => c.id === claim.id)
      if (exists) {
        return prev.filter(c => c.id !== claim.id)
      } else {
        return [...prev, claim]
      }
    })
    
    toast({
      title: "Claim selected",
      description: `"${claim.claim_text.substring(0, 50)}..." has been ${selectedClaims.find(c => c.id === claim.id) ? 'deselected' : 'selected'}`,
      duration: 2000,
    })
  }

  const handleSourceClick = (url: string) => {
    toast({
      title: "Opening source",
      description: "Source link will open in new tab",
      duration: 2000,
    })
    // Default behavior will open in new tab
  }

  const handleExport = (claimsToExport: Claim[]) => {
    toast({
      title: "Export successful",
      description: `${claimsToExport.length} claims exported to CSV`,
      duration: 3000,
    })
  }

  const simulateLoading = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      toast({
        title: "Data refreshed",
        description: "Claims data has been updated",
      })
    }, 2000)
  }

  const addRandomClaim = () => {
    const newClaim: Claim = {
      id: (claims.length + 1).toString(),
      claim_text: `New claim added at ${new Date().toLocaleTimeString()}`,
      source_url: Math.random() > 0.3 ? 'https://example.com/source' : '',
      retrieved_snippet: 'This is a generated snippet for demonstration purposes. It contains relevant information extracted from the source.',
      confidence_score: Math.floor(Math.random() * 100),
      created_at: new Date().toISOString()
    }
    
    setClaims(prev => [newClaim, ...prev])
    toast({
      title: "New claim added",
      description: "A new claim has been added to the ledger",
    })
  }

  const removeSelectedClaims = () => {
    if (selectedClaims.length === 0) {
      toast({
        title: "No claims selected",
        description: "Please select claims to remove",
        variant: "destructive",
      })
      return
    }
    
    const selectedIds = selectedClaims.map(c => c.id)
    setClaims(prev => prev.filter(claim => !selectedIds.includes(claim.id)))
    setSelectedClaims([])
    
    toast({
      title: "Claims removed",
      description: `${selectedClaims.length} claims have been removed`,
    })
  }

  const resetDemo = () => {
    setClaims(sampleClaims)
    setSelectedClaims([])
    setLoading(false)
    toast({
      title: "Demo reset",
      description: "All data has been reset to original state",
    })
  }

  // Statistics
  const stats = {
    total: claims.length,
    withSource: claims.filter(c => c.source_url).length,
    highConfidence: claims.filter(c => c.confidence_score >= 80).length,
    avgConfidence: claims.length > 0 ? claims.reduce((sum, c) => sum + c.confidence_score, 0) / claims.length : 0
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ClaimsLedgerTable Demo</h1>
            <p className="text-muted-foreground">
              Demo comprehensive table component cho AI-extracted claims với sorting, filtering, pagination và export.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Selected: {selectedClaims.length}
            </Badge>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="table" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="table">Live Table</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Live Table Tab */}
        <TabsContent value="table" className="space-y-6">
          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Demo Controls
              </CardTitle>
              <CardDescription>
                Test các tính năng của ClaimsLedgerTable component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={simulateLoading} variant="outline" className="gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Simulate Loading
                </Button>
                
                <Button onClick={addRandomClaim} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Random Claim
                </Button>
                
                <Button 
                  onClick={removeSelectedClaims} 
                  variant="destructive" 
                  className="gap-2"
                  disabled={selectedClaims.length === 0}
                >
                  <Trash2 className="h-4 w-4" />
                  Remove Selected ({selectedClaims.length})
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Click vào claim để select/deselect</p>
                <p>• Sắp xếp bằng cách click vào column headers</p>
                <p>• Filter theo confidence level hoặc search text</p>
                <p>• Dòng màu cam = không có source URL</p>
                <p>• Export CSV với selected claims hoặc tất cả</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Table */}
          <ClaimsLedgerTable
            claims={claims}
            loading={loading}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Hiển thị claims với claim text, source URL, snippet</li>
                  <li>• Confidence score với color-coded badges</li>
                  <li>• Clickable source URLs mở trong tab mới</li>
                  <li>• Tooltips cho confidence levels</li>
                  <li>• Responsive design với horizontal scroll</li>
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
                  <li>• Sorting theo confidence, date, text</li>
                  <li>• Search trong claim text và snippets</li>
                  <li>• Filter theo confidence levels</li>
                  <li>• Pagination với customizable page size</li>
                  <li>• Export CSV với selected hoặc all claims</li>
                  <li>• Highlight claims không có source</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-purple-500" />
                  UI/UX Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Smooth animations với Framer Motion</li>
                  <li>• Row hover effects và selection</li>
                  <li>• Loading skeletons khi fetch data</li>
                  <li>• Empty state với helpful messages</li>
                  <li>• Toast notifications cho actions</li>
                  <li>• Checkbox selection cho multiple claims</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Confidence Levels
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Badge className="bg-green-500 hover:bg-green-600">High</Badge>
                    <span>≥ 80% confidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="bg-yellow-500 hover:bg-yellow-600">Medium</Badge>
                    <span>50-79% confidence</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">Low</Badge>
                    <span>&lt; 50% confidence</span>
                  </div>
                  <div className="flex items-center gap-2 text-orange-600">
                    <AlertCircle className="h-3 w-3" />
                    <span>Claims without source highlighted</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <Database className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Active claims in ledger
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Claims</CardTitle>
                <CheckCircle className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Claims in the ledger
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">With Sources</CardTitle>
                <FileText className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.withSource}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.withSource / stats.total) * 100).toFixed(1)}% have source URLs
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">High Confidence</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.highConfidence}</div>
                <p className="text-xs text-muted-foreground">
                  ≥80% confidence score
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Confidence Distribution</CardTitle>
              <CardDescription>
                Phân phối claims theo mức độ tin cậy
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-3">
                  {[
                    { label: 'High (≥80%)', count: claims.filter(c => c.confidence_score >= 80).length, color: 'bg-green-500' },
                    { label: 'Medium (50-79%)', count: claims.filter(c => c.confidence_score >= 50 && c.confidence_score < 80).length, color: 'bg-yellow-500' },
                    { label: 'Low (<50%)', count: claims.filter(c => c.confidence_score < 50).length, color: 'bg-red-500' },
                    { label: 'No Source', count: claims.filter(c => !c.source_url).length, color: 'bg-orange-500' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                      <div className={`w-4 h-4 rounded ${item.color}`} />
                      <span className="flex-1 text-sm">{item.label}</span>
                      <span className="font-medium">{item.count}</span>
                      <span className="text-xs text-muted-foreground">
                        ({((item.count / stats.total) * 100).toFixed(1)}%)
                      </span>
                    </div>
                  ))}
                </div>
                
                <Separator />
                
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {stats.avgConfidence.toFixed(1)}%
                  </div>
                  <p className="text-sm text-muted-foreground">Average Confidence Score</p>
                </div>
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
                Cách sử dụng ClaimsLedgerTable trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm">
                  <code>{`import { ClaimsLedgerTable, type Claim } from '@/components/ui/claims-ledger-table-simple'

const claims: Claim[] = [
  {
    id: '1',
    claim_text: 'Your claim text here',
    source_url: 'https://example.com/source',
    retrieved_snippet: 'Retrieved snippet from source',
    confidence_score: 85,
    created_at: '2024-01-15T10:30:00Z'
  }
]

function MyComponent() {
  return (
    <ClaimsLedgerTable
      claims={claims}
      showSearch={true}
      showFilter={true}
      showExport={true}
      showPagination={true}
      itemsPerPage={10}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Event Handlers</h4>
                <div className="bg-muted rounded-lg p-4 text-sm">
                  <code>{`<ClaimsLedgerTable
  claims={claims}
  onClaimClick={(claim) => {
    console.log('Claim clicked:', claim)
  }}
  onSourceClick={(url) => {
    window.open(url, '_blank')
  }}
  onExport={(claims) => {
    // Custom export logic
    console.log('Exporting claims:', claims)
  }}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm">
                  <code>{`interface ClaimsLedgerTableProps {
  claims: Claim[]                          // Required claims data
  loading?: boolean                        // Show loading state
  showSearch?: boolean                     // Enable search functionality
  showFilter?: boolean                     // Enable filtering
  showExport?: boolean                     // Enable CSV export
  showPagination?: boolean                 // Enable pagination
  itemsPerPage?: number                    // Items per page (default: 10)
  onClaimClick?: (claim: Claim) => void    // Claim click handler
  onSourceClick?: (url: string) => void    // Source link click handler
  onExport?: (claims: Claim[]) => void     // Custom export handler
  className?: string                       // Additional CSS classes
}

interface Claim {
  id?: string
  claim_text: string                       // Required claim text
  source_url?: string                      // Optional source URL
  retrieved_snippet: string               // Required snippet
  confidence_score: number                 // Required confidence (0-100)
  created_at?: string                      // Optional timestamp
  updated_at?: string                      // Optional update timestamp
  category?: string                        // Optional category
  verified?: boolean                       // Optional verification status
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