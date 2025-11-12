'use client'

import * as React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Share2, Bookmark, MoreHorizontal } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface InstagramPreviewProps {
  avatar?: string
  name: string
  timestamp: Date | string
  content: string
  likeCount?: number
  commentCount?: number
  imageUrl?: string
  className?: string
}

export function InstagramPreview({
  avatar,
  name,
  timestamp,
  content,
  likeCount = 0,
  commentCount = 0,
  imageUrl,
  className
}: InstagramPreviewProps) {
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
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8 flex-shrink-0">
              {avatar ? (
                <AvatarImage src={avatar} alt={name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-purple-500 to-pink-500 text-white text-xs">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
            <div>
              <h3 className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                {name}
              </h3>
            </div>
          </div>
          <button
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-900 dark:text-gray-100"
            aria-label="More options"
          >
            <MoreHorizontal className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Image Placeholder */}
      {imageUrl ? (
        <div className="aspect-square bg-gray-100 dark:bg-gray-800">
          <img
            src={imageUrl}
            alt="Post"
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div className="aspect-square bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 flex items-center justify-center">
          <div className="text-white text-center p-4">
            <p className="text-sm opacity-80">Image placeholder</p>
          </div>
        </div>
      )}

      {/* Engagement Bar */}
      <div className="p-3 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity"
              aria-label="Like"
            >
              <Heart className="h-6 w-6" />
            </button>
            <button
              className="text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity"
              aria-label="Comment"
            >
              <MessageCircle className="h-6 w-6" />
            </button>
            <button
              className="text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity"
              aria-label="Share"
            >
              <Share2 className="h-6 w-6" />
            </button>
          </div>
          <button
            className="text-gray-900 dark:text-gray-100 hover:opacity-70 transition-opacity"
            aria-label="Save"
          >
            <Bookmark className="h-6 w-6" />
          </button>
        </div>
      </div>

      {/* Likes Count */}
      {likeCount > 0 && (
        <div className="px-3 pb-2">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
            {likeCount.toLocaleString()} {likeCount === 1 ? 'like' : 'likes'}
          </p>
        </div>
      )}

      {/* Content */}
      <div className="px-3 pb-2">
        <div className="text-sm text-gray-900 dark:text-gray-100">
          <span className="font-semibold mr-2">{name}</span>
          <span className="whitespace-pre-wrap break-words">{content}</span>
        </div>
      </div>

      {/* Comments Count */}
      {commentCount > 0 && (
        <div className="px-3 pb-2">
          <button className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
            View all {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
          </button>
        </div>
      )}

      {/* Timestamp */}
      <div className="px-3 pb-3">
        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase">
          {formattedTime}
        </span>
      </div>
    </div>
  )
}




