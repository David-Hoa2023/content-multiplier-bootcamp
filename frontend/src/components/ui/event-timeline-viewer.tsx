'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Clock,
  User,
  Download,
  FileSpreadsheet,
  FileText,
  Filter,
  Search,
  ChevronDown,
  ChevronRight,
  Lightbulb,
  FileEdit,
  PenTool,
  Copy,
  Send,
  Eye,
  ThumbsUp,
  GitBranch,
  Trash2,
  Archive,
  RefreshCw,
  Undo,
  Activity,
  Calendar,
  Info
} from 'lucide-react'

export interface TimelineEvent {
  id?: string
  timestamp: string
  event_type: string
  user_id: string
  user_name?: string
  payload: Record<string, any>
  description?: string
}

export interface EventTimelineViewerProps {
  events: TimelineEvent[]
  packId: string
  onUndo?: (eventId: string) => void
  onExportCSV?: () => void
  onExportPDF?: () => void
  className?: string
}

const eventTypeConfig = {
  'idea.generated': {
    icon: <Lightbulb className="h-4 w-4" />,
    color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    description: 'New idea was generated'
  },
  'brief.created': {
    icon: <FileEdit className="h-4 w-4" />,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    description: 'Content brief was created'
  },
  'draft.generated': {
    icon: <PenTool className="h-4 w-4" />,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
    description: 'Draft content was generated'
  },
  'derivatives.created': {
    icon: <Copy className="h-4 w-4" />,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
    description: 'Content derivatives were created'
  },
  'pack.published': {
    icon: <Send className="h-4 w-4" />,
    color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200',
    description: 'Content pack was published'
  },
  'review.requested': {
    icon: <Eye className="h-4 w-4" />,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
    description: 'Review was requested'
  },
  'review.approved': {
    icon: <ThumbsUp className="h-4 w-4" />,
    color: 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
    description: 'Review was approved'
  },
  'state.changed': {
    icon: <GitBranch className="h-4 w-4" />,
    color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
    description: 'State was changed'
  },
  'content.deleted': {
    icon: <Trash2 className="h-4 w-4" />,
    color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    description: 'Content was deleted'
  },
  'pack.archived': {
    icon: <Archive className="h-4 w-4" />,
    color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
    description: 'Content pack was archived'
  }
}

