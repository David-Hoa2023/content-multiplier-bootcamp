'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Share2, Package, ArrowRight, Loader2, FileText } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Badge } from '@/components/ui/badge'
import { DraftEditor } from '@/components/ui/draft-editor'

const API_URL = 'http://localhost:4000'

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

export default function DerivativesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [selectedPackId, setSelectedPackId] = useState<string>('')
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null)
  const [loading, setLoading] = useState(false)

  const fetchPack = async (packId: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/packs/${packId}`)
      const result = await response.json()

      if (result.success) {
        setSelectedPack(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch pack')
      }
    } catch (error) {
      console.error('Error fetching pack:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải content pack',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Check if pack_id is in URL params
    const packIdFromUrl = searchParams.get('pack_id')
    if (packIdFromUrl) {
      setSelectedPackId(packIdFromUrl)
      fetchPack(packIdFromUrl)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <AppLayout
      pageTitle="Derivatives"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Derivatives' },
      ]}
    >
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Derivatives</h1>
          <p className="text-muted-foreground">
            Tạo và quản lý các biến thể nội dung từ content packs đã được duyệt
          </p>
        </div>

        {loading ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : selectedPack ? (
          <>
            {/* Pack Info */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Content Pack đã duyệt
                </CardTitle>
                <CardDescription>
                  Nội dung đã được duyệt và sẵn sàng để tạo derivatives
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pack ID:</span>
                    <p className="font-mono text-xs">{selectedPack.pack_id}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Số từ:</span>
                    <p className="font-semibold">{selectedPack.word_count}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Trạng thái:</span>
                    <Badge>{selectedPack.status}</Badge>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Cập nhật:</span>
                    <p className="text-sm">
                      {new Date(selectedPack.updated_at).toLocaleString('vi-VN')}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Approved Content */}
            <Card>
              <CardHeader>
                <CardTitle>Nội dung đã duyệt</CardTitle>
                <CardDescription>
                  Nội dung đã được duyệt từ bước review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DraftEditor
                  content={selectedPack.draft_content || 'Không có nội dung'}
                  isStreaming={false}
                  title=""
                />
              </CardContent>
            </Card>

            {/* Derivatives Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Share2 className="h-5 w-5" />
                  Biến thể nội dung
                </CardTitle>
                <CardDescription>
                  Tạo các phiên bản khác nhau của nội dung cho các nền tảng khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Tính năng tạo derivatives đang được phát triển. Vui lòng quay lại sau.
                  </p>
                  <Button
                    onClick={() => router.push('/test-packs-draft')}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    Xem Content Packs
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Biến thể nội dung</CardTitle>
              <CardDescription>
                Tạo các phiên bản khác nhau của nội dung cho các nền tảng khác nhau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tính năng tạo derivatives đang được phát triển. Vui lòng quay lại sau.
                </p>
                <Button
                  onClick={() => router.push('/test-packs-draft')}
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  <Package className="h-4 w-4" />
                  Xem Content Packs
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

