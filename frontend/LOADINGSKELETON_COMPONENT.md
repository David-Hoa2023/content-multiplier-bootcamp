# LoadingSkeleton Component Documentation

## Tổng quan

`LoadingSkeleton` là một component React được xây dựng với **Tailwind CSS** và **shadcn/ui**, hiển thị skeleton loading states với shimmer effects và staggered animations cho các loại nội dung khác nhau.

## Features

- ✅ **Multiple Types**: IdeaCard, BriefCard, Table, Custom skeleton variants
- ✅ **Staggered Animations**: Delay giữa các skeleton items
- ✅ **Responsive Layouts**: Grid, flex, stack layouts
- ✅ **Shimmer Effects**: Built-in từ shadcn/ui Skeleton component
- ✅ **Custom Sizing**: Height, width customization
- ✅ **Preset Components**: IdeaListSkeleton, BriefListSkeleton, TableSkeleton, GridSkeleton
- ✅ **Dark Mode Support**: Automatic adaptation
- ✅ **Placeholder Elements**: Fake avatars, icons, badges
- ✅ **Performance Optimized**: Minimal re-renders

## Installation

### Dependencies

```bash
npm install framer-motion
```

### shadcn/ui Components

```bash
npx shadcn@latest add skeleton card
```

## Basic Usage

### Simple LoadingSkeleton

```tsx
import { LoadingSkeleton } from '@/components/ui/loading-skeleton'

function MyComponent() {
  const [isLoading, setIsLoading] = useState(true)

  if (isLoading) {
    return (
      <LoadingSkeleton
        type="idea"
        count={3}
        layout="grid"
      />
    )
  }

  return <ActualContent />
}
```

### Using Preset Components

```tsx
import { IdeaListSkeleton, TableSkeleton } from '@/components/ui/loading-skeleton'

// Ideas page loading
function IdeasPage() {
  return (
    <IdeaListSkeleton count={6} layout="grid" />
  )
}

// Table loading
function DataTable() {
  return (
    <TableSkeleton count={5} />
  )
}
```

## Props

### LoadingSkeleton Props

```tsx
interface LoadingSkeletonProps {
  type: 'idea' | 'brief' | 'table' | 'custom'    // Loại skeleton (required)
  count?: number                                 // Số lượng items (default: 3)
  className?: string                             // CSS classes bổ sung
  height?: string | number                       // Custom height cho type="custom"
  width?: string | number                        // Custom width cho type="custom"
  layout?: 'grid' | 'flex' | 'stack'           // Layout arrangement (default: 'grid')
  showAnimation?: boolean                        // Enable/disable staggered animation (default: true)
}
```

### Preset Component Props

```tsx
// Preset components có props giống LoadingSkeleton nhưng không có type prop
type PresetProps = Omit<LoadingSkeletonProps, 'type'>

// GridSkeleton có props đặc biệt
interface GridSkeletonProps {
  count?: number
  cols?: { sm?: number; md?: number; lg?: number }
  children?: React.ReactNode
}
```

## Skeleton Types

### IdeaCard Skeleton (`type="idea"`)

Skeleton cho IdeaCard component với:
- Title placeholder (3/4 width)
- Description lines (2 lines)
- Persona & Industry fields
- Status badge
- Action menu icon

```tsx
<LoadingSkeleton
  type="idea"
  count={3}
  layout="grid"
/>
```

### BriefCard Skeleton (`type="brief"`)

Skeleton cho BriefCard component với:
- Large title placeholder
- Subtitle/type
- Avatar placeholder
- Multi-line content
- Key points badges
- Footer với actions

```tsx
<LoadingSkeleton
  type="brief"
  count={4}
  layout="grid"
/>
```

### Table Skeleton (`type="table"`)

Skeleton cho table rows với:
- Avatar/icon column
- Multiple data columns
- Actions column
- Proper table structure

```tsx
<LoadingSkeleton
  type="table"
  count={5}
  layout="stack"
/>
```

### Custom Skeleton (`type="custom"`)

Flexible skeleton với custom dimensions:

```tsx
<LoadingSkeleton
  type="custom"
  count={3}
  height="h-32"
  width="w-64"
  layout="stack"
/>
```

## Layouts

