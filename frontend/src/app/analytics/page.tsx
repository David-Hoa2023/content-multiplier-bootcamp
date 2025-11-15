'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Package,
  Share2,
  Eye,
  Send,
  Clock,
  FileText,
  Hash,
  AtSign,
  Loader2,
  Mail,
  CheckSquare,
  ArrowLeft
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { API_URL } from '@/lib/api-config';

// API_URL imported from @/lib/api-config

interface AnalyticsSummary {
  total_published: number
  total_scheduled: number
  total_draft: number
  platforms_used: number
  content_packs_used: number
}

interface PlatformBreakdown {
  platform: string
  published_count: number
  scheduled_count: number
  draft_count: number
}

interface PublishedContent {
  id: number
  pack_id: string
  platform: string
  content: string
  character_count: number
  hashtags: string[]
  mentions: string[]
  status: string
  published_at: string
  brief_title: string | null
  target_audience: string | null
  analytics?: {
    platform_id?: string
    url?: string
    message?: string
    metadata?: {
      campaign_id?: string
      web_id?: string
      subject?: string
      send_time?: string
      [key: string]: any
    }
    published_at?: string
  }
}

export default function AnalyticsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState<AnalyticsSummary | null>(null)
  const [platformBreakdown, setPlatformBreakdown] = useState<PlatformBreakdown[]>([])
  const [publishedContent, setPublishedContent] = useState<PublishedContent[]>([])

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)

      // Fetch summary
      const summaryResponse = await fetch(`${API_URL}/derivatives/analytics/summary`)
      const summaryResult = await summaryResponse.json()

      if (summaryResult.success) {
        setSummary(summaryResult.data.summary)
        setPlatformBreakdown(summaryResult.data.platformBreakdown)
      }

      // Fetch published content
      const publishedResponse = await fetch(`${API_URL}/derivatives/published`)
      const publishedResult = await publishedResponse.json()

      if (publishedResult.success) {
        setPublishedContent(publishedResult.data)
      }
    } catch (error) {
      console.error('Error fetching analytics:', error)
    } finally {
      setLoading(false)
    }
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform.toLowerCase()) {
      case 'twitter': return '𝕏'
      case 'facebook': return 'f'
      case 'linkedin': return 'in'
      case 'instagram': return 'IG'
      case 'tiktok': return 'TT'
      case 'mailchimp': return '✉'
      default: return platform[0]
    }
  }

  if (loading) {
    return (
      <AppLayout
        pageTitle="Analytics"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Analytics' },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      pageTitle="Analytics"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Analytics' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => router.back()}
              className="h-8 w-8"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold">Content Analytics</h1>
              <p className="text-muted-foreground">
                Xem tổng quan và theo dõi hiệu suất nội dung đã xuất bản
              </p>
            </div>
          </div>
        </div>

        {/* Summary Cards */}
        {summary && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
                <Send className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_published}</div>
                <p className="text-xs text-muted-foreground">
                  Nội dung đã đăng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Đã lên lịch</CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_scheduled}</div>
                <p className="text-xs text-muted-foreground">
                  Chờ xuất bản
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Bản thảo</CardTitle>
                <FileText className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.total_draft}</div>
                <p className="text-xs text-muted-foreground">
                  Chưa hoàn thành
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                <Share2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.platforms_used}</div>
                <p className="text-xs text-muted-foreground">
                  Đã sử dụng
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Content Packs</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summary.content_packs_used}</div>
                <p className="text-xs text-muted-foreground">
                  Đã phân phối
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Platform Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Phân tích theo Platform
            </CardTitle>
            <CardDescription>
              Số lượng nội dung theo từng platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {platformBreakdown.map((platform) => (
                <div key={platform.platform} className="flex items-center">
                  <div className="w-32 font-medium text-sm flex items-center gap-2">
                    <span className="w-6 h-6 flex items-center justify-center bg-primary/10 rounded text-xs font-bold">
                      {getPlatformIcon(platform.platform)}
                    </span>
                    {platform.platform}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2 overflow-hidden">
                      <div
                        className="h-full bg-green-500"
                        style={{
                          width: `${platform.published_count ? (platform.published_count / (platform.published_count + platform.scheduled_count + platform.draft_count)) * 100 : 0}%`
                        }}
                      />
                    </div>
                    <div className="flex gap-2 text-xs">
                      <Badge variant="outline" className="text-green-600">
                        {platform.published_count} đã xuất
                      </Badge>
                      <Badge variant="outline" className="text-blue-600">
                        {platform.scheduled_count} lên lịch
                      </Badge>
                      <Badge variant="outline">
                        {platform.draft_count} thảo
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recently Published Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Nội dung đã xuất bản gần đây
            </CardTitle>
            <CardDescription>
              {publishedContent.length} nội dung đã được xuất bản
            </CardDescription>
          </CardHeader>
          <CardContent>
            {publishedContent.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Send className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>Chưa có nội dung nào được xuất bản</p>
              </div>
            ) : (
              <div className="space-y-4">
                {publishedContent.slice(0, 10).map((content) => (
                  <div key={content.id} className="border rounded-lg p-4 space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <Badge className="flex items-center gap-1">
                          <span className="w-5 h-5 flex items-center justify-center bg-white/20 rounded text-xs">
                            {getPlatformIcon(content.platform)}
                          </span>
                          {content.platform}
                        </Badge>
                        {content.brief_title && (
                          <span className="text-sm text-muted-foreground">
                            {content.brief_title}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(content.published_at), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </div>
                    </div>

                    <p className="text-sm line-clamp-2">
                      {content.content}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <FileText className="h-3 w-3" />
                        {content.character_count} ký tự
                      </div>
                      {content.hashtags && content.hashtags.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Hash className="h-3 w-3" />
                          {content.hashtags.length} hashtags
                        </div>
                      )}
                      {content.mentions && content.mentions.length > 0 && (
                        <div className="flex items-center gap-1">
                          <AtSign className="h-3 w-3" />
                          {content.mentions.length} mentions
                        </div>
                      )}
                    </div>

                    {/* MailChimp Analytics Section */}
                    {content.platform.toLowerCase() === 'mailchimp' && content.analytics && (
                      <div className="mt-3 pt-3 border-t border-border">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Email Campaign Details</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          {content.analytics.metadata?.campaign_id && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Campaign ID:</span>
                              <code className="px-2 py-0.5 bg-muted rounded font-mono">
                                {content.analytics.metadata.campaign_id}
                              </code>
                            </div>
                          )}
                          {content.analytics.metadata?.subject && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Subject:</span>
                              <span className="font-medium">{content.analytics.metadata.subject}</span>
                            </div>
                          )}
                          {content.analytics.url && (
                            <div className="flex items-center gap-2">
                              <span className="text-muted-foreground">Archive:</span>
                              <a
                                href={content.analytics.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary hover:underline flex items-center gap-1"
                              >
                                View sent email
                                <Eye className="h-3 w-3" />
                              </a>
                            </div>
                          )}
                          {content.analytics.message && (
                            <div className="flex items-center gap-2 text-green-600">
                              <CheckSquare className="h-3 w-3" />
                              <span>{content.analytics.message}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}
