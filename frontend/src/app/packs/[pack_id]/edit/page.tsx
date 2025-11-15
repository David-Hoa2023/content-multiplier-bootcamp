'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Save, ChevronLeft, FileText, Lightbulb, Package, Edit, CheckCircle, Share2, Send, ArrowRight, CheckSquare } from 'lucide-react'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import MarkdownEditor from '@/app/components/MarkdownEditor'import { API_URL } from '@/lib/api-config';


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

export default function EditContentPackPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const packId = params?.pack_id as string

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [approving, setApproving] = useState(false)
  const [pack, setPack] = useState<ContentPack | null>(null)
  const [content, setContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)
  const [readyForReview, setReadyForReview] = useState(false)

  useEffect(() => {
    if (packId) {
      fetchPack(packId)
    }
  }, [packId])

  const fetchPack = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/api/packs/${id}`)
      const result = await response.json()

      if (result.success) {
        setPack(result.data)
        setContent(result.data.draft_content || '')
        setHasChanges(false)
      } else {
        toast({
          title: 'Lỗi',
          description: result.error || 'Không thể tải content pack',
          variant: 'destructive',
        })
        router.push('/test-packs-draft')
      }
    } catch (error) {
      console.error('Error fetching pack:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải content pack',
        variant: 'destructive',
      })
      router.push('/test-packs-draft')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    console.log('🔵 handleSave called')
    console.log('🔵 packId:', packId)
    console.log('🔵 content length:', content.length)
    console.log('🔵 hasChanges:', hasChanges)

    if (!packId || !content.trim()) {
      console.log('❌ Validation failed')
      toast({
        title: 'Lỗi',
        description: 'Nội dung không được để trống',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      console.log('📡 Sending PUT request to:', `${API_URL}/api/packs/${packId}`)
      const response = await fetch(`${API_URL}/api/packs/${packId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_content: content,
        }),
      })
      console.log('📡 Response status:', response.status)

      const result = await response.json()

      if (result.success) {
        setPack(result.data)
        setHasChanges(false)
        toast({
          title: 'Thành công',
          description: 'Đã lưu nội dung thành công',
        })
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
    console.log('✏️ Content changed, length:', value.length)
    setContent(value)
    const hasChanged = value !== (pack?.draft_content || '')
    console.log('✏️ Has changes:', hasChanged)
    setHasChanges(hasChanged)
  }

  const handleApproveAndContinue = async () => {
    if (!content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Nội dung không được để trống',
        variant: 'destructive',
      })
      return
    }

    // First, save any pending changes
    if (hasChanges) {
      await handleSave()
    }

    // Then approve and navigate
    try {
      setApproving(true)
      const response = await fetch(`${API_URL}/api/packs/${packId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          draft_content: content,
          status: 'approved',
        }),
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Đã duyệt',
          description: 'Content pack đã được duyệt. Chuyển đến tạo derivatives...',
        })
        // Navigate to derivatives page
        router.push(`/derivatives?pack_id=${packId}`)
      } else {
        throw new Error(result.error || 'Failed to approve')
      }
    } catch (error) {
      console.error('Error approving pack:', error)
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể duyệt content pack',
        variant: 'destructive',
      })
    } finally {
      setApproving(false)
    }
  }

  if (loading) {
    return (
      <AppLayout
        pageTitle="Chỉnh sửa nội dung"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Drafts', href: '/drafts' },
          { label: 'Chỉnh sửa nội dung' },
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      </AppLayout>
    )
  }

  if (!pack) {
    return (
      <AppLayout
        pageTitle="Chỉnh sửa nội dung"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Drafts', href: '/drafts' },
          { label: 'Chỉnh sửa nội dung' },
        ]}
      >
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">Không tìm thấy content pack</p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout
      pageTitle="Chỉnh sửa nội dung"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Drafts', href: '/drafts' },
        { label: 'Chỉnh sửa nội dung' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Chỉnh sửa nội dung</h1>
            <p className="text-muted-foreground">
              {pack.brief_title ? `Brief: ${pack.brief_title}` : `Pack ID: ${pack.pack_id.slice(0, 8)}...`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              onClick={() => router.push('/drafts')}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ChevronLeft className="h-4 w-4" />
              Quay lại
            </Button>
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
        </div>

        {/* Workflow Navigation */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quy trình tạo nội dung</CardTitle>
            <CardDescription>
              Bước hiện tại: Chỉnh sửa nội dung
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Workflow Steps */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
                <div className="flex items-center gap-1 opacity-50">
                  <Lightbulb className="h-3 w-3" />
                  <span>Ideas</span>
                </div>
                <ArrowRight className="h-3 w-3 opacity-50" />
                <div className="flex items-center gap-1 opacity-50">
                  <FileText className="h-3 w-3" />
                  <span>Briefs</span>
                </div>
                <ArrowRight className="h-3 w-3 opacity-50" />
                <div className="flex items-center gap-1 opacity-50">
                  <Package className="h-3 w-3" />
                  <span>Content Packs</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1 font-semibold text-foreground bg-primary/10 px-2 py-1 rounded">
                  <Edit className="h-3 w-3" />
                  <span>Chỉnh sửa</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  <span>Duyệt</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Share2 className="h-3 w-3" />
                  <span>Derivatives</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Send className="h-3 w-3" />
                  <span>Xuất bản</span>
                </div>
              </div>
            </div>

            {/* Review Confirmation */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 p-4 bg-muted/50 rounded-lg border border-border">
                <Checkbox
                  id="ready-review"
                  checked={readyForReview}
                  onCheckedChange={(checked) => setReadyForReview(checked === true)}
                />
                <Label
                  htmlFor="ready-review"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                >
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4" />
                    <span>Tôi xác nhận đã hoàn thành chỉnh sửa và nội dung sẵn sàng để duyệt</span>
                  </div>
                </Label>
              </div>

              {/* Next Step Action */}
              <div className="flex flex-wrap gap-3 items-center">
                <Button
                  onClick={handleApproveAndContinue}
                  disabled={approving || !readyForReview}
                  className="flex items-center gap-2"
                >
                  {approving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang duyệt...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4" />
                      Duyệt & Tiếp tục
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </Button>
                {!readyForReview && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    ✓ Đánh dấu checkbox để kích hoạt nút duyệt
                  </p>
                )}
                {hasChanges && readyForReview && (
                  <p className="text-sm text-muted-foreground flex items-center">
                    Lưu ý: Các thay đổi sẽ được lưu tự động trước khi duyệt
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Pack Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Thông tin pack
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Pack ID:</span>
                <p className="font-mono text-xs">{pack.pack_id}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Số từ:</span>
                <p className="font-semibold">{pack.word_count}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Trạng thái:</span>
                <p className="font-medium">{pack.status}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Cập nhật:</span>
                <p className="text-sm">
                  {new Date(pack.updated_at).toLocaleString('vi-VN')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Editor */}
        <Card>
          <CardHeader>
            <CardTitle>Nội dung draft</CardTitle>
            <CardDescription>
              Chỉnh sửa nội dung draft. Sử dụng Markdown để định dạng.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <MarkdownEditor
                value={content}
                onChange={handleContentChange}
                placeholder="Nhập nội dung draft..."
                height={600}
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
      </div>
    </AppLayout>
  )
}

