'use client'

import * as React from 'react'
import { TwitterPreview } from '@/components/ui/twitter-preview'
import { LinkedInPreview } from '@/components/ui/linkedin-preview'
import { FacebookPreview } from '@/components/ui/facebook-preview'
import { InstagramPreview } from '@/components/ui/instagram-preview'
import { TikTokPreview } from '@/components/ui/tiktok-preview'
import { ResponsivePreview } from '@/components/ui/responsive-preview'
import { EmptyState } from '@/components/ui/empty-state'
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Sparkles } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface ComparePreviewsProps {
  content?: string
  authorName?: string
  authorUsername?: string
  authorHeadline?: string
  avatar?: string
  timestamp?: Date | string
  className?: string
  showAllPlatforms?: boolean
  platforms?: ('Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok')[]
  isLoading?: boolean
  showResponsiveToggle?: boolean
  onGenerateClick?: () => void
}

export function ComparePreviews({
  content,
  authorName = 'John Doe',
  authorUsername = 'johndoe',
  authorHeadline = 'Content Creator',
  avatar,
  timestamp = new Date(),
  className,
  showAllPlatforms = true,
  platforms = ['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok'],
  isLoading = false,
  showResponsiveToggle = true,
  onGenerateClick
}: ComparePreviewsProps) {
  const defaultTimestamp = React.useMemo(() => {
    return timestamp || new Date()
  }, [timestamp])

  const platformsToShow = showAllPlatforms
    ? ['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok'] as const
    : (platforms as readonly ('Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok')[])

  // Show loading skeleton
  if (isLoading) {
    return (
      <div className={cn('w-full', className)}>
        <ScrollArea className="w-full">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4">
            {platformsToShow.map((platform, index) => (
              <div key={platform} className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-3 w-3 rounded-full bg-gray-300 dark:bg-gray-700 animate-pulse"></div>
                  <div className="h-4 w-16 bg-gray-200 dark:bg-gray-800 rounded animate-pulse"></div>
                </div>
                <LoadingSkeleton
                  type="custom"
                  count={1}
                  layout="stack"
                  showAnimation={true}
                />
              </div>
            ))}
          </div>
        </ScrollArea>
      </div>
    )
  }

  // Show empty state if no content
  if (!content || content.trim() === '') {
    return (
      <div className={cn('w-full', className)}>
        <EmptyState
          title="No content to preview"
          description="Enter some content to see how it looks across different social media platforms."
          ctaLabel="Generate Content"
          onClick={onGenerateClick}
          icon={<Sparkles className="h-16 w-16 text-muted-foreground/40" />}
          showCTA={!!onGenerateClick}
        />
      </div>
    )
  }

  const previewContent = (
    <ScrollArea className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 p-4">
          {platformsToShow.includes('Twitter') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Twitter</h3>
              </div>
              <TwitterPreview
                name={authorName}
                username={authorUsername}
                content={content}
                timestamp={defaultTimestamp}
                avatar={avatar}
                likeCount={Math.floor(Math.random() * 1000)}
                retweetCount={Math.floor(Math.random() * 500)}
                replyCount={Math.floor(Math.random() * 200)}
              />
            </div>
          )}

          {platformsToShow.includes('LinkedIn') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-blue-600"></div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">LinkedIn</h3>
              </div>
              <LinkedInPreview
                name={authorName}
                headline={authorHeadline}
                content={content}
                timestamp={defaultTimestamp}
                avatar={avatar}
                likeCount={Math.floor(Math.random() * 2000)}
                commentCount={Math.floor(Math.random() * 500)}
                repostCount={Math.floor(Math.random() * 300)}
              />
            </div>
          )}

          {platformsToShow.includes('Facebook') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-blue-700"></div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Facebook</h3>
              </div>
              <FacebookPreview
                name={authorName}
                content={content}
                timestamp={defaultTimestamp}
                avatar={avatar}
                likeCount={Math.floor(Math.random() * 1500)}
                commentCount={Math.floor(Math.random() * 400)}
                shareCount={Math.floor(Math.random() * 250)}
              />
            </div>
          )}

          {platformsToShow.includes('Instagram') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-500"></div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Instagram</h3>
              </div>
              <InstagramPreview
                name={authorName}
                content={content}
                timestamp={defaultTimestamp}
                avatar={avatar}
                likeCount={Math.floor(Math.random() * 5000)}
                commentCount={Math.floor(Math.random() * 800)}
              />
            </div>
          )}

          {platformsToShow.includes('TikTok') && (
            <div className="space-y-2">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-3 w-3 rounded-full bg-black dark:bg-white"></div>
                <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">TikTok</h3>
              </div>
              <TikTokPreview
                name={authorName}
                username={authorUsername}
                content={content}
                timestamp={defaultTimestamp}
                avatar={avatar}
                likeCount={Math.floor(Math.random() * 10000)}
                commentCount={Math.floor(Math.random() * 2000)}
                shareCount={Math.floor(Math.random() * 1500)}
              />
            </div>
          )}
        </div>
      </ScrollArea>
  )

  // Wrap with ResponsivePreview if toggle is enabled
  if (showResponsiveToggle) {
    return (
      <div className={cn('w-full', className)}>
        <ResponsivePreview showToggle={showResponsiveToggle}>
          {previewContent}
        </ResponsivePreview>
      </div>
    )
  }

  return (
    <div className={cn('w-full', className)}>
      {previewContent}
    </div>
  )
}

