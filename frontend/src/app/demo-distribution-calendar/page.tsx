'use client'

import { useState } from 'react'
import { DistributionCalendarExport, type ScheduleItem } from '@/components/ui/distribution-calendar-export'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { useToast } from '@/hooks/use-toast'
import { 
  RefreshCw,
  Calendar,
  Plus,
  Trash2,
  Settings,
  Download,
  FileSpreadsheet,
  TwitterIcon as Twitter,
  Linkedin,
  Mail,
  FileText,
  Globe
} from 'lucide-react'

const sampleSchedule: ScheduleItem[] = [
  {
    id: '1',
    title: 'Launch announcement: New AI-powered content generator',
    platform: 'Twitter',
    scheduled_date: '2024-11-05T09:00:00Z',
    status: 'pending'
  },
  {
    id: '2',
    title: 'Case study: How we increased engagement by 300%',
    platform: 'LinkedIn',
    scheduled_date: '2024-11-05T14:30:00Z',
    status: 'published'
  },
  {
    id: '3',
    title: 'Weekly newsletter: Top content marketing trends',
    platform: 'Email',
    scheduled_date: '2024-11-06T08:00:00Z',
    status: 'pending'
  },
  {
    id: '4',
    title: 'Complete guide to content distribution strategies',
    platform: 'Blog',
    scheduled_date: '2024-11-06T10:00:00Z',
    status: 'published'
  },
  {
    id: '5',
    title: 'SEO optimization for content marketing success',
    platform: 'SEO',
    scheduled_date: '2024-11-07T12:00:00Z',
    status: 'failed'
  },
  {
    id: '6',
    title: 'Quick tips for social media engagement',
    platform: 'Twitter',
    scheduled_date: '2024-11-07T16:00:00Z',
    status: 'pending'
  },
  {
    id: '7',
    title: 'Industry insights: Future of marketing automation',
    platform: 'LinkedIn',
    scheduled_date: '2024-11-08T11:00:00Z',
    status: 'pending'
  },
  {
    id: '8',
    title: 'Product update announcement newsletter',
    platform: 'Email',
    scheduled_date: '2024-11-08T15:00:00Z',
    status: 'published'
  },
  {
    id: '9',
    title: 'Best practices for content repurposing',
    platform: 'Blog',
    scheduled_date: '2024-11-09T09:30:00Z',
    status: 'pending'
  },
  {
    id: '10',
    title: 'Keyword research masterclass',
    platform: 'SEO',
    scheduled_date: '2024-11-09T13:45:00Z',
    status: 'failed'
  },
  {
    id: '11',
    title: 'Behind the scenes: Content creation process',
    platform: 'Twitter',
    scheduled_date: '2024-11-10T10:15:00Z',
    status: 'published'
  },
  {
    id: '12',
    title: 'Thought leadership: The evolution of digital marketing',
    platform: 'LinkedIn',
    scheduled_date: '2024-11-10T14:20:00Z',
    status: 'pending'
  }
]

