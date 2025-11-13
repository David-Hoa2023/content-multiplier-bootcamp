'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Calendar, Clock, Send, AlertTriangle, Filter, Settings } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Derivative {
  id?: number
  platform: string
  content: string
  character_count?: number
  status?: string
}

interface SchedulingModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  derivatives: Derivative[]
  configuredPlatforms?: any[]
  onSchedule: (scheduleData: ScheduleData[]) => Promise<void>
}

interface ScheduleData {
  derivative_id: number
  platform: string
  scheduled_time: string
}

export function SchedulingModal({ 
  open, 
  onOpenChange, 
  derivatives, 
  configuredPlatforms = [],
  onSchedule 
}: SchedulingModalProps) {
  const { toast } = useToast()
  const [scheduling, setScheduling] = useState(false)
  const [scheduleTimes, setScheduleTimes] = useState<{ [key: string]: string }>({})
  const [selectedDerivatives, setSelectedDerivatives] = useState<Set<number>>(new Set())
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(new Set())
  const [showPlatformFilter, setShowPlatformFilter] = useState(false)

  // Initialize with current date/time + 1 hour
  const getDefaultDateTime = () => {
    const now = new Date()
    now.setHours(now.getHours() + 1)
    return now.toISOString().slice(0, 16) // Format for datetime-local input
  }

  const handleTimeChange = (derivativeId: number, time: string) => {
    setScheduleTimes(prev => ({
      ...prev,
      [derivativeId]: time
    }))
  }

  const toggleDerivativeSelection = (derivativeId: number) => {
    setSelectedDerivatives(prev => {
      const newSet = new Set(prev)
      if (newSet.has(derivativeId)) {
        newSet.delete(derivativeId)
      } else {
        newSet.add(derivativeId)
      }
      return newSet
    })
  }

  const handleScheduleAll = async () => {
    if (selectedDerivatives.size === 0) {
      toast({
        title: 'Không có nội dung nào được chọn',
        description: 'Vui lòng chọn ít nhất một nội dung để lên lịch.',
        variant: 'destructive'
      })
      return
    }

    // Validate all selected derivatives have scheduled times
    const scheduleData: ScheduleData[] = []
    for (const derivativeId of Array.from(selectedDerivatives)) {
      const scheduledTime = scheduleTimes[derivativeId]
      if (!scheduledTime) {
        toast({
          title: 'Thiếu thời gian lên lịch',
          description: 'Vui lòng chọn thời gian cho tất cả nội dung đã chọn.',
          variant: 'destructive'
        })
        return
      }

      const derivative = derivatives.find(d => d.id === derivativeId)
      if (derivative) {
        scheduleData.push({
          derivative_id: derivativeId,
          platform: derivative.platform,
          scheduled_time: new Date(scheduledTime).toISOString()
        })
      }
    }

    try {
      setScheduling(true)
      await onSchedule(scheduleData)
      onOpenChange(false)
      
      // Reset form
      setSelectedDerivatives(new Set())
      setScheduleTimes({})
      
      toast({
        title: 'Lên lịch thành công',
        description: `Đã lên lịch ${scheduleData.length} nội dung để xuất bản.`
      })
    } catch (error) {
      console.error('Error scheduling derivatives:', error)
      toast({
        title: 'Lỗi lên lịch',
        description: 'Không thể lên lịch xuất bản. Vui lòng thử lại.',
        variant: 'destructive'
      })
    } finally {
      setScheduling(false)
    }
  }

  const handleQuickSchedule = (minutes: number) => {
    const baseTime = new Date()
    baseTime.setMinutes(baseTime.getMinutes() + minutes)
    
    const filteredDerivatives = getFilteredDerivatives()
    filteredDerivatives.forEach((derivative, index) => {
      if (derivative.id && selectedDerivatives.has(derivative.id)) {
        const scheduleTime = new Date(baseTime)
        scheduleTime.setMinutes(scheduleTime.getMinutes() + (index * 30)) // 30 min gaps
        
        setScheduleTimes(prev => ({
          ...prev,
          [derivative.id!]: scheduleTime.toISOString().slice(0, 16)
        }))
      }
    })
  }

  const isValidTime = (time: string) => {
    if (!time) return false
    const selectedTime = new Date(time)
    const now = new Date()
    return selectedTime > now
  }

  // Get unique platforms from derivatives
  const getAvailablePlatforms = () => {
    return Array.from(new Set(derivatives.map(d => d.platform)))
  }

  // Filter derivatives based on selected platforms
  const getFilteredDerivatives = () => {
    if (selectedPlatforms.size === 0) return derivatives
    return derivatives.filter(d => selectedPlatforms.has(d.platform))
  }

  const togglePlatformSelection = (platform: string) => {
    setSelectedPlatforms(prev => {
      const newSet = new Set(prev)
      if (newSet.has(platform)) {
        newSet.delete(platform)
      } else {
        newSet.add(platform)
      }
      return newSet
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Lên lịch xuất bản
          </DialogTitle>
          <DialogDescription>
            Chọn thời gian xuất bản cho các nội dung trên từng platform
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Quick Schedule Options */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Lên lịch nhanh</Label>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSchedule(30)}
                disabled={selectedDerivatives.size === 0}
              >
                +30 phút
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSchedule(60)}
                disabled={selectedDerivatives.size === 0}
              >
                +1 giờ
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => handleQuickSchedule(24 * 60)}
                disabled={selectedDerivatives.size === 0}
              >
                +1 ngày
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  // Select all filtered derivatives
                  const filteredIds = getFilteredDerivatives().filter(d => d.id).map(d => d.id!)
                  setSelectedDerivatives(new Set(filteredIds))
                }}
              >
                Chọn tất cả
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowPlatformFilter(!showPlatformFilter)}
              >
                <Filter className="h-4 w-4 mr-1" />
                Lọc Platform
              </Button>
            </div>
          </div>

          {/* Platform Filter */}
          {showPlatformFilter && (
            <div className="space-y-3 border rounded-lg p-3 bg-muted/50">
              <Label className="text-sm font-medium">Lọc theo Platform</Label>
              <div className="flex flex-wrap gap-2">
                {getAvailablePlatforms().map(platform => (
                  <Button
                    key={platform}
                    type="button"
                    variant={selectedPlatforms.has(platform) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePlatformSelection(platform)}
                  >
                    {platform}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedPlatforms(new Set())}
                  disabled={selectedPlatforms.size === 0}
                >
                  Xóa bộ lọc
                </Button>
              </div>
              {selectedPlatforms.size > 0 && (
                <p className="text-sm text-muted-foreground">
                  Hiển thị {getFilteredDerivatives().length} / {derivatives.length} nội dung
                </p>
              )}
            </div>
          )}

          {/* Derivatives List */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Chọn nội dung và thời gian</Label>
            {getFilteredDerivatives().filter(d => d.id).map((derivative) => (
              <div
                key={derivative.id}
                className={`border rounded-lg p-4 space-y-3 transition-colors ${
                  selectedDerivatives.has(derivative.id!)
                    ? 'border-primary bg-primary/5'
                    : 'border-border'
                }`}
              >
                {/* Header with checkbox and platform */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedDerivatives.has(derivative.id!)}
                      onChange={() => toggleDerivativeSelection(derivative.id!)}
                      className="w-4 h-4"
                    />
                    <Badge variant="secondary">{derivative.platform}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {derivative.character_count} ký tự
                    </span>
                  </div>
                  {derivative.status === 'scheduled' && (
                    <Badge variant="outline" className="text-blue-600">
                      Đã lên lịch
                    </Badge>
                  )}
                </div>

                {/* Content preview */}
                <div className="text-sm bg-muted p-2 rounded text-ellipsis overflow-hidden">
                  {derivative.content.length > 100
                    ? derivative.content.substring(0, 100) + '...'
                    : derivative.content
                  }
                </div>

                {/* Time picker */}
                {selectedDerivatives.has(derivative.id!) && (
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <Input
                      type="datetime-local"
                      value={scheduleTimes[derivative.id!] || getDefaultDateTime()}
                      onChange={(e) => handleTimeChange(derivative.id!, e.target.value)}
                      className="flex-1"
                      min={new Date().toISOString().slice(0, 16)}
                    />
                    {scheduleTimes[derivative.id!] && !isValidTime(scheduleTimes[derivative.id!]) && (
                      <div className="flex items-center gap-1 text-red-500 text-sm">
                        <AlertTriangle className="h-4 w-4" />
                        Thời gian phải sau hiện tại
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>

          {getFilteredDerivatives().filter(d => d.id).length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              {selectedPlatforms.size > 0 
                ? "Không có nội dung nào cho platform đã chọn" 
                : "Không có nội dung nào để lên lịch"
              }
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-between">
          <div className="text-sm text-muted-foreground">
            {selectedDerivatives.size > 0 && (
              <span>Đã chọn {selectedDerivatives.size} nội dung</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={scheduling}
            >
              Hủy
            </Button>
            <Button
              type="button"
              onClick={handleScheduleAll}
              disabled={scheduling || selectedDerivatives.size === 0}
              className="flex items-center gap-2"
            >
              <Send className="h-4 w-4" />
              {scheduling ? 'Đang lên lịch...' : `Lên lịch (${selectedDerivatives.size})`}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}