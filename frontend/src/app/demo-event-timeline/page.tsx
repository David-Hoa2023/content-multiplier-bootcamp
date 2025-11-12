'use client'

import { useState } from 'react'
import { EventTimelineViewer, type TimelineEvent } from '@/components/ui/event-timeline-viewer'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { 
  RefreshCw,
  Activity,
  Plus,
  Settings,
  Download,
  Users,
  Calendar,
  BarChart3,
  Lightbulb,
  FileEdit,
  PenTool,
  Copy,
  Send,
  Eye,
  ThumbsUp,
  GitBranch,
  Trash2,
  Archive
} from 'lucide-react'

const sampleEvents: TimelineEvent[] = [
  {
    id: '1',
    timestamp: '2024-11-04T10:30:00Z',
    event_type: 'idea.generated',
    user_id: 'user-123',
    user_name: 'Nguyễn Văn An',
    payload: {
      title: 'AI-powered Content Marketing Strategy',
      description: 'Comprehensive strategy for leveraging AI in content marketing',
      category: 'Technology',
      priority: 'high'
    }
  },
  {
    id: '2',
    timestamp: '2024-11-04T11:15:00Z',
    event_type: 'brief.created',
    user_id: 'user-456',
    user_name: 'Trần Thị Bình',
    payload: {
      title: 'Content Brief for AI Marketing Strategy',
      target_audience: 'Marketing professionals, Tech enthusiasts',
      tone: 'Professional, informative',
      keywords: ['AI marketing', 'content strategy', 'automation'],
      word_count: 2000
    }
  },
  {
    id: '3',
    timestamp: '2024-11-04T13:45:00Z',
    event_type: 'draft.generated',
    user_id: 'ai-system',
    user_name: 'AI Assistant',
    payload: {
      title: 'AI-Powered Content Marketing: The Future is Now',
      content: 'In today\'s rapidly evolving digital landscape, artificial intelligence is revolutionizing how we approach content marketing...',
      word_count: 1850,
      status: 'draft',
      ai_confidence: 0.92
    }
  },
  {
    id: '4',
    timestamp: '2024-11-04T14:20:00Z',
    event_type: 'review.requested',
    user_id: 'user-789',
    user_name: 'Lê Minh Cường',
    payload: {
      reviewer: 'Phạm Thị Dung',
      deadline: '2024-11-05T17:00:00Z',
      review_type: 'content_quality',
      priority: 'normal'
    }
  },
  {
    id: '5',
    timestamp: '2024-11-04T16:30:00Z',
    event_type: 'review.approved',
    user_id: 'user-012',
    user_name: 'Phạm Thị Dung',
    payload: {
      rating: 4.5,
      feedback: 'Excellent content quality, minor edits needed',
      approved_sections: ['introduction', 'main_content', 'conclusion'],
      suggested_changes: ['Update statistics', 'Add more examples']
    }
  },
  {
    id: '6',
    timestamp: '2024-11-04T17:15:00Z',
    event_type: 'derivatives.created',
    user_id: 'ai-system',
    user_name: 'AI Assistant',
    payload: {
      derivatives: [
        { type: 'social_post', platform: 'LinkedIn', status: 'generated' },
        { type: 'social_post', platform: 'Twitter', status: 'generated' },
        { type: 'email_newsletter', status: 'generated' },
        { type: 'blog_summary', status: 'generated' }
      ],
      total_derivatives: 4
    }
  },
  {
    id: '7',
    timestamp: '2024-11-04T18:00:00Z',
    event_type: 'state.changed',
    user_id: 'user-123',
    user_name: 'Nguyễn Văn An',
    payload: {
      from_state: 'review',
      to_state: 'approved',
      reason: 'Review completed successfully',
      automated: false
    }
  },
  {
    id: '8',
    timestamp: '2024-11-04T19:30:00Z',
    event_type: 'pack.published',
    user_id: 'user-456',
    user_name: 'Trần Thị Bình',
    payload: {
      publication_channels: ['website', 'linkedin', 'newsletter'],
      scheduled_date: '2024-11-05T09:00:00Z',
      distribution_status: 'scheduled',
      estimated_reach: 15000
    }
  },
  {
    id: '9',
    timestamp: '2024-11-03T14:20:00Z',
    event_type: 'idea.generated',
    user_id: 'user-789',
    user_name: 'Lê Minh Cường',
    payload: {
      title: 'Sustainable Marketing Practices',
      description: 'Exploring eco-friendly marketing strategies',
      category: 'Sustainability',
      priority: 'medium'
    }
  },
  {
    id: '10',
    timestamp: '2024-11-03T16:45:00Z',
    event_type: 'content.deleted',
    user_id: 'user-012',
    user_name: 'Phạm Thị Dung',
    payload: {
      content_id: 'draft-567',
      reason: 'Duplicate content',
      deleted_by: 'user-012',
      backup_created: true
    }
  },
  {
    id: '11',
    timestamp: '2024-11-02T11:30:00Z',
    event_type: 'pack.archived',
    user_id: 'user-123',
    user_name: 'Nguyễn Văn An',
    payload: {
      pack_id: 'pack-456',
      reason: 'Campaign ended',
      archived_date: '2024-11-02T11:30:00Z',
      retain_until: '2025-11-02T00:00:00Z'
    }
  }
]

