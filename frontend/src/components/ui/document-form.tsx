'use client'

import React, { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'
import { CalendarIcon, X, Plus, FileText, Loader2, Upload, File } from 'lucide-react'

const documentSchema = z.object({
  title: z.string().min(1, 'Tiêu đề không được để trống'),
  author: z.string().optional(),
  published_date: z.date().optional(),
  tags: z.array(z.string()),
  content: z.string().min(10, 'Nội dung phải có ít nhất 10 ký tự'),
  file: z.any().optional(), // Use z.any() instead of z.instanceof(File)
})

type DocumentFormValues = z.infer<typeof documentSchema>

interface DocumentFormProps {
  onSubmit: (data: DocumentFormValues) => Promise<void>
  trigger?: React.ReactNode
  defaultValues?: Partial<DocumentFormValues>
  title?: string
  description?: string
}

export function DocumentForm({
  onSubmit,
  trigger,
  defaultValues,
  title = 'Thêm tài liệu mới',
  description = 'Nhập thông tin chi tiết về tài liệu'
}: DocumentFormProps) {
  const [open, setOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [tagInput, setTagInput] = useState('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isExtractingContent, setIsExtractingContent] = useState(false)

  const form = useForm<DocumentFormValues>({
    resolver: zodResolver(documentSchema),
    defaultValues: {
      title: '',
      author: '',
      tags: [],
      content: '',
      ...defaultValues,
    },
  })

  const handleSubmit = async (data: DocumentFormValues) => {
    setIsSubmitting(true)
    try {
      await onSubmit(data)
      form.reset()
      setOpen(false)
    } catch (error) {
      console.error('Error submitting form:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addTag = () => {
    const trimmedTag = tagInput.trim()
    const currentTags = form.getValues('tags') || []
    if (trimmedTag && !currentTags.includes(trimmedTag)) {
      form.setValue('tags', [...currentTags, trimmedTag])
      setTagInput('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('tags') || []
    form.setValue('tags', currentTags.filter(tag => tag !== tagToRemove))
  }

  const handleTagInputKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file)
    form.setValue('file', file)

    // Auto-fill title if not already set
    if (!form.getValues('title')) {
      const fileName = file.name.replace(/\.[^/.]+$/, '')
      form.setValue('title', fileName)
    }

    // Extract content from file if it's a text file
    if (file.type.startsWith('text/') || file.name.endsWith('.txt') || file.name.endsWith('.md')) {
      setIsExtractingContent(true)
      try {
        const content = await file.text()
        if (!form.getValues('content')) {
          form.setValue('content', content)
        }
      } catch (error) {
        console.error('Error reading file:', error)
      } finally {
        setIsExtractingContent(false)
      }
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    form.setValue('file', undefined)
    // Reset file input
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Thêm tài liệu
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {title}
          </DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiêu đề *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nhập tiêu đề tài liệu"
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Author */}
            <FormField
              control={form.control}
              name="author"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tác giả</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Nhập tên tác giả"
                      {...field} 
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Published Date */}
            <FormField
              control={form.control}
              name="published_date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Ngày xuất bản</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                          disabled={isSubmitting}
                        >
                          {field.value ? (
                            format(field.value, 'dd/MM/yyyy', { locale: vi })
                          ) : (
                            <span>Chọn ngày xuất bản</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date > new Date() || date < new Date('1900-01-01')
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Chủ đề</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          placeholder="Nhập chủ đề và nhấn Enter"
                          value={tagInput}
                          onChange={(e) => setTagInput(e.target.value)}
                          onKeyPress={handleTagInputKeyPress}
                          disabled={isSubmitting}
                        />
                        <Button 
                          type="button" 
                          variant="outline" 
                          size="sm"
                          onClick={addTag}
                          disabled={isSubmitting || !tagInput.trim()}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      
                      {field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="flex items-center gap-1"
                            >
                              {tag}
                              <button
                                type="button"
                                onClick={() => removeTag(tag)}
                                className="ml-1 h-3 w-3 hover:bg-destructive hover:text-destructive-foreground rounded-sm"
                                disabled={isSubmitting}
                              >
                                <X className="h-2 w-2" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* File Upload */}
            <FormField
              control={form.control}
              name="file"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tệp tài liệu (tùy chọn)</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      {!selectedFile ? (
                        <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center hover:border-muted-foreground/50 transition-colors">
                          <input
                            id="file-upload"
                            type="file"
                            className="hidden"
                            onChange={handleFileChange}
                            accept=".txt,.md,.pdf,.doc,.docx,.html,.json"
                            disabled={isSubmitting}
                          />
                          <label
                            htmlFor="file-upload"
                            className="cursor-pointer flex flex-col items-center gap-2"
                          >
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <div className="text-sm">
                              <span className="font-medium text-primary">Nhấp để chọn tệp</span>
                              <span className="text-muted-foreground"> hoặc kéo thả tệp vào đây</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Hỗ trợ: TXT, MD, PDF, DOC, DOCX, HTML, JSON
                            </div>
                          </label>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 p-3 border rounded-lg bg-muted/50">
                          <File className="h-8 w-8 text-muted-foreground" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{selectedFile.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(selectedFile.size / 1024).toFixed(1)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={removeFile}
                            disabled={isSubmitting}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                      {isExtractingContent && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Đang trích xuất nội dung từ tệp...
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nội dung *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Nhập nội dung tài liệu hoặc tải lên tệp để tự động điền..."
                      className="min-h-[200px] resize-y"
                      {...field}
                      disabled={isSubmitting || isExtractingContent}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Hủy
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang lưu...
                  </>
                ) : (
                  'Lưu tài liệu'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}

export default DocumentForm