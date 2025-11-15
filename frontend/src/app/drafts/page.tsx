'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Pen, 
  Plus, 
  Search, 
  Filter, 
  FileText, 
  Calendar, 
  Package,
  ArrowRight,
  Loader2,
  Share2
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import { useToast } from '@/hooks/use-toast'import { API_URL } from '@/lib/api-config';


// API_URL imported from @/lib/api-config

interface ContentPack {
  pack_id: string
  brief_id: string
  draft_content: string
  word_count: number
  status: string
  brief_title: string | null
  created_at: string
  updated_at: string
}

export default function DraftsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [contentPacks, setContentPacks] = useState<ContentPack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const fetchContentPacks = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const response = await fetch(`${API_URL}/api/packs/review`)
      const result = await response.json()
      
      if (result.success) {
        setContentPacks(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch content packs')
      }
    } catch (error) {
      console.error('Error fetching content packs:', error)
      setError('Không thể tải danh sách content packs. Vui lòng thử lại.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchContentPacks()
  }, [])

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const filteredPacks = contentPacks.filter(pack => 
    pack.brief_title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    pack.draft_content.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusCounts = () => {
    return {
      total: contentPacks.length,
      draft: contentPacks.filter(p => p.status === 'draft').length,
      approved: contentPacks.filter(p => p.status === 'approved').length,
      published: contentPacks.filter(p => p.status === 'published').length
    }
  }

  const handleOpenInDerivatives = (packId: string) => {
    router.push(`/derivatives?pack_id=${packId}`)
  }

  const statusCounts = getStatusCounts()

  return (
    <AppLayout 
      pageTitle="Drafts"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Drafts' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Content Packs</h1>
            <p className="text-muted-foreground">
              Quản lý các content pack từ bước previous step (briefs).
            </p>
          </div>
          <Button 
            className="flex items-center gap-2"
            onClick={() => router.push('/briefs')}
          >
            <Plus className="h-4 w-4" />
            Tạo content pack mới
          </Button>
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm content pack..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
          </div>
          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Lọc
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tổng Content Packs</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.total}</div>
              <p className="text-xs text-muted-foreground">
                Tất cả content packs
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đang soạn thảo</CardTitle>
              <Pen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.draft}</div>
              <p className="text-xs text-muted-foreground">
                Cần hoàn thành
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã duyệt</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.approved}</div>
              <p className="text-xs text-muted-foreground">
                Sẵn sàng tạo derivatives
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Đã xuất bản</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{statusCounts.published}</div>
              <p className="text-xs text-muted-foreground">
                Đã phân phối
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Content Packs List */}
        {loading ? (
          <Card>
            <CardContent className="p-12">
              <div className="flex items-center justify-center">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  <span>Đang tải content packs...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-red-600">Lỗi</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">{error}</p>
                <Button onClick={fetchContentPacks} variant="outline">
                  Thử lại
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : filteredPacks.length === 0 ? (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <Package className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">
                  {searchQuery ? 'Không tìm thấy content pack nào' : 'Chưa có content pack nào'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Thử tìm kiếm với từ khóa khác'
                    : 'Bắt đầu tạo content pack từ brief của bạn'
                  }
                </p>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => router.push('/briefs')}
                >
                  <Plus className="h-4 w-4" />
                  Tạo content pack đầu tiên
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPacks.map((pack) => (
              <Card key={pack.pack_id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-base line-clamp-2">
                        {pack.brief_title || `Content Pack ${pack.pack_id.substring(0, 8)}`}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={
                            pack.status === 'approved' ? 'default' : 
                            pack.status === 'published' ? 'secondary' : 'outline'
                          }
                          className="text-xs"
                        >
                          {pack.status}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          {pack.word_count} từ
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Content Preview */}
                    <div className="text-sm text-muted-foreground">
                      <p className="line-clamp-4">
                        {truncateContent(pack.draft_content)}
                      </p>
                    </div>

                    {/* Metadata */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {formatDistanceToNow(new Date(pack.updated_at), {
                          addSuffix: true,
                          locale: vi
                        })}
                      </div>
                      <div className="font-mono text-xs">
                        {pack.pack_id.substring(0, 8)}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      {pack.status === 'approved' && (
                        <Button
                          size="sm"
                          className="flex-1 flex items-center gap-1"
                          onClick={() => handleOpenInDerivatives(pack.pack_id)}
                        >
                          <Share2 className="h-3 w-3" />
                          Tạo derivatives
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1 flex items-center gap-1"
                        onClick={() => router.push(`/packs/${pack.pack_id}/edit`)}
                      >
                        <Pen className="h-3 w-3" />
                        Chỉnh sửa
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Refresh Button */}
        {!loading && (
          <div className="flex justify-center">
            <Button
              onClick={fetchContentPacks}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Làm mới danh sách
            </Button>
          </div>
        )}
      </div>
    </AppLayout>
  )
}