export function EventTimelineViewer({
  events,
  packId,
  onUndo,
  onExportCSV,
  onExportPDF,
  className = ''
}: EventTimelineViewerProps) {
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [eventTypeFilter, setEventTypeFilter] = useState<string>('all')
  const [userFilter, setUserFilter] = useState<string>('all')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const { toast } = useToast()

  // Add IDs to events if they don't have them and sort by timestamp
  const eventsWithIds = useMemo(() => {
    return events
      .map((event, index) => ({
        ...event,
        id: event.id || `event-${index}`,
        user_name: event.user_name || event.user_id
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
  }, [events])

  // Get unique event types and users for filtering
  const uniqueEventTypes = useMemo(() => {
    return Array.from(new Set(eventsWithIds.map(event => event.event_type)))
  }, [eventsWithIds])

  const uniqueUsers = useMemo(() => {
    return Array.from(new Set(eventsWithIds.map(event => event.user_name || event.user_id)))
  }, [eventsWithIds])

  // Filter events
  const filteredEvents = useMemo(() => {
    return eventsWithIds.filter(event => {
      const matchesEventType = eventTypeFilter === 'all' || event.event_type === eventTypeFilter
      const matchesUser = userFilter === 'all' || event.user_name === userFilter || event.user_id === userFilter
      const matchesSearch = !searchFilter || 
        event.event_type.toLowerCase().includes(searchFilter.toLowerCase()) ||
        (event.user_name || event.user_id).toLowerCase().includes(searchFilter.toLowerCase()) ||
        JSON.stringify(event.payload).toLowerCase().includes(searchFilter.toLowerCase())
      
      return matchesEventType && matchesUser && matchesSearch
    })
  }, [eventsWithIds, eventTypeFilter, userFilter, searchFilter])

  const toggleEventExpansion = (eventId: string) => {
    const newExpanded = new Set(expandedEvents)
    if (newExpanded.has(eventId)) {
      newExpanded.delete(eventId)
    } else {
      newExpanded.add(eventId)
    }
    setExpandedEvents(newExpanded)
  }

  const handleUndo = (event: TimelineEvent) => {
    if (onUndo && event.id) {
      onUndo(event.id)
      toast({
        title: "Event Undone",
        description: `Event "${event.event_type}" has been undone`,
      })
    }
  }

  const handleExportCSV = () => {
    if (onExportCSV) {
      onExportCSV()
      toast({
        title: "CSV Export",
        description: "Timeline exported to CSV successfully",
      })
    } else {
      // Default CSV export
      const csvContent = [
        ['Timestamp', 'Event Type', 'User', 'Payload'],
        ...filteredEvents.map(event => [
          event.timestamp,
          event.event_type,
          event.user_name || event.user_id,
          JSON.stringify(event.payload)
        ])
      ].map(row => row.map(field => `"${field}"`).join(',')).join('\n')
      
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `timeline-${packId}-${Date.now()}.csv`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)
      
      toast({
        title: "CSV Export",
        description: "Timeline exported to CSV successfully",
      })
    }
  }

  const handleExportPDF = () => {
    if (onExportPDF) {
      onExportPDF()
    } else {
      toast({
        title: "PDF Export",
        description: "PDF export feature coming soon",
        variant: "destructive",
      })
    }
  }

  const getEventIcon = (eventType: string) => {
    const config = eventTypeConfig[eventType as keyof typeof eventTypeConfig]
    return config?.icon || <Activity className="h-4 w-4" />
  }

  const getEventBadge = (eventType: string) => {
    const config = eventTypeConfig[eventType as keyof typeof eventTypeConfig]
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge className={config?.color || 'bg-gray-100 text-gray-800'}>
            <div className="flex items-center gap-1">
              {getEventIcon(eventType)}
              {eventType}
            </div>
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          {config?.description || 'Custom event type'}
        </TooltipContent>
      </Tooltip>
    )
  }

  const formatTimestamp = (timestamp: string) => {
    try {
      return new Date(timestamp).toLocaleString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      })
    } catch {
      return timestamp
    }
  }

  const getRelativeTime = (timestamp: string) => {
    try {
      const now = new Date()
      const eventTime = new Date(timestamp)
      const diffMs = now.getTime() - eventTime.getTime()
      const diffMinutes = Math.floor(diffMs / 60000)
      const diffHours = Math.floor(diffMinutes / 60)
      const diffDays = Math.floor(diffHours / 24)

      if (diffMinutes < 1) return 'Vừa xong'
      if (diffMinutes < 60) return `${diffMinutes} phút trước`
      if (diffHours < 24) return `${diffHours} giờ trước`
      if (diffDays < 7) return `${diffDays} ngày trước`
      
      return formatTimestamp(timestamp)
    } catch {
      return timestamp
    }
  }

  const renderPayload = (payload: Record<string, any>) => {
    if (!payload || Object.keys(payload).length === 0) {
      return <span className="text-muted-foreground">No additional data</span>
    }

    // Handle common payload structures
    if (payload.title) {
      return (
        <div className="space-y-2">
          <div><strong>Title:</strong> {payload.title}</div>
          {payload.content && (
            <div><strong>Content:</strong> {payload.content.substring(0, 200)}...</div>
          )}
          {payload.status && (
            <div><strong>Status:</strong> {payload.status}</div>
          )}
        </div>
      )
    }

    // Fallback: render JSON
    return (
      <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-32">
        {JSON.stringify(payload, null, 2)}
      </pre>
    )
  }

  return (
    <TooltipProvider>
      <div className={`space-y-6 ${className}`}>
        {/* Header with Export Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Event Timeline
            </h3>
            <p className="text-sm text-muted-foreground">
              Content pack: {packId} • {filteredEvents.length} events
            </p>
          </div>
          
          <div className="flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportCSV}
                  className="gap-2"
                >
                  <FileSpreadsheet className="h-4 w-4" />
                  Export CSV
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export timeline to CSV format</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={handleExportPDF}
                  className="gap-2"
                >
                  <FileText className="h-4 w-4" />
                  Export PDF
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export timeline to PDF format</TooltipContent>
            </Tooltip>
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
                    placeholder="Search events..."
                    value={searchFilter}
                    onChange={(e) => setSearchFilter(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Event Type</label>
                <Select value={eventTypeFilter} onValueChange={setEventTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All event types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All event types</SelectItem>
                    {uniqueEventTypes.map(type => (
                      <SelectItem key={type} value={type}>
                        <div className="flex items-center gap-2">
                          {getEventIcon(type)}
                          {type}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">User</label>
                <Select value={userFilter} onValueChange={setUserFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All users" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All users</SelectItem>
                    {uniqueUsers.map(user => (
                      <SelectItem key={user} value={user}>
                        <div className="flex items-center gap-2">
                          <User className="h-3 w-3" />
                          {user}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {(searchFilter || eventTypeFilter !== 'all' || userFilter !== 'all') && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSearchFilter('')
                    setEventTypeFilter('all')
                    setUserFilter('all')
                  }}
                >
                  Clear Filters
                </Button>
                <span className="text-sm text-muted-foreground">
                  Showing {filteredEvents.length} / {eventsWithIds.length} events
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Timeline */}
        <Card>
          <CardContent className="p-6">
            {filteredEvents.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
                <p className="text-center">
                  No events match your current filters. Try adjusting your search criteria.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-96 w-full">
                <div className="relative">
                  {/* Timeline Line */}
                  <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />
                  
                  <div className="space-y-6">
                    <AnimatePresence>
                      {filteredEvents.map((event, index) => (
                        <motion.div
                          key={event.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.05 }}
                          className="relative flex items-start gap-4"
                        >
                          {/* Timeline Node */}
                          <div className="relative z-10 flex-shrink-0">
                            <div className="w-12 h-12 rounded-full bg-background border-2 border-border flex items-center justify-center">
                              {getEventIcon(event.event_type)}
                            </div>
                          </div>
                          
                          {/* Event Content */}
                          <motion.div 
                            className="flex-1 pb-6"
                            whileHover={{ scale: 1.01 }}
                          >
                            <Card className="shadow-sm hover:shadow-md transition-shadow">
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between">
                                  <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                      {getEventBadge(event.event_type)}
                                      <span className="text-xs text-muted-foreground">
                                        {getRelativeTime(event.timestamp)}
                                      </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                      <User className="h-3 w-3" />
                                      <span>{event.user_name || event.user_id}</span>
                                      <Separator orientation="vertical" className="h-4" />
                                      <Clock className="h-3 w-3" />
                                      <span>{formatTimestamp(event.timestamp)}</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => toggleEventExpansion(event.id!)}
                                      className="gap-1"
                                    >
                                      {expandedEvents.has(event.id!) ? (
                                        <>
                                          <ChevronDown className="h-3 w-3" />
                                          Collapse
                                        </>
                                      ) : (
                                        <>
                                          <ChevronRight className="h-3 w-3" />
                                          Details
                                        </>
                                      )}
                                    </Button>
                                    
                                    {onUndo && (
                                      <Tooltip>
                                        <TooltipTrigger asChild>
                                          <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleUndo(event)}
                                          >
                                            <Undo className="h-3 w-3" />
                                          </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>Undo this event</TooltipContent>
                                      </Tooltip>
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                              
                              <AnimatePresence>
                                {expandedEvents.has(event.id!) && (
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
                                          <Info className="h-4 w-4 text-muted-foreground" />
                                          <span className="text-sm font-medium">Event Details:</span>
                                        </div>
                                        <div className="ml-6">
                                          {renderPayload(event.payload)}
                                        </div>
                                      </div>
                                    </CardContent>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </Card>
                          </motion.div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>

        {/* Summary Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredEvents.length}
              </div>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {uniqueEventTypes.length}
              </div>
              <p className="text-xs text-muted-foreground">Event Types</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {uniqueUsers.length}
              </div>
              <p className="text-xs text-muted-foreground">Contributors</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="text-2xl font-bold">
                {filteredEvents.length > 0 ? Math.ceil((Date.now() - new Date(filteredEvents[filteredEvents.length - 1].timestamp).getTime()) / (1000 * 60 * 60 * 24)) : 0}
              </div>
              <p className="text-xs text-muted-foreground">Days Active</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </TooltipProvider>
  )
}