'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Loader2, Save, ChevronLeft, FileText } from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import MarkdownEditor from '@/app/components/MarkdownEditor'

const API_URL = 'http://localhost:4000'

// Required for static export with dynamic routes
export async function generateStaticParams() {
  try {
    // Fetch all pack IDs from the API
    const response = await fetch(`${API_URL}/api/packs`)
    const result = await response.json()
    
    if (result.success && Array.isArray(result.data)) {
      return result.data.map((pack: any) => ({
        pack_id: pack.pack_id
      }))
    }
  } catch (error) {
    console.error('Error fetching packs for static generation:', error)
  }
  
  // Return empty array if no packs found or error occurred
  return []
}

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
  const [pack, setPack] = useState<ContentPack | null>(null)
  const [content, setContent] = useState('')
  const [hasChanges, setHasChanges] = useState(false)

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
    if (!packId || !content.trim()) {
      toast({
        title: 'Lỗi',
        description: 'Nội dung không được để trống',
        variant: 'destructive',
      })
      return
    }

    try {
      setSaving(true)
      const response = await fetch(`${API_URL}/api/packs/${packId}`, {
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
    setContent(value)
    setHasChanges(value !== (pack?.draft_content || ''))
  }

  if (loading) {
    return (
      <AppLayout
        pageTitle="Chỉnh sửa nội dung"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Test Packs Draft', href: '/test-packs-draft' },
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
          { label: 'Test Packs Draft', href: '/test-packs-draft' },
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
        { label: 'Test Packs Draft', href: '/test-packs-draft' },
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
              onClick={() => router.push('/test-packs-draft')}
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

