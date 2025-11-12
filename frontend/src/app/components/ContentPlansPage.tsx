'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import ContentPlanView from './ContentPlanView'
import { 
  FileText, 
  Lightbulb, 
  Calendar,
  Eye,
  Plus,
  Search,
  Filter,
  Trash2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Idea {
  id: string
  title: string
  description: string
  persona: string
  industry: string
  status: string
}

interface ContentPlan {
  id: string
  idea_id: string
  plan_content: string
  target_audience: string
  key_points: string
  created_at: string
  idea?: Idea
}

export default function ContentPlansPage() {
  const [contentPlans, setContentPlans] = useState<ContentPlan[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchContentPlans()
  }, [])

  const fetchContentPlans = async () => {
    try {
      setLoading(true)
      const response = await fetch('http://localhost:4000/content-plans')
      const result = await response.json()
      
      if (result.success) {
        setContentPlans(result.data)
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể tải danh sách kế hoạch",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error fetching content plans:', error)
      toast({
        title: "Lỗi",
        description: "Không thể tải danh sách kế hoạch",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (planId: string, event?: React.MouseEvent) => {
    // Prevent card click when clicking delete button
    if (event) {
      event.stopPropagation()
    }

    // Confirm deletion
    if (!window.confirm('Bạn có chắc chắn muốn xóa kế hoạch nội dung này?')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:4000/content-plans/${planId}`, {
        method: 'DELETE'
      })
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: "Thành công",
          description: "Đã xóa kế hoạch nội dung"
        })
        // If deleted plan was selected, go back to list
        if (selectedPlanId === planId) {
          setSelectedPlanId(null)
        }
        fetchContentPlans()
      } else {
        toast({
          title: "Lỗi",
          description: result.error || "Không thể xóa kế hoạch",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error('Error deleting content plan:', error)
      toast({
        title: "Lỗi",
        description: "Không thể xóa kế hoạch",
        variant: "destructive"
      })
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const truncateText = (text: string, maxLength: number = 150) => {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substr(0, maxLength) + '...'
  }

  const filteredPlans = contentPlans.filter(plan => {
    const searchLower = searchTerm.toLowerCase()
    return (
      plan.plan_content?.toLowerCase().includes(searchLower) ||
      plan.target_audience?.toLowerCase().includes(searchLower) ||
      plan.key_points?.toLowerCase().includes(searchLower) ||
      plan.idea?.title?.toLowerCase().includes(searchLower) ||
      plan.idea?.description?.toLowerCase().includes(searchLower)
    )
  })

  if (selectedPlanId) {
    return (
      <ContentPlanView 
        planId={selectedPlanId}
        onBack={() => setSelectedPlanId(null)}
        onDelete={handleDelete}
      />
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Kế hoạch nội dung</h1>
          <p className="text-gray-500">Quản lý và xem các kế hoạch nội dung</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Tạo kế hoạch mới
        </Button>
      </div>

      {/* Search Bar */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Tìm kiếm kế hoạch nội dung..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Button variant="outline" className="flex items-center gap-2">
          <Filter className="h-4 w-4" />
          Lọc
        </Button>
      </div>

      {/* Content Plans List */}
      {loading ? (
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
        </div>
      ) : filteredPlans.length === 0 ? (
        <Card>
          <CardContent className="p-12">
            <div className="text-center space-y-4">
              <FileText className="h-12 w-12 text-gray-400 mx-auto" />
              <h3 className="text-lg font-medium">Chưa có kế hoạch nội dung nào</h3>
              <p className="text-gray-500">Bắt đầu bằng cách tạo kế hoạch mới từ ý tưởng của bạn</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPlans.map(plan => (
            <Card 
              key={plan.id}
              className="hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => setSelectedPlanId(plan.id)}
            >
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div className="space-y-1 flex-1">
                    {plan.idea && (
                      <div className="flex items-center gap-2 mb-2">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <span className="text-sm font-medium text-gray-700 truncate">
                          {plan.idea.title}
                        </span>
                      </div>
                    )}
                    <CardDescription className="flex items-center gap-2 text-xs">
                      <Calendar className="h-3 w-3" />
                      {formatDate(plan.created_at)}
                    </CardDescription>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedPlanId(plan.id)
                      }}
                      title="Xem chi tiết"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(plan.id, e)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      title="Xóa kế hoạch"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div>
                    <h4 className="text-xs font-medium text-gray-500 mb-1">Nội dung kế hoạch</h4>
                    <p className="text-sm text-gray-700">
                      {truncateText(plan.plan_content)}
                    </p>
                  </div>
                  
                  {plan.target_audience && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-1">Đối tượng mục tiêu</h4>
                      <p className="text-sm text-gray-700">
                        {truncateText(plan.target_audience, 100)}
                      </p>
                    </div>
                  )}

                  {plan.idea && (
                    <div className="flex items-center gap-2 pt-2 border-t">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        plan.idea.status === 'approved' ? 'bg-green-100 text-green-800' :
                        plan.idea.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {plan.idea.status === 'approved' ? 'Ý tưởng đã duyệt' :
                         plan.idea.status === 'rejected' ? 'Ý tưởng bị từ chối' : 
                         'Ý tưởng đang chờ'}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}