'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Loader2, Package, Calendar, FileText, Share2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'import { API_URL } from '@/lib/api-config';


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

interface ContentPackSelectorProps {
  onSelectPack: (packId: string) => void
  selectedPackId?: string
}

export function ContentPackSelector({ onSelectPack, selectedPackId }: ContentPackSelectorProps) {
  const [contentPacks, setContentPacks] = useState<ContentPack[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

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

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải content packs...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
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
    )
  }

  if (contentPacks.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Không có Content Pack nào</CardTitle>
          <CardDescription>
            Chưa có content pack nào đã được duyệt để tạo derivatives
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Bạn cần có ít nhất một content pack đã được duyệt để tạo derivatives cho các platform khác nhau.
            </p>
            <Button
              onClick={() => window.open('/test-packs-draft', '_blank')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Package className="h-4 w-4" />
              Xem Content Packs
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          Chọn Content Pack
        </CardTitle>
        <CardDescription>
          Chọn một content pack đã được duyệt để tạo derivatives cho các platform
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {contentPacks.map((pack) => (
            <Card
              key={pack.pack_id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                selectedPackId === pack.pack_id
                  ? 'ring-2 ring-primary border-primary'
                  : 'hover:border-muted-foreground/30'
              }`}
              onClick={() => onSelectPack(pack.pack_id)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-base line-clamp-2">
                      {pack.brief_title || `Content Pack ${pack.pack_id.substring(0, 8)}`}
                    </CardTitle>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={pack.status === 'approved' ? 'default' : 'secondary'}
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
                  {selectedPackId === pack.pack_id && (
                    <div className="flex-shrink-0">
                      <div className="h-2 w-2 bg-primary rounded-full"></div>
                    </div>
                  )}
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-3">
                  {/* Content Preview */}
                  <div className="text-sm text-muted-foreground">
                    <p className="line-clamp-3">
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
                    <div className="flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      Ready for derivatives
                    </div>
                  </div>

                  {/* Action Button */}
                  <Button
                    size="sm"
                    variant={selectedPackId === pack.pack_id ? "default" : "outline"}
                    className="w-full"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectPack(pack.pack_id)
                    }}
                  >
                    {selectedPackId === pack.pack_id ? 'Đã chọn' : 'Chọn pack này'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Refresh Button */}
        <div className="flex justify-center mt-6">
          <Button
            onClick={fetchContentPacks}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Package className="h-4 w-4" />
            Làm mới danh sách
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}