'use client'

import { useState } from 'react'
import { ScheduledPublishingQueue, type ScheduledPost } from '@/components/ui/scheduled-publishing-queue'
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
  Settings,
  Clock,
  Activity,
  Twitter,
  Linkedin,
  Mail,
  FileText,
  Rss,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Timer,
  Download
} from 'lucide-react'

const samplePosts: ScheduledPost[] = [
  {
    post_id: 'POST-001',
    title: 'AI-Powered Content Marketing Strategy for 2024',
    platform: 'LinkedIn',
    scheduled_for: '2024-11-04T14:30:00Z',
    status: 'pending',
    content: 'Discover how AI is revolutionizing content marketing strategies...'
  },
  {
    post_id: 'POST-002',
    title: 'Quick tip: Boost your productivity with these 5 AI tools',
    platform: 'Twitter',
    scheduled_for: '2024-11-04T16:00:00Z',
    status: 'pending',
    content: '🚀 5 AI tools that will 10x your productivity: 1. ChatGPT for writing...'
  },
  {
    post_id: 'POST-003',
    title: 'Weekly Newsletter: Latest in AI Technology',
    platform: 'Email',
    scheduled_for: '2024-11-05T09:00:00Z',
    status: 'pending',
    content: 'This week in AI: Major breakthroughs, new tools, and industry insights...'
  },
  {
    post_id: 'POST-004',
    title: 'The Complete Guide to Content Automation',
    platform: 'Blog',
    scheduled_for: '2024-11-03T10:00:00Z',
    status: 'published',
    content: 'Learn how to automate your content creation process...'
  },
  {
    post_id: 'POST-005',
    title: 'SEO Best Practices for AI-Generated Content',
    platform: 'SEO',
    scheduled_for: '2024-11-04T11:00:00Z',
    status: 'failed',
    content: 'Optimize your AI-generated content for search engines...',
    error_message: 'API rate limit exceeded. Retry after 15 minutes.'
  },
  {
    post_id: 'POST-006',
    title: 'How to Scale Content Creation with AI',
    platform: 'LinkedIn',
    scheduled_for: '2024-11-02T15:30:00Z',
    status: 'published',
    content: 'Scaling content creation has never been easier with AI assistance...'
  },
  {
    post_id: 'POST-007',
    title: 'Content Marketing ROI: Measuring Success',
    platform: 'Twitter',
    scheduled_for: '2024-11-04T12:15:00Z',
    status: 'failed',
    content: '📊 How to measure your content marketing ROI effectively...',
    error_message: 'Authentication failed. Please reconnect your Twitter account.'
  },
  {
    post_id: 'POST-008',
    title: 'AI Tools Comparison: Which One is Right for You?',
    platform: 'Blog',
    scheduled_for: '2024-11-06T14:00:00Z',
    status: 'pending',
    content: 'Compare the top AI tools for content creation and marketing...'
  },
  {
    post_id: 'POST-009',
    title: 'Monthly Content Performance Report',
    platform: 'Email',
    scheduled_for: '2024-11-01T10:00:00Z',
    status: 'published',
    content: 'Your content performance insights for October 2024...'
  },
  {
    post_id: 'POST-010',
    title: 'Voice Search Optimization for Modern SEO',
    platform: 'SEO',
    scheduled_for: '2024-11-07T13:45:00Z',
    status: 'pending',
    content: 'Optimize your content for voice search queries...'
  },
  {
    post_id: 'POST-011',
    title: 'Social Media Trends to Watch in 2024',
    platform: 'LinkedIn',
    scheduled_for: '2024-11-04T17:30:00Z',
    status: 'pending',
    content: 'Stay ahead of the curve with these emerging social media trends...'
  },
  {
    post_id: 'POST-012',
    title: 'Content Calendar Planning Made Easy',
    platform: 'Twitter',
    scheduled_for: '2024-11-05T11:00:00Z',
    status: 'pending',
    content: '📅 Master your content calendar with these simple tips...'
  }
]

