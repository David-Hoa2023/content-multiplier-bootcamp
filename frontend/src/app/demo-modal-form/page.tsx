'use client'

import { useState } from 'react'
import { ModalForm, type FormData } from '@/components/ui/modal-form'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Toaster } from '@/components/ui/toaster'
import { 
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Archive
} from 'lucide-react'

interface Idea extends FormData {
  id: string
  createdAt: string
  updatedAt: string
}

const sampleIdeas: Idea[] = [
  {
    id: '1',
    title: 'Chiến lược Content Marketing cho ngành F&B',
    description: 'Phát triển nội dung thu hút khách hàng trẻ tuổi thông qua social media với focus vào Instagram và TikTok.',
    persona: 'Gen Z Food Lovers',
    industry: 'food-beverage',
    status: 'selected',
    createdAt: '2024-01-15T10:30:00Z',
    updatedAt: '2024-01-15T10:30:00Z'
  },
  {
    id: '2',
    title: 'Ứng dụng AI trong Healthcare',
    description: 'Tạo nội dung giáo dục về việc sử dụng AI để cải thiện chăm sóc sức khỏe.',
    persona: 'Medical Professionals',
    industry: 'healthcare',
    status: 'draft',
    createdAt: '2024-01-14T14:20:00Z',
    updatedAt: '2024-01-14T14:20:00Z'
  },
  {
    id: '3',
    title: 'Sustainable Fashion Trends',
    description: 'Series bài viết về xu hướng thời trang bền vững và tác động môi trường.',
    persona: 'Eco-conscious Millennials',
    industry: 'fashion',
    status: 'archived',
    createdAt: '2024-01-10T09:15:00Z',
    updatedAt: '2024-01-10T09:15:00Z'
  }
]

const statusConfig = {
  draft: { label: 'Nháp', color: 'secondary', icon: Clock },
  selected: { label: 'Đã chọn', color: 'default', icon: CheckCircle2 },
  archived: { label: 'Lưu trữ', color: 'destructive', icon: Archive }
}

const industryLabels: Record<string, string> = {
  'technology': 'Công nghệ',
  'healthcare': 'Y tế',
  'finance': 'Tài chính',
  'education': 'Giáo dục',
  'retail': 'Bán lẻ',
  'food-beverage': 'Thực phẩm & Đồ uống',
  'fashion': 'Thời trang',
  'travel': 'Du lịch',
  'real-estate': 'Bất động sản',
  'automotive': 'Ô tô',
  'entertainment': 'Giải trí',
  'other': 'Khác'
}

