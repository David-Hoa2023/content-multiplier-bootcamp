'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Package, 
  ArrowRight, 
  CheckCircle, 
  Clock, 
  Calendar, 
  BarChart3, 
  ExternalLink,
  RefreshCw,
  Loader2
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

const API_URL = 'http://localhost:4000'

interface Derivative {
  id: number
  pack_id: string
  platform: string
  content: string
  character_count: number
  hashtags: string[]
  mentions: string[]
  status: 'draft' | 'scheduled' | 'published' | 'failed'
  scheduled_at?: string
  published_at?: string
  publication_url?: string
  platform_response?: string
  analytics?: {
    reach?: number
    impressions?: number
    clicks?: number
    engagement_rate?: number
  }
  created_at: string
}

interface PlatformConfig {
  id: number
  platform_type: string
  platform_name: string
  is_active: boolean
  is_connected: boolean
}

export default function PublishPage() {
  const router = useRouter()
  const { toast } = useToast()
  
  const [derivatives, setDerivatives] = useState<Derivative[]>([])
  const [platformConfigs, setPlatformConfigs] = useState<PlatformConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState('published')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch all derivatives
      const derivativesResponse = await fetch(`${API_URL}/derivatives`)
      const derivativesResult = await derivativesResponse.json()
      
      if (derivativesResult.success) {
        setDerivatives(derivativesResult.data)
      }

      // Fetch platform configurations
      const platformsResponse = await fetch(`${API_URL}/platforms/configurations`)
      const platformsResult = await platformsResponse.json()
      
      if (platformsResult.success) {
        setPlatformConfigs(platformsResult.data)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải dữ liệu xuất bản',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchData()
    setRefreshing(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published': return 'bg-green-100 text-green-800 border-green-200'
      case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'failed': return 'bg-red-100 text-red-800 border-red-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'published': return <CheckCircle className="h-3 w-3" />
      case 'scheduled': return <Calendar className="h-3 w-3" />
      case 'failed': return <Clock className="h-3 w-3" />
      default: return <Clock className="h-3 w-3" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getFilteredDerivatives = (status: string) => {
    switch (status) {
      case 'published':
        return derivatives.filter(d => d.status === 'published')
      case 'scheduled':
        return derivatives.filter(d => d.status === 'scheduled')
      case 'failed':
        return derivatives.filter(d => d.status === 'failed')
      case 'all':
      default:
        return derivatives
    }
  }

  const getStatsForStatus = (status: string) => {
    const filtered = getFilteredDerivatives(status)
    return {
      count: filtered.length,
      platforms: [...new Set(filtered.map(d => d.platform))].length,
      totalReach: filtered.reduce((sum, d) => sum + (d.analytics?.reach || 0), 0),
      avgEngagement: filtered.length > 0 
        ? filtered.reduce((sum, d) => sum + (d.analytics?.engagement_rate || 0), 0) / filtered.length
        : 0
    }
  }

  if (loading) {
    return (
      <AppLayout
        pageTitle="Xuất bản nội dung"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Xuất bản' },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  const publishedStats = getStatsForStatus('published')
  const scheduledStats = getStatsForStatus('scheduled')

  return (
    <AppLayout
      pageTitle="Xuất bản nội dung"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Xuất bản' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Xuất bản nội dung</h1>
            <p className="text-muted-foreground">
              Theo dõi và quản lý nội dung đã xuất bản lên các platform
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
            <Button
              onClick={() => router.push('/derivatives')}
              className="flex items-center gap-2"
            >
              <ArrowRight className="h-4 w-4" />
              Tạo nội dung mới
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đã xuất bản</p>
                  <p className="text-2xl font-bold text-green-600">{publishedStats.count}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Đã lên lịch</p>
                  <p className="text-2xl font-bold text-blue-600">{scheduledStats.count}</p>
                </div>
                <Calendar className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Tổng reach</p>
                  <p className="text-2xl font-bold">{publishedStats.totalReach.toLocaleString()}</p>
                </div>
                <BarChart3 className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Platforms</p>
                  <p className="text-2xl font-bold">{publishedStats.platforms}</p>
                </div>
                <Send className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="published">Đã xuất bản ({publishedStats.count})</TabsTrigger>
            <TabsTrigger value="scheduled">Đã lên lịch ({scheduledStats.count})</TabsTrigger>
            <TabsTrigger value="failed">Thất bại ({getStatsForStatus('failed').count})</TabsTrigger>
            <TabsTrigger value="all">Tất cả ({derivatives.length})</TabsTrigger>
          </TabsList>

          {['published', 'scheduled', 'failed', 'all'].map(status => (
            <TabsContent key={status} value={status} className="space-y-4">
              {getFilteredDerivatives(status).length === 0 ? (
                <Card>
                  <CardContent className="p-8 text-center">
                    <Send className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">
                      {status === 'published' && 'Chưa có nội dung nào được xuất bản'}
                      {status === 'scheduled' && 'Chưa có nội dung nào được lên lịch'}
                      {status === 'failed' && 'Không có nội dung nào bị lỗi'}
                      {status === 'all' && 'Chưa có nội dung nào'}
                    </h3>
                    <p className="text-muted-foreground mb-4">
                      Tạo derivatives và xuất bản để xem nội dung ở đây
                    </p>
                    <Button
                      onClick={() => router.push('/derivatives')}
                      className="flex items-center gap-2"
                    >
                      <Package className="h-4 w-4" />
                      Tạo nội dung
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid gap-4">
                  {getFilteredDerivatives(status).map((derivative) => (
                    <Card key={derivative.id}>
                      <CardContent className="p-6">
                        <div className="flex justify-between items-start mb-4">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono text-xs">
                              {derivative.platform}
                            </Badge>
                            <Badge className={getStatusColor(derivative.status)}>
                              <span className="flex items-center gap-1">
                                {getStatusIcon(derivative.status)}
                                {derivative.status === 'published' && 'Đã xuất bản'}
                                {derivative.status === 'scheduled' && 'Đã lên lịch'}
                                {derivative.status === 'failed' && 'Thất bại'}
                                {derivative.status === 'draft' && 'Nháp'}
                              </span>
                            </Badge>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-muted-foreground">
                              {derivative.character_count} ký tự
                            </span>
                            {derivative.publication_url && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(derivative.publication_url, '_blank')}
                                className="flex items-center gap-1"
                              >
                                <ExternalLink className="h-3 w-3" />
                                Xem
                              </Button>
                            )}
                          </div>
                        </div>

                        {/* Content Preview */}
                        <div className="mb-4">
                          <p className="text-sm text-gray-700 line-clamp-3">
                            {derivative.content}
                          </p>
                        </div>

                        {/* Metadata */}
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            <span>Pack: {derivative.pack_id.slice(0, 8)}</span>
                            {derivative.hashtags?.length > 0 && (
                              <span>{derivative.hashtags.length} hashtags</span>
                            )}
                            {derivative.mentions?.length > 0 && (
                              <span>{derivative.mentions.length} mentions</span>
                            )}
                          </div>
                          <div className="flex items-center gap-4">
                            {derivative.published_at && (
                              <span>Xuất bản: {formatDate(derivative.published_at)}</span>
                            )}
                            {derivative.scheduled_at && (
                              <span>Lịch: {formatDate(derivative.scheduled_at)}</span>
                            )}
                            {derivative.analytics && (
                              <span>Reach: {derivative.analytics.reach?.toLocaleString() || 0}</span>
                            )}
                          </div>
                        </div>

                        {/* Error message for failed status */}
                        {derivative.status === 'failed' && derivative.platform_response && (
                          <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                            <strong>Lỗi:</strong> {derivative.platform_response}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* Navigation */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Quay lại các bước trước để tạo nội dung mới
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => router.push('/derivatives')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Derivatives
                </Button>
                <Button
                  onClick={() => router.push('/multi-platform-publisher')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Send className="h-4 w-4" />
                  Publisher
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}





