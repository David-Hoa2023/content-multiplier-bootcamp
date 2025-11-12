'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  FileText, 
  Trash2, 
  RefreshCw,
  Calendar,
  HardDrive,
  Layers,
  CheckCircle,
  Loader2,
  AlertCircle,
  File,
  MoreHorizontal
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { formatDistanceToNow } from 'date-fns'
import { vi } from 'date-fns/locale'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const API_URL = 'http://localhost:4000'

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

interface DocumentListProps {
  documents: KnowledgeDocument[]
  loading: boolean
  onDelete: (documentId: string) => void
  onRefresh: () => void
}

export function DocumentList({ documents, loading, onDelete, onRefresh }: DocumentListProps) {
  const { toast } = useToast()
  const [reprocessing, setReprocessing] = useState<string | null>(null)

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case 'processing':
        return <Loader2 className="h-4 w-4 text-yellow-600 animate-spin" />
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-600" />
      default:
        return <FileText className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ready':
        return <Badge variant="default" className="bg-green-100 text-green-800">Sẵn sàng</Badge>
      case 'processing':
        return <Badge variant="default" className="bg-yellow-100 text-yellow-800">Đang xử lý</Badge>
      case 'error':
        return <Badge variant="destructive">Lỗi</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getFileTypeIcon = (fileType: string, filename: string) => {
    if (fileType === 'application/pdf' || filename.endsWith('.pdf')) {
      return <FileText className="h-5 w-5 text-red-500" />
    }
    if (fileType.includes('word') || filename.endsWith('.docx')) {
      return <FileText className="h-5 w-5 text-blue-500" />
    }
    return <File className="h-5 w-5 text-gray-500" />
  }

  const handleReprocess = async (documentId: string) => {
    setReprocessing(documentId)
    try {
      const response = await fetch(`${API_URL}/api/knowledge/documents/${documentId}/reprocess`, {
        method: 'POST'
      })
      
      const result = await response.json()
      
      if (result.success) {
        toast({
          title: 'Bắt đầu xử lý lại',
          description: 'Tài liệu sẽ được xử lý lại trong vài phút'
        })
        onRefresh()
      } else {
        throw new Error(result.error || 'Failed to reprocess document')
      }
    } catch (error) {
      console.error('Error reprocessing document:', error)
      toast({
        title: 'Lỗi',
        description: 'Không thể xử lý lại tài liệu',
        variant: 'destructive'
      })
    } finally {
      setReprocessing(null)
    }
  }

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin" />
              <span>Đang tải danh sách tài liệu...</span>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (documents.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Không có tài liệu nào</CardTitle>
          <CardDescription>
            Chưa có tài liệu nào trong knowledge base. Hãy tải lên tài liệu đầu tiên.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-muted-foreground">
              Tài liệu của bạn sẽ được hiển thị ở đây sau khi tải lên
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {documents.map((document) => (
        <Card key={document.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                {/* File Icon */}
                <div className="flex-shrink-0 mt-1">
                  {getFileTypeIcon(document.file_type, document.filename)}
                </div>

                {/* Document Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold truncate">
                        {document.title}
                      </h3>
                      <p className="text-sm text-muted-foreground truncate">
                        {document.filename}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {getStatusIcon(document.status)}
                      {getStatusBadge(document.status)}
                    </div>
                  </div>

                  {/* Categories */}
                  {document.categories && document.categories.length > 0 && (
                    <div className="flex items-center gap-1 mb-3 flex-wrap">
                      {document.categories.map((category) => (
                        <Badge
                          key={category.id}
                          variant="outline"
                          className="text-xs"
                          style={{ 
                            borderColor: category.color,
                            color: category.color
                          }}
                        >
                          {category.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  {/* Document Stats */}
                  <div className="flex items-center gap-6 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-4 w-4" />
                      {formatFileSize(document.file_size)}
                    </div>
                    <div className="flex items-center gap-1">
                      <Layers className="h-4 w-4" />
                      {document.chunk_count || 0} chunks
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {formatDistanceToNow(new Date(document.created_at), {
                        addSuffix: true,
                        locale: vi
                      })}
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 ml-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {(document.status === 'error' || document.status === 'ready') && (
                      <DropdownMenuItem
                        onClick={() => handleReprocess(document.id)}
                        disabled={reprocessing === document.id}
                      >
                        {reprocessing === document.id ? (
                          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <RefreshCw className="h-4 w-4 mr-2" />
                        )}
                        Xử lý lại
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuItem
                      onClick={() => onDelete(document.id)}
                      className="text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}