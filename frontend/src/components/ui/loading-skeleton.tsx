"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Skeleton } from '@/components/ui/skeleton'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface LoadingSkeletonProps {
  type: 'idea' | 'brief' | 'table' | 'custom'
  count?: number
  className?: string
  height?: string | number
  width?: string | number
  layout?: 'grid' | 'flex' | 'stack'
  showAnimation?: boolean
}

interface SkeletonItemProps {
  children: React.ReactNode
  delay?: number
  className?: string
}

// Wrapper component cho staggered animation
const SkeletonItem: React.FC<SkeletonItemProps> = ({ 
  children, 
  delay = 0, 
  className 
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay,
        ease: "easeOut" 
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}

// IdeaCard Skeleton
const IdeaCardSkeleton: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <SkeletonItem delay={delay}>
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-5 w-3/4" />
            {/* Description */}
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          {/* Action Menu */}
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 space-y-4">
        {/* Persona & Industry */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-4 w-24" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-12" />
            <Skeleton className="h-4 w-20" />
          </div>
        </div>

        {/* Status Badge & Date */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-16 rounded-full" />
          <Skeleton className="h-4 w-20" />
        </div>
      </CardContent>
    </Card>
  </SkeletonItem>
)

// BriefCard Skeleton
const BriefCardSkeleton: React.FC<{ delay?: number }> = ({ delay = 0 }) => (
  <SkeletonItem delay={delay}>
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            {/* Title */}
            <Skeleton className="h-6 w-4/5" />
            {/* Subtitle/Type */}
            <Skeleton className="h-4 w-1/3" />
          </div>
          {/* Avatar */}
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Main content */}
        <div className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-4/5" />
        </div>

        {/* Key points badges */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-20" />
          <div className="flex flex-wrap gap-2">
            <Skeleton className="h-6 w-16 rounded-full" />
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-14 rounded-full" />
            <Skeleton className="h-6 w-18 rounded-full" />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between pt-2">
          <Skeleton className="h-4 w-24" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8 rounded-md" />
            <Skeleton className="h-8 w-8 rounded-md" />
          </div>
        </div>
      </CardContent>
    </Card>
  </SkeletonItem>
)

// Table Row Skeleton
const TableRowSkeleton: React.FC<{ delay?: number; columns?: number }> = ({ 
  delay = 0, 
  columns = 4 
}) => (
  <SkeletonItem delay={delay} className="border-b border-border">
    <div className="flex items-center space-x-4 py-4 px-4">
      {/* Avatar/Icon column */}
      <Skeleton className="h-10 w-10 rounded-full shrink-0" />
      
      {/* Data columns */}
      {Array.from({ length: columns }).map((_, index) => (
        <div key={index} className="flex-1 space-y-1">
          <Skeleton className={cn(
            "h-4",
            index === 0 ? "w-3/4" : "w-1/2"
          )} />
          {index === 0 && (
            <Skeleton className="h-3 w-1/2" />
          )}
        </div>
      ))}
      
      {/* Actions column */}
      <div className="flex gap-2 shrink-0">
        <Skeleton className="h-8 w-8 rounded-md" />
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  </SkeletonItem>
)

// Custom Skeleton
const CustomSkeleton: React.FC<{ 
  delay?: number
  height?: string | number
  width?: string | number
}> = ({ delay = 0, height = "h-24", width = "w-full" }) => (
  <SkeletonItem delay={delay}>
    <Skeleton className={cn(
      typeof height === 'string' ? height : `h-[${height}px]`,
      typeof width === 'string' ? width : `w-[${width}px]`
    )} />
  </SkeletonItem>
)

// Main LoadingSkeleton Component
export function LoadingSkeleton({
  type,
  count = 3,
  className,
  height,
  width,
  layout = 'grid',
  showAnimation = true
}: LoadingSkeletonProps) {
  const items = Array.from({ length: count }, (_, index) => index)
  
  // Render skeleton based on type
  const renderSkeleton = (index: number) => {
    const delay = showAnimation ? index * 0.1 : 0
    
    switch (type) {
      case 'idea':
        return <IdeaCardSkeleton key={index} delay={delay} />
      
      case 'brief':
        return <BriefCardSkeleton key={index} delay={delay} />
      
      case 'table':
        return <TableRowSkeleton key={index} delay={delay} />
      
      case 'custom':
        return (
          <CustomSkeleton 
            key={index} 
            delay={delay} 
            height={height}
            width={width}
          />
        )
      
      default:
        return <IdeaCardSkeleton key={index} delay={delay} />
    }
  }

  // Layout classes
  const getLayoutClasses = () => {
    if (type === 'table') {
      return 'space-y-0' // Table rows don't need gaps
    }
    
    switch (layout) {
      case 'grid':
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
      case 'flex':
        return 'flex flex-wrap gap-6'
      case 'stack':
        return 'space-y-6'
      default:
        return 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
    }
  }

  return (
    <div className={cn(getLayoutClasses(), className)}>
      {items.map(renderSkeleton)}
    </div>
  )
}

// Preset components for common scenarios
export const IdeaListSkeleton: React.FC<Omit<LoadingSkeletonProps, 'type'>> = (props) => (
  <LoadingSkeleton type="idea" {...props} />
)

export const BriefListSkeleton: React.FC<Omit<LoadingSkeletonProps, 'type'>> = (props) => (
  <LoadingSkeleton type="brief" {...props} />
)

// Derivative Preview Skeleton with shimmer
export const DerivativeSkeleton: React.FC<{ count?: number }> = ({ count = 5 }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ 
            duration: 0.4, 
            delay: index * 0.1,
            ease: "easeOut" 
          }}
        >
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2 mb-2">
                <Skeleton className="h-3 w-3 rounded-full" />
                <Skeleton className="h-4 w-16" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
              <div className="space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
              </div>
              <div className="flex gap-2 pt-2">
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
                <Skeleton className="h-8 w-8 rounded-full" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}

export const TableSkeleton: React.FC<Omit<LoadingSkeletonProps, 'type'>> = (props) => (
  <div className="border border-border rounded-lg overflow-hidden">
    {/* Table Header */}
    <div className="border-b border-border bg-muted/50 px-4 py-3">
      <div className="flex items-center space-x-4">
        <Skeleton className="h-4 w-4" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-4 w-16" />
        <div className="ml-auto">
          <Skeleton className="h-4 w-16" />
        </div>
      </div>
    </div>
    
    {/* Table Body */}
    <LoadingSkeleton type="table" layout="stack" {...props} />
  </div>
)

// Grid Layout Skeleton (responsive)
export const GridSkeleton: React.FC<{
  count?: number
  cols?: { sm?: number; md?: number; lg?: number }
  children?: React.ReactNode
}> = ({ 
  count = 6, 
  cols = { sm: 1, md: 2, lg: 3 },
  children 
}) => {
  const gridCols = `grid-cols-${cols.sm} md:grid-cols-${cols.md} lg:grid-cols-${cols.lg}`
  
  return (
    <div className={cn("grid gap-6", gridCols)}>
      {children || Array.from({ length: count }, (_, i) => (
        <SkeletonItem key={i} delay={i * 0.1}>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-2/3" />
              <div className="flex justify-between">
                <Skeleton className="h-6 w-16 rounded-full" />
                <Skeleton className="h-6 w-20" />
              </div>
            </CardContent>
          </Card>
        </SkeletonItem>
      ))}
    </div>
  )
}

export default LoadingSkeleton