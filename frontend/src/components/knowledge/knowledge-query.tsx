'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  Search, 
  Loader2, 
  FileText,
  Sparkles,
  Copy,
  BookOpen
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'import { API_URL } from '@/lib/api-config';


// API_URL imported from @/lib/api-config

interface Category {
  id: number
  name: string
  description?: string
  color: string
  document_count: number
}

interface QueryResult {
  chunk_text: string
  chunk_index: number
  similarity_score: number
  document: {
    id: string
    title: string
    filename: string
    file_type: string
    created_at: string
  }
}

interface KnowledgeQueryProps {
  categories: Category[]
}

export function KnowledgeQuery({ categories }: KnowledgeQueryProps) {
  const { toast } = useToast()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<QueryResult[]>([])
  const [loading, setLoading] = useState(false)
  const [limit, setLimit] = useState(5)
  const [similarityThreshold, setSimilarityThreshold] = useState(0.7)
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])

  const handleSearch = async () => {
    if (!query.trim()) {
      toast({
        title: 'Chưa nhập truy vấn',
        description: 'Vui lòng nhập câu hỏi hoặc từ khóa để tìm kiếm',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/knowledge/query`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          query: query.trim(),
          limit,
          similarity_threshold: similarityThreshold,
          category_ids: selectedCategories.length > 0 ? selectedCategories : undefined
        })
      })

      const result = await response.json()

      if (result.success) {
        setResults(result.data.results)
        
        if (result.data.results.length === 0) {
          toast({
            title: 'Không tìm thấy kết quả',
            description: 'Thử điều chỉnh từ khóa hoặc giảm ngưỡng độ tương đồng'
          })
        } else {
          toast({
            title: 'Tìm kiếm thành công',
            description: `Tìm thấy ${result.data.results.length} kết quả liên quan`
          })
        }
      } else {
        throw new Error(result.error || 'Search failed')
      }
    } catch (error) {
      console.error('Search error:', error)
      toast({
        title: 'Lỗi tìm kiếm',
        description: 'Không thể thực hiện tìm kiếm. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast({
      title: 'Đã sao chép',
      description: 'Nội dung đã được sao chép vào clipboard'
    })
  }

  const getSimilarityColor = (score: number) => {
    if (score >= 0.9) return 'bg-green-100 text-green-800'
    if (score >= 0.8) return 'bg-blue-100 text-blue-800'
    if (score >= 0.7) return 'bg-yellow-100 text-yellow-800'
    return 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6">
      {/* Search Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Tìm kiếm Knowledge Base
          </CardTitle>
          <CardDescription>
            Tìm kiếm thông tin trong các tài liệu đã tải lên bằng semantic search
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Query Input */}
          <div>
            <Label htmlFor="query">Câu hỏi hoặc từ khóa</Label>
            <Textarea
              id="query"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ví dụ: Chiến lược marketing cho sản phẩm mới, quy trình onboarding nhân viên..."
              className="mt-1"
              rows={3}
            />
          </div>

          {/* Search Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Limit */}
            <div>
              <Label>Số kết quả tối đa: {limit}</Label>
              <Slider
                value={[limit]}
                onValueChange={(value) => setLimit(value[0])}
                min={1}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>

            {/* Similarity Threshold */}
            <div>
              <Label>Ngưỡng độ tương đồng: {similarityThreshold}</Label>
              <Slider
                value={[similarityThreshold]}
                onValueChange={(value) => setSimilarityThreshold(value[0])}
                min={0.5}
                max={1.0}
                step={0.05}
                className="mt-2"
              />
            </div>
          </div>

          {/* Category Filter */}
          {categories.length > 0 && (
            <div>
              <Label>Lọc theo danh mục (không bắt buộc)</Label>
              <div className="mt-2 space-y-2">
                {categories.map(category => (
                  <div key={category.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`search-category-${category.id}`}
                      checked={selectedCategories.includes(category.id)}
                      onCheckedChange={() => toggleCategory(category.id)}
                    />
                    <label
                      htmlFor={`search-category-${category.id}`}
                      className="text-sm font-medium leading-none flex items-center gap-2 cursor-pointer"
                    >
                      <div 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      {category.name}
                      <span className="text-xs text-muted-foreground">
                        ({category.document_count} tài liệu)
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Search Button */}
          <Button
            onClick={handleSearch}
            disabled={!query.trim() || loading}
            className="w-full flex items-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Search className="h-4 w-4" />
            )}
            {loading ? 'Đang tìm kiếm...' : 'Tìm kiếm'}
          </Button>
        </CardContent>
      </Card>

      {/* Search Results */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5" />
              Kết quả tìm kiếm ({results.length})
            </CardTitle>
            <CardDescription>
              Các đoạn văn bản liên quan đến truy vấn của bạn
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {results.map((result, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {result.document.title}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {result.document.filename} • Chunk {result.chunk_index + 1}
                        </CardDescription>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getSimilarityColor(result.similarity_score)}>
                          {(result.similarity_score * 100).toFixed(1)}% tương đồng
                        </Badge>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard(result.chunk_text)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="bg-muted p-4 rounded-lg">
                      <p className="text-sm whitespace-pre-wrap">
                        {result.chunk_text}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* No Results State */}
      {!loading && query && results.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Không tìm thấy kết quả</h3>
            <p className="text-muted-foreground mb-4">
              Không có tài liệu nào chứa thông tin liên quan đến truy vấn của bạn.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>💡 Gợi ý:</p>
              <ul className="space-y-1 text-left max-w-md mx-auto">
                <li>• Thử sử dụng từ khóa khác</li>
                <li>• Giảm ngưỡng độ tương đồng</li>
                <li>• Bỏ chọn bộ lọc danh mục</li>
                <li>• Tải lên thêm tài liệu liên quan</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}