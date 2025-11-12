'use client'

import { useState } from 'react'
import { TwitterPreview } from '@/components/ui/twitter-preview'
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
  Twitter,
  Sparkles
} from 'lucide-react'

export default function DemoTwitterPreviewPage() {
  const [previewData, setPreviewData] = useState({
    name: 'John Doe',
    username: 'johndoe',
    content: 'Just shipped a new feature! 🚀\n\nExcited to see what you think. Let me know your thoughts in the comments below.',
    replyCount: 12,
    retweetCount: 45,
    likeCount: 234,
    timestamp: new Date()
  })

  const [customAvatar, setCustomAvatar] = useState('')

  const sampleTweets = [
    {
      name: 'Elon Musk',
      username: 'elonmusk',
      content: 'The future is going to be wild. AI, space exploration, sustainable energy - we\'re living in the most exciting time in human history.',
      replyCount: 15234,
      retweetCount: 8923,
      likeCount: 125678,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      avatar: 'https://i.pravatar.cc/150?img=12'
    },
    {
      name: 'Tech News',
      username: 'technews',
      content: 'Breaking: New AI model breaks all previous benchmarks. This could change everything we know about machine learning.',
      replyCount: 234,
      retweetCount: 567,
      likeCount: 3456,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      avatar: 'https://i.pravatar.cc/150?img=5'
    },
    {
      name: 'Design Daily',
      username: 'designdaily',
      content: 'Beautiful UI design inspiration for today:\n\n• Clean minimalism\n• Bold typography\n• Thoughtful spacing\n\nWhat\'s your favorite design trend?',
      replyCount: 89,
      retweetCount: 156,
      likeCount: 1234,
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      avatar: 'https://i.pravatar.cc/150?img=8'
    },
    {
      name: 'Code Master',
      username: 'codemaster',
      content: 'Just refactored 1000 lines of legacy code. The feeling when everything finally works is unmatched. 💻✨',
      replyCount: 45,
      retweetCount: 78,
      likeCount: 567,
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    }
  ]

  const resetPreview = () => {
    setPreviewData({
      name: 'John Doe',
      username: 'johndoe',
      content: 'Just shipped a new feature! 🚀\n\nExcited to see what you think. Let me know your thoughts in the comments below.',
      replyCount: 12,
      retweetCount: 45,
      likeCount: 234,
      timestamp: new Date()
    })
    setCustomAvatar('')
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Twitter className="h-8 w-8 text-blue-500" />
            TwitterPreview Component Demo
          </h1>
          <p className="text-muted-foreground">
            Component preview tweet giống Twitter thật với avatar, tên, timestamp, nội dung và các nút tương tác.
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
                  <Sparkles className="h-5 w-5 text-blue-500" />
                  Preview
                </CardTitle>
                <CardDescription>
                  Tweet preview giống Twitter thật
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  <TwitterPreview
                    {...previewData}
                    avatar={customAvatar || undefined}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Sample Tweets */}
            <Card>
              <CardHeader>
                <CardTitle>Sample Tweets</CardTitle>
                <CardDescription>
                  Các ví dụ tweet khác nhau
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                  {sampleTweets.map((tweet, index) => (
                    <TwitterPreview key={index} {...tweet} />
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
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    value={previewData.username}
                    onChange={(e) => setPreviewData({ ...previewData, username: e.target.value })}
                    placeholder="johndoe"
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
                  placeholder="What's happening?"
                  className="min-h-[120px]"
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="replies">Replies</Label>
                  <Input
                    id="replies"
                    type="number"
                    value={previewData.replyCount}
                    onChange={(e) => setPreviewData({ ...previewData, replyCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="retweets">Retweets</Label>
                  <Input
                    id="retweets"
                    type="number"
                    value={previewData.retweetCount}
                    onChange={(e) => setPreviewData({ ...previewData, retweetCount: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="likes">Likes</Label>
                  <Input
                    id="likes"
                    type="number"
                    value={previewData.likeCount}
                    onChange={(e) => setPreviewData({ ...previewData, likeCount: parseInt(e.target.value) || 0 })}
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
            <CardContent className="p-0">
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                <TwitterPreview
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
              <CardTitle>Different Tweet Examples</CardTitle>
              <CardDescription>
                Các ví dụ tweet với nội dung và số liệu khác nhau
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="bg-white dark:bg-gray-950 rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                {sampleTweets.map((tweet, index) => (
                  <TwitterPreview key={index} {...tweet} />
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
{`import { TwitterPreview } from '@/components/ui/twitter-preview'

export default function MyComponent() {
  return (
    <TwitterPreview
      name="John Doe"
      username="johndoe"
      content="Just shipped a new feature! 🚀"
      timestamp={new Date()}
      replyCount={12}
      retweetCount={45}
      likeCount={234}
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
                  <h4 className="font-semibold mb-2">TwitterPreviewProps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">name: string</code>
                      <span className="text-muted-foreground">- Tên người dùng</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">username: string</code>
                      <span className="text-muted-foreground">- Username (không có @)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">content: string</code>
                      <span className="text-muted-foreground">- Nội dung tweet</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">timestamp: Date | string</code>
                      <span className="text-muted-foreground">- Thời gian đăng tweet</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">avatar?: string</code>
                      <span className="text-muted-foreground">- URL avatar (optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">replyCount?: number</code>
                      <span className="text-muted-foreground">- Số lượt reply (default: 0)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">retweetCount?: number</code>
                      <span className="text-muted-foreground">- Số lượt retweet (default: 0)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">likeCount?: number</code>
                      <span className="text-muted-foreground">- Số lượt like (default: 0)</span>
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
        </TabsContent>
      </Tabs>
    </div>
  )
}




