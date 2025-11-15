'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  BookOpen, 
  Upload, 
  Search, 
  FileText, 
  Folder,
  Plus,
  Trash2,
  BarChart3,
  RefreshCw,
  Filter,
  Download
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { DocumentUploader } from '@/components/knowledge/document-uploader'
import { DocumentList } from '@/components/knowledge/document-list'
import { KnowledgeQuery } from '@/components/knowledge/knowledge-query'
import { CategoryManager } from '@/components/knowledge/category-manager'
import { KnowledgeStats } from '@/components/knowledge/knowledge-stats'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'import { API_URL } from '@/lib/api-config';


// API_URL imported from @/lib/api-config

interface KnowledgeDocument {
  id: string
  title: string
  filename: string
  file_type: string
  file_size: number
  status: 'processing' | 'ready' | 'error'
  categories: Array<{ id: number, name: string, color: string }>
  chunk_count: number
  created_at: string
  updated_at: string
}

interface Category {
  id: number
  name: string
  description?: string
  color: string
  document_count: number
}

interface KnowledgeStatsData {
  total_documents: number
  ready_documents: number
  processing_documents: number
  error_documents: number
  total_file_size: number
  total_chunks: number
}

export default function KnowledgePage() {
  const { toast } = useToast()
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [stats, setStats] = useState<KnowledgeStatsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('documents')

  // Fetch documents with filters
  const fetchDocuments = async () => {
    try {
      const params = new URLSearchParams()
      if (selectedCategory !== 'all') params.append('category', selectedCategory)
      if (statusFilter !== 'all') params.append('status', statusFilter)
      
      const response = await fetch(`${API_URL}/api/knowledge/documents?${params.toString()}`)
      const result = await response.json()
      
      if (result.success) {
        setDocuments(result.data.documents)
      } else {
        throw new Error(result.error || 'Failed to fetch documents')
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tài liệu',
        variant: 'destructive'
      })
    }
  }

  // Fetch categories
  const fetchCategories = async () => {
    try {
      const response = await fetch(`${API_URL}/api/knowledge/categories`)
      const result = await response.json()
      
      if (result.success) {
        setCategories(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch categories')
      }
    } catch (error) {
      console.error('Error fetching categories:', error)
    }
  }

  // Fetch knowledge base stats
  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_URL}/api/knowledge/stats`)
      const result = await response.json()
      
      if (result.success) {
        setStats(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch stats')
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  // Load all data
  const loadData = async () => {
    setLoading(true)
    await Promise.all([
      fetchDocuments(),
      fetchCategories(),
      fetchStats()
    ])
    setLoading(false)
  }

  // Handle document upload success
  const handleUploadSuccess = (document: KnowledgeDocument) => {
    setDocuments(prev => [document, ...prev])
    fetchStats() // Refresh stats
    toast({
      title: 'Thành công',
      description: `Đã tải lên "${document.title}" và bắt đầu xử lý`
    })
  }

  // Handle document deletion
  const handleDeleteDocument = async (documentId: string) => {
    if (!window.confirm('Bạn có chắc muốn xóa tài liệu này?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/api/knowledge/documents/${documentId}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        fetchStats() // Refresh stats
        toast({
          title: 'Thành công',
          description: 'Đã xóa tài liệu'
        })
      } else {
        throw new Error(result.error || 'Failed to delete document')
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài liệu',
        variant: 'destructive'
      })
    }
  }

  // Handle category creation
  const handleCategoryCreated = (category: Category) => {
    setCategories(prev => [...prev, category])
    toast({
      title: 'Thành công',
      description: `Đã tạo danh mục "${category.name}"`
    })
  }

  // Filter documents by search query
  const filteredDocuments = documents.filter(doc =>
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.filename.toLowerCase().includes(searchQuery.toLowerCase())
  )

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (!loading) {
      fetchDocuments() // Re-fetch when filters change
    }
  }, [selectedCategory, statusFilter])

  return (
    <AppLayout
      pageTitle="Knowledge Base"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Knowledge Base' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Knowledge Base</h1>
            <p className="text-muted-foreground mt-2">
              Quản lý tài liệu và kiến thức để hỗ trợ tạo nội dung
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={loadData}
              disabled={loading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Làm mới
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <KnowledgeStats stats={stats} loading={loading} />

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="documents" className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              Tài liệu
            </TabsTrigger>
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Tải lên
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              Tìm kiếm
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-2">
              <Folder className="h-4 w-4" />
              Danh mục
            </TabsTrigger>
          </TabsList>

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-4">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Bộ lọc tài liệu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <Input
                      placeholder="Tìm kiếm tài liệu..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Chọn danh mục" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả danh mục</SelectItem>
                      {categories.map(category => (
                        <SelectItem key={category.id} value={category.name}>
                          <div className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: category.color }}
                            />
                            {category.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-[150px]">
                      <SelectValue placeholder="Trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tất cả</SelectItem>
                      <SelectItem value="ready">Sẵn sàng</SelectItem>
                      <SelectItem value="processing">Đang xử lý</SelectItem>
                      <SelectItem value="error">Lỗi</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Documents List */}
            <DocumentList 
              documents={filteredDocuments} 
              loading={loading}
              onDelete={handleDeleteDocument}
              onRefresh={loadData}
            />
          </TabsContent>

          {/* Upload Tab */}
          <TabsContent value="upload">
            <DocumentUploader 
              categories={categories}
              onUploadSuccess={handleUploadSuccess}
            />
          </TabsContent>

          {/* Search Tab */}
          <TabsContent value="search">
            <KnowledgeQuery categories={categories} />
          </TabsContent>

          {/* Categories Tab */}
          <TabsContent value="categories">
            <CategoryManager 
              categories={categories}
              onCategoryCreated={handleCategoryCreated}
              onRefresh={fetchCategories}
            />
          </TabsContent>
        </Tabs>
      </div>
    </AppLayout>
  )
}