export default function DemoScheduledPublishingPage() {
  const [posts, setPosts] = useState<ScheduledPost[]>(samplePosts)
  const { toast } = useToast()

  const handleRetry = (postId: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === postId 
          ? { ...post, status: 'pending' as const, error_message: undefined }
          : post
      )
    )
    console.log('Retrying post:', postId)
    toast({
      title: "Post Retry",
      description: `Post ${postId} has been queued for retry`,
    })
  }

  const handleCancel = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.post_id !== postId))
    console.log('Cancelling post:', postId)
    toast({
      title: "Post Cancelled",
      description: `Post ${postId} has been cancelled and removed from queue`,
      variant: "destructive",
    })
  }

  const handleReschedule = (postId: string, newTime: string) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.post_id === postId 
          ? { ...post, scheduled_for: newTime }
          : post
      )
    )
    console.log('Rescheduling post:', postId, 'to:', newTime)
    toast({
      title: "Post Rescheduled",
      description: `Post ${postId} has been rescheduled to ${new Date(newTime).toLocaleString('vi-VN')}`,
    })
  }

  const handleExportCSV = () => {
    console.log('Exporting posts to CSV...')
    toast({
      title: "CSV Export",
      description: "Publishing queue has been exported to CSV format",
    })
  }

  const addRandomPost = () => {
    const platforms = ['Twitter', 'LinkedIn', 'Email', 'Blog', 'SEO'] as const
    const statuses = ['pending', 'published', 'failed'] as const
    const titles = [
      'New AI Marketing Trends',
      'Content Strategy Deep Dive',
      'Social Media Best Practices',
      'SEO Optimization Guide',
      'Email Marketing Tips',
      'Productivity Hacks with AI',
      'Future of Content Creation',
      'Digital Marketing Insights'
    ]
    
    const platform = platforms[Math.floor(Math.random() * platforms.length)]
    const status = statuses[Math.floor(Math.random() * statuses.length)]
    const title = titles[Math.floor(Math.random() * titles.length)]
    
    const newPost: ScheduledPost = {
      post_id: `POST-${String(posts.length + 1).padStart(3, '0')}`,
      title: `${title} (Generated)`,
      platform,
      scheduled_for: new Date(Date.now() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      status,
      content: `Random generated content for ${platform} platform...`,
      error_message: status === 'failed' ? 'Random error for demo purposes' : undefined
    }
    
    setPosts(prev => [newPost, ...prev])
    toast({
      title: "Post Added",
      description: `New ${platform} post has been added to the queue`,
    })
  }

  const simulatePublishing = () => {
    const pendingPosts = posts.filter(p => p.status === 'pending')
    if (pendingPosts.length === 0) {
      toast({
        title: "No Pending Posts",
        description: "There are no pending posts to publish",
        variant: "destructive"
      })
      return
    }

    // Randomly publish or fail some pending posts
    setPosts(prevPosts => 
      prevPosts.map(post => {
        if (post.status === 'pending' && Math.random() > 0.7) {
          const shouldFail = Math.random() > 0.8
          return {
            ...post,
            status: shouldFail ? 'failed' as const : 'published' as const,
            error_message: shouldFail ? 'Simulated publishing error' : undefined
          }
        }
        return post
      })
    )
    
    toast({
      title: "Publishing Simulation",
      description: "Some pending posts have been randomly published or failed",
    })
  }

  const resetDemo = () => {
    setPosts(samplePosts)
    toast({
      title: "Demo Reset",
      description: "Publishing queue has been reset to original state",
    })
  }

  // Statistics
  const stats = {
    total: posts.length,
    pending: posts.filter(p => p.status === 'pending').length,
    published: posts.filter(p => p.status === 'published').length,
    failed: posts.filter(p => p.status === 'failed').length,
    platforms: new Set(posts.map(p => p.platform)).size
  }

  const getPlatformIcon = (platform: string) => {
    const icons: Record<string, any> = {
      Twitter: <Twitter className="h-4 w-4" />,
      LinkedIn: <Linkedin className="h-4 w-4" />,
      Email: <Mail className="h-4 w-4" />,
      Blog: <FileText className="h-4 w-4" />,
      SEO: <Rss className="h-4 w-4" />
    }
    return icons[platform] || <Activity className="h-4 w-4" />
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">ScheduledPublishingQueue Demo</h1>
            <p className="text-muted-foreground">
              Demo component quản lý queue các bài đăng đã được lên lịch với filtering, editing và monitoring functionality.
            </p>
          </div>
          
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="gap-1">
              <Calendar className="h-3 w-3" />
              {stats.total} Posts Queued
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
                Test các tính năng của ScheduledPublishingQueue component
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Button onClick={addRandomPost} variant="outline" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add Random Post
                </Button>
                <Button onClick={simulatePublishing} variant="outline" className="gap-2">
                  <Timer className="h-4 w-4" />
                  Simulate Publishing
                </Button>
              </div>
              
              <div className="text-sm text-muted-foreground space-y-1">
                <p>• Filter posts theo platform (Twitter, LinkedIn, Email, Blog, SEO)</p>
                <p>• Filter theo status (pending, published, failed)</p>
                <p>• Click "Edit" để reschedule bài pending</p>
                <p>• Retry bài failed, Cancel bài pending</p>
                <p>• Real-time countdown đến thời điểm scheduled</p>
                <p>• Export data to CSV format</p>
              </div>
            </CardContent>
          </Card>

          {/* Main Component */}
          <ScheduledPublishingQueue
            posts={posts}
            onRetry={handleRetry}
            onCancel={handleCancel}
            onReschedule={handleReschedule}
            onExportCSV={handleExportCSV}
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
                  <li>• Table layout với scroll horizontal support</li>
                  <li>• Platform badges với custom icons</li>
                  <li>• Status badges với color coding</li>
                  <li>• Real-time countdown timers</li>
                  <li>• Responsive design cho mobile/desktop</li>
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
                  <li>• Filtering theo platform và status</li>
                  <li>• Search functionality across posts</li>
                  <li>• Inline editing cho scheduled time</li>
                  <li>• Retry/Cancel actions với confirmations</li>
                  <li>• CSV export functionality</li>
                  <li>• Toast notifications cho user feedback</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-purple-500" />
                  Supported Platforms
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Twitter className="h-3 w-3 text-blue-500" />
                    Twitter
                  </div>
                  <div className="flex items-center gap-2">
                    <Linkedin className="h-3 w-3 text-blue-500" />
                    LinkedIn
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3 text-green-500" />
                    Email
                  </div>
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-purple-500" />
                    Blog
                  </div>
                  <div className="flex items-center gap-2">
                    <Rss className="h-3 w-3 text-orange-500" />
                    SEO
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-orange-500" />
                  Status Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <ul className="space-y-2 text-sm">
                  <li>• Pending: Chờ publish với countdown timer</li>
                  <li>• Published: Đã đăng thành công</li>
                  <li>• Failed: Lỗi với error message details</li>
                  <li>• Automatic retry mechanisms</li>
                  <li>• Error message display</li>
                  <li>• Status change animations</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Statistics Tab */}
        <TabsContent value="stats" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Posts</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
                <p className="text-xs text-muted-foreground">
                  In queue
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
                <p className="text-xs text-muted-foreground">
                  Waiting to publish
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Published</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.published}</div>
                <p className="text-xs text-muted-foreground">
                  Successfully posted
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Failed</CardTitle>
                <XCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
                <p className="text-xs text-muted-foreground">
                  Need attention
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Platforms</CardTitle>
                <Timer className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.platforms}</div>
                <p className="text-xs text-muted-foreground">
                  Active platforms
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Platform Distribution</CardTitle>
              <CardDescription>
                Distribution của posts theo từng platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {['Twitter', 'LinkedIn', 'Email', 'Blog', 'SEO'].map(platform => {
                  const platformPosts = posts.filter(p => p.platform === platform)
                  const percentage = (platformPosts.length / posts.length) * 100
                  
                  return (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(platform)}
                          <span className="text-sm font-medium">{platform}</span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {platformPosts.length} posts ({percentage.toFixed(1)}%)
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
                Cách sử dụng ScheduledPublishingQueue trong projects
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h4 className="font-medium">Basic Implementation</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`import { ScheduledPublishingQueue, type ScheduledPost } from '@/components/ui/scheduled-publishing-queue'

const scheduledPosts: ScheduledPost[] = [
  {
    post_id: 'POST-001',
    title: 'AI Marketing Strategy',
    platform: 'LinkedIn',
    scheduled_for: '2024-11-04T14:30:00Z',
    status: 'pending'
  }
]

function MyComponent() {
  const handleRetry = (postId) => {
    console.log('Retrying post:', postId)
  }

  const handleCancel = (postId) => {
    console.log('Cancelling post:', postId)
  }

  return (
    <ScheduledPublishingQueue
      posts={scheduledPosts}
      onRetry={handleRetry}
      onCancel={handleCancel}
    />
  )
}`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">With All Features</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`<ScheduledPublishingQueue
  posts={posts}
  onRetry={handleRetry}
  onCancel={handleCancel}
  onReschedule={(postId, newTime) => {
    // Update scheduled time
    updatePostSchedule(postId, newTime)
  }}
  onExportCSV={() => {
    // Custom CSV export
    exportQueueToCSV(posts)
  }}
/>`}</code>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium">Props Interface</h4>
                <div className="bg-muted rounded-lg p-4 text-sm overflow-auto">
                  <code>{`interface ScheduledPublishingQueueProps {
  posts: ScheduledPost[]                     // Required: Array of scheduled posts
  onRetry?: (postId: string) => void         // Optional: Retry failed post handler
  onCancel?: (postId: string) => void        // Optional: Cancel pending post handler
  onReschedule?: (postId: string, newTime: string) => void  // Optional: Reschedule handler
  onExportCSV?: () => void                   // Optional: CSV export handler
  className?: string                         // Optional: Additional CSS classes
}

interface ScheduledPost {
  post_id: string                            // Required: Unique post identifier
  title: string                              // Required: Post title
  platform: 'Twitter' | 'LinkedIn' | 'Email' | 'Blog' | 'SEO'  // Required: Publishing platform
  scheduled_for: string                      // Required: ISO timestamp
  status: 'pending' | 'published' | 'failed'  // Required: Current status
  content?: string                           // Optional: Post content
  error_message?: string                     // Optional: Error message for failed posts
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