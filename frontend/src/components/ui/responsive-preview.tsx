'use client'

import * as React from 'react'
import { Smartphone, Monitor } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ViewMode = 'mobile' | 'desktop'

export interface ResponsivePreviewProps {
  children: React.ReactNode
  defaultView?: ViewMode
  className?: string
  showToggle?: boolean
  onViewChange?: (view: ViewMode) => void
}

export function ResponsivePreview({
  children,
  defaultView = 'desktop',
  className,
  showToggle = true,
  onViewChange
}: ResponsivePreviewProps) {
  const [viewMode, setViewMode] = React.useState<ViewMode>(defaultView)

  const handleViewChange = (view: ViewMode) => {
    setViewMode(view)
    onViewChange?.(view)
  }

  return (
    <div className={cn('relative', className)}>
      {showToggle && (
        <div className="flex items-center justify-end gap-2 mb-4">
          <div className="inline-flex items-center rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-1">
            <Button
              variant={viewMode === 'desktop' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('desktop')}
              className="gap-2"
            >
              <Monitor className="h-4 w-4" />
              <span className="hidden sm:inline">Desktop</span>
            </Button>
            <Button
              variant={viewMode === 'mobile' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewChange('mobile')}
              className="gap-2"
            >
              <Smartphone className="h-4 w-4" />
              <span className="hidden sm:inline">Mobile</span>
            </Button>
          </div>
        </div>
      )}

      <div
        className={cn(
          'transition-all duration-300',
          viewMode === 'mobile'
            ? 'max-w-sm mx-auto'
            : 'w-full'
        )}
      >
        <div
          className={cn(
            'transition-all duration-300',
            viewMode === 'mobile' && 'border-8 border-gray-900 dark:border-gray-700 rounded-[2rem] bg-gray-900 dark:bg-gray-700 p-2 shadow-2xl'
          )}
        >
          <div
            className={cn(
              'transition-all duration-300',
              viewMode === 'mobile' && 'rounded-[1.5rem] overflow-hidden bg-white dark:bg-gray-900'
            )}
          >
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}




