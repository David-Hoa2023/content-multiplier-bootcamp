'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Save, Edit, Package, FileText, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import MarkdownEditor from '@/app/components/MarkdownEditor'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'

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

export default function EditPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [packs, setPacks] = useState<ContentPack[]>([])
  const [selectedPackId, setSelectedPackId] = useState<string>('')
  const [selectedPack, setSelectedPack] = useState<ContentPack | null>(null)
  const [loading, setLoading] = useState(true)
  const [loadingPack, setLoadingPack] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [content, setContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

  useEffect(() => {
    fetchPacks()
  }, [])

  useEffect(() => {
    if (selectedPackId) {
      fetchPack(selectedPackId)
    } else {
      setSelectedPack(null)
      setContent('')
      setHasChanges(false)
    }
  }, [selectedPackId])

  const fetchPacks = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/packs`)
      const result = await response.json()

      if (result.success) {
        setPacks(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch packs')
      }
    } catch (error) {
      console.error('Error fetching packs:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách content packs',
        variant: 'destructive',
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchPack = async (packId: string) => {
    try {
      setLoadingPack(true)
      const response = await fetch(`${API_URL}/api/packs/${packId}`)
      const result = await response.json()

      if (result.success) {
        setSelectedPack(result.data)
        setContent(result.data.draft_content || '')
        setHasChanges(false)
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
      setLoadingPack(false)
    }
  }

  const handleSave = async () => {
    if (!selectedPackId || !content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Nội dung không được để trống',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`${API_URL}/api/packs/${selectedPackId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_content: content,
        }),
      })

      const result = await response.json()

      if (result.success) {
        setSelectedPack(result.data)
        setHasChanges(false)
        toast({
          title: 'Thành công',
          description: 'Đã lưu nội dung thành công',
        })
        // Refresh packs list
        fetchPacks()
      } else {
        throw new Error(result.error || 'Failed to save')
      }
    } catch (error) {
      console.error('Error saving pack:', error)
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể lưu nội dung',
        variant: 'destructive',
      })
    } finally {
      setSaving(false)
    }
  }

  const handleContentChange = (value: string) => {
    setContent(value)
    setHasChanges(value !== (selectedPack?.draft_content || ''))
  }

  const handleSendToReview = async () => {
    if (!selectedPackId) {
      toast({
        title: 'Lỗi',
        description: 'Vui lòng chọn content pack',
        variant: 'destructive',
      })
      return
    }

    // First save if there are changes
    if (hasChanges) {
      try {
        setSaving(true)
        const saveResponse = await fetch(`${API_URL}/api/packs/${selectedPackId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            draft_content: content,
          }),
        })

        const saveResult = await saveResponse.json()
        if (!saveResult.success) {
          throw new Error(saveResult.error || 'Failed to save')
        }
        setHasChanges(false)
      } catch (error) {
        console.error('Error saving before send:', error)
        toast({
          title: 'Lỗi',
          description: 'Không thể lưu trước khi gửi',
          variant: 'destructive',
        })
        setSaving(false)
        return
      } finally {
        setSaving(false)
      }
    }

    // Then update status to 'review' and navigate
    try {
      setSending(true)
      const response = await fetch(`${API_URL}/api/packs/${selectedPackId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: 'review',
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Đã gửi draft đến bước duyệt',
        })
        // Navigate to review page with the pack_id
        router.push(`/review?pack_id=${selectedPackId}`)
      } else {
        throw new Error(result.error || 'Failed to send to review')
      }
    } catch (error) {
      console.error('Error sending to review:', error)
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể gửi đến bước duyệt',
        variant: 'destructive',
      })
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <AppLayout
        pageTitle="Chỉnh sửa nội dung"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Chỉnh sửa' },
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
      pageTitle="Chỉnh sửa nội dung"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Chỉnh sửa' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold">Chỉnh sửa nội dung</h1>
          <p className="text-muted-foreground">
            Chọn và chỉnh sửa content pack
          </p>
        </div>

        {/* Pack Selector */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Chọn Content Pack
            </CardTitle>
            <CardDescription>
              Chọn một content pack để chỉnh sửa nội dung
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="pack-select">Content Pack</Label>
              <Select value={selectedPackId} onValueChange={setSelectedPackId}>
                <SelectTrigger id="pack-select">
                  <SelectValue placeholder="Chọn content pack để chỉnh sửa" />
                </SelectTrigger>
                <SelectContent>
                  {packs.length === 0 ? (
                    <SelectItem value="no-packs" disabled>
                      Không có content pack nào
                    </SelectItem>
                  ) : (
                    packs.map((pack) => (
                      <SelectItem key={pack.pack_id} value={pack.pack_id}>
                        {pack.brief_title || `Pack ${pack.pack_id.slice(0, 8)}`} 
                        {' '}
                        <span className="text-muted-foreground">
                          ({pack.word_count} từ)
                        </span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {packs.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Chưa có content pack nào. Hãy tạo content pack từ trang{' '}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => router.push('/test-packs-draft')}
                  >
                    Test Packs Draft
                  </Button>
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pack Info */}
        {selectedPack && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Thông tin pack
              </CardTitle>
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
                  <p className="font-medium">{selectedPack.status}</p>
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
        )}

        {/* Editor */}
        {loadingPack ? (
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            </CardContent>
          </Card>
        ) : selectedPack ? (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Nội dung draft</CardTitle>
                  <CardDescription>
                    Chỉnh sửa nội dung draft. Sử dụng Markdown để định dạng.
                  </CardDescription>
                </div>
                <Button
                  onClick={handleSave}
                  disabled={saving || !hasChanges}
                  className="flex items-center gap-2"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Lưu
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <MarkdownEditor
                  value={content}
                  onChange={handleContentChange}
                  placeholder="Nhập nội dung draft..."
                  height={600}
                  additionalButtons={
                    <Button
                      onClick={handleSendToReview}
                      disabled={sending || saving || !selectedPackId}
                      variant="default"
                      size="sm"
                      className="flex items-center gap-2"
                    >
                      {sending ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang gửi...
                        </>
                      ) : (
                        <>
                          <Send className="h-4 w-4" />
                          Send
                        </>
                      )}
                    </Button>
                  }
                />
                {hasChanges && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>•</span>
                    <span>Bạn có thay đổi chưa lưu</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <div className="text-center text-muted-foreground">
                <Edit className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Chọn một content pack để bắt đầu chỉnh sửa</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}

