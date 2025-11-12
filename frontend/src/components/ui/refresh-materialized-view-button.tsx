'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  RefreshCcw,
  Database,
  Clock,
  CheckCircle2,
  AlertCircle,
  ChevronDown
} from 'lucide-react'

export interface MaterializedView {
  id: string
  name: string
  displayName: string
  description: string
}

export interface RefreshMaterializedViewButtonProps {
  onRefresh: (viewId?: string) => Promise<void>
  views?: MaterializedView[]
  defaultView?: string
  cooldownSeconds?: number
  showLastRefresh?: boolean
  variant?: 'default' | 'outline' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

const defaultViews: MaterializedView[] = [
  {
    id: 'mv_pack_kpis',
    name: 'mv_pack_kpis',
    displayName: 'Pack KPIs',
    description: 'Materialized view tổng hợp KPIs của các content pack'
  },
  {
    id: 'mv_content_metrics',
    name: 'mv_content_metrics',
    displayName: 'Content Metrics',
    description: 'Materialized view metrics của content'
  },
  {
    id: 'mv_user_analytics',
    name: 'mv_user_analytics',
    displayName: 'User Analytics',
    description: 'Materialized view phân tích người dùng'
  }
]

export function RefreshMaterializedViewButton({
  onRefresh,
  views = defaultViews,
  defaultView,
  cooldownSeconds = 10,
  showLastRefresh = true,
  variant = 'outline',
  size = 'sm',
  className = ''
}: RefreshMaterializedViewButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [selectedView, setSelectedView] = useState<string>(defaultView || views[0]?.id || 'mv_pack_kpis')
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const { toast } = useToast()

  // Cooldown timer effect
  useEffect(() => {
    if (cooldownRemaining > 0) {
      const timer = setTimeout(() => {
        setCooldownRemaining(prev => prev - 1)
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [cooldownRemaining])

  const handleRefresh = async () => {
    if (isLoading || cooldownRemaining > 0) return

    setIsLoading(true)

    try {
      await onRefresh(selectedView)
      
      const now = new Date()
      setLastRefresh(now)
      setCooldownRemaining(cooldownSeconds)

      const selectedViewData = views.find(v => v.id === selectedView)
      
      toast({
        title: "✅ Cập nhật thành công!",
        description: `${selectedViewData?.displayName || 'Materialized view'} đã được refresh lúc ${now.toLocaleTimeString('vi-VN')}`,
        duration: 3000,
      })
    } catch (error) {
      console.error('Refresh error:', error)
      
      toast({
        title: "❌ Lỗi khi cập nhật",
        description: error instanceof Error ? error.message : "Không thể refresh materialized view. Vui lòng thử lại.",
        variant: "destructive",
        duration: 5000,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const formatLastRefresh = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMinutes = Math.floor(diffMs / 60000)
    const diffSeconds = Math.floor(diffMs / 1000)

    if (diffSeconds < 60) {
      return `${diffSeconds} giây trước`
    } else if (diffMinutes < 60) {
      return `${diffMinutes} phút trước`
    } else {
      return date.toLocaleTimeString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    }
  }

  const getTooltipContent = () => {
    const selectedViewData = views.find(v => v.id === selectedView)
    
    if (cooldownRemaining > 0) {
      return `Vui lòng đợi ${cooldownRemaining} giây trước khi refresh lại`
    }
    
    if (selectedViewData) {
      return selectedViewData.description
    }
    
    return "Cập nhật dữ liệu tổng hợp từ database"
  }

  const isDisabled = isLoading || cooldownRemaining > 0

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-2 ${className}`}>
        {views.length > 1 && (
          <Select value={selectedView} onValueChange={setSelectedView} disabled={isLoading}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {views.map(view => (
                <SelectItem key={view.id} value={view.id}>
                  <div className="flex items-center gap-2">
                    <Database className="h-3 w-3" />
                    {view.displayName}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={variant}
              size={size}
              onClick={handleRefresh}
              disabled={isDisabled}
              className="gap-2 relative overflow-hidden"
            >
              <motion.div
                animate={isLoading ? { rotate: 360 } : { rotate: 0 }}
                transition={isLoading ? { duration: 1, repeat: Infinity, ease: "linear" } : {}}
              >
                <RefreshCcw className="h-4 w-4" />
              </motion.div>
              
              {views.length === 1 ? (
                <>
                  {isLoading ? 'Đang cập nhật...' : cooldownRemaining > 0 ? `Đợi ${cooldownRemaining}s` : 'Refresh KPIs'}
                </>
              ) : (
                <>
                  {isLoading ? 'Đang cập nhật...' : cooldownRemaining > 0 ? `Đợi ${cooldownRemaining}s` : 'Refresh'}
                </>
              )}
              
              {/* Loading overlay */}
              {isLoading && (
                <motion.div
                  className="absolute inset-0 bg-primary/10 backdrop-blur-sm"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent side="bottom" className="max-w-xs">
            <p>{getTooltipContent()}</p>
          </TooltipContent>
        </Tooltip>

        {showLastRefresh && lastRefresh && (
          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-1 text-xs text-muted-foreground"
          >
            <Clock className="h-3 w-3" />
            <span>Cập nhật {formatLastRefresh(lastRefresh)}</span>
          </motion.div>
        )}

        {/* Status indicator */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="flex items-center"
        >
          {isLoading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCcw className="h-3 w-3 text-blue-500" />
            </motion.div>
          ) : lastRefresh ? (
            <Tooltip>
              <TooltipTrigger>
                <CheckCircle2 className="h-3 w-3 text-green-500" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Lần refresh cuối: {lastRefresh.toLocaleString('vi-VN')}</p>
              </TooltipContent>
            </Tooltip>
          ) : cooldownRemaining > 0 ? (
            <Tooltip>
              <TooltipTrigger>
                <AlertCircle className="h-3 w-3 text-yellow-500" />
              </TooltipTrigger>
              <TooltipContent side="bottom">
                <p>Cooldown: {cooldownRemaining} giây</p>
              </TooltipContent>
            </Tooltip>
          ) : null}
        </motion.div>
      </div>
    </TooltipProvider>
  )
}