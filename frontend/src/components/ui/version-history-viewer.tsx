'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  History,
  RotateCcw,
  Clock,
  User,
  ChevronDown,
  ChevronRight,
  FileText,
  Search,
  CalendarDays,
  GitCompare,
  AlertTriangle
} from 'lucide-react'

export interface Version {
  version: number
  changed_by: string
  timestamp: string
  content: string
  id?: string
}

export interface VersionHistoryViewerProps {
  versions: Version[]
  currentVersion?: number
  onRestore: (version: Version) => void
  className?: string
}

interface DiffChunk {
  type: 'added' | 'removed' | 'unchanged'
  content: string
}

export function VersionHistoryViewer({
  versions,
  currentVersion = 1,
  onRestore,
  className = ''
}: VersionHistoryViewerProps) {
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set([currentVersion]))
  const [compareMode, setCompareMode] = useState(false)
  const [selectedVersions, setSelectedVersions] = useState<[number, number] | null>(null)
  const [restoreDialogOpen, setRestoreDialogOpen] = useState(false)
  const [versionToRestore, setVersionToRestore] = useState<Version | null>(null)
  const [userFilter, setUserFilter] = useState<string>('all')
  const [dateFilter, setDateFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const { toast } = useToast()

  // Get unique users for filter
  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(versions.map(v => v.changed_by)))
  }, [versions])

  // Filter versions based on search and filters
  const filteredVersions = useMemo(() => {
    return versions.filter(version => {
      const matchesUser = !userFilter || userFilter === 'all' || version.changed_by === userFilter
      const matchesSearch = !searchFilter || 
        version.content.toLowerCase().includes(searchFilter.toLowerCase()) ||
        version.changed_by.toLowerCase().includes(searchFilter.toLowerCase())
      
      let matchesDate = true
      if (dateFilter) {
        const versionDate = new Date(version.timestamp)
        const filterDate = new Date(dateFilter)
        // Show versions from selected date onwards
        matchesDate = versionDate >= filterDate
      }
      
      return matchesUser && matchesSearch && matchesDate
    })
  }, [versions, userFilter, searchFilter, dateFilter])

  // Simple diff algorithm
  const generateDiff = (text1: string, text2: string): DiffChunk[] => {
    const words1 = text1.split(/\s+/)
    const words2 = text2.split(/\s+/)
    const chunks: DiffChunk[] = []
    
    let i = 0, j = 0
    while (i < words1.length || j < words2.length) {
      if (i >= words1.length) {
        chunks.push({ type: 'added', content: words2.slice(j).join(' ') })
        break
      }
      if (j >= words2.length) {
        chunks.push({ type: 'removed', content: words1.slice(i).join(' ') })
        break
      }
      
      if (words1[i] === words2[j]) {
        let start = i
        while (i < words1.length && j < words2.length && words1[i] === words2[j]) {
          i++
          j++
        }
        chunks.push({ type: 'unchanged', content: words1.slice(start, i).join(' ') })
      } else {
        // Find next common word
        let found = false
        for (let k = i + 1; k < Math.min(words1.length, i + 10); k++) {
          for (let l = j + 1; l < Math.min(words2.length, j + 10); l++) {
            if (words1[k] === words2[l]) {
              chunks.push({ type: 'removed', content: words1.slice(i, k).join(' ') })
              chunks.push({ type: 'added', content: words2.slice(j, l).join(' ') })
              i = k
              j = l
              found = true
              break
            }
          }
          if (found) break
        }
        
        if (!found) {
          chunks.push({ type: 'removed', content: words1[i] })
          chunks.push({ type: 'added', content: words2[j] })
          i++
          j++
        }
      }
    }
    
    return chunks
  }

  const toggleExpansion = (version: number) => {
    const newExpanded = new Set(expandedVersions)
    if (newExpanded.has(version)) {
      newExpanded.delete(version)
    } else {
      newExpanded.add(version)
    }
    setExpandedVersions(newExpanded)
  }

  const handleRestore = (version: Version) => {
    setVersionToRestore(version)
    setRestoreDialogOpen(true)
  }

  const confirmRestore = () => {
    if (versionToRestore) {
      onRestore(versionToRestore)
      setRestoreDialogOpen(false)
      setVersionToRestore(null)
      toast({
        title: "Phiên bản đã được khôi phục",
        description: `Đã khôi phục về phiên bản v${versionToRestore.version}`,
      })
    }
  }

  const handleCompare = (version1: number, version2: number) => {
    setSelectedVersions([Math.min(version1, version2), Math.max(version1, version2)])
    setCompareMode(true)
  }

  const getDiffView = () => {
    if (!selectedVersions) return null
    
    const [v1, v2] = selectedVersions
    const version1 = versions.find(v => v.version === v1)
    const version2 = versions.find(v => v.version === v2)
    
    if (!version1 || !version2) return null
    
    const diff = generateDiff(version1.content, version2.content)
    
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <GitCompare className="h-5 w-5" />
            So sánh v{v1} và v{v2}
          </h3>
          <Button variant="outline" onClick={() => setCompareMode(false)}>
            Đóng
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">v{v1} - {version1.changed_by}</CardTitle>
              <CardDescription>{new Date(version1.timestamp).toLocaleString('vi-VN')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-40">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {version1.content}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">v{v2} - {version2.changed_by}</CardTitle>
              <CardDescription>{new Date(version2.timestamp).toLocaleString('vi-VN')}</CardDescription>
            </CardHeader>
            <CardContent className="pt-0">
              <ScrollArea className="h-40">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {version2.content}
                </p>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Thay đổi</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-60">
              <div className="space-y-1">
                {diff.map((chunk, index) => (
                  <span
                    key={index}
                    className={`inline ${
                      chunk.type === 'added'
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : chunk.type === 'removed'
                        ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        : ''
                    }`}
                  >
                    {chunk.content}{' '}
                  </span>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    } catch {
      return timestamp
    }
  }

  const truncateContent = (content: string, maxLength: number = 300) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  if (compareMode && selectedVersions) {
    return (
      <div className={`space-y-6 ${className}`}>
        {getDiffView()}
      </div>
    )
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            <h2 className="text-xl font-semibold">Lịch sử phiên bản</h2>
            <Badge variant="secondary">{filteredVersions.length} phiên bản</Badge>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base">Bộ lọc</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Tìm kiếm</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm trong nội dung hoặc người chỉnh sửa..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Người chỉnh sửa</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tất cả người dùng" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả người dùng</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>{user}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Từ ngày</label>
                <Input
                  type="date"
                  value={dateFilter}
                  onChange={(e) => setDateFilter(e.target.value)}
                />
              </div>
            </div>
            
            {(searchFilter || (userFilter && userFilter !== 'all') || dateFilter) && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchFilter('')
                    setUserFilter('all')
                    setDateFilter('')
                  }}
                >
                  Xóa bộ lọc
                </Button>
                <span className="text-sm text-muted-foreground">
                  Hiển thị {filteredVersions.length} / {versions.length} phiên bản
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Version List */}
        <div className="space-y-4">
          {filteredVersions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Không tìm thấy phiên bản</h3>
                <p className="text-muted-foreground text-center">
                  Thử điều chỉnh bộ lọc để hiển thị thêm phiên bản
                </p>
              </CardContent>
            </Card>
          ) : (
            filteredVersions.map((version, index) => (
              <motion.div
                key={version.version}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleExpansion(version.version)}
                          className="p-1 h-6 w-6"
                        >
                          {expandedVersions.has(version.version) ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </Button>
                        
                        <div className="flex items-center gap-2">
                          <Badge variant={version.version === currentVersion ? 'default' : 'secondary'}>
                            v{version.version}
                          </Badge>
                          {version.version === currentVersion && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900 dark:text-green-100">
                              Hiện tại
                            </Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{version.changed_by}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(version.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        {filteredVersions.length > 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  const otherVersion = filteredVersions.find(v => v.version !== version.version)
                                  if (otherVersion) {
                                    handleCompare(version.version, otherVersion.version)
                                  }
                                }}
                              >
                                <GitCompare className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>So sánh phiên bản</TooltipContent>
                          </Tooltip>
                        )}
                        
                        {version.version !== currentVersion && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleRestore(version)}
                              >
                                <RotateCcw className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Khôi phục phiên bản này</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  
                  <AnimatePresence>
                    {expandedVersions.has(version.version) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3 }}
                      >
                        <Separator />
                        <CardContent className="pt-4">
                          <div className="space-y-3">
                            <div className="flex items-center gap-2">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm font-medium">Nội dung:</span>
                            </div>
                            <ScrollArea className="h-40 w-full rounded border p-3">
                              <p className="text-sm whitespace-pre-wrap">
                                {version.content}
                              </p>
                            </ScrollArea>
                          </div>
                        </CardContent>
                      </motion.div>
                    )}
                  </AnimatePresence>
                  
                  {!expandedVersions.has(version.version) && (
                    <CardContent className="pt-0">
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {truncateContent(version.content)}
                      </p>
                    </CardContent>
                  )}
                </Card>
              </motion.div>
            ))
          )}
        </div>

        {/* Restore Confirmation Dialog */}
        <Dialog open={restoreDialogOpen} onOpenChange={setRestoreDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-orange-500" />
                Xác nhận khôi phục
              </DialogTitle>
              <DialogDescription>
                Bạn có chắc chắn muốn khôi phục về phiên bản v{versionToRestore?.version}?
                Hành động này sẽ thay thế nội dung hiện tại.
              </DialogDescription>
            </DialogHeader>
            
            {versionToRestore && (
              <div className="space-y-4">
                <div className="bg-muted rounded-lg p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge>v{versionToRestore.version}</Badge>
                    <span className="text-sm text-muted-foreground">
                      {versionToRestore.changed_by} • {formatTimestamp(versionToRestore.timestamp)}
                    </span>
                  </div>
                  <ScrollArea className="h-32">
                    <p className="text-sm">
                      {truncateContent(versionToRestore.content, 200)}
                    </p>
                  </ScrollArea>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setRestoreDialogOpen(false)}>
                Hủy
              </Button>
              <Button onClick={confirmRestore}>
                Khôi phục
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}