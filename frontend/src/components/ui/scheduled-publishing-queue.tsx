'use client'

import { useState, useMemo, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import {
  Clock,
  RotateCcw,
  X,
  Filter,
  Download,
  FileSpreadsheet,
  Calendar,
  Timer,
  RefreshCw,
  Edit3,
  Check,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Twitter,
  Linkedin,
  Mail,
  FileText,
  Search,
  Rss
} from 'lucide-react'

export interface ScheduledPost {
  post_id: string
  title: string
  platform: 'Twitter' | 'LinkedIn' | 'Email' | 'Blog' | 'SEO'
  scheduled_for: string
  status: 'pending' | 'published' | 'failed'
  content?: string
  error_message?: string
}

export interface ScheduledPublishingQueueProps {
  posts: ScheduledPost[]
  onRetry?: (postId: string) => void
  onCancel?: (postId: string) => void
  onReschedule?: (postId: string, newTime: string) => void
  onExportCSV?: () => void
  className?: string
}

const platformConfig = {
  Twitter: {
    icon: <Twitter className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  LinkedIn: {
    icon: <Linkedin className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  Email: {
    icon: <Mail className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  },
  Blog: {
    icon: <FileText className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
  },
  SEO: {
    icon: <Rss className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
  }
}

const statusConfig = {
  pending: {
    icon: <Clock className="h-3 w-3" />,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    label: 'Pending'
  },
  published: {
    icon: <CheckCircle2 className="h-3 w-3" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    label: 'Published'
  },
  failed: {
    icon: <XCircle className="h-3 w-3" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    label: 'Failed'
  }
}

export function ScheduledPublishingQueue({
  posts,
  onRetry,
  onCancel,
  onReschedule,
  onExportCSV,
  className = ''
}: ScheduledPublishingQueueProps) {
  const [platformFilter, setPlatformFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [editingPost, setEditingPost] = useState<string | null>(null)
  const [newScheduleTime, setNewScheduleTime] = useState<string>('')
  const [currentTime, setCurrentTime] = useState(new Date())
  const { toast } = useToast()

  // Update current time every second for countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  // Get unique platforms for filtering
  const uniquePlatforms = useMemo(() => {
    return Array.from(new Set(posts.map(post => post.platform)))
  }, [posts])

  // Filter posts
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesPlatform = platformFilter === 'all' || post.platform === platformFilter
      const matchesStatus = statusFilter === 'all' || post.status === statusFilter
      const matchesSearch = !searchFilter || 
        post.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
        post.post_id.toLowerCase().includes(searchFilter.toLowerCase())
      
      return matchesPlatform && matchesStatus && matchesSearch
    })
  }, [posts, platformFilter, statusFilter, searchFilter])

  // Sort posts by scheduled time
  const sortedPosts = useMemo(() => {
    return [...filteredPosts].sort((a, b) => 
      new Date(a.scheduled_for).getTime() - new Date(b.scheduled_for).getTime()
    )
  }, [filteredPosts])

  const handleRetry = (post: ScheduledPost) => {
    if (onRetry) {
      onRetry(post.post_id)
      toast({
        title: "Post Retry",
        description: `Retrying to publish "${post.title}" on ${post.platform}`,
      })
    }
  }

  const handleCancel = (post: ScheduledPost) => {
    if (onCancel) {
      onCancel(post.post_id)
      toast({
        title: "Post Cancelled",
        description: `Cancelled scheduled post "${post.title}"`,
        variant: "destructive",
      })
    }
  }

  const handleReschedule = (post: ScheduledPost) => {
    if (onReschedule && newScheduleTime) {
      onReschedule(post.post_id, newScheduleTime)
      setEditingPost(null)
      setNewScheduleTime('')
      toast({
        title: "Post Rescheduled",
        description: `"${post.title}" rescheduled to ${new Date(newScheduleTime).toLocaleString('vi-VN')}`,
      })
    }
  }

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV()
    } else {
      // Default CSV export
      const csvContent = [
        ['Post ID', 'Title', 'Platform', 'Scheduled For', 'Status', 'Error Message'],
        ...sortedPosts.map(post => [
          post.post_id,
          post.title,
          post.platform,
          post.scheduled_for,
          post.status,
          post.error_message || ''
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `scheduled-posts-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "CSV Export",
        description: "Publishing queue exported to CSV successfully",
      })
    }
  }

  const formatDateTime = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return dateString
    }
  }

  const getCountdown = (scheduledFor: string) => {
    try {
      const scheduledTime = new Date(scheduledFor)
      const diff = scheduledTime.getTime() - currentTime.getTime()
      
      if (diff <= 0) {
        return 'Overdue'
      }
      
      const days = Math.floor(diff / (1000 * 60 * 60 * 24))
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)
      
      if (days > 0) return `${days}d ${hours}h`
      if (hours > 0) return `${hours}h ${minutes}m`
      if (minutes > 0) return `${minutes}m ${seconds}s`
      return `${seconds}s`
    } catch {
      return 'Invalid date'
    }
  }

  const startEdit = (post: ScheduledPost) => {
    setEditingPost(post.post_id)
    setNewScheduleTime(new Date(post.scheduled_for).toISOString().slice(0, 16))
  }

  const cancelEdit = () => {
    setEditingPost(null)
    setNewScheduleTime('')
  }

  // Statistics
  const stats = useMemo(() => {
    const total = filteredPosts.length
    const pending = filteredPosts.filter(p => p.status === 'pending').length
    const published = filteredPosts.filter(p => p.status === 'published').length
    const failed = filteredPosts.filter(p => p.status === 'failed').length
    
    return { total, pending, published, failed }
  }, [filteredPosts])

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Scheduled Publishing Queue
            </h3>
            <p className="text-sm text-muted-foreground">
              Manage and monitor your scheduled content publications
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExportCSV} className="gap-2">
              <FileSpreadsheet className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader className="pb-4">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filters & Search
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Search</label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search posts..."
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
                    <SelectValue placeholder="All platforms" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All platforms</SelectItem>
                    {uniquePlatforms.map(platform => {
                      const config = platformConfig[platform as keyof typeof platformConfig]
                      return (
                        <SelectItem key={platform} value={platform}>
                          <div className="flex items-center gap-2">
                            {config.icon}
                            {platform}
                          </div>
                        </SelectItem>
                      )
                    })}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    {Object.entries(statusConfig).map(([status, config]) => (
                      <SelectItem key={status} value={status}>
                        <div className="flex items-center gap-2">
                          {config.icon}
                          {config.label}
                        </div>
                      </SelectItem>
                    ))}
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
                  Clear Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing {sortedPosts.length} / {posts.length} posts
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Total Posts</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-green-600">{stats.published}</div>
              <p className="text-xs text-muted-foreground">Published</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <p className="text-xs text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
        </div>

        {/* Posts Table */}
        <Card>
          <CardContent className="p-0">
            {sortedPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Scheduled Posts</h3>
                <p className="text-center">
                  No posts match your current filters or there are no scheduled posts.
                </p>
              </div>
            ) : (
              <ScrollArea className="w-full">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Post ID</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Platform</TableHead>
                      <TableHead>Scheduled Time</TableHead>
                      <TableHead>Countdown</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <AnimatePresence>
                      {sortedPosts.map((post, index) => {
                        const platformInfo = platformConfig[post.platform]
                        const statusInfo = statusConfig[post.status]
                        const isEditing = editingPost === post.post_id
                        
                        return (
                          <motion.tr
                            key={post.post_id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ delay: index * 0.05 }}
                            className="group hover:bg-muted/50"
                          >
                            <TableCell className="font-mono text-sm">
                              {post.post_id}
                            </TableCell>
                            <TableCell>
                              <div className="max-w-[200px]">
                                <div className="font-medium truncate" title={post.title}>
                                  {post.title}
                                </div>
                                {post.error_message && (
                                  <div className="text-xs text-red-600 mt-1 truncate" title={post.error_message}>
                                    Error: {post.error_message}
                                  </div>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge className={platformInfo.color}>
                                <div className="flex items-center gap-1">
                                  {platformInfo.icon}
                                  {post.platform}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {isEditing ? (
                                <div className="flex items-center gap-2">
                                  <Input
                                    type="datetime-local"
                                    value={newScheduleTime}
                                    onChange={(e) => setNewScheduleTime(e.target.value)}
                                    className="w-48"
                                  />
                                  <Button
                                    size="sm"
                                    onClick={() => handleReschedule(post)}
                                    disabled={!newScheduleTime}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={cancelEdit}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ) : (
                                <div className="space-y-1">
                                  <div className="text-sm font-medium">
                                    {formatDateTime(post.scheduled_for)}
                                  </div>
                                  {onReschedule && post.status === 'pending' && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => startEdit(post)}
                                      className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
                                    >
                                      <Edit3 className="h-3 w-3 mr-1" />
                                      Edit
                                    </Button>
                                  )}
                                </div>
                              )}
                            </TableCell>
                            <TableCell>
                              {post.status === 'pending' ? (
                                <div className="flex items-center gap-1">
                                  <Timer className="h-3 w-3 text-muted-foreground" />
                                  <span className="text-sm font-mono">
                                    {getCountdown(post.scheduled_for)}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-muted-foreground">
                                  {post.status === 'published' ? 'Completed' : 'N/A'}
                                </span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={statusInfo.color}>
                                <div className="flex items-center gap-1">
                                  {statusInfo.icon}
                                  {statusInfo.label}
                                </div>
                              </Badge>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                {post.status === 'failed' && onRetry && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleRetry(post)}
                                      >
                                        <RotateCcw className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Retry post</TooltipContent>
                                  </Tooltip>
                                )}
                                
                                {post.status === 'pending' && onCancel && (
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => handleCancel(post)}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </TooltipTrigger>
                                    <TooltipContent>Cancel post</TooltipContent>
                                  </Tooltip>
                                )}
                              </div>
                            </TableCell>
                          </motion.tr>
                        )
                      })}
                    </AnimatePresence>
                  </TableBody>
                </Table>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  )
}