'use client'

import { useState } from 'react'
import { AppLayout } from '@/components/layout'
import { 
  EmptyState, 
  EmptyIdeas, 
  EmptyBriefs, 
  EmptySearch, 
  EmptyArchive 
} from '@/components/ui/empty-state'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lightbulb,
  FileText,
  Users,
  Settings,
  Inbox,
  Image as ImageIcon,
  Heart,
  Star,
  Zap,
  Sparkles,
  Palette,
  Music,
  Camera,
  Globe,
  RefreshCw
} from 'lucide-react'

export default function DemoEmptyStatePage() {
  const [actionCount, setActionCount] = useState(0)
  
  const handleAction = (action: string) => {
    setActionCount(prev => prev + 1)
    console.log(`Action: ${action}`)
    alert(`Action "${action}" được thực hiện! (${actionCount + 1} lần)`)
  }

  const resetDemo = () => {
    setActionCount(0)
    window.location.reload()
  }

  return (
    <AppLayout
      pageTitle="Empty State Demo"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Demos', href: '#' },
        { label: 'Empty State Demo' },
      ]}
    >
      <div className="space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">EmptyState Component Demo</h1>
          <p className="text-muted-foreground">
            Demo component EmptyState với animations, variants, và presets khác nhau.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <Badge variant="secondary">
            Actions thực hiện: {actionCount}
          </Badge>
          <Button variant="outline" onClick={resetDemo} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Reset Demo
          </Button>
        </div>
      </div>

      <Tabs defaultValue="variants" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="sizes">Sizes</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
        </TabsList>

        {/* Variants Demo */}
        <TabsContent value="variants" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Variants</CardTitle>
              <CardDescription>
                Ba variant khác nhau: default, compact, và minimal
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Default Variant */}
                <Card className="h-80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Default</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <EmptyState
                      title="No ideas yet"
                      description="Start by creating your first idea to begin the content creation journey"
                      ctaLabel="Add Idea"
                      onClick={() => handleAction('Add Idea - Default')}
                      icon={<Lightbulb className="h-16 w-16" />}
                      variant="default"
                      size="sm"
                    />
                  </CardContent>
                </Card>

                {/* Compact Variant */}
                <Card className="h-80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Compact</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <EmptyState
                      title="No briefs available"
                      description="Create your first brief to get started"
                      ctaLabel="Generate Brief"
                      onClick={() => handleAction('Generate Brief - Compact')}
                      icon={<FileText className="h-12 w-12" />}
                      variant="compact"
                      size="sm"
                    />
                  </CardContent>
                </Card>

                {/* Minimal Variant */}
                <Card className="h-80">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">Minimal</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <EmptyState
                      title="No results found"
                      description="Try adjusting your search criteria"
                      variant="minimal"
                      size="sm"
                      showCTA={false}
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Sizes Demo */}
        <TabsContent value="sizes" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sizes</CardTitle>
              <CardDescription>
                Ba kích thước khác nhau: small, medium, và large
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {/* Small */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Small</h3>
                  <Card>
                    <CardContent className="p-0">
                      <EmptyState
                        title="No notifications"
                        description="You're all caught up!"
                        ctaLabel="Refresh"
                        onClick={() => handleAction('Refresh - Small')}
                        icon={<Inbox className="h-12 w-12" />}
                        size="sm"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Medium */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Medium (Default)</h3>
                  <Card>
                    <CardContent className="p-0">
                      <EmptyState
                        title="No team members"
                        description="Invite colleagues to collaborate on your content projects and share ideas together"
                        ctaLabel="Invite Team"
                        onClick={() => handleAction('Invite Team - Medium')}
                        icon={<Users className="h-16 w-16" />}
                        size="md"
                      />
                    </CardContent>
                  </Card>
                </div>

                {/* Large */}
                <div>
                  <h3 className="text-sm font-medium mb-4">Large</h3>
                  <Card>
                    <CardContent className="p-0">
                      <EmptyState
                        title="Welcome to ContentHub"
                        description="Start your content creation journey by setting up your workspace and creating your first project. We'll guide you through every step of the process."
                        ctaLabel="Get Started"
                        onClick={() => handleAction('Get Started - Large')}
                        icon={<Sparkles className="h-20 w-20" />}
                        size="lg"
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Presets Demo */}
        <TabsContent value="presets" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Preset Components</CardTitle>
              <CardDescription>
                Các preset components cho trường hợp sử dụng phổ biến
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-64">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">EmptyIdeas</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <EmptyIdeas
                      title="No ideas yet"
                      description="Create your first idea to get started"
                      ctaLabel="Add Idea"
                      onClick={() => handleAction('Add Idea - Preset')}
                      size="sm"
                    />
                  </CardContent>
                </Card>

                <Card className="h-64">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">EmptyBriefs</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <EmptyBriefs
                      title="No briefs available"
                      description="Generate your first brief"
                      ctaLabel="Create Brief"
                      onClick={() => handleAction('Create Brief - Preset')}
                      size="sm"
                    />
                  </CardContent>
                </Card>

                <Card className="h-64">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">EmptySearch</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <EmptySearch
                      title="No results found"
                      description="Try different keywords"
                      ctaLabel="Clear Search"
                      onClick={() => handleAction('Clear Search - Preset')}
                      size="sm"
                    />
                  </CardContent>
                </Card>

                <Card className="h-64">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">EmptyArchive</CardTitle>
                  </CardHeader>
                  <CardContent className="p-0 flex-1">
                    <EmptyArchive
                      title="Archive is empty"
                      description="No archived items found"
                      ctaLabel="Browse All"
                      onClick={() => handleAction('Browse All - Preset')}
                      size="sm"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Custom Demo */}
        <TabsContent value="custom" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Custom Icons & Styling</CardTitle>
              <CardDescription>
                EmptyState với custom icons và styling khác nhau
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="h-72">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="No favorites"
                      description="Start favoriting content you love"
                      ctaLabel="Explore"
                      onClick={() => handleAction('Explore Favorites')}
                      icon={<Heart className="h-16 w-16 text-red-400" />}
                      size="sm"
                    />
                  </CardContent>
                </Card>

                <Card className="h-72">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="No reviews yet"
                      description="Be the first to leave a review"
                      ctaLabel="Add Review"
                      onClick={() => handleAction('Add Review')}
                      icon={<Star className="h-16 w-16 text-yellow-400" />}
                      size="sm"
                    />
                  </CardContent>
                </Card>

                <Card className="h-72">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="No media files"
                      description="Upload your first image or video"
                      ctaLabel="Upload Media"
                      onClick={() => handleAction('Upload Media')}
                      icon={<ImageIcon className="h-16 w-16 text-blue-400" />}
                      size="sm"
                    />
                  </CardContent>
                </Card>

                <Card className="h-72">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="Workspace empty"
                      description="Create your first project"
                      ctaLabel="New Project"
                      onClick={() => handleAction('New Project')}
                      icon={<Zap className="h-16 w-16 text-purple-400" />}
                      size="sm"
                      variant="compact"
                    />
                  </CardContent>
                </Card>

                <Card className="h-72">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="No themes"
                      description="Customize your workspace"
                      ctaLabel="Browse Themes"
                      onClick={() => handleAction('Browse Themes')}
                      icon={<Palette className="h-16 w-16 text-green-400" />}
                      size="sm"
                      variant="compact"
                    />
                  </CardContent>
                </Card>

                <Card className="h-72">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="No music"
                      description="Add some tracks to get started"
                      ctaLabel="Import Music"
                      onClick={() => handleAction('Import Music')}
                      icon={<Music className="h-16 w-16 text-pink-400" />}
                      size="sm"
                      variant="compact"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Without CTA Demo */}
          <Card>
            <CardHeader>
              <CardTitle>Without CTA Button</CardTitle>
              <CardDescription>
                EmptyState dùng để hiển thị thông tin, không có action
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="h-48">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="Coming soon"
                      description="This feature is under development"
                      icon={<Settings className="h-16 w-16" />}
                      showCTA={false}
                      size="sm"
                    />
                  </CardContent>
                </Card>

                <Card className="h-48">
                  <CardContent className="p-0 h-full">
                    <EmptyState
                      title="Server maintenance"
                      description="We'll be back shortly"
                      icon={<Globe className="h-16 w-16" />}
                      showCTA={false}
                      size="sm"
                      variant="minimal"
                    />
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Hướng dẫn sử dụng</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="space-y-3">
              <h4 className="font-medium">Features:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Fade-in animation khi component xuất hiện</li>
                <li>Hover effect trên CTA button với scale animation</li>
                <li>Dark mode support tự động</li>
                <li>Responsive design cho mọi kích thước màn hình</li>
                <li>Custom icons hoặc sử dụng preset icons</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Variants:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><Badge variant="secondary" className="mr-2">default</Badge> - Layout đầy đủ với icon, title, description</li>
                <li><Badge variant="secondary" className="mr-2">compact</Badge> - Layout gọn hơn, phù hợp cho modal</li>
                <li><Badge variant="secondary" className="mr-2">minimal</Badge> - Chỉ title và description</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Preset Components:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">EmptyIdeas</Badge>
              <Badge variant="outline">EmptyBriefs</Badge>
              <Badge variant="outline">EmptySearch</Badge>
              <Badge variant="outline">EmptyArchive</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
      </div>
    </AppLayout>
  )
}