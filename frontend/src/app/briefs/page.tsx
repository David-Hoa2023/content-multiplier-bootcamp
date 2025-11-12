'use client'

import { useState, useEffect } from 'react'
import { AppLayout } from '@/components/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Plus, Search, ArrowRight, Package, Calendar, Trash2, Lightbulb, Edit, CheckCircle, Share2, Send } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { Checkbox } from '@/components/ui/checkbox'

interface Brief {
  brief_id: string
  title: string | null
  content: string
  created_at: string
  updated_at: string
}

const API_URL = 'http://localhost:4000'

export default function BriefsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [briefs, setBriefs] = useState<Brief[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedBriefs, setSelectedBriefs] = useState<Set<string>>(new Set())

  useEffect(() => {
    fetchBriefs()
  }, [])

  const fetchBriefs = async () => {
    try {
      setLoading(true)
      const response = await fetch(`${API_URL}/briefs`)
      const result = await response.json()

      if (result.success) {
        setBriefs(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch briefs')
      }
    } catch (error) {
      console.error('Error fetching briefs:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách briefs',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredBriefs = briefs.filter(brief => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase()
    return (
      (brief.title?.toLowerCase().includes(query) || false) ||
      brief.content.toLowerCase().includes(query)
    )
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleDelete = async (briefId: string, event: React.MouseEvent) => {
    event.stopPropagation() // Prevent card click when clicking delete button
    
    if (!window.confirm('Bạn có chắc chắn muốn xóa brief này?')) {
      return
    }

    try {
      const response = await fetch(`${API_URL}/briefs/${briefId}`, {
        method: 'DELETE',
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Brief đã được xóa',
        })
        // Remove from selected if was selected
        const newSelected = new Set(selectedBriefs)
        newSelected.delete(briefId)
        setSelectedBriefs(newSelected)
        // Refresh briefs list
        fetchBriefs()
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
    }
  }

  const handleToggleSelect = (briefId: string, checked: boolean) => {
    const newSelected = new Set(selectedBriefs)
    if (checked) {
      newSelected.add(briefId)
    } else {
      newSelected.delete(briefId)
    }
    setSelectedBriefs(newSelected)
  }

  const handleSelectAll = () => {
    if (selectedBriefs.size === filteredBriefs.length) {
      setSelectedBriefs(new Set())
    } else {
      setSelectedBriefs(new Set(filteredBriefs.map(b => b.brief_id)))
    }
  }

  const handleCreateContentPacks = () => {
    if (selectedBriefs.size === 0) {
      toast({
        title: 'Thông báo',
        description: 'Vui lòng chọn ít nhất một brief',
        variant: 'default'
      })
      return
    }

    // Navigate to content packs page with selected brief IDs
    const briefIds = Array.from(selectedBriefs).join(',')
    router.push(`/test-packs-draft?brief_ids=${briefIds}`)
  }
  
  return (
    <AppLayout 
      pageTitle="Briefs"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Briefs' }
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Briefs</h1>
            <p className="text-muted-foreground">
              Quản lý và tạo briefs cho các dự án nội dung.
            </p>
          </div>
          <Button className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Tạo brief mới
          </Button>
        </div>

        {/* Search and Selection Controls */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <input
              type="text"
              placeholder="Tìm kiếm briefs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring bg-background"
            />
          </div>
          
          {/* Selection Controls */}
          {!loading && filteredBriefs.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={selectedBriefs.size > 0 && selectedBriefs.size === filteredBriefs.length}
                  onCheckedChange={handleSelectAll}
                  className="data-[state=checked]:bg-primary"
                />
                <span className="text-sm text-muted-foreground">
                  {selectedBriefs.size > 0 
                    ? `Đã chọn ${selectedBriefs.size} brief${selectedBriefs.size > 1 ? 's' : ''}`
                    : 'Chọn tất cả'}
                </span>
              </div>
              {selectedBriefs.size > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedBriefs(new Set())}
                  className="text-xs"
                >
                  Bỏ chọn tất cả
                </Button>
              )}
            </div>
          )}
        </div>

        {/* Workflow Navigation */}
        {!loading && (
          <Card>
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
              <div className="space-y-3">
                {selectedBriefs.size > 0 && (
                  <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm font-medium mb-2">
                      Đã chọn {selectedBriefs.size} brief{selectedBriefs.size > 1 ? 's' : ''}:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {Array.from(selectedBriefs).map(briefId => {
                        const brief = briefs.find(b => b.brief_id === briefId)
                        return brief ? (
                          <span 
                            key={briefId}
                            className="text-xs px-2 py-1 bg-primary/20 rounded"
                          >
                            {brief.title || `Brief ${briefId.slice(0, 8)}`}
                          </span>
                        ) : null
                      })}
                    </div>
                  </div>
                )}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={handleCreateContentPacks}
                    disabled={selectedBriefs.size === 0}
                    className="flex items-center gap-2"
                  >
                    <Package className="h-4 w-4" />
                    {selectedBriefs.size > 0 
                      ? `Tạo Content Pack từ ${selectedBriefs.size} brief${selectedBriefs.size > 1 ? 's' : ''}`
                      : 'Tạo Content Pack từ brief (chọn brief trước)'}
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                  {selectedBriefs.size === 0 && (
                    <Button
                      variant="outline"
                      onClick={() => router.push('/test-packs-draft')}
                      className="flex items-center gap-2"
                    >
                      Tạo Content Pack (không chọn brief)
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading State */}
        {loading && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-4 text-muted-foreground">Đang tải briefs...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Briefs List */}
        {!loading && filteredBriefs.length > 0 && (
          <div className="grid gap-4">
            {filteredBriefs.map((brief) => {
              const isSelected = selectedBriefs.has(brief.brief_id)
              return (
                <Card 
                  key={brief.brief_id} 
                  className={`hover:shadow-md transition-all ${
                    isSelected ? 'ring-2 ring-primary border-primary' : 'cursor-pointer'
                  }`}
                  onClick={(e) => {
                    // Only navigate if clicking on card, not checkbox
                    if ((e.target as HTMLElement).closest('[role="checkbox"]')) {
                      return
                    }
                    router.push(`/briefs/${brief.brief_id}`)
                  }}
                >
                  <CardHeader>
                    <div className="flex justify-between items-start gap-3">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={(checked) => handleToggleSelect(brief.brief_id, checked === true)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg mb-2">
                          {brief.title || `Brief ${brief.brief_id.slice(0, 8)}`}
                        </CardTitle>
                        <CardDescription className="flex items-center gap-2">
                          <Calendar className="h-4 w-4" />
                          {formatDate(brief.created_at)}
                        </CardDescription>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDelete(brief.brief_id, e)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 shrink-0"
                        title="Xóa brief"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-3">
                      {brief.content.substring(0, 200)}...
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Empty State */}
        {!loading && filteredBriefs.length === 0 && (
          <Card>
            <CardContent className="p-12">
              <div className="text-center space-y-4">
                <FileText className="h-12 w-12 text-muted-foreground mx-auto" />
                <h3 className="text-lg font-medium">
                  {searchQuery ? 'Không tìm thấy brief nào' : 'Chưa có brief nào'}
                </h3>
                <p className="text-muted-foreground">
                  {searchQuery 
                    ? 'Thử tìm kiếm với từ khóa khác'
                    : 'Bắt đầu bằng cách tạo brief đầu tiên cho dự án của bạn'}
                </p>
                {!searchQuery && (
                  <Button className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    Tạo brief đầu tiên
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  )
}