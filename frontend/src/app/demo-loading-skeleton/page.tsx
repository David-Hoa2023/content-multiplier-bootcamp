'use client'

import { useState, useEffect } from 'react'
import { 
  LoadingSkeleton,
  IdeaListSkeleton,
  BriefListSkeleton,
  TableSkeleton,
  GridSkeleton
} from '@/components/ui/loading-skeleton'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  RefreshCw,
  Play,
  Pause,
  RotateCcw,
  Grid3x3,
  List,
  Table,
  Layers
} from 'lucide-react'

export default function DemoLoadingSkeletonPage() {
  const [isAnimating, setIsAnimating] = useState(true)
  const [refreshKey, setRefreshKey] = useState(0)
  const [selectedCount, setSelectedCount] = useState(3)
  const [selectedLayout, setSelectedLayout] = useState<'grid' | 'flex' | 'stack'>('grid')

  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1)
  }

  const toggleAnimation = () => {
    setIsAnimating(!isAnimating)
  }

  const resetDemo = () => {
    setRefreshKey(0)
    setIsAnimating(true)
    setSelectedCount(3)
    setSelectedLayout('grid')
  }

  return (
    <div className="container mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">LoadingSkeleton Component Demo</h1>
          <p className="text-muted-foreground">
            Demo component LoadingSkeleton với shimmer effects, staggered animations và các variant khác nhau.
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex gap-2">
            <Button onClick={handleRefresh} variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Refresh
            </Button>
            <Button onClick={toggleAnimation} variant="outline" className="gap-2">
              {isAnimating ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isAnimating ? 'Tắt Animation' : 'Bật Animation'}
            </Button>
            <Button onClick={resetDemo} variant="outline" className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Count:</span>
            {[1, 3, 6, 9].map(count => (
              <Button
                key={count}
                variant={selectedCount === count ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCount(count)}
              >
                {count}
              </Button>
            ))}
          </div>

          <Separator orientation="vertical" className="h-6" />

          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Layout:</span>
            <Button
              variant={selectedLayout === 'grid' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayout('grid')}
            >
              <Grid3x3 className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedLayout === 'flex' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayout('flex')}
            >
              <Layers className="h-4 w-4" />
            </Button>
            <Button
              variant={selectedLayout === 'stack' ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedLayout('stack')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant={isAnimating ? "default" : "secondary"}>
            Animation: {isAnimating ? 'ON' : 'OFF'}
          </Badge>
          <Badge variant="outline">
            Count: {selectedCount}
          </Badge>
          <Badge variant="outline">
            Layout: {selectedLayout}
          </Badge>
          <Badge variant="outline">
            Refresh: #{refreshKey}
          </Badge>
        </div>
      </div>

      <Tabs defaultValue="types" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="types">Types</TabsTrigger>
          <TabsTrigger value="layouts">Layouts</TabsTrigger>
          <TabsTrigger value="presets">Presets</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="realworld">Real World</TabsTrigger>
        </TabsList>

        {/* Types Demo */}
        <TabsContent value="types" className="space-y-8">
          {/* IdeaCard Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">IdeaCard Skeleton</h3>
              <Badge variant="secondary">type="idea"</Badge>
            </div>
            <Card>
              <CardContent className="p-6">
                <div key={`idea-${refreshKey}`}>
                  <LoadingSkeleton
                    type="idea"
                    count={selectedCount}
                    layout={selectedLayout}
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* BriefCard Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">BriefCard Skeleton</h3>
              <Badge variant="secondary">type="brief"</Badge>
            </div>
            <Card>
              <CardContent className="p-6">
                <div key={`brief-${refreshKey}`}>
                  <LoadingSkeleton
                    type="brief"
                    count={selectedCount}
                    layout={selectedLayout}
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Table Skeleton */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold">Table Skeleton</h3>
              <Badge variant="secondary">type="table"</Badge>
            </div>
            <Card>
              <CardContent className="p-6">
                <div key={`table-${refreshKey}`}>
                  <TableSkeleton
                    count={Math.min(selectedCount, 5)}
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Layouts Demo */}
        <TabsContent value="layouts" className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Grid Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Grid3x3 className="h-5 w-5" />
                  Grid Layout
                </CardTitle>
                <CardDescription>
                  Responsive grid với breakpoints
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div key={`grid-${refreshKey}`}>
                  <LoadingSkeleton
                    type="idea"
                    count={6}
                    layout="grid"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Flex Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  Flex Layout
                </CardTitle>
                <CardDescription>
                  Flexbox với wrap
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div key={`flex-${refreshKey}`}>
                  <LoadingSkeleton
                    type="idea"
                    count={4}
                    layout="flex"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Stack Layout */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <List className="h-5 w-5" />
                  Stack Layout
                </CardTitle>
                <CardDescription>
                  Vertical stack
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div key={`stack-${refreshKey}`}>
                  <LoadingSkeleton
                    type="idea"
                    count={3}
                    layout="stack"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Presets Demo */}
        <TabsContent value="presets" className="space-y-8">
          <div className="space-y-8">
            {/* IdeaListSkeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">IdeaListSkeleton</h3>
                <Badge variant="secondary">Preset Component</Badge>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div key={`idea-list-${refreshKey}`}>
                    <IdeaListSkeleton
                      count={selectedCount}
                      layout={selectedLayout}
                      showAnimation={isAnimating}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* BriefListSkeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">BriefListSkeleton</h3>
                <Badge variant="secondary">Preset Component</Badge>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div key={`brief-list-${refreshKey}`}>
                    <BriefListSkeleton
                      count={selectedCount}
                      layout={selectedLayout}
                      showAnimation={isAnimating}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* GridSkeleton */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">GridSkeleton</h3>
                <Badge variant="secondary">Responsive Grid</Badge>
              </div>
              <Card>
                <CardContent className="p-6">
                  <div key={`grid-skeleton-${refreshKey}`}>
                    <GridSkeleton
                      count={selectedCount * 2}
                      cols={{ sm: 1, md: 2, lg: 3 }}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Custom Demo */}
        <TabsContent value="custom" className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Custom Heights */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Heights</CardTitle>
                <CardDescription>
                  Custom height với type="custom"
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div key={`custom-height-${refreshKey}`}>
                  <LoadingSkeleton
                    type="custom"
                    count={3}
                    height="h-32"
                    layout="stack"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Custom Widths */}
            <Card>
              <CardHeader>
                <CardTitle>Custom Widths</CardTitle>
                <CardDescription>
                  Custom width với pixel values
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div key={`custom-width-${refreshKey}`}>
                  <LoadingSkeleton
                    type="custom"
                    count={4}
                    height="h-16"
                    width="w-64"
                    layout="stack"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Mixed Sizes */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle>Mixed Custom Sizes</CardTitle>
                <CardDescription>
                  Các kích thước khác nhau trong cùng container
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4" key={`mixed-${refreshKey}`}>
                  <LoadingSkeleton
                    type="custom"
                    count={1}
                    height="h-20"
                    width="w-full"
                    showAnimation={isAnimating}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <LoadingSkeleton
                      type="custom"
                      count={1}
                      height="h-32"
                      showAnimation={isAnimating}
                    />
                    <LoadingSkeleton
                      type="custom"
                      count={1}
                      height="h-32"
                      showAnimation={isAnimating}
                    />
                  </div>
                  <LoadingSkeleton
                    type="custom"
                    count={3}
                    height="h-12"
                    layout="stack"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Real World Demo */}
        <TabsContent value="realworld" className="space-y-8">
          <div className="space-y-8">
            {/* Dashboard Loading */}
            <Card>
              <CardHeader>
                <CardTitle>Dashboard Loading State</CardTitle>
                <CardDescription>
                  Typical dashboard với stats, charts và lists
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div key={`dashboard-${refreshKey}`}>
                  {/* Stats Row */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <LoadingSkeleton
                      type="custom"
                      count={4}
                      height="h-24"
                      showAnimation={isAnimating}
                    />
                  </div>
                  
                  {/* Charts Row */}
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <LoadingSkeleton
                      type="custom"
                      count={2}
                      height="h-64"
                      showAnimation={isAnimating}
                    />
                  </div>
                  
                  {/* Recent Activity Table */}
                  <TableSkeleton count={4} showAnimation={isAnimating} />
                </div>
              </CardContent>
            </Card>

            {/* Content Feed Loading */}
            <Card>
              <CardHeader>
                <CardTitle>Content Feed Loading</CardTitle>
                <CardDescription>
                  Social media style feed loading
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div key={`feed-${refreshKey}`}>
                  <LoadingSkeleton
                    type="brief"
                    count={3}
                    layout="stack"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Search Results Loading */}
            <Card>
              <CardHeader>
                <CardTitle>Search Results Loading</CardTitle>
                <CardDescription>
                  Search page với filters và results
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div key={`search-${refreshKey}`}>
                  {/* Search Bar & Filters */}
                  <div className="flex gap-4 mb-6">
                    <LoadingSkeleton
                      type="custom"
                      count={1}
                      height="h-10"
                      width="w-64"
                      showAnimation={isAnimating}
                    />
                    <LoadingSkeleton
                      type="custom"
                      count={3}
                      height="h-10"
                      width="w-24"
                      layout="flex"
                      showAnimation={isAnimating}
                    />
                  </div>
                  
                  {/* Results */}
                  <IdeaListSkeleton
                    count={6}
                    layout="grid"
                    showAnimation={isAnimating}
                  />
                </div>
              </CardContent>
            </Card>
          </div>
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
                <li>Shimmer effect tự động từ shadcn/ui Skeleton</li>
                <li>Staggered animation delays giữa các items</li>
                <li>Responsive layouts (grid, flex, stack)</li>
                <li>Dark mode support</li>
                <li>Placeholder avatars và icons</li>
                <li>Custom heights và widths</li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <h4 className="font-medium">Types:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li><Badge variant="secondary" className="mr-2">idea</Badge> - IdeaCard skeleton với title, description, badges</li>
                <li><Badge variant="secondary" className="mr-2">brief</Badge> - BriefCard skeleton với content, key points</li>
                <li><Badge variant="secondary" className="mr-2">table</Badge> - Table row skeleton với columns</li>
                <li><Badge variant="secondary" className="mr-2">custom</Badge> - Custom size skeleton</li>
              </ul>
            </div>
          </div>

          <div className="pt-4 border-t">
            <h4 className="font-medium mb-2">Preset Components:</h4>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline">IdeaListSkeleton</Badge>
              <Badge variant="outline">BriefListSkeleton</Badge>
              <Badge variant="outline">TableSkeleton</Badge>
              <Badge variant="outline">GridSkeleton</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}