'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  Calendar, 
  FileText, 
  ChevronLeft,
  Copy,
  Trash2,
  ArrowRight,
  Package,
  Lightbulb,
  Edit,
  CheckCircle,
  Share2,
  Send
} from 'lucide-react'
import { useRouter, useParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import ReactMarkdown from 'react-markdown'import { API_URL } from '@/lib/api-config';


interface Brief {
  brief_id: string
  title: string | null
  content: string
  created_at: string
  updated_at: string
}

// API_URL imported from @/lib/api-config

export default function BriefDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [brief, setBrief] = useState<Brief | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const briefId = params?.brief_id as string

  useEffect(() => {
    if (briefId) {
      fetchBrief(briefId)
    }
  }, [briefId])

  const fetchBrief = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/briefs/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setBrief(result.data)
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải brief",
          variant: "destructive"
        })
        router.push('/briefs')
      }
    } catch (error) {
      console.error('Error fetching brief:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải brief",
        variant: "destructive"
      })
      router.push('/briefs')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: "Đã sao chép",
      description: `${label} đã được sao chép vào clipboard`
    })
  }

  const handleDelete = async () => {
    if (!brief) return

    if (!window.confirm('Bạn có chắc chắn muốn xóa brief này?')) {
      return
    }

    try {
      setIsDeleting(true)
      const response = await fetch(`${API_URL}/briefs/${brief.brief_id}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Brief đã được xóa',
        })
        router.push('/briefs')
      } else {
        throw new Error(result.error || 'Failed to delete brief')
      }
    } catch (error) {
      console.error('Error deleting brief:', error)
      toast({
        title: 'Lỗi',
        description: error instanceof Error ? error.message : 'Không thể xóa brief',
        variant: 'destructive'
      })
    } finally {
      setIsDeleting(false)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <AppLayout 
        pageTitle="Brief Detail"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Briefs', href: '/briefs' },
          { label: 'Detail' }
        ]}
      >
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      </AppLayout>
    )
  }

  if (!brief) {
    return (
      <AppLayout 
        pageTitle="Brief Detail"
        breadcrumbs={[
          { label: 'Dashboard', href: '/' },
          { label: 'Briefs', href: '/briefs' },
          { label: 'Detail' }
        ]}
      >
        <Card className="p-6">
          <CardContent>
            <p className="text-center text-gray-500 dark:text-gray-400">Không tìm thấy brief</p>
          </CardContent>
        </Card>
      </AppLayout>
    )
  }

  return (
    <AppLayout 
      pageTitle={brief.title || 'Brief Detail'}
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Briefs', href: '/briefs' },
        { label: brief.title || 'Detail' }
      ]}
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex justify-between items-center">
          <Button 
            onClick={() => router.push('/briefs')} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
          
          <div className="flex gap-2">
            <Button 
              onClick={handleDelete} 
              variant="outline" 
              size="sm"
              disabled={isDeleting}
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              {isDeleting ? 'Đang xóa...' : 'Xóa'}
            </Button>
          </div>
        </div>

        {/* Brief Content */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {brief.title || `Brief ${brief.brief_id.slice(0, 8)}`}
            </CardTitle>
            <CardDescription className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4" />
              Tạo ngày: {formatDate(brief.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Content */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Nội dung brief</h3>
                <Button 
                  onClick={() => handleCopyToClipboard(brief.content, "Nội dung brief")}
                  variant="ghost"
                  size="sm"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{brief.content}</ReactMarkdown>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Workflow Navigation */}
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-lg">Quy trình tiếp theo</CardTitle>
            <CardDescription>
              Chuyển sang bước tiếp theo trong quy trình tạo nội dung
            </CardDescription>
          </CardHeader>
          <CardContent>
            {/* Workflow Steps */}
            <div className="mb-6">
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                <div className="flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  <span>Ideas</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1 font-semibold text-foreground">
                  <FileText className="h-3 w-3" />
                  <span>Briefs</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
                  <Package className="h-3 w-3" />
                  <span>Content Packs</span>
                </div>
                <ArrowRight className="h-3 w-3" />
                <div className="flex items-center gap-1">
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

            {/* Next Step Actions */}
            <div className="flex flex-wrap gap-3">
              <Button
                onClick={() => router.push(`/test-packs-draft?brief_id=${brief.brief_id}`)}
                className="flex items-center gap-2"
              >
                <Package className="h-4 w-4" />
                Tạo Content Pack từ brief
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  )
}

