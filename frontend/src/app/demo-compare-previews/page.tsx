'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { ComparePreviews } from '@/components/ui/compare-previews'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { ThemeToggle } from '@/components/theme-toggle'
import { 
  RefreshCw,
  RotateCcw,
  Code,
  Sparkles,
  LayoutGrid,
  Loader2
} from 'lucide-react'

export default function DemoComparePreviewsPage() {
  const [content, setContent] = useState(
    'Excited to share that we just launched a new feature! 🚀\n\nThis has been months in the making, and I\'m proud of the team\'s hard work. Looking forward to hearing your feedback.\n\n#TechInnovation #SoftwareDevelopment'
  )
  const [authorName, setAuthorName] = useState('John Doe')
  const [authorUsername, setAuthorUsername] = useState('johndoe')
  const [authorHeadline, setAuthorHeadline] = useState('Senior Software Engineer at Tech Company')
  const [avatar, setAvatar] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showResponsiveToggle, setShowResponsiveToggle] = useState(true)
  const [platforms, setPlatforms] = useState({
    Twitter: true,
    LinkedIn: true,
    Facebook: true,
    Instagram: true,
    TikTok: true
  })

  const sampleContents = [
    {
      title: 'Product Launch',
      content: 'Excited to share that we just launched a new feature! 🚀\n\nThis has been months in the making, and I\'m proud of the team\'s hard work. Looking forward to hearing your feedback.\n\n#TechInnovation #SoftwareDevelopment'
    },
    {
      title: 'Short & Catchy',
      content: 'Just shipped! 🎉 What do you think?'
    },
    {
      title: 'Long Form',
      content: 'Today I want to share some thoughts on the future of technology and how it\'s shaping our world.\n\nWe\'re living in an incredible time where innovation is happening at an unprecedented pace. From AI to quantum computing, the possibilities seem endless.\n\nBut with great power comes great responsibility. As we build these technologies, we must ensure they benefit all of humanity, not just a select few.\n\nWhat are your thoughts on this? I\'d love to hear your perspective in the comments below.\n\n#Technology #Innovation #Future #AI #TechEthics'
    },
    {
      title: 'Question Post',
      content: 'What\'s your favorite productivity tip? 💡\n\nShare yours in the comments! 👇'
    }
  ]

  const resetContent = () => {
    setContent('Excited to share that we just launched a new feature! 🚀\n\nThis has been months in the making, and I\'m proud of the team\'s hard work. Looking forward to hearing your feedback.\n\n#TechInnovation #SoftwareDevelopment')
    setAuthorName('John Doe')
    setAuthorUsername('johndoe')
    setAuthorHeadline('Senior Software Engineer at Tech Company')
    setAvatar('')
    setPlatforms({
      Twitter: true,
      LinkedIn: true,
      Facebook: true,
      Instagram: true,
      TikTok: true
    })
  }

  const selectedPlatforms = Object.entries(platforms)
    .filter(([_, selected]) => selected)
    .map(([platform]) => platform) as ('Twitter' | 'LinkedIn' | 'Facebook' | 'Instagram' | 'TikTok')[]

  return (
    <AppLayout
      pageTitle="Compare Previews Demo"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Demos', href: '#' },
        { label: 'Compare Previews Demo' },
      ]}
    >
      <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <LayoutGrid className="h-8 w-8 text-blue-500" />
            ComparePreviews Component Demo
          </h1>
          <p className="text-muted-foreground">
            So sánh preview của cùng một nội dung trên các platform khác nhau: Twitter, LinkedIn, Facebook, Instagram, TikTok.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={resetContent} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset
          </Button>
          <Button 
            onClick={() => setIsLoading(!isLoading)} 
            variant={isLoading ? 'default' : 'outline'}
            className="gap-2"
          >
            <Loader2 className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            {isLoading ? 'Loading...' : 'Simulate Loading'}
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <ThemeToggle />
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                Platform Comparison
              </CardTitle>
              <CardDescription>
                Cùng một nội dung hiển thị trên các platform khác nhau. Thử xóa nội dung để xem EmptyState hoặc click "Simulate Loading" để xem LoadingSkeleton.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparePreviews
                content={content}
                authorName={authorName}
                authorUsername={authorUsername}
                authorHeadline={authorHeadline}
                avatar={avatar || undefined}
                platforms={selectedPlatforms}
                isLoading={isLoading}
                showResponsiveToggle={showResponsiveToggle}
                onGenerateClick={() => {
                  setIsLoading(true)
                  setTimeout(() => {
                    setContent('Generated content! This is a sample post created automatically.')
                    setIsLoading(false)
                  }, 2000)
                }}
              />
            </CardContent>
          </Card>

          {/* Empty State Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Empty State Demo</CardTitle>
              <CardDescription>
                Xóa nội dung để xem EmptyState với CTA
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparePreviews
                content=""
                onGenerateClick={() => {
                  setContent('New content generated!')
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customize Tab */}
        <TabsContent value="customize" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Content & Author</CardTitle>
                <CardDescription>
                  Tùy chỉnh nội dung và thông tin tác giả
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="content">Content</Label>
                  <Textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Enter your content..."
                    className="min-h-[200px]"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Author Name</Label>
                    <Input
                      id="name"
                      value={authorName}
                      onChange={(e) => setAuthorName(e.target.value)}
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={authorUsername}
                      onChange={(e) => setAuthorUsername(e.target.value)}
                      placeholder="johndoe"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="headline">Headline (LinkedIn)</Label>
                  <Input
                    id="headline"
                    value={authorHeadline}
                    onChange={(e) => setAuthorHeadline(e.target.value)}
                    placeholder="Senior Software Engineer at Tech Company"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="avatar">Avatar URL (optional)</Label>
                  <Input
                    id="avatar"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://example.com/avatar.jpg"
                  />
                </div>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="responsive-toggle"
                    checked={showResponsiveToggle}
                    onCheckedChange={(checked) => setShowResponsiveToggle(checked === true)}
                  />
                  <Label
                    htmlFor="responsive-toggle"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                  >
                    Show Responsive Toggle (Mobile/Desktop)
                  </Label>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Platforms</CardTitle>
                <CardDescription>
                  Chọn platforms để hiển thị
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {(['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok'] as const).map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={platforms[platform]}
                      onCheckedChange={(checked) =>
                        setPlatforms({ ...platforms, [platform]: checked === true })
                      }
                    />
                    <Label
                      htmlFor={platform}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      {platform}
                    </Label>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Live Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Live Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <ComparePreviews
                content={content}
                authorName={authorName}
                authorUsername={authorUsername}
                authorHeadline={authorHeadline}
                avatar={avatar || undefined}
                platforms={selectedPlatforms}
                isLoading={isLoading}
                showResponsiveToggle={showResponsiveToggle}
                onGenerateClick={() => {
                  setIsLoading(true)
                  setTimeout(() => {
                    setContent('Generated content! This is a sample post created automatically.')
                    setIsLoading(false)
                  }, 2000)
                }}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Examples Tab */}
        <TabsContent value="examples" className="space-y-6">
          {sampleContents.map((sample, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>{sample.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-muted rounded-lg">
                  <p className="text-sm text-muted-foreground mb-2">Content:</p>
                  <p className="whitespace-pre-wrap">{sample.content}</p>
                </div>
                <ComparePreviews
                  content={sample.content}
                  authorName={authorName}
                  authorUsername={authorUsername}
                  authorHeadline={authorHeadline}
                  avatar={avatar || undefined}
                />
              </CardContent>
            </Card>
          ))}
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
{`import { ComparePreviews } from '@/components/ui/compare-previews'

export default function MyComponent() {
  return (
    <ComparePreviews
      content="Your content here..."
      authorName="John Doe"
      authorUsername="johndoe"
      authorHeadline="Senior Software Engineer at Tech Company"
      avatar="https://example.com/avatar.jpg" // optional
      platforms={['Twitter', 'LinkedIn', 'Facebook', 'Instagram', 'TikTok']} // optional
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
                  <h4 className="font-semibold mb-2">ComparePreviewsProps</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">content: string</code>
                      <span className="text-muted-foreground">- Nội dung để hiển thị</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">authorName?: string</code>
                      <span className="text-muted-foreground">- Tên tác giả (default: 'John Doe')</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">authorUsername?: string</code>
                      <span className="text-muted-foreground">- Username (default: 'johndoe')</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">authorHeadline?: string</code>
                      <span className="text-muted-foreground">- Headline cho LinkedIn (optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">avatar?: string</code>
                      <span className="text-muted-foreground">- URL avatar (optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">timestamp?: Date | string</code>
                      <span className="text-muted-foreground">- Timestamp (default: now)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">platforms?: Platform[]</code>
                      <span className="text-muted-foreground">- Platforms để hiển thị (optional)</span>
                    </div>
                    <div className="flex gap-2">
                      <code className="bg-muted px-2 py-1 rounded">showAllPlatforms?: boolean</code>
                      <span className="text-muted-foreground">- Hiển thị tất cả platforms (default: true)</span>
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
                    <h4 className="font-semibold">Multi-Platform Comparison</h4>
                    <p className="text-sm text-muted-foreground">
                      Hiển thị cùng một nội dung trên 5 platforms: Twitter, LinkedIn, Facebook, Instagram, TikTok
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Responsive Grid Layout</h4>
                    <p className="text-sm text-muted-foreground">
                      Grid layout tự động điều chỉnh theo kích thước màn hình
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Platform Selection</h4>
                    <p className="text-sm text-muted-foreground">
                      Chọn platforms để hiển thị hoặc ẩn
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Customizable Content</h4>
                    <p className="text-sm text-muted-foreground">
                      Tùy chỉnh nội dung, tác giả, và avatar
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