### Grid Layout (`layout="grid"`)

Responsive grid layout:
- Mobile: 1 column
- Tablet: 2 columns
- Desktop: 3 columns

```tsx
<LoadingSkeleton
  type="idea"
  count={6}
  layout="grid"  // Default
/>
```

### Flex Layout (`layout="flex"`)

Flexbox với wrap:

```tsx
<LoadingSkeleton
  type="brief"
  count={4}
  layout="flex"
/>
```

### Stack Layout (`layout="stack"`)

Vertical stacking:

```tsx
<LoadingSkeleton
  type="table"
  count={5}
  layout="stack"
/>
```

## Animations

### Staggered Entry Animation

Mỗi skeleton item có delay animation:

```tsx
const SkeletonItem = ({ children, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ 
        duration: 0.4, 
        delay: delay,  // delay = index * 0.1
        ease: "easeOut" 
      }}
    >
      {children}
    </motion.div>
  )
}
```

### Disable Animation

```tsx
<LoadingSkeleton
  type="idea"
  count={3}
  showAnimation={false}  // No stagger delay
/>
```

## Preset Components

### IdeaListSkeleton

Preset cho danh sách ideas:

```tsx
import { IdeaListSkeleton } from '@/components/ui/loading-skeleton'

<IdeaListSkeleton
  count={6}
  layout="grid"
  showAnimation={true}
/>
```

### BriefListSkeleton

Preset cho danh sách briefs:

```tsx
import { BriefListSkeleton } from '@/components/ui/loading-skeleton'

<BriefListSkeleton
  count={4}
  layout="stack"
/>
```

### TableSkeleton

Complete table skeleton với header:

```tsx
import { TableSkeleton } from '@/components/ui/loading-skeleton'

<TableSkeleton
  count={5}
  showAnimation={true}
/>
```

### GridSkeleton

Responsive grid với custom columns:

```tsx
import { GridSkeleton } from '@/components/ui/loading-skeleton'

<GridSkeleton
  count={9}
  cols={{ sm: 1, md: 2, lg: 3 }}
/>
```

## Usage Patterns

### Data Fetching

```tsx
function DataList({ data, isLoading }) {
  if (isLoading) {
    return (
      <IdeaListSkeleton
        count={6}
        layout="grid"
      />
    )
  }

  if (data.length === 0) {
    return <EmptyState />
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {data.map(item => <ItemCard key={item.id} item={item} />)}
    </div>
  )
}
```

### Search Results

```tsx
function SearchResults({ query, results, isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Search filters skeleton */}
        <LoadingSkeleton
          type="custom"
          count={1}
          height="h-12"
          layout="stack"
        />
        
        {/* Results skeleton */}
        <IdeaListSkeleton count={9} />
      </div>
    )
  }

  return <ActualResults />
}
```

### Dashboard Loading

```tsx
function Dashboard({ isLoading }) {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Stats cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <LoadingSkeleton
            type="custom"
            count={4}
            height="h-24"
          />
        </div>
        
        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <LoadingSkeleton
            type="custom"
            count={2}
            height="h-64"
          />
        </div>
        
        {/* Recent activity table */}
        <TableSkeleton count={5} />
      </div>
    )
  }

  return <DashboardContent />
}
```

### Modal Loading

```tsx
function ModalContent({ isLoading }) {
  return (
    <Dialog>
      <DialogContent>
        {isLoading ? (
          <div className="space-y-4">
            <LoadingSkeleton
              type="custom"
              count={1}
              height="h-8"
              width="w-48"
            />
            <LoadingSkeleton
              type="custom"
              count={3}
              height="h-16"
              layout="stack"
            />
          </div>
        ) : (
          <ActualModalContent />
        )}
      </DialogContent>
    </Dialog>
  )
}
```

## Customization

### Custom Skeleton Variants

Tạo skeleton variant mới:

```tsx
const CustomCardSkeleton = ({ delay = 0 }) => (
  <SkeletonItem delay={delay}>
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <Skeleton className="h-12 w-12 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
        </div>
      </CardContent>
    </Card>
  </SkeletonItem>
)
```

### Custom Layout

