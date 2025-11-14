'use client'

import * as React from 'react'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { CopyButton } from '@/components/ui/copy-button'
import { Twitter, Linkedin } from 'lucide-react'

export type Platform = 'Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok' | 'MailChimp'

export interface PlatformConfig {
  platform: Platform
  characterLimit: number
  content?: string
}

export interface DerivativeTabsProps {
  platforms: PlatformConfig[]
  defaultValue?: Platform
  onPlatformChange?: (platform: Platform) => void
  className?: string
  children?: React.ReactNode | ((platform: Platform) => React.ReactNode)
  showCopyButton?: boolean
}

// Platform icon mapping với SVG fallback cho các icon không có trong lucide-react
const getPlatformIcon = (platform: Platform): React.ReactNode => {
  switch (platform) {
    case 'Twitter':
      return <Twitter className="h-4 w-4" />
    case 'LinkedIn':
      return <Linkedin className="h-4 w-4" />
    case 'Facebook':
      // Facebook icon SVG
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    case 'Instagram':
      // Instagram icon SVG
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    case 'TikTok':
      // TikTok icon SVG
      return (
        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
        </svg>
      )
    default:
      return null
  }
}

// Character count badge component
const CharacterBadge: React.FC<{ count: number; limit: number }> = ({ count, limit }) => {
  const isOverLimit = count > limit

  return (
    <Badge
      variant={isOverLimit ? 'destructive' : 'secondary'}
      className={
        isOverLimit
          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300 dark:border-red-700'
          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300 dark:border-green-700'
      }
    >
      {count} / {limit}
    </Badge>
  )
}

export function DerivativeTabs({
  platforms,
  defaultValue,
  onPlatformChange,
  className = '',
  children,
  showCopyButton = true
}: DerivativeTabsProps) {
  const [activePlatform, setActivePlatform] = React.useState<Platform>(
    defaultValue || platforms[0]?.platform || 'Twitter'
  )

  const handleValueChange = (value: string) => {
    const platform = value as Platform
    setActivePlatform(platform)
    onPlatformChange?.(platform)
  }

  const getCharacterCount = (platform: Platform): number => {
    const config = platforms.find(p => p.platform === platform)
    return config?.content?.length || 0
  }

  const getContent = (platform: Platform): string => {
    const config = platforms.find(p => p.platform === platform)
    return config?.content || ''
  }

  return (
    <Tabs
      value={activePlatform}
      onValueChange={handleValueChange}
      className={className}
    >
      <TabsList 
        className="grid w-full gap-1"
        style={{ gridTemplateColumns: `repeat(${platforms.length}, minmax(0, 1fr))` }}
      >
        {platforms.map(({ platform, characterLimit }) => {
          const count = getCharacterCount(platform)
          return (
            <TabsTrigger
              key={platform}
              value={platform}
              className="flex items-center gap-1.5 text-xs sm:text-sm"
            >
              {getPlatformIcon(platform)}
              <span className="hidden sm:inline">{platform}</span>
              <CharacterBadge count={count} limit={characterLimit} />
            </TabsTrigger>
          )
        })}
      </TabsList>

      {platforms.map(({ platform }) => (
        <TabsContent key={platform} value={platform}>
          <div className="relative">
            {showCopyButton && getContent(platform) && (
              <div className="absolute top-0 right-0 z-10">
                <CopyButton
                  text={getContent(platform)}
                  successMessage="Copied to clipboard!"
                />
              </div>
            )}
            {typeof children === 'function' ? children(platform) : children}
          </div>
        </TabsContent>
      ))}
    </Tabs>
  )
}