export default function DemoEventTimelinePage() {
  const [events, setEvents] = useState<TimelineEvent[]>(sampleEvents)
  const [packId] = useState('PACK-2024-AI-001')
  const { toast } = useToast()

  const handleUndo = (eventId: string) => {
    console.log('Undoing event:', eventId)
    toast({
      title: "Event Undone",
      description: `Event ${eventId} has been undone`,
    })
  }

  const handleExportCSV = () => {
    console.log('Exporting CSV...')
    // CSV export is handled by the component
  }

  const handleExportPDF = () => {
    console.log('Exporting PDF...')
    toast({
      title: "PDF Export",
      description: "PDF export functionality would be implemented here",
    })
  }

  const addRandomEvent = () => {
    const eventTypes = [
      'idea.generated',
      'brief.created', 
      'draft.generated',
      'derivatives.created',
      'pack.published',
      'review.requested',
      'review.approved',
      'state.changed',
      'content.deleted',
      'pack.archived'
    ]
    
    const users = [
      { id: 'user-123', name: 'Nguyễn Văn An' },
      { id: 'user-456', name: 'Trần Thị Bình' },
      { id: 'user-789', name: 'Lê Minh Cường' },
      { id: 'user-012', name: 'Phạm Thị Dung' },
      { id: 'ai-system', name: 'AI Assistant' }
    ]
    
    const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)]
    const user = users[Math.floor(Math.random() * users.length)]
    
    const newEvent: TimelineEvent = {
      id: `event-${Date.now()}`,
      timestamp: new Date().toISOString(),
      event_type: eventType,
      user_id: user.id,
      user_name: user.name,
      payload: {
        title: `Random ${eventType} event`,
        description: 'This is a randomly generated event for demo purposes',
        timestamp: new Date().toISOString()
      }
    }
    
    setEvents(prev => [newEvent, ...prev])
    toast({
      title: "Event Added",
      description: `New ${eventType} event has been added to the timeline`,
    })
  }

  const resetDemo = () => {
    setEvents(sampleEvents)
    toast({
      title: "Demo Reset",
      description: "Timeline has been reset to original state",
    })
  }

  // Statistics
  const stats = {
    total: events.length,
    eventTypes: new Set(events.map(e => e.event_type)).size,
    users: new Set(events.map(e => e.user_name || e.user_id)).size,
    today: events.filter(e => {
      const eventDate = new Date(e.timestamp).toDateString()
      const today = new Date().toDateString()
      return eventDate === today
    }).length
  }

  const getEventTypeIcon = (eventType: string) => {
    const icons: Record<string, any> = {
      'idea.generated': <Lightbulb className="h-4 w-4" />,
      'brief.created': <FileEdit className="h-4 w-4" />,
      'draft.generated': <PenTool className="h-4 w-4" />,
      'derivatives.created': <Copy className="h-4 w-4" />,
      'pack.published': <Send className="h-4 w-4" />,
      'review.requested': <Eye className="h-4 w-4" />,
      'review.approved': <ThumbsUp className="h-4 w-4" />,
      'state.changed': <GitBranch className="h-4 w-4" />,
      'content.deleted': <Trash2 className="h-4 w-4" />,
      'pack.archived': <Archive className="h-4 w-4" />
    }
    return icons[eventType] || <Activity className="h-4 w-4" />
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">EventTimelineViewer Demo</h1>
            <p className="text-muted-foreground">
              Demo component hiển thị timeline các sự kiện của content pack với filtering và export functionality.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Activity className="h-3 w-3" />
              {packId}
            </Badge>
            <Button variant="outline" onClick={resetDemo} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Reset Demo
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          {/* Demo Controls */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-blue-500" />
                Demo Controls
              </CardTitle>
              <CardDescription>
                Test các tính năng của EventTimelineViewer component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={addRandomEvent} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Random Event
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Sử dụng filters để lọc theo event type hoặc user</p>
                <p>• Click "Details" để expand/collapse event payload</p>
                <p>• Hover lên icons để xem event descriptions</p>
                <p>• Click "Export CSV" để download timeline data</p>
                <p>• Thời gian hiển thị dạng relative (ví dụ: "2 giờ trước")</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <EventTimelineViewer
            events={events}
            packId={packId}
            onUndo={handleUndo}
            onExportCSV={handleExportCSV}
            onExportPDF={handleExportPDF}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Vertical timeline layout với chronological order</li>
                  <li>• Event badges với color coding</li>
                  <li>• Timeline nodes với custom icons</li>
                  <li>• Relative time display (ví dụ: "2 giờ trước")</li>
                  <li>• Expand/collapse payload details</li>
                  <li>• Dark mode support hoàn toàn</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-blue-500" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Filtering theo event type và user</li>
                  <li>• Search functionality across events</li>
                  <li>• Export to CSV format</li>
                  <li>• Undo functionality cho events</li>
                  <li>• Toast notifications cho actions</li>
                  <li>• Smooth animations với Framer Motion</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-500" />
                  Event Types Supported
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Lightbulb className="h-3 w-3 text-yellow-500" />
                    idea.generated
                  </div>
                  <div className="flex items-center gap-2">
                    <FileEdit className="h-3 w-3 text-blue-500" />
                    brief.created
                  </div>
                  <div className="flex items-center gap-2">
                    <PenTool className="h-3 w-3 text-purple-500" />
                    draft.generated
                  </div>
                  <div className="flex items-center gap-2">
                    <Copy className="h-3 w-3 text-green-500" />
                    derivatives.created
                  </div>
                  <div className="flex items-center gap-2">
                    <Send className="h-3 w-3 text-emerald-500" />
                    pack.published
                  </div>
                  <div className="flex items-center gap-2">
                    <Eye className="h-3 w-3 text-orange-500" />
                    review.requested
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-orange-500" />
                  Timeline Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Chronological sorting (newest first)</li>
                  <li>• Visual timeline line connecting events</li>
                  <li>• Responsive design for mobile/desktop</li>
                  <li>• Scrollable timeline for large datasets</li>
                  <li>• Hover effects và visual feedback</li>
                  <li>• Empty state handling</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Events in timeline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Event Types</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.eventTypes}</div>
                <p className="text-xs text-muted-foreground">
                  Different event types
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Contributors</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.users}</div>
                <p className="text-xs text-muted-foreground">
                  Unique contributors
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Today's Events</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.today}</div>
                <p className="text-xs text-muted-foreground">
                  Events today
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Event Type Distribution</CardTitle>
              <CardDescription>
                Phân phối events theo từng loại
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.from(new Set(events.map(e => e.event_type))).map(eventType => {
                  const count = events.filter(e => e.event_type === eventType).length
                  const percentage = (count / events.length) * 100
                  
                  return (
                    <div key={eventType} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getEventTypeIcon(eventType)}
                          <span className="text-sm font-medium">{eventType}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count} events ({percentage.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary rounded-full h-2 transition-all duration-300"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Component Usage</CardTitle>
              <CardDescription>
                Cách sử dụng EventTimelineViewer trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { EventTimelineViewer, type TimelineEvent } from '@/components/ui/event-timeline-viewer'

const events: TimelineEvent[] = [
  {
    id: '1',
    timestamp: '2024-11-04T10:30:00Z',
    event_type: 'idea.generated',
    user_id: 'user-123',
    user_name: 'John Doe',
    payload: {
      title: 'New marketing strategy',
      description: 'AI-powered content marketing'
    }
  }
]

function MyComponent() {
  const handleUndo = (eventId) => {
    console.log('Undoing event:', eventId)
  }

  return (
    <EventTimelineViewer
      events={events}
      packId="PACK-001"
      onUndo={handleUndo}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Export Functions</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`<EventTimelineViewer
  events={events}
  packId="PACK-001"
  onUndo={handleUndo}
  onExportCSV={() => {
    // Custom CSV export logic
    console.log('Exporting CSV...')
  }}
  onExportPDF={() => {
    // Custom PDF export logic
    console.log('Exporting PDF...')
  }}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface EventTimelineViewerProps {
  events: TimelineEvent[]                    // Required: Array of events
  packId: string                             // Required: Content pack ID
  onUndo?: (eventId: string) => void         // Optional: Undo event handler
  onExportCSV?: () => void                   // Optional: CSV export handler
  onExportPDF?: () => void                   // Optional: PDF export handler
  className?: string                         // Optional: Additional CSS classes
}

interface TimelineEvent {
  id?: string                                // Optional: Unique identifier
  timestamp: string                          // Required: ISO timestamp
  event_type: string                         // Required: Event type
  user_id: string                           // Required: User ID
  user_name?: string                        // Optional: User display name
  payload: Record<string, any>              // Required: Event data
  description?: string                      // Optional: Event description
}`}</code>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Toaster />
    </div>
  )
}