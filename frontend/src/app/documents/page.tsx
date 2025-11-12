'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { AppLayout } from '@/components/layout'
import { DocumentForm } from '@/components/ui/document-form'
import { DocumentCard } from '@/components/ui/document-card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { 
  Search, 
  Filter, 
  Plus, 
  Loader2, 
  X,
  FileText,
  Users,
  Tag
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Document {
  id: number
  title: string
  author?: string
  published_date?: string
  tags?: string[]
  content: string
  file_path?: string
  file_type?: string
  file_size?: number
  status: 'processing' | 'ready' | 'error'
  created_at: string
  updated_at: string
}

interface SearchResult {
  document: Document
  chunks: any[]
  similarity_score?: number
}

const API_URL = 'http://localhost:4000'

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedAuthor, setSelectedAuthor] = useState<string>('all')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [authors, setAuthors] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 12,
    total: 0,
    totalPages: 0
  })
  const [isSearching, setIsSearching] = useState(false)
  const { toast } = useToast()

  // Fetch metadata (authors and tags)
  const fetchMetadata = useCallback(async () => {
    try {
      const [authorsRes, tagsRes] = await Promise.all([
        fetch(`${API_URL}/api/documents/meta/authors`),
        fetch(`${API_URL}/api/documents/meta/tags`)
      ])
      
      const authorsData = await authorsRes.json()
      const tagsData = await tagsRes.json()
      
      if (authorsData.success) setAuthors(authorsData.data)
      if (tagsData.success) setAvailableTags(tagsData.data)
    } catch (error) {
      console.error('Error fetching metadata:', error)
    }
  }, [])

  // Fetch documents or search
  const fetchDocuments = useCallback(async (page = 1, reset = false) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString()
      })
      
      if (selectedAuthor && selectedAuthor !== 'all') params.append('author', selectedAuthor)
      if (selectedTags.length > 0) params.append('tags', selectedTags.join(','))
      
      let endpoint = '/api/documents'
      if (searchQuery.trim()) {
        endpoint = '/api/documents/search'
        params.append('q', searchQuery.trim())
        setIsSearching(true)
      } else {
        setIsSearching(false)
      }
      
      const response = await fetch(`${API_URL}${endpoint}?${params}`)
      const data = await response.json()
      
      if (data.success) {
        const newDocs = endpoint === '/api/documents/search'
          ? data.data.results.map((r: SearchResult) => r.document)
          : data.data.documents
        
        setDocuments(prevDocs => reset ? newDocs : [...prevDocs, ...newDocs])
        setPagination(data.data.pagination)
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tải danh sách tài liệu',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }, [searchQuery, selectedAuthor, selectedTags, pagination.limit, toast])

  // Initial load
  useEffect(() => {
    fetchMetadata()
  }, [fetchMetadata])

  // Fetch documents on component mount and when filters change
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      fetchDocuments(1, true)
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [searchQuery, selectedAuthor, selectedTags, fetchDocuments])

  const handleCreateDocument = async (data: any) => {
    try {
      let response;
      
      if (data.file) {
        // Use multipart form data for file uploads
        const formData = new FormData()
        formData.append('title', data.title)
        if (data.author) formData.append('author', data.author)
        if (data.published_date) formData.append('published_date', format(data.published_date, 'yyyy-MM-dd'))
        formData.append('tags', JSON.stringify(data.tags || []))
        formData.append('content', data.content)
        formData.append('file', data.file)
        
        response = await fetch(`${API_URL}/api/documents/upload`, {
          method: 'POST',
          body: formData
        })
      } else {
        // Use JSON for regular form data
        response = await fetch(`${API_URL}/api/documents`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...data,
            published_date: data.published_date ? format(data.published_date, 'yyyy-MM-dd') : undefined
          })
        })
      }
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Tài liệu đã được tạo và đang xử lý'
        })
        fetchDocuments(1, true)
        fetchMetadata()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error('Error creating document:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể tạo tài liệu',
        variant: 'destructive'
      })
    }
  }

  const handleDeleteDocument = async (id: string) => {
    try {
      const response = await fetch(`${API_URL}/api/documents/${id}`, {
        method: 'DELETE'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Thành công',
          description: 'Tài liệu đã được xóa'
        })
        setDocuments(docs => docs.filter(doc => doc.id.toString() !== id))
        fetchMetadata()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      toast({
        title: 'Lỗi',
        description: 'Không thể xóa tài liệu',
        variant: 'destructive'
      })
    }
  }

  const removeTag = (tagToRemove: string) => {
    setSelectedTags(tags => tags.filter(tag => tag !== tagToRemove))
  }

  const clearFilters = () => {
    setSearchQuery('')
    setSelectedAuthor('all')
    setSelectedTags([])
  }

  const loadMore = () => {
    if (pagination.page < pagination.totalPages && !loading) {
      fetchDocuments(pagination.page + 1, false)
    }
  }

  return (
    <AppLayout
      pageTitle="Quản lý tài liệu"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Tài liệu' },
      ]}
    >
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Quản lý tài liệu</h1>
            <p className="text-muted-foreground">
              {pagination.total > 0 ? `${pagination.total} tài liệu` : 'Chưa có tài liệu nào'}
              {isSearching && searchQuery && ` • Tìm kiếm: "${searchQuery}"`}
            </p>
          </div>
          
          <DocumentForm onSubmit={handleCreateDocument} />
        </div>

        {/* Search and Filters */}
        <div className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Tìm kiếm theo nội dung tài liệu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Lọc:</span>
            </div>
            
            {/* Author Filter */}
            <Select value={selectedAuthor} onValueChange={setSelectedAuthor}>
              <SelectTrigger className="w-[180px]">
                <Users className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tác giả" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả tác giả</SelectItem>
                {authors.map(author => (
                  <SelectItem key={author} value={author}>
                    {author}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Tags Filter */}
            <Select 
              value="" 
              onValueChange={(value) => {
                if (value && !selectedTags.includes(value)) {
                  setSelectedTags([...selectedTags, value])
                }
              }}
            >
              <SelectTrigger className="w-[180px]">
                <Tag className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Chọn chủ đề" />
              </SelectTrigger>
              <SelectContent>
                {availableTags
                  .filter(tag => !selectedTags.includes(tag))
                  .map(tag => (
                    <SelectItem key={tag} value={tag}>
                      {tag}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Clear Filters */}
            {(searchQuery || (selectedAuthor && selectedAuthor !== 'all') || selectedTags.length > 0) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-2" />
                Xóa bộ lọc
              </Button>
            )}
          </div>

          {/* Selected Tags */}
          {selectedTags.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm text-muted-foreground">Chủ đề đã chọn:</span>
              {selectedTags.map(tag => (
                <Badge 
                  key={tag} 
                  variant="secondary" 
                  className="flex items-center gap-1"
                >
                  {tag}
                  <button
                    onClick={() => removeTag(tag)}
                    className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-sm"
                  >
                    <X className="h-2 w-2" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
        </div>

        {/* Documents Grid */}
        {documents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FileText className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchQuery || (selectedAuthor && selectedAuthor !== 'all') || selectedTags.length > 0 
                ? 'Không tìm thấy tài liệu nào' 
                : 'Chưa có tài liệu nào'
              }
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery || (selectedAuthor && selectedAuthor !== 'all') || selectedTags.length > 0 
                ? 'Thử thay đổi từ khóa tìm kiếm hoặc bộ lọc'
                : 'Tạo tài liệu đầu tiên để bắt đầu'
              }
            </p>
            {!(searchQuery || (selectedAuthor && selectedAuthor !== 'all') || selectedTags.length > 0) && (
              <DocumentForm 
                onSubmit={handleCreateDocument}
                trigger={
                  <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Tạo tài liệu đầu tiên
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((document) => (
                <DocumentCard
                  key={document.id}
                  document={{
                    id: document.id.toString(),
                    title: document.title,
                    url: document.file_path || '#',
                    uploadDate: new Date(document.created_at),
                    fileType: document.file_type,
                    status: document.status,
                    // Add new fields
                    author: document.author,
                    published_date: document.published_date,
                    tags: document.tags
                  }}
                  onDelete={handleDeleteDocument}
                  onClick={(doc) => {
                    toast({
                      title: 'Tài liệu',
                      description: `Clicked: ${doc.title}`,
                    })
                  }}
                />
              ))}
            </div>

            {/* Load More */}
            {pagination.page < pagination.totalPages && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={loadMore}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang tải...
                    </>
                  ) : (
                    `Tải thêm (${documents.length}/${pagination.total})`
                  )}
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </AppLayout>
  )
}