export default function DemoDistributionCalendarPage() {
  const [schedule, setSchedule] = useState<ScheduleItem[]>(sampleSchedule)
  const [packId] = useState('PACK-2024-001')
  const { toast } = useToast()

  const handleExportCSV = (selectedItems?: ScheduleItem[]) => {
    const items = selectedItems || schedule
    
    // Generate CSV content
    const headers = ['Title', 'Platform', 'Scheduled Date', 'Status']
    const csvContent = [
      headers.join(','),
      ...items.map(item => [
        `"${item.title}"`,
        item.platform,
        item.scheduled_date,
        item.status
      ].join(','))
    ].join('\n')
    
    // Create and download file
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `distribution-calendar-${packId}-${Date.now()}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    console.log('Exporting CSV:', items)
  }

  const handleExportICS = (selectedItems?: ScheduleItem[]) => {
    const items = selectedItems || schedule
    
    // Generate ICS content
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Content Distribution//Calendar//EN',
      'CALSCALE:GREGORIAN',
      ...items.map(item => [
        'BEGIN:VEVENT',
        `UID:${item.id}@contentdistribution.com`,
        `DTSTART:${new Date(item.scheduled_date).toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `SUMMARY:${item.title}`,
        `DESCRIPTION:Platform: ${item.platform}\\nStatus: ${item.status}`,
        `CATEGORIES:${item.platform}`,
        'END:VEVENT'
      ].join('\n')),
      'END:VCALENDAR'
    ].join('\n')
    
    // Create and download file
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `distribution-calendar-${packId}-${Date.now()}.ics`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
    
    console.log('Exporting ICS:', items)
  }

  const handleUpdateDate = (itemId: string, newDate: string) => {
    setSchedule(prev => prev.map(item => 
      item.id === itemId ? { ...item, scheduled_date: newDate } : item
    ))
    console.log('Updated date for item:', itemId, 'to:', newDate)
  }

  const addRandomItem = () => {
    const titles = [
      'New product feature announcement',
      'Customer success story spotlight',
      'Industry trend analysis',
      'Expert interview insights',
      'How-to guide for beginners',
      'Company milestone celebration',
      'Seasonal marketing tips',
      'Technology update overview'
    ]
    
    const platforms: ScheduleItem['platform'][] = ['Twitter', 'LinkedIn', 'Email', 'Blog', 'SEO']
    const statuses: ScheduleItem['status'][] = ['pending', 'published', 'failed']
    
    const newItem: ScheduleItem = {
      id: `item-${Date.now()}`,
      title: titles[Math.floor(Math.random() * titles.length)],
      platform: platforms[Math.floor(Math.random() * platforms.length)],
      scheduled_date: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status: statuses[Math.floor(Math.random() * statuses.length)]
    }
    
    setSchedule(prev => [newItem, ...prev])
    toast({
      title: "Item mới đã được thêm",
      description: "Một item phân phối mới đã được thêm vào lịch",
    })
  }

  const resetDemo = () => {
    setSchedule(sampleSchedule)
    toast({
      title: "Demo đã được reset",
      description: "Tất cả dữ liệu đã được khôi phục về trạng thái ban đầu",
    })
  }

  // Statistics
  const stats = {
    total: schedule.length,
    pending: schedule.filter(item => item.status === 'pending').length,
    published: schedule.filter(item => item.status === 'published').length,
    failed: schedule.filter(item => item.status === 'failed').length,
    platforms: {
      Twitter: schedule.filter(item => item.platform === 'Twitter').length,
      LinkedIn: schedule.filter(item => item.platform === 'LinkedIn').length,
      Email: schedule.filter(item => item.platform === 'Email').length,
      Blog: schedule.filter(item => item.platform === 'Blog').length,
      SEO: schedule.filter(item => item.platform === 'SEO').length,
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">DistributionCalendarExport Demo</h1>
            <p className="text-muted-foreground">
              Demo component hiển thị lịch phân phối nội dung với filtering, inline editing và export functionality.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline">
              Pack: {packId}
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
                Test các tính năng của DistributionCalendarExport component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={addRandomItem} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Thêm item ngẫu nhiên
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Sử dụng checkboxes để chọn nhiều items</p>
                <p>• Click vào icon edit để chỉnh sửa ngày đăng inline</p>
                <p>• Sử dụng bộ lọc để lọc theo platform hoặc status</p>
                <p>• Export toàn bộ hoặc chỉ items đã chọn</p>
                <p>• Hover vào nút export để xem tooltip</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <DistributionCalendarExport
            schedule={schedule}
            packId={packId}
            onExportCSV={handleExportCSV}
            onExportICS={handleExportICS}
            onUpdateDate={handleUpdateDate}
          />
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-green-500" />
                  Core Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Table layout với responsive design</li>
                  <li>• Status badges với color coding</li>
                  <li>• Platform icons cho visual clarity</li>
                  <li>• Formatted timestamps (Vietnamese locale)</li>
                  <li>• Horizontal scroll cho mobile</li>
                  <li>• Dark mode support hoàn toàn</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5 text-blue-500" />
                  Advanced Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Multi-row selection với checkboxes</li>
                  <li>• Inline date editing với datetime-local</li>
                  <li>• Export CSV và iCalendar (.ics)</li>
                  <li>• Filtering theo platform và status</li>
                  <li>• Search trong content titles</li>
                  <li>• Individual item export actions</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5 text-purple-500" />
                  Export Options
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Export toàn bộ danh sách</li>
                  <li>• Export chỉ items đã chọn</li>
                  <li>• Export individual items</li>
                  <li>• CSV format cho spreadsheet apps</li>
                  <li>• iCalendar format cho calendar apps</li>
                  <li>• Toast notifications cho feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-orange-500" />
                  UI/UX Features
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Smooth animations với Framer Motion</li>
                  <li>• Hover effects và visual feedback</li>
                  <li>• Tooltips cho better usability</li>
                  <li>• Empty state với helpful message</li>
                  <li>• Loading states và transitions</li>
                  <li>• Accessible design patterns</li>
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
                <CardTitle className="text-sm font-medium">Total Items</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  Scheduled content items
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Badge className="text-xs bg-yellow-500">P</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.pending / stats.total) * 100).toFixed(1)}% of total
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <Badge className="text-xs bg-green-500">✓</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.published / stats.total) * 100).toFixed(1)}% success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <Badge variant="destructive" className="text-xs">✗</Badge>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">
                  {((stats.failed / stats.total) * 100).toFixed(1)}% failure rate
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>
                Phân phối content theo từng platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(stats.platforms).map(([platform, count]) => {
                  const percentage = (count / stats.total) * 100
                  const getIcon = () => {
                    switch (platform) {
                      case 'Twitter': return <Twitter className="h-4 w-4" />
                      case 'LinkedIn': return <Linkedin className="h-4 w-4" />
                      case 'Email': return <Mail className="h-4 w-4" />
                      case 'Blog': return <FileText className="h-4 w-4" />
                      case 'SEO': return <Globe className="h-4 w-4" />
                      default: return <FileText className="h-4 w-4" />
                    }
                  }
                  
                  return (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getIcon()}
                          <span className="text-sm font-medium">{platform}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {count} items ({percentage.toFixed(1)}%)
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
                Cách sử dụng DistributionCalendarExport trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { DistributionCalendarExport, type ScheduleItem } from '@/components/ui/distribution-calendar-export'

const schedule: ScheduleItem[] = [
  {
    id: '1',
    title: 'Launch announcement',
    platform: 'Twitter',
    scheduled_date: '2024-11-05T09:00:00Z',
    status: 'pending'
  }
]

function MyComponent() {
  const handleExportCSV = (items) => {
    // Custom CSV export logic
    console.log('Exporting CSV:', items)
  }
  
  const handleExportICS = (items) => {
    // Custom iCalendar export logic  
    console.log('Exporting ICS:', items)
  }

  return (
    <DistributionCalendarExport
      schedule={schedule}
      packId="PACK-001"
      onExportCSV={handleExportCSV}
      onExportICS={handleExportICS}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With Date Editing</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`<DistributionCalendarExport
  schedule={schedule}
  packId="PACK-001"
  onExportCSV={handleExportCSV}
  onExportICS={handleExportICS}
  onUpdateDate={(itemId, newDate) => {
    // Handle date update
    setSchedule(prev => prev.map(item => 
      item.id === itemId ? { ...item, scheduled_date: newDate } : item
    ))
  }}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface DistributionCalendarExportProps {
  schedule: ScheduleItem[]                           // Required: Schedule data
  packId: string                                     // Required: Content pack ID
  onExportCSV: (selectedItems?: ScheduleItem[]) => void   // Required: CSV export handler
  onExportICS: (selectedItems?: ScheduleItem[]) => void   // Required: ICS export handler
  onUpdateDate?: (itemId: string, newDate: string) => void // Optional: Date update handler
  className?: string                                 // Optional: Additional CSS classes
}

interface ScheduleItem {
  id?: string                                        // Optional: Unique identifier
  title: string                                      // Required: Content title
  platform: 'Twitter' | 'LinkedIn' | 'Email' | 'Blog' | 'SEO' // Required: Platform
  scheduled_date: string                             // Required: ISO date string
  status: 'pending' | 'published' | 'failed'        // Required: Publishing status
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