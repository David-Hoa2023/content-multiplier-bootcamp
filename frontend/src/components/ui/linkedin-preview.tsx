'use client'

import * as React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { ThumbsUp, MessageSquare, Repeat2, Send, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface LinkedInPreviewProps {
  avatar?: string
  name: string
  headline?: string
  timestamp: Date | string
  content: string
  likeCount?: number
  commentCount?: number
  repostCount?: number
  className?: string
}

export function LinkedInPreview({
  avatar,
  name,
  headline,
  timestamp,
  content,
  likeCount = 0,
  commentCount = 0,
  repostCount = 0,
  className
}: LinkedInPreviewProps) {
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
      {/* Profile Section */}
      <div className="p-4 pb-3">
        <div className="flex items-start gap-3">
          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            {avatar ? (
              <AvatarImage src={avatar} alt={name} />
            ) : (
              <AvatarFallback className="bg-blue-600 text-white">
                {getInitials(name)}
              </AvatarFallback>
            )}
          </Avatar>

          {/* Profile Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 hover:text-blue-600 dark:hover:text-blue-400 hover:underline cursor-pointer">
                  {name}
                </h3>
                {headline && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                    {headline}
                  </p>
                )}
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

      {/* Content Section */}
      <div className="px-4 pb-4">
        <div className="text-gray-900 dark:text-gray-100 whitespace-pre-wrap break-words leading-relaxed">
          {content}
        </div>
      </div>

      {/* Engagement Stats */}
      {(likeCount > 0 || commentCount > 0 || repostCount > 0) && (
        <div className="px-4 pb-3 border-t border-gray-200 dark:border-gray-800 pt-3">
          <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
            {likeCount > 0 && (
              <div className="flex items-center gap-1">
                <div className="flex items-center -space-x-1">
                  <div className="h-5 w-5 rounded-full bg-blue-600 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <ThumbsUp className="h-3 w-3 text-white" />
                  </div>
                  <div className="h-5 w-5 rounded-full bg-blue-500 border-2 border-white dark:border-gray-900 flex items-center justify-center">
                    <span className="text-xs text-white font-semibold">👍</span>
                  </div>
                </div>
                <span>{likeCount}</span>
              </div>
            )}
            {(commentCount > 0 || repostCount > 0) && (
              <div className="flex items-center gap-4">
                {commentCount > 0 && (
                  <span>
                    {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
                  </span>
                )}
                {repostCount > 0 && (
                  <span>
                    {repostCount} {repostCount === 1 ? 'repost' : 'reposts'}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="border-t border-gray-200 dark:border-gray-800">
        <div className="grid grid-cols-4 divide-x divide-gray-200 dark:divide-gray-800">
          {/* Like */}
          <button
            className="group flex items-center justify-center gap-2 py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Like"
          >
            <ThumbsUp className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Like
            </span>
          </button>

          {/* Comment */}
          <button
            className="group flex items-center justify-center gap-2 py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Comment"
          >
            <MessageSquare className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Comment
            </span>
          </button>

          {/* Repost */}
          <button
            className="group flex items-center justify-center gap-2 py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Repost"
          >
            <Repeat2 className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Repost
            </span>
          </button>

          {/* Send */}
          <button
            className="group flex items-center justify-center gap-2 py-3 px-4 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            aria-label="Send"
          >
            <Send className="h-5 w-5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            <span className="text-sm font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              Send
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}




