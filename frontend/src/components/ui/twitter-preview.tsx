'use client'

import * as React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { MessageCircle, Repeat2, Heart, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TwitterPreviewProps {
  avatar?: string
  name: string
  username: string
  timestamp: Date | string
  content: string
  replyCount?: number
  retweetCount?: number
  likeCount?: number
  className?: string
}

export function TwitterPreview({
  avatar,
  name,
  username,
  timestamp,
  content,
  replyCount = 0,
  retweetCount = 0,
  likeCount = 0,
  className
}: TwitterPreviewProps) {
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
        'w-full border-b border-gray-200 dark:border-gray-800 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors',
        className
      )}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        <Avatar className="h-12 w-12 flex-shrink-0">
          {avatar ? (
            <AvatarImage src={avatar} alt={name} />
          ) : (
            <AvatarFallback className="bg-blue-500 text-white">
              {getInitials(name)}
            </AvatarFallback>
          )}
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Header: Name, Username, Timestamp */}
          <div className="flex items-baseline gap-2 mb-1">
            <span className="font-semibold text-gray-900 dark:text-gray-100 hover:underline">
              {name}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              @{username}
            </span>
            <span className="text-gray-500 dark:text-gray-400 text-sm">·</span>
            <span className="text-gray-500 dark:text-gray-400 text-sm hover:underline">
              {formattedTime}
            </span>
          </div>

          {/* Tweet Content */}
          <div className="text-gray-900 dark:text-gray-100 mb-3 whitespace-pre-wrap break-words">
            {content}
          </div>

          {/* Interaction Buttons - Muted style */}
          <div className="flex items-center justify-between max-w-md mt-3">
            {/* Reply */}
            <button
              className="group flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors opacity-60"
              aria-label="Reply"
              disabled
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950 transition-colors">
                <MessageCircle className="h-5 w-5" />
              </div>
              {replyCount > 0 && (
                <span className="text-sm group-hover:text-blue-500 dark:group-hover:text-blue-400">
                  {replyCount}
                </span>
              )}
            </button>

            {/* Retweet */}
            <button
              className="group flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-green-500 dark:hover:text-green-400 transition-colors opacity-60"
              aria-label="Retweet"
              disabled
            >
              <div className="p-2 rounded-full group-hover:bg-green-50 dark:group-hover:bg-green-950 transition-colors">
                <Repeat2 className="h-5 w-5" />
              </div>
              {retweetCount > 0 && (
                <span className="text-sm group-hover:text-green-500 dark:group-hover:text-green-400">
                  {retweetCount}
                </span>
              )}
            </button>

            {/* Like */}
            <button
              className="group flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 transition-colors opacity-60"
              aria-label="Like"
              disabled
            >
              <div className="p-2 rounded-full group-hover:bg-red-50 dark:group-hover:bg-red-950 transition-colors">
                <Heart className="h-5 w-5" />
              </div>
              {likeCount > 0 && (
                <span className="text-sm group-hover:text-red-500 dark:group-hover:text-red-400">
                  {likeCount}
                </span>
              )}
            </button>

            {/* Share */}
            <button
              className="group flex items-center gap-2 text-gray-400 dark:text-gray-500 hover:text-blue-500 dark:hover:text-blue-400 transition-colors opacity-60"
              aria-label="Share"
              disabled
            >
              <div className="p-2 rounded-full group-hover:bg-blue-50 dark:group-hover:bg-blue-950 transition-colors">
                <Share2 className="h-5 w-5" />
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}




