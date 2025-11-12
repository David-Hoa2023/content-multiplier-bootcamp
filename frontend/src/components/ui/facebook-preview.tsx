'use client'

import * as React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface FacebookPreviewProps {
  avatar?: string
  name: string
  timestamp: Date | string
  content: string
  likeCount?: number
  commentCount?: number
  shareCount?: number
  className?: string
}

export function FacebookPreview({
  avatar,
  name,
  timestamp,
  content,
  likeCount = 0,
  commentCount = 0,
  shareCount = 0,
  className
}: FacebookPreviewProps) {
  const formattedTime = React.useMemo(() => {
    try {
      const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp
      return formatDistanceToNow(date, { addSuffix: true })
    } catch {
      return 'just now'
    }
  }, [timestamp])

  const getInitials = (name: string): string => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div
      className={cn(
        'w-full bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 flex-shrink-0">
            {avatar ? (
              <AvatarImage src={avatar} alt={name} />
            ) : (
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(name)}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:underline cursor-pointer">
                  {name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    {formattedTime}
                  </span>
                  <span className="text-gray-400 dark:text-gray-600">·</span>
                  <span className="text-xs text-gray-500 dark:text-gray-500">
                    🌐
                  </span>
                </div>
              </div>
              <button
                className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-600 dark:text-gray-400"
                aria-label="More options"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 pb-4">
        <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </div>
      </div>

      {/* Engagement Stats */}
      {(likeCount > 0 || commentCount > 0 || shareCount > 0) && (
        <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-800 pt-3">
          <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-center gap-1">
              {likeCount > 0 && (
                <>
                  <div className="h-5 w-5 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <ThumbsUp className="h-3 w-3 text-white" />
                  </div>
                  <span>{likeCount}</span>
                </>
              )}
            </div>
            {(commentCount > 0 || shareCount > 0) && (
              <div className="flex items-center gap-4">
                {commentCount > 0 && (
                  <span>
                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                  </span>
                )}
                {shareCount > 0 && (
                  <span>
                    {shareCount} {shareCount === 1 ? 'share' : 'shares'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-3 divide-x divide-gray-200 dark:divide-gray-800">
          <button
            className="group flex items-center justify-center gap-2 py-2.5 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Like"
          >
            <ThumbsUp className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Like
            </span>
          </button>
          <button
            className="group flex items-center justify-center gap-2 py-2.5 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Comment"
          >
            <MessageCircle className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Comment
            </span>
          </button>
          <button
            className="group flex items-center justify-center gap-2 py-2.5 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Share"
          >
            <Share2 className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Share
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}




