"use client"

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  MoreVertical, 
  Edit2, 
  Trash2, 
  FileText,
  Loader2
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface Idea {
  id: string | number
  title: string
  description?: string
  persona: string
  industry: string
  status: 'draft' | 'selected' | 'archived'
  created_at?: string
}

interface IdeaCardProps {
  idea: Idea
  onEdit?: (idea: Idea) => void
  onDelete?: (ideaId: string | number) => void
  onSelectAndCreateBrief?: (idea: Idea) => void
  className?: string
}

const statusConfig = {
  draft: {
    label: 'Nháp',
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  },
  selected: {
    label: 'Đã chọn',
    variant: 'default' as const,
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  archived: {
    label: 'Lưu trữ',
    variant: 'destructive' as const,
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
}

export function IdeaCard({
  idea,
  onEdit,
  onDelete,
  onSelectAndCreateBrief,
  className
}: IdeaCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [loadingAction, setLoadingAction] = useState<string | null>(null)

  const statusInfo = statusConfig[idea.status]
  const canCreateBrief = idea.status === 'selected'

  const handleAction = async (
    action: string,
    callback?: () => void | Promise<void>
  ) => {
    if (!callback) return

    try {
      setIsLoading(true)
      setLoadingAction(action)
      
      await callback()
      
      toast({
        title: "Thành công",
        description: `${action} đã được thực hiện thành công.`,
      })
    } catch (error) {
      console.error(`Error with ${action}:`, error)
      toast({
        title: "Lỗi",
        description: `Có lỗi xảy ra khi ${action.toLowerCase()}.`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setLoadingAction(null)
    }
  }

  const handleEdit = () => {
    handleAction('Chỉnh sửa', () => onEdit?.(idea))
  }

  const handleDelete = () => {
    handleAction('Xóa', () => onDelete?.(idea.id))
  }

  const handleSelectAndCreateBrief = () => {
    handleAction('Tạo brief', () => onSelectAndCreateBrief?.(idea))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ 
        scale: 1.02,
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
      }}
      transition={{ 
        duration: 0.2,
        ease: "easeOut"
      }}
      className={cn("group", className)}
    >
      <Card className="h-full transition-all duration-200 hover:border-primary/20 relative overflow-hidden">
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>{loadingAction}...</span>
            </div>
          </div>
        )}

        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <CardTitle className="text-lg font-semibold leading-6 truncate group-hover:text-primary transition-colors">
                {idea.title}
              </CardTitle>
              {idea.description && (
                <CardDescription className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {idea.description}
                </CardDescription>
              )}
            </div>
            
            {/* Actions Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                  disabled={isLoading}
                >
                  <MoreVertical className="h-4 w-4" />
                  <span className="sr-only">Mở menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem 
                  onClick={handleEdit}
                  className="cursor-pointer"
                  disabled={isLoading}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Chỉnh sửa
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleSelectAndCreateBrief}
                  className="cursor-pointer"
                  disabled={!canCreateBrief || isLoading}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  Chọn & Tạo Brief
                  {!canCreateBrief && (
                    <span className="ml-auto text-xs text-muted-foreground">
                      (Chỉ dành cho đã chọn)
                    </span>
                  )}
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="cursor-pointer text-destructive focus:text-destructive"
                  disabled={isLoading}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Xóa
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-4">
          {/* Persona & Industry */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Persona:</span>
              <span className="text-foreground">{idea.persona}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="font-medium text-muted-foreground">Ngành:</span>
              <span className="text-foreground">{idea.industry}</span>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between">
            <Badge 
              variant={statusInfo.variant}
              className={cn(
                "transition-all duration-200",
                statusInfo.className
              )}
            >
              {statusInfo.label}
            </Badge>
            
            {/* Created Date */}
            {idea.created_at && (
              <span className="text-xs text-muted-foreground">
                {new Date(idea.created_at).toLocaleDateString('vi-VN')}
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default IdeaCard