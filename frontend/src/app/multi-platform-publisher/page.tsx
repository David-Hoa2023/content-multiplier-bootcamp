'use client'

import { useState, useMemo, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  DerivativeTabs,
  type Platform,
  type PlatformConfig,
  ComparePreviews,
  ResponsivePreview,
  ExportOptions,
  type Derivative,
  SharePreviewLink,
  AnalyticsDashboard,
  type AnalyticsStats
} from '@/components/ui'
import { 
  Share2, 
  Sparkles, 
  BarChart3,
  Download,
  Smartphone,
  Monitor
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { format } from 'date-fns'
import { useSearchParams, useRouter } from 'next/navigation'
import { API_URL } from '@/lib/api-config'

export default function MultiPlatformPublisherPage() {
  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [content, setContent] = useState('')
  const [sourceData, setSourceData] = useState<any>(null)
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([
    {
      platform: 'Twitter',
      characterLimit: 280,
      content: ''
    },
    {
      platform: 'LinkedIn',
      characterLimit: 3000,
      content: ''
    },
    {
      platform: 'Facebook',
      characterLimit: 5000,
      content: ''
    },
    {
      platform: 'Instagram',
      characterLimit: 2200,
      content: ''
    },
    {
      platform: 'TikTok',
      characterLimit: 300,
      content: ''
    }
  ])
  const [activePlatform, setActivePlatform] = useState<Platform>('Twitter')
  const [isGenerating, setIsGenerating] = useState(false)
  const [derivatives, setDerivatives] = useState<Derivative[]>([])
  const [analyticsStats, setAnalyticsStats] = useState<AnalyticsStats | null>(null)
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true)

  // Fetch real analytics data from backend
  const fetchAnalytics = async () => {
    setIsLoadingAnalytics(true)
    try {
      const response = await fetch(`${API_URL}/analytics/stats`)
      const data = await response.json()

      if (data.success) {
        // Pass backend data directly (now matches AnalyticsStats type)
        setAnalyticsStats(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      // Use fallback data if API fails
      setAnalyticsStats({
        overview: { totalIdeas: 0, totalContentPlans: 0, totalDerivatives: 0, publishedDerivatives: 0, averageDerivativesPerPlan: 0 },
        statusDistribution: { draft: 0, scheduled: 0, published: 0 },
        weeklyContent: [],
        platformBreakdown: [],
        recentActivity: []
      })
    } finally {
      setIsLoadingAnalytics(false)
    }
  }

  // Load analytics on mount
  useEffect(() => {
    fetchAnalytics()
  }, [])

  // Load data from Derivatives page if coming from there
  useEffect(() => {
    const from = searchParams.get('from')
    const packId = searchParams.get('pack_id')
    
    if (from === 'derivatives' && typeof window !== 'undefined') {
      const storedData = sessionStorage.getItem('derivatives_data')
      if (storedData) {
        const data = JSON.parse(storedData)
        setSourceData(data)
        
        // Set original content from the pack
        if (data.pack?.draft_content) {
          setContent(data.pack.draft_content)
        }
        
        // Load existing derivatives
        if (data.derivatives && data.derivatives.length > 0) {
          const loadedPlatforms = data.derivatives.map((d: any) => ({
            platform: d.platform,
            characterLimit: d.characterLimit,
            content: d.content || ''
          }))
          setPlatforms(loadedPlatforms)
          
          // Create derivative objects for display
          const loadedDerivatives = data.derivatives
            .filter((d: any) => d.content)
            .map((d: any) => ({
              id: `${d.platform}-loaded`,
              title: `Content for ${d.platform}`,
              platform: d.platform,
              content: d.content,
              status: 'draft' as const
            }))
          setDerivatives(loadedDerivatives)
        }
        
        // Clear session storage after loading
        sessionStorage.removeItem('derivatives_data')
      }
    }
  }, [searchParams])

  const updatePlatformContent = (platform: Platform, newContent: string) => {
    setPlatforms(prev =>
      prev.map(p =>
        p.platform === platform ? { ...p, content: newContent } : p
      )
    )
  }

  const getCurrentContent = (platform: Platform): string => {
    return platforms.find(p => p.platform === platform)?.content || ''
  }

  const handleGenerate = async () => {
    if (!content.trim()) {
      toast({
        title: 'Thiếu nội dung',
        description: 'Vui lòng nhập nội dung để tạo derivatives.',
        variant: 'destructive'
      })
      return
    }

    setIsGenerating(true)

    try {
      // Call real backend API to generate derivatives
      const response = await fetch(`${API_URL}/derivatives/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          pack_id: searchParams.get('pack_id') || `pack-${Date.now()}`,
          original_content: content,
          platforms: platforms.map(p => ({
            platform: p.platform,
            character_limit: p.characterLimit
          }))
        })
      })

      const data = await response.json()

      if (data.success && data.data) {
        // Update platforms with generated content from backend
        const generatedContent: Record<string, string> = {}
        data.data.forEach((d: any) => {
          generatedContent[d.platform] = d.content
        })

        setPlatforms(prev =>
          prev.map(p => ({
            ...p,
            content: generatedContent[p.platform] || p.content || content.substring(0, p.characterLimit)
          }))
        )

        // Create derivative objects for display
        const newDerivatives: Derivative[] = data.data.map((d: any) => ({
          id: `${d.platform}-${d.id || Date.now()}`,
          title: `Content for ${d.platform}`,
          platform: d.platform as Platform,
          content: d.content,
          status: d.status || 'draft'
        }))

        setDerivatives(newDerivatives)

        toast({
          title: 'Tạo thành công',
          description: `Đã tạo ${newDerivatives.length} nội dung cho các platform và lưu vào database.`
        })

        // Refresh analytics after generating
        fetchAnalytics()
      } else {
        throw new Error(data.error || 'Failed to generate')
      }
    } catch (error) {
      console.error('Error generating derivatives:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo nội dung. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportCSV = (derivatives: Derivative[]) => {
    toast({
      title: 'Export CSV',
      description: `Đã export ${derivatives.length} derivatives.`
    })
  }

  const handleExportICS = (derivatives: Derivative[]) => {
    toast({
      title: 'Export Calendar',
      description: `Đã export ${derivatives.length} events.`
    })
  }

  const handleGenerateShareLink = async (packId: string): Promise<string> => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
    const token = btoa(`${packId}-${Date.now()}`).replace(/[+/=]/g, '')
    return `${baseUrl}/preview/${packId}?token=${token}`
  }

  const currentDerivatives = useMemo(() => {
    return platforms
      .filter(p => p.content)
      .map(p => ({
        id: `${p.platform}-${Date.now()}`,
        title: `Content for ${p.platform}`,
        platform: p.platform,
        content: p.content || '',
        status: 'draft' as const
      }))
  }, [platforms])

  return (
    <AppLayout
      pageTitle="Multi-platform Publisher"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Multi-platform Publisher' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Multi-platform Publisher</h1>
          <p className="text-muted-foreground mt-2">
            Tạo và quản lý nội dung cho nhiều nền tảng mạng xã hội
          </p>
          {sourceData && (
            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
              <span>Đang làm việc với:</span>
              <Badge variant="secondary">{sourceData.pack?.pack_id}</Badge>
              {sourceData.plan && (
                <Badge variant="outline">Từ Content Plan</Badge>
              )}
            </div>
          )}
        </div>

        {/* Content Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Nội dung gốc
            </CardTitle>
            <CardDescription>
              {sourceData ? 'Nội dung từ trang Nội dung cho các Platform' : 'Nhập nội dung để tạo nội dung cho các platform'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="Nhập nội dung của bạn ở đây..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px]"
            />
            <div className="flex justify-between">
              <div>
                {sourceData && (
                  <Button
                    variant="outline"
                    onClick={() => router.push(`/derivatives?pack_id=${searchParams.get('pack_id')}`)}>
                    ← Quay lại Nội dung cho các Platform
                  </Button>
                )}
              </div>
              <div className="flex gap-2">
                <SharePreviewLink
                  packId={searchParams.get('pack_id') || 'multi-platform-publisher'}
                  onGenerateLink={handleGenerateShareLink}
                />
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !content.trim()}
                  className="gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  {isGenerating ? 'Đang tạo...' : sourceData ? 'Tạo thêm Nội dung' : 'Tạo Nội dung'}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Derivative Tabs */}
        {platforms.some(p => p.content) && (
          <Card>
            <CardHeader>
              <CardTitle>Nội dung cho các Platform</CardTitle>
              <CardDescription>
                Chỉnh sửa nội dung cho từng nền tảng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DerivativeTabs
                platforms={platforms}
                defaultValue={activePlatform}
                onPlatformChange={setActivePlatform}
                showCopyButton={true}
              >
                {(platform) => (
                  <Textarea
                    value={getCurrentContent(platform)}
                    onChange={(e) => updatePlatformContent(platform, e.target.value)}
                    placeholder={`Nhập nội dung cho ${platform}...`}
                    className="min-h-[200px] mt-4"
                  />
                )}
              </DerivativeTabs>
            </CardContent>
          </Card>
        )}

        {/* Compare Previews */}
        {platforms.some(p => p.content) && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                So sánh Preview
              </CardTitle>
              <CardDescription>
                Xem trước nội dung trên tất cả các nền tảng
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsivePreview showToggle={true}>
                <ComparePreviews
                  content={getCurrentContent(activePlatform) || content}
                  authorName="ContentHub"
                  authorUsername="contenthub"
                  authorHeadline="Content Creator"
                  platforms={['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok']}
                  isLoading={isGenerating}
                  onGenerateClick={handleGenerate}
                />
              </ResponsivePreview>
            </CardContent>
          </Card>
        )}

        {/* Export Options */}
        {currentDerivatives.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Options
              </CardTitle>
              <CardDescription>
                Export derivatives ra CSV hoặc Calendar
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-end">
                <ExportOptions
                  derivatives={currentDerivatives}
                  packId="multi-platform-publisher"
                  packTitle="Multi-platform Content"
                  onExportCSV={handleExportCSV}
                  onExportICS={handleExportICS}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analytics Dashboard */}
        {analyticsStats && (
          <Card>
            <CardHeader>
              <CardTitle>Analytics Dashboard</CardTitle>
              <CardDescription>
                Thống kê và phân tích hiệu suất content (Dữ liệu thực từ database)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <AnalyticsDashboard
                stats={analyticsStats}
                onRefresh={async () => {
                  await fetchAnalytics()
                  toast({
                    title: 'Đã cập nhật',
                    description: 'Dữ liệu analytics đã được làm mới từ database.'
                  })
                }}
                isLoading={isLoadingAnalytics}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

