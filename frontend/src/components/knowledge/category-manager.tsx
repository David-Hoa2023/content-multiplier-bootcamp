'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Folder, 
  Plus, 
  Palette,
  FileText
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

const API_URL = 'http://localhost:4000'

interface Category {
  id: number
  name: string
  description?: string
  color: string
  document_count: number
}

interface CategoryManagerProps {
  categories: Category[]
  onCategoryCreated: (category: Category) => void
  onRefresh: () => void
}

const DEFAULT_COLORS = [
  '#3B82F6', // Blue
  '#10B981', // Green
  '#8B5CF6', // Purple
  '#F59E0B', // Orange
  '#EF4444', // Red
  '#6B7280', // Gray
  '#EC4899', // Pink
  '#14B8A6', // Teal
  '#F97316', // Orange-2
  '#84CC16', // Lime
]

export function CategoryManager({ categories, onCategoryCreated, onRefresh }: CategoryManagerProps) {
  const { toast } = useToast()
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedColor, setSelectedColor] = useState(DEFAULT_COLORS[0])
  const [creating, setCreating] = useState(false)

  const handleCreateCategory = async () => {
    if (!name.trim()) {
      toast({
        title: 'Chưa nhập tên danh mục',
        description: 'Vui lòng nhập tên cho danh mục',
        variant: 'destructive'
      })
      return
    }

    setCreating(true)
    try {
      const response = await fetch(`${API_URL}/api/knowledge/categories`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined,
          color: selectedColor
        })
      })

      const result = await response.json()

      if (result.success) {
        onCategoryCreated(result.data)
        
        // Reset form
        setName('')
        setDescription('')
        setSelectedColor(DEFAULT_COLORS[0])
        setShowCreateForm(false)
        
        toast({
          title: 'Tạo thành công',
          description: `Đã tạo danh mục "${result.data.name}"`
        })
      } else {
        throw new Error(result.error || 'Failed to create category')
      }
    } catch (error) {
      console.error('Error creating category:', error)
      toast({
        title: 'Lỗi tạo danh mục',
        description: 'Không thể tạo danh mục. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Category Form */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Folder className="h-5 w-5" />
                Quản lý danh mục
              </CardTitle>
              <CardDescription>
                Tạo và quản lý danh mục để phân loại tài liệu
              </CardDescription>
            </div>
            {!showCreateForm && (
              <Button onClick={() => setShowCreateForm(true)} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Tạo danh mục
              </Button>
            )}
          </div>
        </CardHeader>
        {showCreateForm && (
          <CardContent className="space-y-4 border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category-name">Tên danh mục</Label>
                <Input
                  id="category-name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ví dụ: Brand Guidelines, Product Info..."
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="category-description">Mô tả (không bắt buộc)</Label>
                <Input
                  id="category-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Mô tả ngắn về danh mục"
                  className="mt-1"
                />
              </div>
            </div>

            {/* Color Picker */}
            <div>
              <Label className="flex items-center gap-2">
                <Palette className="h-4 w-4" />
                Màu sắc
              </Label>
              <div className="flex gap-2 mt-2 flex-wrap">
                {DEFAULT_COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setSelectedColor(color)}
                    className={`w-8 h-8 rounded-full border-2 ${
                      selectedColor === color ? 'border-gray-900' : 'border-gray-300'
                    }`}
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-2">
              <Button
                onClick={handleCreateCategory}
                disabled={!name.trim() || creating}
                className="flex items-center gap-2"
              >
                <Plus className="h-4 w-4" />
                {creating ? 'Đang tạo...' : 'Tạo danh mục'}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowCreateForm(false)
                  setName('')
                  setDescription('')
                  setSelectedColor(DEFAULT_COLORS[0])
                }}
              >
                Hủy
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Categories List */}
      <Card>
        <CardHeader>
          <CardTitle>Danh mục hiện có</CardTitle>
          <CardDescription>
            {categories.length} danh mục
          </CardDescription>
        </CardHeader>
        <CardContent>
          {categories.length === 0 ? (
            <div className="text-center py-8">
              <Folder className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Chưa có danh mục nào. Tạo danh mục đầu tiên để phân loại tài liệu.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Card key={category.id} className="border-l-4" style={{ borderLeftColor: category.color }}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <h3 className="font-semibold">{category.name}</h3>
                        </div>
                        {category.description && (
                          <p className="text-sm text-muted-foreground mb-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <FileText className="h-3 w-3" />
                          <span>{category.document_count} tài liệu</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}