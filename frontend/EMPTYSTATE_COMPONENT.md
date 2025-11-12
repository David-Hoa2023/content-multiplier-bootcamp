# EmptyState Component Documentation

## Tổng quan

`EmptyState` là một component React được xây dựng với **Tailwind CSS** và **shadcn/ui**, hiển thị trạng thái rỗng với illustration, message và call-to-action button.

## Features

- ✅ **Multiple Variants**: Default, compact, minimal layouts
- ✅ **Responsive Sizes**: Small, medium, large sizing options
- ✅ **Custom Icons**: Support cho Lucide icons hoặc custom React elements
- ✅ **Preset Components**: EmptyIdeas, EmptyBriefs, EmptySearch, EmptyArchive
- ✅ **Smooth Animations**: Fade-in entrance với staggered children
- ✅ **Hover Effects**: Scale animation trên CTA button
- ✅ **Dark Mode Support**: Tự động adapt với theme
- ✅ **Flexible Content**: Optional CTA, custom styling
- ✅ **Default Illustration**: Animated floating icon khi không có custom icon

## Installation

### Dependencies

```bash
npm install framer-motion
```

### shadcn/ui Components

```bash
npx shadcn@latest add button
```

## Basic Usage

### Simple EmptyState

```tsx
import { EmptyState } from '@/components/ui/empty-state'
import { Lightbulb } from 'lucide-react'

function MyComponent() {
  const handleAddIdea = () => {
    console.log('Adding new idea...')
  }

  return (
    <EmptyState
      title="No ideas yet"
      description="Start by creating your first idea to begin the journey"
      ctaLabel="Add Idea"
      onClick={handleAddIdea}
      icon={<Lightbulb />}
    />
  )
}
```

### Using Preset Components

```tsx
import { EmptyIdeas, EmptyBriefs } from '@/components/ui/empty-state'

function IdeasPage() {
  return (
    <EmptyIdeas
      title="No ideas yet"
      description="Create your first idea to get started"
      ctaLabel="Add Idea"
      onClick={() => router.push('/ideas/new')}
    />
  )
}
```

## Props

### EmptyState Props

```tsx
interface EmptyStateProps {
  title: string                                 // Tiêu đề chính (required)
  description: string                           // Mô tả chi tiết (required) 
  ctaLabel?: string                            // Text cho CTA button
  onClick?: () => void                         // Handler cho CTA button
  icon?: React.ReactNode                       // Custom icon hoặc illustration
  variant?: 'default' | 'compact' | 'minimal' // Layout variant
  size?: 'sm' | 'md' | 'lg'                   // Kích thước component
  className?: string                           // CSS classes bổ sung
  showCTA?: boolean                           // Hiển thị CTA button (default: true)
}
```

### Preset Component Props

```tsx
// Các preset component có props giống EmptyState nhưng không có icon prop
type PresetProps = Omit<EmptyStateProps, 'icon'>
```

## Variants

### Default Variant

Layout đầy đủ với icon lớn, title, description và CTA button:

```tsx
<EmptyState
  title="Welcome to ContentHub"
  description="Start your content creation journey by creating your first project"
  ctaLabel="Get Started"
  onClick={handleGetStarted}
  variant="default"  // Default value
/>
```

### Compact Variant

Layout gọn hơn, phù hợp cho modal hoặc sidebar:

```tsx
<EmptyState
  title="No notifications"
  description="You're all caught up!"
  ctaLabel="Refresh"
  onClick={handleRefresh}
  variant="compact"
/>
```

### Minimal Variant

Chỉ title và description, không có icon:

```tsx
<EmptyState
  title="No results found"
  description="Try adjusting your search criteria"
  variant="minimal"
  showCTA={false}
/>
```

## Sizes

### Size Configuration

```tsx
const sizeConfig = {
  sm: {
    container: 'py-8 px-4',
    icon: 'h-12 w-12',
    title: 'text-lg',
    description: 'text-sm',
    button: 'sm'
  },
  md: {
    container: 'py-12 px-6',
    icon: 'h-16 w-16',
    title: 'text-xl', 
    description: 'text-base',
    button: 'default'
  },
  lg: {
    container: 'py-16 px-8',
    icon: 'h-20 w-20',
    title: 'text-2xl',
    description: 'text-lg',
    button: 'lg'
  }
}
```

### Usage Examples

