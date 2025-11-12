'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/hooks/use-toast'
import {
  Download,
  Calendar,
  FileSpreadsheet,
  Filter,
  Search,
  Edit3,
  Check,
  X,
  TwitterIcon as Twitter,
  Linkedin,
  Mail,
  FileText,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react'

export interface ScheduleItem {
  id?: string
  title: string
  platform: 'Twitter' | 'LinkedIn' | 'Email' | 'Blog' | 'SEO'
  scheduled_date: string
  status: 'pending' | 'published' | 'failed'
}

export interface DistributionCalendarExportProps {
  schedule: ScheduleItem[]
  packId: string
  onExportCSV: (selectedItems?: ScheduleItem[]) => void
  onExportICS: (selectedItems?: ScheduleItem[]) => void
  onUpdateDate?: (itemId: string, newDate: string) => void
  className?: string
}

export function DistributionCalendarExport({
  schedule,
  packId,
  onExportCSV,
  onExportICS,
  onUpdateDate,
  className = ''
}: DistributionCalendarExportProps) {
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
  const [editingDate, setEditingDate] = useState<string | null>(null)
  const [tempDate, setTempDate] = useState<string>('')
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const { toast } = useToast()

  // Add IDs to schedule items if they don't have them
  const scheduleWithIds = useMemo(() => {
    return schedule.map((item, index) => ({
      ...item,
      id: item.id || `item-${index}`
    }))
  }, [schedule])

  // Filter schedule items
  const filteredSchedule = useMemo(() => {
    return scheduleWithIds.filter(item => {
      const matchesPlatform = platformFilter === 'all' || item.platform === platformFilter
      const matchesStatus = statusFilter === 'all' || item.status === statusFilter
      const matchesSearch = !searchFilter || 
        item.title.toLowerCase().includes(searchFilter.toLowerCase())
      
      return matchesPlatform && matchesStatus && matchesSearch
    })
  }, [scheduleWithIds, platformFilter, statusFilter, searchFilter])

  // Get unique platforms for filter
  const uniquePlatforms = useMemo(() => {
    return Array.from(new Set(scheduleWithIds.map(item => item.platform)))
  }, [scheduleWithIds])

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(new Set(filteredSchedule.map(item => item.id!)))
    } else {
      setSelectedItems(new Set())
    }
  }

  const handleSelectItem = (itemId: string, checked: boolean) => {
    const newSelected = new Set(selectedItems)
    if (checked) {
      newSelected.add(itemId)
    } else {
      newSelected.delete(itemId)
    }
    setSelectedItems(newSelected)
  }

  const handleEditDate = (itemId: string, currentDate: string) => {
    setEditingDate(itemId)
    setTempDate(currentDate)
  }

  const handleSaveDate = (itemId: string) => {
    if (onUpdateDate && tempDate) {
      onUpdateDate(itemId, tempDate)
      toast({
        title: "Ngày đã được cập nhật",
        description: "Lịch phân phối đã được cập nhật thành công",
      })
    }
    setEditingDate(null)
    setTempDate('')
  }

  const handleCancelEdit = () => {
    setEditingDate(null)
    setTempDate('')
  }

  const handleExportCSV = (selectedOnly = false) => {
    const itemsToExport = selectedOnly && selectedItems.size > 0
      ? filteredSchedule.filter(item => selectedItems.has(item.id!))
      : filteredSchedule
    
    onExportCSV(itemsToExport)
    toast({
      title: "Export CSV thành công",
      description: `${itemsToExport.length} items đã được export sang CSV`,
    })
  }

  const handleExportICS = (selectedOnly = false) => {
    const itemsToExport = selectedOnly && selectedItems.size > 0
      ? filteredSchedule.filter(item => selectedItems.has(item.id!))
      : filteredSchedule
    
    onExportICS(itemsToExport)
    toast({
      title: "Export Calendar thành công",
      description: `${itemsToExport.length} events đã được export sang iCalendar`,
    })
  }

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'Twitter': return <Twitter className="h-4 w-4" />
      case 'LinkedIn': return <Linkedin className="h-4 w-4" />
      case 'Email': return <Mail className="h-4 w-4" />
      case 'Blog': return <FileText className="h-4 w-4" />
      case 'SEO': return <Globe className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case 'published':
        return (
          <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
            <CheckCircle className="h-3 w-3 mr-1" />
            Published
          </Badge>
        )
      case 'failed':
        return (
          <Badge variant="destructive" className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">
            <XCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      default:
        return (
          <Badge variant="outline">
            <AlertCircle className="h-3 w-3 mr-1" />
            Unknown
          </Badge>
        )
    }
  }

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const isAllSelected = filteredSchedule.length > 0 && 
    filteredSchedule.every(item => selectedItems.has(item.id!))
  const isSomeSelected = selectedItems.size > 0 && !isAllSelected

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header with Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Distribution Calendar</h3>
            <p className="text-sm text-muted-foreground">
              Content pack: {packId} • {filteredSchedule.length} items
              {selectedItems.size > 0 && ` • ${selectedItems.size} selected`}
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            {selectedItems.size > 0 && (
              <>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportCSV(true)}
                      className="gap-2"
                    >
                      <FileSpreadsheet className="h-4 w-4" />
                      Export Selected CSV
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tải xuống items đã chọn định dạng CSV</TooltipContent>
                </Tooltip>
                
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleExportICS(true)}
                      className="gap-2"
                    >
                      <Calendar className="h-4 w-4" />
                      Export Selected ICS
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Tải xuống events đã chọn định dạng iCalendar</TooltipContent>
                </Tooltip>
                
                <Separator orientation="vertical" className="h-6" />
              </>
            )}
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportCSV(false)}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tải xuống định dạng CSV</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleExportICS(false)}
                  className="gap-2"
                >
                  <Calendar className="h-4 w-4" />
                  Export Calendar (.ics)
                </Button>
              </TooltipTrigger>
              <TooltipContent>Tải xuống định dạng iCalendar</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Bộ lọc
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm theo tiêu đề..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Platform</label>
                <Select value={platformFilter} onValueChange={setPlatformFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả platforms</SelectItem>
                    {uniquePlatforms.map(platform => (
                      <SelectItem key={platform} value={platform}>
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(platform)}
                          {platform}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Trạng thái</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả trạng thái" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả trạng thái</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchFilter || platformFilter !== 'all' || statusFilter !== 'all') && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchFilter('')
                    setPlatformFilter('all')
                    setStatusFilter('all')
                  }}
                >
                  Xóa bộ lọc
                </Button>
                <span className="text-sm text-muted-foreground">
                  Hiển thị {filteredSchedule.length} / {scheduleWithIds.length} items
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardContent className="p-0">
            <ScrollArea className="w-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={isAllSelected}
                          indeterminate={isSomeSelected}
                          onCheckedChange={handleSelectAll}
                        />
                      </TableHead>
                      <TableHead>Content Title</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Scheduled Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="w-20">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {filteredSchedule.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-12">
                            <div className="flex flex-col items-center gap-2">
                              <Calendar className="h-12 w-12 text-muted-foreground" />
                              <h3 className="text-lg font-semibold">Không có dữ liệu</h3>
                              <p className="text-muted-foreground">
                                Không tìm thấy items nào với bộ lọc hiện tại
                              </p>
                            </div>
                          </TableCell>
                        </TableRow>
                      ) : (
                        filteredSchedule.map((item, index) => (
                          <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ delay: index * 0.05 }}
                            className="hover:bg-muted/50"
                          >
                            <TableCell>
                              <Checkbox
                                checked={selectedItems.has(item.id!)}
                                onCheckedChange={(checked) => 
                                  handleSelectItem(item.id!, checked as boolean)
                                }
                              />
                            </TableCell>
                            <TableCell className="font-medium max-w-xs">
                              <div className="truncate" title={item.title}>
                                {item.title}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                {getPlatformIcon(item.platform)}
                                <span>{item.platform}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              {editingDate === item.id ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="datetime-local"
                                    value={tempDate}
                                    onChange={(e) => setTempDate(e.target.value)}
                                    className="w-48"
                                  />
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={() => handleSaveDate(item.id!)}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2 group">
                                  <span>{formatDate(item.scheduled_date)}</span>
                                  {onUpdateDate && (
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                      onClick={() => handleEditDate(item.id!, item.scheduled_date)}
                                    >
                                      <Edit3 className="h-3 w-3" />
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(item.status)}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleExportCSV([item])}
                                    >
                                      <FileSpreadsheet className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Export item này sang CSV</TooltipContent>
                                </Tooltip>
                                
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      onClick={() => handleExportICS([item])}
                                    >
                                      <Calendar className="h-3 w-3" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent>Export event này sang iCalendar</TooltipContent>
                                </Tooltip>
                              </div>
                            </TableCell>
                          </motion.tr>
                        ))
                      )}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </motion.div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredSchedule.length}
              </div>
              <p className="text-xs text-muted-foreground">Total Items</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">
                {filteredSchedule.filter(item => item.status === 'pending').length}
              </div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">
                {filteredSchedule.filter(item => item.status === 'published').length}
              </div>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">
                {filteredSchedule.filter(item => item.status === 'failed').length}
              </div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}