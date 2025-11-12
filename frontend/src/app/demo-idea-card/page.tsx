'use client'

import { useState } from 'react'
import { IdeaCard, type Idea } from '@/components/ui/idea-card'
import { Toaster } from '@/components/ui/toaster'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  RefreshCw,
  Plus,
  Grid3x3,
  List
} from 'lucide-react'

export default function DemoIdeaCardPage() {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  
  // Sample ideas data
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: '1',
      title: 'Chiến lược Content Marketing cho ngành F&B',
      description: 'Phát triển nội dung thu hút khách hàng trẻ tuổi thông qua social media với focus vào Instagram và TikTok.',
      persona: 'Gen Z Food Lovers',
      industry: 'Thực phẩm & Đồ uống',
      status: 'selected',
      created_at: '2024-01-15T10:30:00Z'
    },
    {
      id: '2', 
      title: 'Ứng dụng AI trong Healthcare',
      description: 'Tạo nội dung giáo dục về việc sử dụng AI để cải thiện chăm sóc sức khỏe.',
      persona: 'Medical Professionals',
      industry: 'Y tế',
      status: 'draft',
      created_at: '2024-01-14T14:20:00Z'
    },
    {
      id: '3',
      title: 'Sustainable Fashion Trends',
      description: 'Series bài viết về xu hướng thời trang bền vững và tác động môi trường.',
      persona: 'Eco-conscious Millennials',
      industry: 'Thời trang',
      status: 'archived',
      created_at: '2024-01-10T09:15:00Z'
    },
    {
      id: '4',
      title: 'Digital Banking for Seniors',
      description: 'Hướng dẫn sử dụng ngân hàng số dành cho người cao tuổi.',
      persona: 'Senior Citizens',
      industry: 'Ngân hàng',
      status: 'selected',
      created_at: '2024-01-12T16:45:00Z'
    },
    {
      id: '5',
      title: 'Remote Work Productivity Tips',
      description: 'Chia sẻ kinh nghiệm làm việc từ xa hiệu quả.',
      persona: 'Remote Workers',
      industry: 'Công nghệ',
      status: 'draft',
      created_at: '2024-01-16T11:30:00Z'
    },
    {
      id: '6',
      title: 'Cryptocurrency for Beginners',
      description: 'Hướng dẫn cơ bản về đầu tư tiền điện tử cho người mới bắt đầu.',
      persona: 'Investment Beginners',
      industry: 'Fintech',
      status: 'archived',
      created_at: '2024-01-08T13:20:00Z'
    }
  ])

  const handleEdit = (idea: Idea) => {
    console.log('Editing idea:', idea.title)
    // Simulate async action
    return new Promise(resolve => setTimeout(resolve, 1000))
  }

  const handleDelete = (ideaId: string | number) => {
    console.log('Deleting idea:', ideaId)
    // Simulate async action
    return new Promise((resolve) => {
      setTimeout(() => {
        setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
        resolve(void 0)
      }, 1500)
    })
  }

  const handleSelectAndCreateBrief = (idea: Idea) => {
    console.log('Creating brief for idea:', idea.title)
    // Simulate async action
    return new Promise(resolve => setTimeout(resolve, 2000))
  }

  const refreshData = () => {
    console.log('Refreshing data...')
    window.location.reload()
  }

  const addNewIdea = () => {
    const newIdea: Idea = {
      id: Date.now().toString(),
      title: `Ý tưởng mới #${Date.now()}`,
      description: 'Mô tả ý tưởng mới được tạo từ demo.',
      persona: 'Demo Persona',
      industry: 'Demo Industry',
      status: 'draft',
      created_at: new Date().toISOString()
    }
    
    setIdeas(prev => [newIdea, ...prev])
  }

  const statusCounts = {
    draft: ideas.filter(idea => idea.status === 'draft').length,
    selected: ideas.filter(idea => idea.status === 'selected').length,
    archived: ideas.filter(idea => idea.status === 'archived').length
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">IdeaCard Component Demo</h1>
          <p className="text-muted-foreground">
            Demo component IdeaCard với đầy đủ tính năng: dropdown actions, loading states, toast notifications và animations.
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Tổng ý tưởng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ideas.length}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Nháp</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{statusCounts.draft}</div>
                <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                  Nháp
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Đã chọn</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{statusCounts.selected}</div>
                <Badge className="bg-blue-100 text-blue-800">
                  Đã chọn
                </Badge>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Lưu trữ</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <div className="text-2xl font-bold">{statusCounts.archived}</div>
                <Badge variant="destructive" className="bg-red-100 text-red-800">
                  Lưu trữ
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Controls */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex gap-2">
            <Button onClick={addNewIdea} className="gap-2">
              <Plus className="h-4 w-4" />
              Thêm ý tưởng
            </Button>
            <Button variant="outline" onClick={refreshData} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Làm mới
            </Button>
          </div>
          
          <div className="flex gap-2">
            <Button 
              variant={viewMode === 'grid' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button 
              variant={viewMode === 'list' ? 'default' : 'outline'}
              size="icon"
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
          <CardDescription>
            Test các tính năng của IdeaCard component
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <h4 className="font-medium">Features:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Hover card để xem animation scale và shadow</li>
                <li>Click icon "⋮" để mở dropdown menu</li>
                <li>Action "Chọn & Tạo Brief" chỉ enabled khi status = "selected"</li>
                <li>Loading spinner hiển thị khi đang xử lý action</li>
                <li>Toast notification khi action hoàn thành</li>
              </ul>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Status Colors:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><Badge variant="secondary" className="mr-2 bg-gray-100 text-gray-800">Nháp</Badge> - Màu xám</li>
                <li><Badge className="mr-2 bg-blue-100 text-blue-800">Đã chọn</Badge> - Màu xanh dương</li>
                <li><Badge variant="destructive" className="mr-2 bg-red-100 text-red-800">Lưu trữ</Badge> - Màu đỏ</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ideas Grid/List */}
      {ideas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-medium">Không có ý tưởng nào</h3>
              <p className="text-muted-foreground">Hãy thêm ý tưởng mới để bắt đầu.</p>
              <Button onClick={addNewIdea} className="gap-2">
                <Plus className="h-4 w-4" />
                Thêm ý tưởng đầu tiên
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" 
            : "space-y-4"
        }>
          {ideas.map((idea) => (
            <IdeaCard
              key={idea.id}
              idea={idea}
              onEdit={handleEdit}
              onDelete={handleDelete}
              onSelectAndCreateBrief={handleSelectAndCreateBrief}
              className={viewMode === 'list' ? "max-w-none" : ""}
            />
          ))}
        </div>
      )}

      <Toaster />
    </div>
  )
}