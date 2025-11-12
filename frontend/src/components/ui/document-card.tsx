'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { 
  FileText, 
  ExternalLink, 
  Trash2, 
  Calendar,
  Copy,
  CheckCircle,
  User
} from 'lucide-react'
import { format } from 'date-fns'
import { vi } from 'date-fns/locale'

interface Document {
  id: string
  title: string
  url: string
  uploadDate: Date
  fileType?: string
  status?: 'processing' | 'ready' | 'error'
  author?: string
  published_date?: string
  tags?: string[]
}

interface DocumentCardProps {
  document: Document
  onDelete: (id: string) => void
  onClick?: (document: Document) => void
  className?: string
}

export function DocumentCard({
  document,
  onDelete,
  onClick,
  className,
}: DocumentCardProps) {
  const [isCopied, setIsCopied] = useState(false)

  const handleCopyUrl = async (e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await navigator.clipboard.writeText(document.url)
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy URL:', err)
    }
  }

  const handleCardClick = () => {
    if (onClick) {
      onClick(document)
    }
  }

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
  }

  const truncateUrl = (url: string, maxLength: number = 50) => {
    if (url.length <= maxLength) return url
    return url.substring(0, maxLength) + '...'
  }

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'processing':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300'
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'error':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
    }
  }

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'processing':
        return 'Đang xử lý'
      case 'ready':
        return 'Sẵn sàng'
      case 'error':
        return 'Lỗi'
      default:
        return 'Chưa xác định'
    }
  }

  return (
    <Card 
      className={cn(
        'group relative cursor-pointer transition-all duration-200 hover:shadow-md hover:-translate-y-1 border border-border/50 hover:border-border',
        onClick && 'hover:bg-accent/50',
        className
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <FileText className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 text-foreground group-hover:text-primary transition-colors">
                {document.title}
              </h3>
              <div className="space-y-2 mt-2">
                <div className="flex items-center gap-2">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    {format(document.uploadDate, 'dd/MM/yyyy HH:mm', { locale: vi })}
                  </span>
                  {document.status && (
                    <Badge 
                      variant="secondary" 
                      className={cn('text-xs', getStatusColor(document.status))}
                    >
                      {getStatusText(document.status)}
                    </Badge>
                  )}
                </div>
                
                {/* Author */}
                {document.author && (
                  <div className="flex items-center gap-2">
                    <User className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground truncate">
                      {document.author}
                    </span>
                  </div>
                )}
                
                {/* Published Date */}
                {document.published_date && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(document.published_date), 'dd/MM/yyyy', { locale: vi })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopyUrl}
              className="h-8 w-8 p-0"
              title="Copy URL"
            >
              {isCopied ? (
                <CheckCircle className="h-4 w-4 text-green-500" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
            
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation()
                window.open(document.url, '_blank')
              }}
              className="h-8 w-8 p-0"
              title="Open in new tab"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
            
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDeleteClick}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive hover:bg-destructive/10"
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Xác nhận xóa document</AlertDialogTitle>
                  <AlertDialogDescription>
                    Bạn có chắc chắn muốn xóa document "{document.title}"? 
                    Hành động này không thể hoàn tác.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Hủy</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(document.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Xóa
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0">
        <div className="flex items-center gap-2">
          <ExternalLink className="h-3 w-3 text-muted-foreground flex-shrink-0" />
          <span 
            className="text-xs text-muted-foreground truncate flex-1 font-mono"
            title={document.url}
          >
            {truncateUrl(document.url)}
          </span>
        </div>
        
        {/* Tags */}
        {document.tags && document.tags.length > 0 && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-1">
              {document.tags.slice(0, 3).map(tag => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {document.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{document.tags.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {document.fileType && (
          <div className="mt-2">
            <Badge variant="outline" className="text-xs">
              {document.fileType.toUpperCase()}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default DocumentCard