```tsx
const CustomLayout = ({ children }) => (
  <div className="masonry-grid">
    {children}
  </div>
)

// Usage
<CustomLayout>
  {Array.from({ length: 6 }, (_, i) => (
    <CustomCardSkeleton key={i} delay={i * 0.1} />
  ))}
</CustomLayout>
```

### Theme Customization

Skeleton colors adapt tự động với dark mode, nhưng có thể custom:

```css
/* globals.css */
.skeleton-custom {
  background: linear-gradient(
    90deg,
    var(--skeleton-bg) 25%,
    var(--skeleton-highlight) 50%,
    var(--skeleton-bg) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
```

## Advanced Examples

### Conditional Skeleton Count

```tsx
function ResponsiveSkeleton() {
  const [screenSize, setScreenSize] = useState('lg')
  
  const getSkeletonCount = () => {
    switch (screenSize) {
      case 'sm': return 2
      case 'md': return 4
      case 'lg': return 6
      default: return 6
    }
  }

  return (
    <IdeaListSkeleton
      count={getSkeletonCount()}
      layout="grid"
    />
  )
}
```

### Progressive Loading

```tsx
function ProgressiveLoading({ page, hasMore, isLoading }) {
  return (
    <div className="space-y-6">
      {/* Existing content */}
      <ExistingItems />
      
      {/* Loading more */}
      {isLoading && (
        <IdeaListSkeleton
          count={3}
          layout="grid"
          showAnimation={true}
        />
      )}
      
      {/* Load more button */}
      {!isLoading && hasMore && (
        <LoadMoreButton />
      )}
    </div>
  )
}
```

### Skeleton with Error Boundary

```tsx
function SafeSkeleton({ children, isLoading }) {
  return (
    <ErrorBoundary
      fallback={
        <LoadingSkeleton
          type="custom"
          count={1}
          height="h-32"
          className="border border-destructive rounded-lg"
        />
      }
    >
      {isLoading ? (
        <IdeaListSkeleton count={6} />
      ) : (
        children
      )}
    </ErrorBoundary>
  )
}
```

### Skeleton Timing Control

```tsx
function TimedSkeleton() {
  const [showSkeleton, setShowSkeleton] = useState(true)
  
  useEffect(() => {
    // Show skeleton for minimum 500ms for better UX
    const timer = setTimeout(() => {
      if (!isActuallyLoading) {
        setShowSkeleton(false)
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [isActuallyLoading])

  return showSkeleton ? (
    <IdeaListSkeleton count={6} />
  ) : (
    <ActualContent />
  )
}
```

## Best Practices

1. **Match actual content structure**:
   - Skeleton nên giống với actual content về layout và sizing
   - Sử dụng đúng skeleton type cho từng component

2. **Consistent timing**:
   - Duy trì skeleton ít nhất 300-500ms cho better perceived performance
   - Sử dụng staggered animation để tạo cảm giác smooth

3. **Responsive behavior**:
   - Test skeleton trên different screen sizes
   - Adjust count và layout cho mobile

4. **Performance considerations**:
   - Limit số lượng skeleton items (max ~10-12)
   - Sử dụng `showAnimation={false}` nếu performance issue

5. **Error handling**:
   - Provide fallback skeleton cho error states
   - Transition smoothly từ skeleton sang actual content

6. **Accessibility**:
   - Skeleton có ARIA labels phù hợp
   - Announce loading states cho screen readers

## Troubleshooting

### Animation không smooth
- Kiểm tra framer-motion đã cài đặt đúng version
- Verify component trong Client Component boundary

### Skeleton layout bị broken
- Kiểm tra CSS grid/flex classes
- Verify parent container có proper sizing

### Performance issues với nhiều skeletons
- Reduce animation complexity
- Use `showAnimation={false}`
- Implement virtual scrolling cho large lists

### Dark mode colors không đúng
- Kiểm tra theme provider setup
- Verify CSS variables được define

## Demo

Truy cập `/demo-loading-skeleton` để xem demo đầy đủ tính năng của LoadingSkeleton component.

---

## Support

Component này được xây dựng với:
- **Next.js 14** - App Router
- **Tailwind CSS** - Styling
- **shadcn/ui** - Base Skeleton component
- **Framer Motion** - Animations
- **React 18** - Concurrent features