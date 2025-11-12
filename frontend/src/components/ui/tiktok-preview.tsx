'use client'

import * as React from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Heart, MessageCircle, Share2, Bookmark } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface TikTokPreviewProps {
  avatar?: string
  name: string
  username: string
  timestamp: Date | string
  content: string
  likeCount?: number
  commentCount?: number
  shareCount?: number
  videoUrl?: string
  className?: string
}

export function TikTokPreview({
  avatar,
  name,
  username,
  timestamp,
  content,
  likeCount = 0,
  commentCount = 0,
  shareCount = 0,
  videoUrl,
  className
}: TikTokPreviewProps) {
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
        'w-full bg-black rounded-lg overflow-hidden',
        className
      )}
    >
      {/* Video Area */}
      <div className="relative aspect-[9/16] bg-gradient-to-br from-gray-900 to-black">
        {videoUrl ? (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <p className="text-white text-sm opacity-50">Video placeholder</p>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="text-center text-white p-4">
              <p className="text-sm opacity-50 mb-2">Video placeholder</p>
              <div className="w-16 h-16 mx-auto rounded-full bg-white/10 flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
          </div>
        )}

        {/* Right Side Actions */}
        <div className="absolute right-2 bottom-20 flex flex-col gap-4">
          <button className="flex flex-col items-center gap-1 text-white">
            <Avatar className="h-12 w-12 border-2 border-white">
              {avatar ? (
                <AvatarImage src={avatar} alt={name} />
              ) : (
                <AvatarFallback className="bg-gradient-to-br from-pink-500 to-blue-500 text-white text-xs">
                  {getInitials(name)}
                </AvatarFallback>
              )}
            </Avatar>
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Heart className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold">{likeCount > 0 ? likeCount.toLocaleString() : ''}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <MessageCircle className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold">{commentCount > 0 ? commentCount.toLocaleString() : ''}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Share2 className="h-6 w-6" />
            </div>
            <span className="text-xs font-semibold">{shareCount > 0 ? shareCount.toLocaleString() : ''}</span>
          </button>
          <button className="flex flex-col items-center gap-1 text-white">
            <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
              <Bookmark className="h-6 w-6" />
            </div>
          </button>
        </div>
      </div>

      {/* Bottom Info */}
      <div className="p-4 bg-black text-white">
        <div className="flex items-start gap-2 mb-2">
          <span className="font-semibold text-sm">{name}</span>
          <span className="text-xs text-gray-400">@{username}</span>
        </div>
        <div className="text-sm mb-2 whitespace-pre-wrap break-words">
          {content}
        </div>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  )
}