export default function DemoModalFormPage() {
  const [ideas, setIdeas] = useState<Idea[]>(sampleIdeas)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea | null>(null)
  const [submissionCount, setSubmissionCount] = useState(0)

  const handleCreateSubmit = async (data: FormData) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    const newIdea: Idea = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    setIdeas(prev => [newIdea, ...prev])
    setSubmissionCount(prev => prev + 1)
    setIsCreateModalOpen(false)
  }

  const handleEditSubmit = async (data: FormData) => {
    if (!editingIdea) return
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1200))
    
    const updatedIdea: Idea = {
      ...editingIdea,
      ...data,
      updatedAt: new Date().toISOString()
    }
    
    setIdeas(prev => prev.map(idea => 
      idea.id === editingIdea.id ? updatedIdea : idea
    ))
    setSubmissionCount(prev => prev + 1)
    setIsEditModalOpen(false)
    setEditingIdea(null)
  }

  const handleEdit = (idea: Idea) => {
    setEditingIdea(idea)
    setIsEditModalOpen(true)
  }

  const handleDelete = (id: string) => {
    setIdeas(prev => prev.filter(idea => idea.id !== id))
  }

  const resetDemo = () => {
    setIdeas(sampleIdeas)
    setSubmissionCount(0)
    setIsCreateModalOpen(false)
    setIsEditModalOpen(false)
    setEditingIdea(null)
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ModalForm Component Demo</h1>
            <p className="text-muted-foreground">
              Demo component ModalForm với validation, animations và toast notifications.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Submissions: {submissionCount}
            </Badge>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          {/* Action Buttons */}
          <Card>
            <CardHeader>
              <CardTitle>Actions</CardTitle>
              <CardDescription>
                Test create và edit functionality
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Tạo ý tưởng mới
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={() => handleEdit(ideas[0])}
                  disabled={ideas.length === 0}
                  className="gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Chỉnh sửa ý tưởng đầu tiên
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground">
                Click các button trên để test create và edit modes của ModalForm.
              </div>
            </CardContent>
          </Card>

          {/* Ideas List */}
          <Card>
            <CardHeader>
              <CardTitle>Danh sách ý tưởng ({ideas.length})</CardTitle>
              <CardDescription>
                Các ý tưởng được tạo hoặc chỉnh sửa thông qua ModalForm
              </CardDescription>
            </CardHeader>
            <CardContent>
              {ideas.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>Chưa có ý tưởng nào. Hãy tạo ý tưởng đầu tiên!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {ideas.map((idea) => {
                    const statusInfo = statusConfig[idea.status]
                    const StatusIcon = statusInfo.icon
                    
                    return (
                      <div key={idea.id} className="border rounded-lg p-4 space-y-3">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg leading-6 truncate">
                              {idea.title}
                            </h3>
                            <p className="text-muted-foreground text-sm mt-1 line-clamp-2">
                              {idea.description}
                            </p>
                          </div>
                          
                          <div className="flex gap-2 shrink-0">
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleEdit(idea)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="icon"
                              variant="outline"
                              onClick={() => handleDelete(idea.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-3 text-sm">
                          <div className="flex items-center gap-1">
                            <StatusIcon className="h-4 w-4" />
                            <Badge variant={statusInfo.color as any}>
                              {statusInfo.label}
                            </Badge>
                          </div>
                          
                          <Separator orientation="vertical" className="h-4" />
                          
                          <span className="text-muted-foreground">
                            <strong>Persona:</strong> {idea.persona}
                          </span>
                          
                          <Separator orientation="vertical" className="h-4" />
                          
                          <span className="text-muted-foreground">
                            <strong>Ngành:</strong> {industryLabels[idea.industry] || idea.industry}
                          </span>
                        </div>
                        
                        <div className="text-xs text-muted-foreground">
                          Tạo: {new Date(idea.createdAt).toLocaleString('vi-VN')} | 
                          Cập nhật: {new Date(idea.updatedAt).toLocaleString('vi-VN')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Form validation với Zod schema</li>
                  <li>• React Hook Form integration</li>
                  <li>• Create và Edit modes</li>
                  <li>• Auto-reset form khi đóng modal</li>
                  <li>• Loading states với spinner</li>
                  <li>• Toast notifications</li>
                  <li>• Error handling và display</li>
                  <li>• Responsive design</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  UI/UX Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Smooth Framer Motion animations</li>
                  <li>• Field stagger entry animations</li>
                  <li>• Button state transitions</li>
                  <li>• Error summary display</li>
                  <li>• Prevent outside click khi submitting</li>
                  <li>• Dark mode support</li>
                  <li>• Proper focus management</li>
                  <li>• Form field validation indicators</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Validation Rules
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Title: Bắt buộc, max 100 ký tự</li>
                  <li>• Description: Bắt buộc, max 500 ký tự</li>
                  <li>• Persona: Bắt buộc, max 50 ký tự</li>
                  <li>• Industry: Bắt buộc, từ dropdown</li>
                  <li>• Status: Bắt buộc, enum values</li>
                  <li>• Real-time validation feedback</li>
                  <li>• Error messages trong tiếng Việt</li>
                  <li>• Form-level error summary</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RefreshCw className="h-5 w-5 text-purple-500" />
                  Technical Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• TypeScript với proper typing</li>
                  <li>• Zod schema validation</li>
                  <li>• shadcn/ui Dialog component</li>
                  <li>• Form state management</li>
                  <li>• Async submit handling</li>
                  <li>• Error boundary support</li>
                  <li>• Memory leak prevention</li>
                  <li>• Performance optimized</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Examples</CardTitle>
              <CardDescription>
                Các ví dụ sử dụng ModalForm trong different scenarios
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <h4 className="font-medium">Basic Create Form</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`<ModalForm
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={handleSubmit}
/>`}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Edit Form với Initial Data</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`<ModalForm
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={handleUpdate}
  initialData={existingIdea}
/>`}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Custom Title & Description</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`<ModalForm
  open={isOpen}
  onClose={() => setIsOpen(false)}
  onSubmit={handleSubmit}
  title="Custom Title"
  description="Custom description"
/>`}</code>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">With Error Handling</h4>
                  <div className="bg-muted rounded-lg p-4 text-sm">
                    <code>{`const handleSubmit = async (data) => {
  try {
    await api.createIdea(data)
    // Success toast tự động
  } catch (error) {
    // Error toast tự động
    throw error
  }
}`}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Modal */}
      <ModalForm
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={handleCreateSubmit}
      />

      {/* Edit Modal */}
      <ModalForm
        open={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false)
          setEditingIdea(null)
        }}
        onSubmit={handleEditSubmit}
        initialData={editingIdea || undefined}
      />

      <Toaster />
    </div>
  )
}