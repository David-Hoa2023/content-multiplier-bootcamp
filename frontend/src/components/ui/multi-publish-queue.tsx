'use client'

import * as React from 'react'
import { CheckCircle2, XCircle, Send, Loader2 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'

export type Platform = 'Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok'

export interface Derivative {
  id: string
  platform: Platform
  content: string
  characterCount: number
  characterLimit: number
  status?: 'draft' | 'ready' | 'published'
  createdAt?: Date
}

export interface MultiPublishQueueProps {
  derivatives: Derivative[]
  onPublish?: (derivativeIds: string[]) => Promise<void>
  onSelect?: (derivativeIds: string[]) => void
  className?: string
  showSelectAll?: boolean
}

export function MultiPublishQueue({
  derivatives,
  onPublish,
  onSelect,
  className,
  showSelectAll = true
}: MultiPublishQueueProps) {
  const [selectedIds, setSelectedIds] = React.useState<Set<string>>(new Set())
  const [publishingIds, setPublishingIds] = React.useState<Set<string>>(new Set())
  const [publishedIds, setPublishedIds] = React.useState<Set<string>>(new Set())

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
    onSelect?.(Array.from(newSelected))
  }

  const handleSelectAll = () => {
    const allReadyIds = derivatives
      .filter(d => d.status !== 'published')
      .map(d => d.id)
    
    if (selectedIds.size === allReadyIds.length) {
      setSelectedIds(new Set())
      onSelect?.([])
    } else {
      const newSelected = new Set(allReadyIds)
      setSelectedIds(newSelected)
      onSelect?.(Array.from(newSelected))
    }
  }

  const handlePublish = async () => {
    if (selectedIds.size === 0 || !onPublish) return

    const idsToPublish = Array.from(selectedIds)
    setPublishingIds(new Set(idsToPublish))

    try {
      await onPublish(idsToPublish)
      
      // Mark as published
      setPublishedIds(new Set(Array.from(publishedIds).concat(Array.from(idsToPublish))))
      setSelectedIds(new Set())
    } catch (error) {
      console.error('Failed to publish:', error)
    } finally {
      setPublishingIds(new Set())
    }
  }

  const getPlatformColor = (platform: Platform): string => {
    switch (platform) {
      case 'Twitter': return 'bg-blue-500'
      case 'LinkedIn': return 'bg-blue-600'
      case 'Facebook': return 'bg-blue-700'
      case 'Instagram': return 'bg-gradient-to-r from-purple-500 to-pink-500'
      case 'TikTok': return 'bg-black dark:bg-white'
      default: return 'bg-gray-500'
    }
  }

  const isOverLimit = (derivative: Derivative) => {
    return derivative.characterCount > derivative.characterLimit
  }

  const canPublish = (derivative: Derivative) => {
    return !isOverLimit(derivative) && derivative.status !== 'published'
  }

  const readyCount = derivatives.filter(d => canPublish(d)).length
  const selectedCount = selectedIds.size
  const canPublishSelected = selectedCount > 0 && Array.from(selectedIds).every(id => {
    const derivative = derivatives.find(d => d.id === id)
    return derivative && canPublish(derivative)
  })

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Send className="h-5 w-5" />
              Publish Queue
            </CardTitle>
            <CardDescription>
              Select derivatives to publish across platforms
            </CardDescription>
          </div>
          {showSelectAll && readyCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleSelectAll}
            >
              {selectedIds.size === readyCount ? 'Deselect All' : 'Select All'}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Ready:</span>
            <Badge variant="secondary">{readyCount}</Badge>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Selected:</span>
            <Badge variant={selectedCount > 0 ? 'default' : 'secondary'}>
              {selectedCount}
            </Badge>
          </div>
          {selectedCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground">Can Publish:</span>
              <Badge variant={canPublishSelected ? 'default' : 'destructive'}>
                {canPublishSelected ? 'Yes' : 'No'}
              </Badge>
            </div>
          )}
        </div>

        <Separator />

        {/* Derivatives List */}
        <ScrollArea className="h-[400px]">
          <div className="space-y-2">
            {derivatives.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No derivatives available
              </div>
            ) : (
              derivatives.map((derivative) => {
                const isSelected = selectedIds.has(derivative.id)
                const isPublishing = publishingIds.has(derivative.id)
                const isPublished = publishedIds.has(derivative.id) || derivative.status === 'published'
                const overLimit = isOverLimit(derivative)
                const canPublishThis = canPublish(derivative)

                return (
                  <div
                    key={derivative.id}
                    className={cn(
                      'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                      isSelected && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
                      !isSelected && 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800',
                      isPublished && 'opacity-60'
                    )}
                  >
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={() => handleToggleSelect(derivative.id)}
                      disabled={isPublished || !canPublishThis || isPublishing}
                      className="mt-1"
                    />
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn('h-3 w-3 rounded-full', getPlatformColor(derivative.platform))} />
                          <span className="font-semibold text-sm">{derivative.platform}</span>
                          {isPublished && (
                            <Badge variant="secondary" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                              <CheckCircle2 className="h-3 w-3 mr-1" />
                              Published
                            </Badge>
                          )}
                          {isPublishing && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                              Publishing...
                            </Badge>
                          )}
                        </div>
                        <Badge
                          variant={overLimit ? 'destructive' : 'secondary'}
                          className={overLimit ? '' : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'}
                        >
                          {derivative.characterCount} / {derivative.characterLimit}
                        </Badge>
                      </div>
                      
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {derivative.content}
                      </p>
                      
                      {overLimit && (
                        <p className="text-xs text-red-600 dark:text-red-400">
                          ⚠️ Content exceeds character limit
                        </p>
                      )}
                      
                      {!canPublishThis && !overLimit && !isPublished && (
                        <p className="text-xs text-yellow-600 dark:text-yellow-400">
                          ⚠️ Content not ready for publishing
                        </p>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </ScrollArea>

        {/* Publish Button */}
        {selectedCount > 0 && (
          <>
            <Separator />
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                {selectedCount} derivative{selectedCount !== 1 ? 's' : ''} selected
              </p>
              <Button
                onClick={handlePublish}
                disabled={!canPublishSelected || publishingIds.size > 0}
                className="gap-2"
              >
                {publishingIds.size > 0 ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Publishing...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Publish Selected ({selectedCount})
                  </>
                )}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}