```tsx
// Small - cho modal, sidebar
<EmptyState size="sm" title="..." description="..." />

// Medium - default, cho main content
<EmptyState size="md" title="..." description="..." />

// Large - cho landing page, welcome screen
<EmptyState size="lg" title="..." description="..." />
```

## Icons & Illustrations

### Custom Icons

```tsx
import { Heart, Star, Users } from 'lucide-react'

<EmptyState
  title="No favorites"
  description="Start favoriting content you love"
  icon={<Heart className="h-16 w-16 text-red-400" />}
  ctaLabel="Explore"
  onClick={handleExplore}
/>
```

### Custom SVG Illustration

```tsx
const CustomIllustration = () => (
  <svg width="120" height="120" viewBox="0 0 120 120">
    {/* Your custom SVG content */}
  </svg>
)

<EmptyState
  title="Custom illustration"
  description="Using your own SVG artwork"
  icon={<CustomIllustration />}
/>
```

### Default Illustration

Khi không cung cấp icon, component sẽ hiển thị animated default illustration:

```tsx
<EmptyState
  title="Default illustration"
  description="No custom icon provided"
  // icon prop bỏ trống sẽ hiển thị default illustration
/>
```

## Preset Components

### EmptyIdeas

```tsx
import { EmptyIdeas } from '@/components/ui/empty-state'

<EmptyIdeas
  title="No ideas yet"
  description="Create your first idea to get started"
  ctaLabel="Add Idea"
  onClick={() => router.push('/ideas/new')}
  size="md"
/>
```

### EmptyBriefs

```tsx
import { EmptyBriefs } from '@/components/ui/empty-state'

<EmptyBriefs
  title="No briefs available"
  description="Generate your first content brief"
  ctaLabel="Create Brief"
  onClick={() => router.push('/briefs/new')}
/>
```

### EmptySearch

```tsx
import { EmptySearch } from '@/components/ui/empty-state'

<EmptySearch
  title="No results found"
  description="Try different keywords or filters"
  ctaLabel="Clear Search"
  onClick={() => setSearchQuery('')}
/>
```

### EmptyArchive

```tsx
import { EmptyArchive } from '@/components/ui/empty-state'

<EmptyArchive
  title="Archive is empty"
  description="No archived items found"
  ctaLabel="Browse All"
  onClick={() => router.push('/all')}
/>
```

## Animations

### Entrance Animation

Component sử dụng staggered animation khi xuất hiện:

```tsx
const containerVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1  // Children animate với delay
    }
  }
}
```

### Hover Effects

CTA button có scale effect khi hover:

```tsx
<Button className="gap-2 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md">
  <Plus className="h-4 w-4" />
  {ctaLabel}
</Button>
```

### Default Illustration Animation

Default illustration có floating animation:

```tsx
<motion.div
  animate={{ 
    y: [0, -8, 0],
    rotate: [0, 2, -2, 0]
  }}
  transition={{ 
    duration: 4, 
    repeat: Infinity, 
    ease: "easeInOut" 
  }}
>
```

## Dark Mode Support

Component tự động adapt với dark mode:

```tsx
// Text colors
className="text-foreground"           // Auto dark/light
className="text-muted-foreground"     // Muted text

// Background & borders  
className="bg-card"                   // Card background
className="border-border"             // Border color

// Icon colors với alpha
className="text-muted-foreground/40"  // 40% opacity
```

## Usage Patterns

### Empty List/Grid

```tsx
function ItemsList({ items }) {
  if (items.length === 0) {
    return (
      <EmptyState
        title="No items found"
        description="Start by adding your first item"
        ctaLabel="Add Item"
        onClick={() => setShowCreateModal(true)}
        icon={<Plus className="h-16 w-16" />}
      />
    )
  }

  return (
    <div className="grid grid-cols-3 gap-4">
      {items.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  )
}
```

### Search Results

```tsx
function SearchResults({ query, results }) {
  if (query && results.length === 0) {
    return (
      <EmptySearch
        title="No results found"
        description={`No items found for "${query}"`}
        ctaLabel="Clear Search"
        onClick={() => setQuery('')}
        variant="compact"
      />
    )
  }

  return <ResultsList results={results} />
}
```

### Loading vs Empty States

```tsx
function DataContainer() {
  if (isLoading) {
    return <LoadingSpinner />
  }

  if (data.length === 0) {
    return (
      <EmptyState
        title="No data available"
        description="Check back later or refresh the page"
        ctaLabel="Refresh"
        onClick={() => refetch()}
      />
    )
  }

  return <DataList data={data} />
}
```

