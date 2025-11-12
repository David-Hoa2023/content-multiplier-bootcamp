'use client'

import { useState } from 'react'
import { DerivativeTabs, type PlatformConfig, type Platform } from '@/components/ui/derivative-tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Toaster } from '@/components/ui/toaster'
import { 
  RefreshCw,
  RotateCcw,
  Code,
  Sparkles
} from 'lucide-react'

export default function DemoDerivativeTabsPage() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([
    {
      platform: 'Twitter',
      characterLimit: 280,
      content: 'This is a sample tweet content that demonstrates the character counter badge functionality.'
    },
    {
      platform: 'LinkedIn',
      characterLimit: 3000,
      content: 'This is a longer LinkedIn post content that can be much more detailed and professional. LinkedIn allows for more comprehensive content sharing, making it ideal for thought leadership and professional networking.'
    },
    {
      platform: 'Facebook',
      characterLimit: 5000,
      content: 'Facebook post content can be quite extensive. This platform allows for longer form content compared to Twitter, making it suitable for detailed updates, stories, and community engagement.'
    },
    {
      platform: 'Instagram',
      characterLimit: 2200,
      content: 'Instagram caption content. While Instagram is primarily visual, captions can be quite long and engaging. This allows for storytelling and detailed descriptions of your visual content.'
    },
    {
      platform: 'TikTok',
      characterLimit: 300,
      content: 'TikTok caption - short and catchy!'
    }
  ])

  const [activePlatform, setActivePlatform] = useState<Platform>('Twitter')

  const updateContent = (platform: Platform, content: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.platform === platform 
          ? { ...p, content }
          : p
      )
    )
  }

  const resetContent = () => {
    setPlatforms([
      {
        platform: 'Twitter',
        characterLimit: 280,
        content: ''
      },
      {
        platform: 'LinkedIn',
        characterLimit: 3000,
        content: ''
      },
      {
        platform: 'Facebook',
        characterLimit: 5000,
        content: ''
      },
      {
        platform: 'Instagram',
        characterLimit: 2200,
        content: ''
      },
      {
        platform: 'TikTok',
        characterLimit: 300,
        content: ''
      }
    ])
  }

  const getCurrentContent = (platform: Platform): string => {
    return platforms.find(p => p.platform === platform)?.content || ''
  }

  const getCharacterCount = (platform: Platform): number => {
    return getCurrentContent(platform).length
  }

  const isOverLimit = (platform: Platform): boolean => {
    const config = platforms.find(p => p.platform === platform)
    if (!config) return false
    return getCharacterCount(platform) > config.characterLimit
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">DerivativeTabs Component Demo</h1>
          <p className="text-muted-foreground">
            Component Tabs với icon cho từng platform (Twitter, LinkedIn, Facebook, Instagram, TikTok) và badge hiển thị số ký tự.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <Button onClick={resetContent} variant="outline" className="gap-2">
            <RotateCcw className="h-4 w-4" />
            Reset Content
          </Button>
          <Separator orientation="vertical" className="h-6" />
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Platform:</span>
            <Badge variant="secondary">{activePlatform}</Badge>
          </div>
        </div>
      </div>

      <Tabs defaultValue="demo" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="demo">Live Demo</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
          <TabsTrigger value="usage">Usage</TabsTrigger>
          <TabsTrigger value="code">Code Example</TabsTrigger>
        </TabsList>

        {/* Live Demo Tab */}
        <TabsContent value="demo" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                DerivativeTabs Component
              </CardTitle>
              <CardDescription>
                Nhập nội dung vào textarea bên dưới để thấy badge đếm ký tự thay đổi màu sắc
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <DerivativeTabs
                platforms={platforms}
                defaultValue={activePlatform}
                onPlatformChange={setActivePlatform}
              >
                <div className="space-y-4 mt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">
                      Content for {activePlatform}
                    </label>
                    <Badge 
                      variant={isOverLimit(activePlatform) ? 'destructive' : 'secondary'}
                      className={
                        isOverLimit(activePlatform)
                          ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }
                    >
                      {getCharacterCount(activePlatform)} / {platforms.find(p => p.platform === activePlatform)?.characterLimit}
                    </Badge>
                  </div>
                  <Textarea
                    value={getCurrentContent(activePlatform)}
                    onChange={(e) => updateContent(activePlatform, e.target.value)}
                    placeholder={`Enter content for ${activePlatform}...`}
                    className="min-h-[200px]"
                  />
                  {isOverLimit(activePlatform) && (
                    <p className="text-sm text-red-600 dark:text-red-400">
                      ⚠️ Content exceeds the character limit for {activePlatform}
                    </p>
                  )}
                </div>
              </DerivativeTabs>
            </CardContent>
          </Card>

          {/* Platform Stats */}
          <Card>
            <CardHeader>
              <CardTitle>Platform Statistics</CardTitle>
              <CardDescription>
                Character count overview for all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {platforms.map(({ platform, characterLimit }) => {
                  const count = getCharacterCount(platform)
                  const overLimit = count > characterLimit
                  const percentage = Math.min((count / characterLimit) * 100, 100)
                  
                  return (
                    <div key={platform} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{platform}</span>
                        <Badge
                          variant={overLimit ? 'destructive' : 'secondary'}
                          className={
                            overLimit
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          }
                        >
                          {count} / {characterLimit}
                        </Badge>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div
                          className={`rounded-full h-2 transition-all duration-300 ${
                            overLimit
                              ? 'bg-red-500'
                              : count > characterLimit * 0.8
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Tab */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Features</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Platform Icons</h4>
                    <p className="text-sm text-muted-foreground">
                      Icons cho từng platform: Twitter, LinkedIn (từ lucide-react), Facebook, Instagram, TikTok (SVG custom)
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Character Counter Badge</h4>
                    <p className="text-sm text-muted-foreground">
                      Badge hiển thị số ký tự hiện tại / giới hạn. Màu xanh khi ≤ limit, màu đỏ khi vượt quá
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Responsive Design</h4>
                    <p className="text-sm text-muted-foreground">
                      Tên platform ẩn trên màn hình nhỏ, chỉ hiển thị icon và badge
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">TypeScript Support</h4>
                    <p className="text-sm text-muted-foreground">
                      Đầy đủ type definitions và interfaces
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Badge variant="secondary" className="mt-1">✓</Badge>
                  <div>
                    <h4 className="font-semibold">Customizable</h4>
                    <p className="text-sm text-muted-foreground">
                      Hỗ trợ callback khi platform thay đổi, custom className, và children content
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Platform Limits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {platforms.map(({ platform, characterLimit }) => (
                  <div key={platform} className="flex items-center justify-between p-2 rounded border">
                    <span className="font-medium">{platform}</span>
                    <Badge variant="outline">{characterLimit} characters</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Usage Tab */}
        <TabsContent value="usage" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Usage Guide</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">1. Import Component</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`import { DerivativeTabs, type PlatformConfig } from '@/components/ui/derivative-tabs'`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">2. Define Platforms</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`const platforms: PlatformConfig[] = [
  { platform: 'Twitter', characterLimit: 280, content: '...' },
  { platform: 'LinkedIn', characterLimit: 3000, content: '...' },
  { platform: 'Facebook', characterLimit: 5000, content: '...' },
  { platform: 'Instagram', characterLimit: 2200, content: '...' },
  { platform: 'TikTok', characterLimit: 300, content: '...' },
]`}
                  </pre>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">3. Use Component</h4>
                  <pre className="bg-muted p-3 rounded text-sm overflow-x-auto">
{`<DerivativeTabs 
  platforms={platforms}
  defaultValue="Twitter"
  onPlatformChange={(platform) => console.log(platform)}
>
  {/* Your content here */}
</DerivativeTabs>`}
                  </pre>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Code Example Tab */}
        <TabsContent value="code" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="h-5 w-5" />
                Complete Example
              </CardTitle>
            </CardHeader>
            <CardContent>
              <pre className="bg-muted p-4 rounded text-sm overflow-x-auto">
{`'use client'

import { useState } from 'react'
import { DerivativeTabs, type PlatformConfig } from '@/components/ui/derivative-tabs'
import { Textarea } from '@/components/ui/textarea'

export default function MyComponent() {
  const [platforms, setPlatforms] = useState<PlatformConfig[]>([
    { platform: 'Twitter', characterLimit: 280, content: '' },
    { platform: 'LinkedIn', characterLimit: 3000, content: '' },
    { platform: 'Facebook', characterLimit: 5000, content: '' },
    { platform: 'Instagram', characterLimit: 2200, content: '' },
    { platform: 'TikTok', characterLimit: 300, content: '' },
  ])

  const [activePlatform, setActivePlatform] = useState('Twitter')

  const updateContent = (platform: string, content: string) => {
    setPlatforms(prev => 
      prev.map(p => 
        p.platform === platform 
          ? { ...p, content }
          : p
      )
    )
  }

  const getCurrentContent = (platform: string) => {
    return platforms.find(p => p.platform === platform)?.content || ''
  }

  return (
    <DerivativeTabs
      platforms={platforms}
      defaultValue={activePlatform}
      onPlatformChange={setActivePlatform}
    >
      <Textarea
        value={getCurrentContent(activePlatform)}
        onChange={(e) => updateContent(activePlatform, e.target.value)}
        placeholder={\`Enter content for \${activePlatform}...\`}
      />
    </DerivativeTabs>
  )
}`}
              </pre>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <Toaster />
    </div>
  )
}

