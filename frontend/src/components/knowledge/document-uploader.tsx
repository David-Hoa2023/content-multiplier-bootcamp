'use client'

import { useState, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { 
  Upload, 
  FileText, 
  File, 
  X, 
  CheckCircle,
  Loader2
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Checkbox } from '@/components/ui/checkbox'import { API_URL } from '@/lib/api-config';


// API_URL imported from @/lib/api-config

interface Category {
  id: number
  name: string
  description?: string
  color: string
  document_count: number
}

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

interface DocumentUploaderProps {
  categories: Category[]
  onUploadSuccess: (document: KnowledgeDocument) => void
}

export function DocumentUploader({ categories, onUploadSuccess }: DocumentUploaderProps) {
  const { toast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [selectedCategories, setSelectedCategories] = useState<number[]>([])
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)

  const allowedTypes = {
    'application/pdf': '.pdf',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document': '.docx',
    'text/plain': '.txt',
    'text/markdown': '.md',
    'application/json': '.json'
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!Object.keys(allowedTypes).includes(file.type) && 
        !Object.values(allowedTypes).some(ext => file.name.toLowerCase().endsWith(ext))) {
      toast({
        title: 'Định dạng file không hỗ trợ',
        description: 'Vui lòng chọn file PDF, DOCX, TXT, MD hoặc JSON',
        variant: 'destructive'
      })
      return
    }

    // Validate file size (50MB)
    if (file.size > 50 * 1024 * 1024) {
      toast({
        title: 'File quá lớn',
        description: 'Kích thước file không được vượt quá 50MB',
        variant: 'destructive'
      })
      return
    }

    setSelectedFile(file)
    if (!title) {
      setTitle(file.name.replace(/\.[^/.]+$/, '')) // Remove extension
    }
  }

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    const file = event.dataTransfer.files[0]
    if (file) {
      // Simulate file input change
      const fakeEvent = {
        target: { files: [file] },
        currentTarget: {} as HTMLInputElement,
        nativeEvent: {} as Event,
        bubbles: false,
        cancelable: false,
        defaultPrevented: false,
        eventPhase: 0,
        isTrusted: false,
        preventDefault: () => {},
        isDefaultPrevented: () => false,
        stopPropagation: () => {},
        isPropagationStopped: () => false,
        persist: () => {},
        timeStamp: Date.now(),
        type: 'change'
      } as unknown as React.ChangeEvent<HTMLInputElement>
      handleFileSelect(fakeEvent)
    }
  }

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
  }

  const toggleCategory = (categoryId: number) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    )
  }

  const handleUpload = async () => {
    if (!selectedFile) {
      toast({
        title: 'Chưa chọn file',
        description: 'Vui lòng chọn một file để tải lên',
        variant: 'destructive'
      })
      return
    }

    if (!title.trim()) {
      toast({
        title: 'Chưa nhập tiêu đề',
        description: 'Vui lòng nhập tiêu đề cho tài liệu',
        variant: 'destructive'
      })
      return
    }

    setUploading(true)
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('title', title.trim())
      if (selectedCategories.length > 0) {
        formData.append('category_ids', JSON.stringify(selectedCategories))
      }

      const response = await fetch(`${API_URL}/api/knowledge/upload`, {
        method: 'POST',
        body: formData
      })

      const result = await response.json()

      if (response.ok && result.success) {
        onUploadSuccess(result.data)
        
        // Reset form
        setSelectedFile(null)
        setTitle('')
        setSelectedCategories([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
        
        toast({
          title: 'Tải lên thành công',
          description: 'Tài liệu đang được xử lý và sẽ sẵn sàng trong vài phút'
        })
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      toast({
        title: 'Lỗi tải lên',
        description: 'Không thể tải lên tài liệu. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
  }

  const getFileIcon = (file: File) => {
    if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
      return <FileText className="h-8 w-8 text-red-500" />
    }
    return <File className="h-8 w-8 text-blue-500" />
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Tải lên tài liệu
          </CardTitle>
          <CardDescription>
            Tải lên tài liệu để bổ sung vào knowledge base. Hỗ trợ PDF, DOCX, TXT, MD, JSON.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              selectedFile 
                ? 'border-green-300 bg-green-50' 
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
          >
            {selectedFile ? (
              <div className="space-y-4">
                <div className="flex items-center justify-center">
                  {getFileIcon(selectedFile)}
                </div>
                <div>
                  <p className="text-sm font-medium">{selectedFile.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(selectedFile.size)}
                  </p>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedFile(null)
                    if (fileInputRef.current) fileInputRef.current.value = ''
                  }}
                  className="flex items-center gap-2"
                >
                  <X className="h-4 w-4" />
                  Xóa file
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Upload className="h-12 w-12 text-gray-400 mx-auto" />
                <div>
                  <p className="text-lg font-medium">Kéo thả file vào đây</p>
                  <p className="text-sm text-muted-foreground">
                    hoặc nhấn để chọn file
                  </p>
                </div>
                <Button
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Chọn file
                </Button>
                <p className="text-xs text-muted-foreground">
                  PDF, DOCX, TXT, MD, JSON (tối đa 50MB)
                </p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept=".pdf,.docx,.txt,.md,.json"
            onChange={handleFileSelect}
          />

          {/* Document Details */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Tiêu đề tài liệu</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Nhập tiêu đề cho tài liệu"
                className="mt-1"
              />
            </div>

            {/* Category Selection */}
            {categories.length > 0 && (
              <div>
                <Label>Danh mục (không bắt buộc)</Label>
                <div className="mt-2 space-y-2">
                  {categories.map(category => (
                    <div key={category.id} className="flex items-center space-x-2">
                      <Checkbox
                        id={`category-${category.id}`}
                        checked={selectedCategories.includes(category.id)}
                        onCheckedChange={() => toggleCategory(category.id)}
                      />
                      <label
                        htmlFor={`category-${category.id}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
                      >
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        {category.name}
                        {category.description && (
                          <span className="text-xs text-muted-foreground">
                            ({category.description})
                          </span>
                        )}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Upload Progress */}
          {uploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Đang tải lên...</span>
                <span className="text-sm text-muted-foreground">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          )}

          {/* Upload Button */}
          <Button
            onClick={handleUpload}
            disabled={!selectedFile || !title.trim() || uploading}
            className="w-full flex items-center gap-2"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            {uploading ? 'Đang tải lên...' : 'Tải lên tài liệu'}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}