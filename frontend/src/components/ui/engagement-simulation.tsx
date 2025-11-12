'use client'

import * as React from 'react'
import { ThumbsUp, MessageCircle, Share2, TrendingUp, Eye } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

export type Platform = 'Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok'

export interface EngagementMetrics {
  likes: number
  comments: number
  shares: number
  views?: number
  engagementRate?: number
}

export interface EngagementSimulationProps {
  platform: Platform
  content: string
  characterCount: number
  characterLimit: number
  className?: string
  showDetails?: boolean
  animated?: boolean
}

const platformEngagementMultipliers = {
  Twitter: {
    baseLikes: 50,
    baseComments: 10,
    baseShares: 5,
    baseViews: 500,
    engagementMultiplier: 0.02
  },
  LinkedIn: {
    baseLikes: 100,
    baseComments: 25,
    baseShares: 15,
    baseViews: 1000,
    engagementMultiplier: 0.03
  },
  Facebook: {
    baseLikes: 150,
    baseComments: 30,
    baseShares: 20,
    baseViews: 2000,
    engagementMultiplier: 0.025
  },
  Instagram: {
    baseLikes: 500,
    baseComments: 80,
    baseShares: 40,
    baseViews: 5000,
    engagementMultiplier: 0.04
  },
  TikTok: {
    baseLikes: 1000,
    baseComments: 200,
    baseShares: 150,
    baseViews: 10000,
    engagementMultiplier: 0.05
  }
}

// Simulate engagement based on content quality
const simulateEngagement = (
  platform: Platform,
  content: string,
  characterCount: number,
  characterLimit: number
): EngagementMetrics => {
  const multipliers = platformEngagementMultipliers[platform]
  
  // Quality factors
  const lengthFactor = Math.min(characterCount / characterLimit, 1.2) // Slightly over limit can be OK
  const hashtagCount = (content.match(/#\w+/g) || []).length
  const mentionCount = (content.match(/@\w+/g) || []).length
  const urlCount = (content.match(/https?:\/\/[^\s]+/g) || []).length
  
  // Engagement calculation
  const qualityScore = Math.min(
    1 + (hashtagCount * 0.1) + (mentionCount * 0.15) + (urlCount * 0.2),
    2.0
  )
  
  const likes = Math.floor(multipliers.baseLikes * lengthFactor * qualityScore * (0.8 + Math.random() * 0.4))
  const comments = Math.floor(multipliers.baseComments * lengthFactor * qualityScore * (0.7 + Math.random() * 0.6))
  const shares = Math.floor(multipliers.baseShares * lengthFactor * qualityScore * (0.6 + Math.random() * 0.8))
  const views = Math.floor(multipliers.baseViews * lengthFactor * qualityScore * (0.9 + Math.random() * 0.2))
  
  const totalEngagements = likes + comments + shares
  const engagementRate = views > 0 ? (totalEngagements / views) * 100 : 0
  
  return {
    likes,
    comments,
    shares,
    views,
    engagementRate: Number(engagementRate.toFixed(2))
  }
}

export function EngagementSimulation({
  platform,
  content,
  characterCount,
  characterLimit,
  className,
  showDetails = true,
  animated = true
}: EngagementSimulationProps) {
  const [metrics, setMetrics] = React.useState<EngagementMetrics | null>(null)
  const [isAnimating, setIsAnimating] = React.useState(false)

  React.useEffect(() => {
    if (!content) {
      setMetrics(null)
      return
    }

    if (animated) {
      setIsAnimating(true)
      // Simulate gradual increase
      const steps = 20
      const finalMetrics = simulateEngagement(platform, content, characterCount, characterLimit)
      
      let currentStep = 0
      const interval = setInterval(() => {
        currentStep++
        const progress = currentStep / steps
        
        setMetrics({
          likes: Math.floor(finalMetrics.likes * progress),
          comments: Math.floor(finalMetrics.comments * progress),
          shares: Math.floor(finalMetrics.shares * progress),
          views: finalMetrics.views ? Math.floor(finalMetrics.views * progress) : undefined,
          engagementRate: finalMetrics.engagementRate ? Number((finalMetrics.engagementRate * progress).toFixed(2)) : undefined
        })
        
        if (currentStep >= steps) {
          setMetrics(finalMetrics)
          setIsAnimating(false)
          clearInterval(interval)
        }
      }, 50)
      
      return () => clearInterval(interval)
    } else {
      setMetrics(simulateEngagement(platform, content, characterCount, characterLimit))
    }
  }, [platform, content, characterCount, characterLimit, animated])

  if (!content || !metrics) {
    return null
  }

  const formatNumber = (num: number): string => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getPlatformColor = (platform: Platform): string => {
    switch (platform) {
      case 'Twitter': return 'text-blue-500'
      case 'LinkedIn': return 'text-blue-600'
      case 'Facebook': return 'text-blue-700'
      case 'Instagram': return 'text-pink-500'
      case 'TikTok': return 'text-black dark:text-white'
      default: return 'text-gray-500'
    }
  }

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <TrendingUp className={cn('h-4 w-4', getPlatformColor(platform))} />
          Engagement Simulation
          <Badge variant="outline" className="text-xs">{platform}</Badge>
        </CardTitle>
        {showDetails && metrics.engagementRate && (
          <CardDescription className="text-xs">
            Estimated engagement rate: {metrics.engagementRate}%
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Main Metrics */}
        <div className="grid grid-cols-3 gap-3">
          <div className="flex flex-col items-center p-3 rounded-lg bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
            <ThumbsUp className="h-5 w-5 text-red-500 mb-1" />
            <div className="text-lg font-bold text-red-700 dark:text-red-300">
              {formatNumber(metrics.likes)}
            </div>
            <div className="text-xs text-muted-foreground">Likes</div>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
            <MessageCircle className="h-5 w-5 text-blue-500 mb-1" />
            <div className="text-lg font-bold text-blue-700 dark:text-blue-300">
              {formatNumber(metrics.comments)}
            </div>
            <div className="text-xs text-muted-foreground">Comments</div>
          </div>
          
          <div className="flex flex-col items-center p-3 rounded-lg bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800">
            <Share2 className="h-5 w-5 text-green-500 mb-1" />
            <div className="text-lg font-bold text-green-700 dark:text-green-300">
              {formatNumber(metrics.shares)}
            </div>
            <div className="text-xs text-muted-foreground">Shares</div>
          </div>
        </div>

        {/* Additional Details */}
        {showDetails && (
          <>
            {metrics.views && (
              <div className="flex items-center justify-between p-2 rounded bg-muted">
                <div className="flex items-center gap-2">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Estimated Views</span>
                </div>
                <span className="text-sm font-semibold">{formatNumber(metrics.views)}</span>
              </div>
            )}
            
            {metrics.engagementRate && (
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Engagement Rate</span>
                  <span className="font-semibold">{metrics.engagementRate}%</span>
                </div>
                <Progress 
                  value={Math.min(metrics.engagementRate, 100)} 
                  className="h-2"
                />
              </div>
            )}
          </>
        )}

        {isAnimating && (
          <p className="text-xs text-center text-muted-foreground animate-pulse">
            Simulating engagement...
          </p>
        )}
      </CardContent>
    </Card>
  )
}

