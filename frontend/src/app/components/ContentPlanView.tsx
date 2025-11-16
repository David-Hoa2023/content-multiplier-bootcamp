'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { API_URL } from '@/lib/api-config'
import { 
  Calendar, 
  Target, 
  Lightbulb, 
  FileText, 
  Building2, 
  User, 
  ChevronLeft,
  Copy,
  Edit,
  Trash2,
  ArrowRight,
  Package,
  CheckCircle,
  Share2,
  Send
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { API_URL } from '@/lib/api-config';


interface Idea {
  id: string
  title: string
  description: string
  persona: string
  industry: string
  status: string
  created_at: string
}

interface ContentPlan {
  id: string
  idea_id: string
  plan_content: string
  target_audience: string
  key_points: string
  created_at: string
}

interface ContentPlanViewProps {
  planId?: string
  onBack?: () => void
  onEdit?: (plan: ContentPlan) => void
  onDelete?: (planId: string) => void
}

export default function ContentPlanView({ 
  planId, 
  onBack,
  onEdit,
  onDelete 
}: ContentPlanViewProps) {
  const [loading, setLoading] = useState(true)
  const [contentPlan, setContentPlan] = useState<ContentPlan | null>(null)
  const [idea, setIdea] = useState<Idea | null>(null)
  const [isCreatingBrief, setIsCreatingBrief] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    if (planId) {
      fetchContentPlan(planId)
    }
  }, [planId])

  const fetchContentPlan = async (id: string) => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/content-plans/${id}`)
      const result = await response.json()
      
      if (result.success) {
        setContentPlan(result.data.contentPlan)
        setIdea(result.data.idea)
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải kế hoạch nội dung",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching content plan:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải kế hoạch nội dung",
        variant: "destructive"
      })
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDeleteClick = () => {
    if (contentPlan && onDelete) {
      if (window.confirm('Bạn có chắc chắn muốn xóa kế hoạch nội dung này?')) {
        onDelete(contentPlan.id)
      }
    }
  }

  const handleCreateBrief = async () => {
    console.log('handleCreateBrief called, planId:', planId, 'type:', typeof planId)
    
    if (!planId) {
      console.error('planId is missing')
      toast({
        title: "Lỗi",
        description: "Không tìm thấy ID kế hoạch",
        variant: "destructive"
      })
      return
    }

    try {
      setIsCreatingBrief(true)
      // Ensure planId is converted to string
      const planIdStr = String(planId)
      const url = `${API_URL}/briefs/create-from-plan/${planIdStr}`
      console.log('Calling API:', url)
      
      const response = await fetch(url, {
        method: 'POST',
        // Don't send Content-Type header if no body, or send empty body
        body: JSON.stringify({}),
        headers: {
          'Content-Type': 'application/json',
        },
      })

      console.log('Response status:', response.status, response.statusText)

      if (!response.ok) {
        const errorText = await response.text()
        console.error('Error response:', errorText)
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { error: errorText || 'Unknown error' }
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
      }

      const result = await response.json()
      console.log('Success result:', result)

      if (result.success) {
        toast({
          title: "Thành công",
          description: "Brief đã được tạo thành công",
        })
        // Navigate to briefs page after a short delay
        setTimeout(() => {
          router.push('/briefs')
        }, 500)
      } else {
        throw new Error(result.error || 'Không thể tạo brief')
      }
    } catch (error) {
      console.error('Error creating brief:', error)
      toast({
        title: "Lỗi",
        description: error instanceof Error ? error.message : "Không thể tạo brief từ kế hoạch này",
        variant: "destructive"
      })
    } finally {
      setIsCreatingBrief(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!contentPlan || !idea) {
    return (
      <Card className="p-6">
        <CardContent>
          <p className="text-center text-gray-500 dark:text-gray-400">Không tìm thấy kế hoạch nội dung</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex justify-between items-center">
        {onBack && (
          <Button 
            onClick={onBack} 
            variant="outline" 
            size="sm"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="h-4 w-4" />
            Quay lại
          </Button>
        )}
        
        <div className="flex gap-2 ml-auto">
          {onEdit && (
            <Button 
              onClick={() => onEdit(contentPlan)} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
            >
              <Edit className="h-4 w-4" />
              Chỉnh sửa
            </Button>
          )}
          {onDelete && (
            <Button 
              onClick={handleDeleteClick} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2 text-red-600 hover:text-red-700"
            >
              <Trash2 className="h-4 w-4" />
              Xóa
            </Button>
          )}
        </div>
      </div>

      <Tabs defaultValue="content-plan" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="content-plan">Kế hoạch nội dung</TabsTrigger>
          <TabsTrigger value="original-idea">Ý tưởng gốc</TabsTrigger>
        </TabsList>

        {/* Content Plan Tab */}
        <TabsContent value="content-plan" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Kế hoạch nội dung
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Tạo ngày: {formatDate(contentPlan.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Plan Content */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Nội dung kế hoạch</h3>
                  <Button 
                    onClick={() => handleCopyToClipboard(contentPlan.plan_content, "Nội dung kế hoạch")}
                    variant="ghost"
                    size="sm"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{contentPlan.plan_content}</p>
                </div>
              </div>

              {/* Target Audience */}
              {contentPlan.target_audience && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Target className="h-4 w-4" />
                      Đối tượng mục tiêu
                    </h3>
                    <Button 
                      onClick={() => handleCopyToClipboard(contentPlan.target_audience, "Đối tượng mục tiêu")}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-blue-50 dark:bg-blue-900/30 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{contentPlan.target_audience}</p>
                  </div>
                </div>
              )}

              {/* Key Points */}
              {contentPlan.key_points && (
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Lightbulb className="h-4 w-4" />
                      Các điểm chính
                    </h3>
                    <Button 
                      onClick={() => handleCopyToClipboard(contentPlan.key_points, "Các điểm chính")}
                      variant="ghost"
                      size="sm"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/30 p-4 rounded-lg">
                    <p className="whitespace-pre-wrap text-sm text-gray-900 dark:text-gray-100">{contentPlan.key_points}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Original Idea Tab */}
        <TabsContent value="original-idea" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-500" />
                {idea.title}
              </CardTitle>
              <CardDescription className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                Tạo ngày: {formatDate(idea.created_at)}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Status Badge */}
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Trạng thái:</span>
                <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                  idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                  idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                  'bg-yellow-100 text-yellow-800'
                }`}>
                  {idea.status === 'approved' ? 'Đã duyệt' :
                   idea.status === 'rejected' ? 'Từ chối' : 'Đang chờ'}
                </span>
              </div>

              {/* Description */}
              {idea.description && (
                <div className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200">Mô tả</h3>
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-sm text-gray-900 dark:text-gray-100">{idea.description}</p>
                  </div>
                </div>
              )}

              {/* Persona & Industry */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {idea.persona && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Đối tượng
                    </h3>
                    <div className="bg-blue-50 dark:bg-blue-900/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{idea.persona}</p>
                    </div>
                  </div>
                )}

                {idea.industry && (
                  <div className="space-y-2">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-200 flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Ngành nghề
                    </h3>
                    <div className="bg-purple-50 dark:bg-purple-900/30 p-3 rounded-lg">
                      <p className="text-sm text-gray-900 dark:text-gray-100">{idea.industry}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4">
                <Button 
                  onClick={() => handleCopyToClipboard(
                    `Ý tưởng: ${idea.title}\n\nMô tả: ${idea.description || 'N/A'}\n\nĐối tượng: ${idea.persona || 'N/A'}\n\nNgành: ${idea.industry || 'N/A'}`,
                    "Thông tin ý tưởng"
                  )}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Copy className="h-4 w-4" />
                  Sao chép thông tin ý tưởng
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4 flex-wrap">
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
              onClick={(e) => {
                e.preventDefault()
                e.stopPropagation()
                console.log('Button clicked, planId:', planId, 'isCreatingBrief:', isCreatingBrief)
                handleCreateBrief()
              }}
              disabled={isCreatingBrief || !planId}
              className="flex items-center gap-2"
            >
              <FileText className="h-4 w-4" />
              {isCreatingBrief ? 'Đang tạo Brief...' : 'Tạo Brief từ kế hoạch này'}
              <ArrowRight className="h-4 w-4" />
            </Button>
            {!planId && (
              <p className="text-sm text-muted-foreground">planId: {planId || 'undefined'}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}