'use client'

import * as React from 'react'
import { Clock, RotateCcw, CheckCircle2, FileText, User } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

export interface Version {
  id: string
  version: number
  content: string
  platform: string
  createdAt: Date | string
  createdBy?: string
  isCurrent?: boolean
  metadata?: {
    characterCount?: number
    wordCount?: number
    changes?: string
    platform?: string
  }
}

export interface VersionControlProps {
  versions: Version[]
  currentVersionId?: string
  onRollback?: (versionId: string) => Promise<void>
  onViewVersion?: (versionId: string) => void
  className?: string
  maxVersions?: number
}

export function VersionControl({
  versions,
  currentVersionId,
  onRollback,
  onViewVersion,
  className,
  maxVersions = 10
}: VersionControlProps) {
  const [rollingBackId, setRollingBackId] = React.useState<string | null>(null)

  const sortedVersions = React.useMemo(() => {
    return [...versions].sort((a, b) => {
      const dateA = typeof a.createdAt === 'string' ? new Date(a.createdAt) : a.createdAt
      const dateB = typeof b.createdAt === 'string' ? new Date(b.createdAt) : b.createdAt
      return dateB.getTime() - dateA.getTime()
    })
  }, [versions])

  const displayedVersions = sortedVersions.slice(0, maxVersions)

  const handleRollback = async (versionId: string) => {
    if (!onRollback) return

    setRollingBackId(versionId)
    try {
      await onRollback(versionId)
    } catch (error) {
      console.error('Failed to rollback:', error)
    } finally {
      setRollingBackId(null)
    }
  }

  const formatDate = (date: Date | string): string => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date
      return formatDistanceToNow(d, { addSuffix: true })
    } catch {
      return 'Unknown'
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Version History
            </CardTitle>
            <CardDescription>
              View and restore previous versions
            </CardDescription>
          </div>
          <Badge variant="outline">{versions.length} version{versions.length !== 1 ? 's' : ''}</Badge>
        </div>
      </CardHeader>
      <CardContent>
        {versions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No version history available</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px]">
            <div className="space-y-3">
              {displayedVersions.map((version, index) => {
                const isCurrent = version.id === currentVersionId || version.isCurrent
                const isRollingBack = rollingBackId === version.id

                return (
                  <div
                    key={version.id}
                    className={cn(
                      'relative p-4 rounded-lg border transition-colors',
                      isCurrent && 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800',
                      !isCurrent && 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800'
                    )}
                  >
                    {/* Version Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          'h-8 w-8 rounded-full flex items-center justify-center text-xs font-semibold',
                          isCurrent 
                            ? 'bg-blue-500 text-white' 
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-700 dark:text-gray-300'
                        )}>
                          v{version.version}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">
                              Version {version.version}
                            </span>
                            {isCurrent && (
                              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(version.createdAt)}</span>
                            {version.createdBy && (
                              <>
                                <Separator orientation="vertical" className="h-3" />
                                <User className="h-3 w-3" />
                                <span>{version.createdBy}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                      {version.metadata?.platform && (
                        <Badge variant="outline" className="text-xs">
                          {version.metadata.platform}
                        </Badge>
                      )}
                    </div>

                    {/* Version Content Preview */}
                    <div className="mb-3">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {version.content}
                      </p>
                      {version.metadata?.characterCount && (
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span>{version.metadata.characterCount} characters</span>
                          {version.metadata.wordCount && (
                            <span>{version.metadata.wordCount} words</span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Version Actions */}
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onViewVersion?.(version.id)}
                        className="flex-1"
                      >
                        <FileText className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      {!isCurrent && onRollback && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRollback(version.id)}
                          disabled={isRollingBack}
                          className="flex-1"
                        >
                          {isRollingBack ? (
                            <>
                              <RotateCcw className="h-3 w-3 mr-1 animate-spin" />
                              Rolling back...
                            </>
                          ) : (
                            <>
                              <RotateCcw className="h-3 w-3 mr-1" />
                              Rollback
                            </>
                          )}
                        </Button>
                      )}
                      {isCurrent && (
                        <Button
                          variant="outline"
                          size="sm"
                          disabled
                          className="flex-1"
                        >
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Active
                        </Button>
                      )}
                    </div>

                    {/* Version Indicator Line */}
                    {index < displayedVersions.length - 1 && (
                      <div className="absolute left-6 top-full h-4 w-0.5 bg-gray-200 dark:bg-gray-800 mt-2" />
                    )}
                  </div>
                )
              })}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}




