'use client'

import * as React from 'react'
import { Download, FileText, Calendar, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

export interface Derivative {
  id?: string
  title: string
  platform: 'Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok'
  content: string
  scheduledDate?: Date | string
  status?: 'draft' | 'scheduled' | 'published'
}

export interface ExportOptionsProps {
  derivatives: Derivative[]
  packId?: string
  packTitle?: string
  className?: string
  onExportCSV?: (derivatives: Derivative[]) => void
  onExportICS?: (derivatives: Derivative[]) => void
}

export function ExportOptions({
  derivatives,
  packId,
  packTitle,
  className,
  onExportCSV,
  onExportICS
}: ExportOptionsProps) {
  const [isExporting, setIsExporting] = React.useState(false)

  const handleExportCSV = () => {
    if (derivatives.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Không có derivatives để export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // Prepare CSV data
      const csvHeaders = ['Title', 'Platform', 'Content', 'Scheduled Date', 'Status']
      const csvRows = derivatives.map(derivative => {
        const scheduledDate = derivative.scheduledDate
          ? format(new Date(derivative.scheduledDate), 'yyyy-MM-dd HH:mm:ss')
          : ''
        
        return [
          derivative.title || '',
          derivative.platform,
          derivative.content.replace(/\n/g, ' ').replace(/,/g, ';'),
          scheduledDate,
          derivative.status || 'draft'
        ]
      })

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n')

      // Create and download file
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `derivatives-${packId || 'export'}-${format(new Date(), 'yyyy-MM-dd')}.csv`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export thành công",
        description: `${derivatives.length} derivatives đã được export sang CSV.`,
      })

      onExportCSV?.(derivatives)
    } catch (error) {
      console.error('Export CSV error:', error)
      toast({
        title: "Lỗi export",
        description: "Không thể export CSV. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const handleExportICS = () => {
    if (derivatives.length === 0) {
      toast({
        title: "Không có dữ liệu",
        description: "Không có derivatives để export.",
        variant: "destructive",
      })
      return
    }

    setIsExporting(true)

    try {
      // Filter derivatives with scheduled dates
      const scheduledDerivatives = derivatives.filter(d => d.scheduledDate)
      
      if (scheduledDerivatives.length === 0) {
        toast({
          title: "Không có lịch",
          description: "Không có derivatives nào có scheduled date để export.",
          variant: "destructive",
        })
        setIsExporting(false)
        return
      }

      // Generate ICS content
      const formatICSDate = (date: Date | string): string => {
        const d = typeof date === 'string' ? new Date(date) : date
        return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
      }

      const icsEvents = scheduledDerivatives.map(derivative => {
        const startDate = new Date(derivative.scheduledDate!)
        const endDate = new Date(startDate.getTime() + 30 * 60 * 1000) // 30 minutes duration

        return [
          'BEGIN:VEVENT',
          `UID:${derivative.id || `derivative-${Date.now()}-${Math.random()}`}@contenthub.com`,
          `DTSTART:${formatICSDate(startDate)}`,
          `DTEND:${formatICSDate(endDate)}`,
          `SUMMARY:${derivative.title || `Publish to ${derivative.platform}`}`,
          `DESCRIPTION:Platform: ${derivative.platform}\\nContent: ${derivative.content.substring(0, 200).replace(/\n/g, ' ')}`,
          `LOCATION:${derivative.platform}`,
          `CATEGORIES:${derivative.platform},Content Publishing`,
          `STATUS:CONFIRMED`,
          `CREATED:${formatICSDate(new Date())}`,
          `LAST-MODIFIED:${formatICSDate(new Date())}`,
          'END:VEVENT'
        ].join('\r\n')
      })

      const icsContent = [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//ContentHub//Derivatives Export//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        ...icsEvents,
        'END:VCALENDAR'
      ].join('\r\n')

      // Create and download file
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `publish-schedule-${packId || 'export'}-${format(new Date(), 'yyyy-MM-dd')}.ics`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      toast({
        title: "Export thành công",
        description: `${scheduledDerivatives.length} events đã được export sang iCalendar.`,
      })

      onExportICS?.(scheduledDerivatives)
    } catch (error) {
      console.error('Export ICS error:', error)
      toast({
        title: "Lỗi export",
        description: "Không thể export ICS. Vui lòng thử lại.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const hasScheduled = derivatives.some(d => d.scheduledDate)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          disabled={isExporting || derivatives.length === 0}
          className={cn("gap-2", className)}
        >
          <Download className="h-4 w-4" />
          {isExporting ? 'Đang export...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem
          onClick={handleExportCSV}
          disabled={isExporting || derivatives.length === 0}
          className="gap-2"
        >
          <FileText className="h-4 w-4" />
          <div className="flex flex-col">
            <span>Export CSV</span>
            <span className="text-xs text-muted-foreground">
              {derivatives.length} derivatives
            </span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={handleExportICS}
          disabled={isExporting || !hasScheduled}
          className="gap-2"
        >
          <Calendar className="h-4 w-4" />
          <div className="flex flex-col">
            <span>Export Calendar</span>
            <span className="text-xs text-muted-foreground">
              {derivatives.filter(d => d.scheduledDate).length} scheduled
            </span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}