### Modal Empty State

```tsx
function SelectModal() {
  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Select an item</DialogTitle>
        </DialogHeader>
        
        {items.length === 0 ? (
          <EmptyState
            title="No options available"
            description="Add some items first"
            ctaLabel="Add Item"
            onClick={handleAddItem}
            variant="compact"
            size="sm"
          />
        ) : (
          <ItemSelector items={items} />
        )}
      </DialogContent>
    </Dialog>
  )
}
```

## Customization

### Custom Styling

```tsx
<EmptyState
  title="Custom styled"
  description="With custom background"
  className="bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 rounded-lg"
  ctaLabel="Action"
  onClick={handleAction}
/>
```

### Custom Button Styling

Sửa trong component để customize button:

```tsx
<Button 
  onClick={onClick}
  size={config.button as any}
  className="gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
>
  <Plus className="h-4 w-4" />
  {ctaLabel}
</Button>
```

### Custom Animation

```tsx
const customVariants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { type: "spring", stiffness: 100 }
  }
}

// Thay thế containerVariants trong component
```

## Advanced Examples

### Multi-step Onboarding

```tsx
function OnboardingStep({ step, totalSteps }) {
  const steps = [
    {
      title: "Welcome to ContentHub",
      description: "Let's get you set up with your first project",
      ctaLabel: "Get Started",
      icon: <Sparkles className="h-20 w-20" />
    },
    {
      title: "Create your workspace", 
      description: "Organize your content projects in workspaces",
      ctaLabel: "Create Workspace",
      icon: <FolderPlus className="h-20 w-20" />
    },
    {
      title: "Invite your team",
      description: "Collaborate with colleagues on content creation",
      ctaLabel: "Invite Team",
      icon: <Users className="h-20 w-20" />
    }
  ]

  return (
    <EmptyState
      {...steps[step]}
      size="lg"
      onClick={() => setStep(step + 1)}
    />
  )
}
```

### Conditional CTA

```tsx
function ConditionalEmpty({ userRole, canCreate }) {
  return (
    <EmptyState
      title="No projects found"
      description={
        canCreate 
          ? "Start by creating your first project"
          : "Ask your admin to create a project"
      }
      ctaLabel={canCreate ? "Create Project" : "Contact Admin"}
      onClick={canCreate ? handleCreate : handleContact}
      icon={<FolderPlus className="h-16 w-16" />}
    />
  )
}
```

### With Error Boundary

```tsx
function SafeEmptyState({ children, fallback }) {
  return (
    <ErrorBoundary
      fallback={
        <EmptyState
          title="Something went wrong"
          description="Please refresh the page and try again"
          ctaLabel="Refresh"
          onClick={() => window.location.reload()}
          icon={<AlertTriangle className="h-16 w-16 text-red-400" />}
        />
      }
    >
      {children}
    </ErrorBoundary>
  )
}
```

## Best Practices

1. **Choose appropriate variant**:
   - `default` cho main content areas
   - `compact` cho modals, sidebars
   - `minimal` cho inline messages

2. **Use meaningful icons**:
   - Icon phải phản ánh đúng context
   - Sử dụng consistent icon style

3. **Write helpful descriptions**:
   - Explain tại sao empty
   - Suggest next action

4. **Provide clear CTAs**:
   - Action verb + noun (e.g., "Add Idea", "Create Project")
   - Lead to logical next step

5. **Consider user permissions**:
   - Hide CTA nếu user không có quyền
   - Show alternative actions

6. **Test responsive behavior**:
   - Verify trên mobile, tablet, desktop
   - Adjust size accordingly

7. **Use preset components** khi phù hợp:
   - Consistent UX
   - Less code duplication

## Troubleshooting

### Animation không hoạt động
- Kiểm tra framer-motion đã cài đặt
- Verify component trong Client Component

### Icon không hiển thị đúng size
- Kiểm tra icon có className size phù hợp
- Verify Lucide icon import đúng

### CTA button không responsive
- Kiểm tra size config
- Verify Button component props

### Dark mode không hoạt động
- Kiểm tra theme provider setup
- Verify CSS variables được define

## Demo

Truy cập `/demo-empty-state` để xem demo đầy đủ tính năng của EmptyState component.

---

## Support

Component này được xây dựng với:
- **Next.js 14** - App Router
- **Tailwind CSS** - Styling
- **shadcn/ui** - Base components  
- **Framer Motion** - Animations
- **Lucide React** - Icons