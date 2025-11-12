'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { LinkedInPreview } from '@/components/ui/linkedin-preview'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  RefreshCw,
  RotateCcw,
  Code,
  Linkedin,
  Sparkles
} from 'lucide-react'

export default function DemoLinkedInPreviewPage() {
  const [previewData, setPreviewData] = useState({
    name: 'John Doe',
    headline: 'Senior Software Engineer at Tech Company',
    content: 'Excited to share that we just launched a new feature! 🚀\n\nThis has been months in the making, and I\'m proud of the team\'s hard work. Looking forward to hearing your feedback.\n\n#TechInnovation #SoftwareDevelopment',
    likeCount: 234,
    commentCount: 45,
    repostCount: 12,
    timestamp: new Date()
  })

  const [customAvatar, setCustomAvatar] = useState('')

  const samplePosts = [
    {
      name: 'Sarah Johnson',
      headline: 'Product Manager | AI Enthusiast',
      content: 'Just wrapped up an amazing conference on AI and machine learning. The future of technology is truly exciting! Key takeaways:\n\n• AI will transform how we work\n• Ethics in AI is crucial\n• Collaboration is key\n\nWhat are your thoughts on AI\'s impact?',
      likeCount: 567,
      commentCount: 89,
      repostCount: 34,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      avatar: 'https://i.pravatar.cc/150?img=47'
    },
    {
      name: 'Michael Chen',
      headline: 'CEO at Startup Inc. | Building the Future',
      content: 'We\'re hiring! 🎉\n\nLooking for talented engineers to join our growing team. If you\'re passionate about innovation and want to make an impact, check out our open positions.\n\n#Hiring #TechJobs #StartupLife',
      likeCount: 1234,
      commentCount: 156,
      repostCount: 78,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      avatar: 'https://i.pravatar.cc/150?img=33'
    },
    {
      name: 'Emily Rodriguez',
      headline: 'UX Designer | Creating Beautiful Experiences',
      content: 'Design tip of the day: Always prioritize user experience over aesthetics. A beautiful design that doesn\'t work well is just decoration.\n\nWhat\'s your favorite UX principle?',
      likeCount: 345,
      commentCount: 67,
      repostCount: 23,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      avatar: 'https://i.pravatar.cc/150?img=20'
    },
    {
      name: 'David Kim',
      headline: 'Data Scientist | Machine Learning Expert',
      content: 'Just published a new article on deep learning architectures. Check it out if you\'re interested in neural networks and their applications.\n\nLink in comments 👇',
      likeCount: 789,
      commentCount: 123,
      repostCount: 45,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    }
  ]

  const resetPreview = () => {
    setPreviewData({
      name: 'John Doe',
      headline: 'Senior Software Engineer at Tech Company',
      content: 'Excited to share that we just launched a new feature! 🚀\n\nThis has been months in the making, and I\'m proud of the team\'s hard work. Looking forward to hearing your feedback.\n\n#TechInnovation #SoftwareDevelopment',
      likeCount: 234,
      commentCount: 45,
      repostCount: 12,
      timestamp: new Date()
    })
    setCustomAvatar('')
  }

  return (
    <AppLayout
      pageTitle="LinkedIn Preview Demo"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Demos', href: '#' },
        { label: 'LinkedIn Preview Demo' },
      ]}
    >
      <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Linkedin className="h-8 w-8 text-blue-600" />
            LinkedInPreview Component Demo
          </h1>
          <p className="text-muted-foreground">
            Component preview post giống LinkedIn thật với profile section, nội dung và engagement bar.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={resetPreview} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="customize">Customize</TabsTrigger>
          <TabsTrigger value="examples">Examples</TabsTrigger>
          <TabsTrigger value="code">Code</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Preview */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  Preview
                </CardTitle>
                <CardDescription>
                  LinkedIn post preview giống LinkedIn thật
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="max-w-2xl">
                  <LinkedInPreview
                    {...previewData}
                    avatar={customAvatar || undefined}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sample Posts */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Posts</CardTitle>
                <CardDescription>
                  Các ví dụ post khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-w-2xl">
                  {samplePosts.map((post, index) => (
                    <LinkedInPreview key={index} {...post} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Customize Tab */}
        <TabsContent value="customize" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customize Preview</CardTitle>
              <CardDescription>
                Thay đổi các giá trị để xem preview cập nhật
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={previewData.name}
                    onChange={(e) => setPreviewData({ ...previewData, name: e.target.value })}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline</Label>
                  <Input
                    id="headline"
                    value={previewData.headline}
                    onChange={(e) => setPreviewData({ ...previewData, headline: e.target.value })}
                    placeholder="Senior Software Engineer at Tech Company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL (optional)</Label>
                  <Input
                    id="avatar"
                    value={customAvatar}
                    onChange={(e) => setCustomAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="timestamp">Timestamp</Label>
                  <Input
                    id="timestamp"
                    type="datetime-local"
                    value={new Date(previewData.timestamp).toISOString().slice(0, 16)}
                    onChange={(e) => setPreviewData({ ...previewData, timestamp: new Date(e.target.value) })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={previewData.content}
                  onChange={(e) => setPreviewData({ ...previewData, content: e.target.value })}
                  placeholder="What do you want to talk about?"
                  className="min-h-[150px]"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={previewData.likeCount}
                    onChange={(e) => setPreviewData({ ...previewData, likeCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comments">Comments</Label>
                  <Input
                    id="comments"
                    type="number"
                    value={previewData.commentCount}
                    onChange={(e) => setPreviewData({ ...previewData, commentCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="reposts">Reposts</Label>
                  <Input
                    id="reposts"
                    type="number"
                    value={previewData.repostCount}
                    onChange={(e) => setPreviewData({ ...previewData, repostCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-w-2xl">
                <LinkedInPreview
                  {...previewData}
                  avatar={customAvatar || undefined}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Different Post Examples</CardTitle>
              <CardDescription>
                Các ví dụ post với nội dung và số liệu khác nhau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-w-2xl">
                {samplePosts.map((post, index) => (
                  <LinkedInPreview key={index} {...post} />
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Tab */}
        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Usage Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`import { LinkedInPreview } from '@/components/ui/linkedin-preview'

export default function MyComponent() {
  return (
    <LinkedInPreview
      name="John Doe"
      headline="Senior Software Engineer at Tech Company"
      content="Excited to share that we just launched a new feature! 🚀"
      timestamp={new Date()}
      likeCount={234}
      commentCount={45}
      repostCount={12}
      avatar="https://example.com/avatar.jpg" // optional
    />
  )
}`}
              </pre>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Props</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">LinkedInPreviewProps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">name: string</code>
                      <span className="text-muted-foreground">- Tên người dùng</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">headline?: string</code>
                      <span className="text-muted-foreground">- Headline/job title (optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">content: string</code>
                      <span className="text-muted-foreground">- Nội dung post</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">timestamp: Date | string</code>
                      <span className="text-muted-foreground">- Thời gian đăng post</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">avatar?: string</code>
                      <span className="text-muted-foreground">- URL avatar (optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">likeCount?: number</code>
                      <span className="text-muted-foreground">- Số lượt like (default: 0)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">commentCount?: number</code>
                      <span className="text-muted-foreground">- Số lượt comment (default: 0)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">repostCount?: number</code>
                      <span className="text-muted-foreground">- Số lượt repost (default: 0)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">className?: string</code>
                      <span className="text-muted-foreground">- Custom className</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Profile Section</h4>
                    <p className="text-sm text-muted-foreground">
                      Avatar, tên, headline (job title), và timestamp
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Content Section</h4>
                    <p className="text-sm text-muted-foreground">
                      Nội dung post với hỗ trợ line breaks và formatting
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Engagement Stats</h4>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị số lượt like, comment, repost với LinkedIn-style icons
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Engagement Bar</h4>
                    <p className="text-sm text-muted-foreground">
                      Các nút Like, Comment, Repost, Send với hover effects
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">LinkedIn Styling</h4>
                    <p className="text-sm text-muted-foreground">
                      Card design, colors, và layout giống LinkedIn thật
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      </div>
    </AppLayout>
  )
}




