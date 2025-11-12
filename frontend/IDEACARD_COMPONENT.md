# IdeaCard Component Documentation

## Tổng quan

`IdeaCard` là một component React được xây dựng với **Tailwind CSS** và **shadcn/ui**, hiển thị thông tin ý tưởng nội dung với đầy đủ chức năng quản lý.

## Features

- ✅ **Responsive Design**: Hiển thị tối ưu trên mọi thiết bị
- ✅ **Status Badges**: Badge màu sắc phân biệt status (draft, selected, archived)  
- ✅ **Dropdown Actions**: Menu dropdown với các action: Edit, Delete, Select & Create Brief
- ✅ **Smart Disable**: Disable "Select & Create Brief" khi status khác "selected"
- ✅ **Loading States**: Spinner và overlay khi đang xử lý actions
- ✅ **Toast Notifications**: Thông báo thành công/lỗi khi thực hiện actions
- ✅ **Hover Animations**: Animation scale và shadow khi hover
- ✅ **Truncation**: Tự động cắt text dài với ellipsis
- ✅ **Date Formatting**: Hiển thị ngày tạo theo định dạng VN

## Installation

### 1. Dependencies

```bash
npm install framer-motion
```

### 2. shadcn/ui Components

```bash
npx shadcn@latest add card badge button dropdown-menu toast spinner
```

## Basic Usage

### Standalone Component

```tsx
import { IdeaCard, type Idea } from '@/components/ui/idea-card'
import { Toaster } from '@/components/ui/toaster'

const idea: Idea = {
  id: '1',
  title: 'Chiến lược Content Marketing',
  description: 'Phát triển nội dung thu hút khách hàng...',
  persona: 'Gen Z Food Lovers',
  industry: 'F&B',
  status: 'selected',
  created_at: '2024-01-15T10:30:00Z'
}

function MyComponent() {
  const handleEdit = (idea: Idea) => {
    console.log('Edit:', idea.title)
  }

  const handleDelete = (ideaId: string | number) => {
    console.log('Delete:', ideaId)
  }

  const handleCreateBrief = (idea: Idea) => {
    console.log('Create brief:', idea.title)
  }

  return (
    <>
      <IdeaCard
        idea={idea}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onSelectAndCreateBrief={handleCreateBrief}
      />
      <Toaster />
    </>
  )
}
```

### With Grid Layout

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {ideas.map((idea) => (
    <IdeaCard
      key={idea.id}
      idea={idea}
      onEdit={handleEdit}
      onDelete={handleDelete}
      onSelectAndCreateBrief={handleCreateBrief}
    />
  ))}
</div>
```

## Props

### IdeaCard Props

```tsx
interface IdeaCardProps {
  idea: Idea                                    // Dữ liệu ý tưởng (required)
  onEdit?: (idea: Idea) => void                // Handler chỉnh sửa
  onDelete?: (ideaId: string | number) => void // Handler xóa
  onSelectAndCreateBrief?: (idea: Idea) => void // Handler tạo brief
  className?: string                           // CSS classes bổ sung
}
```

### Idea Interface

```tsx
interface Idea {
  id: string | number        // ID duy nhất
  title: string             // Tiêu đề ý tưởng
  description?: string      // Mô tả chi tiết (optional)
  persona: string          // Persona target
  industry: string         // Ngành nghề
  status: 'draft' | 'selected' | 'archived'  // Trạng thái
  created_at?: string      // Ngày tạo ISO string (optional)
}
```

## Status Configuration

### Status Colors & Labels

```tsx
const statusConfig = {
  draft: {
    label: 'Nháp',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
  },
  selected: {
    label: 'Đã chọn', 
    variant: 'default',
    className: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
  },
  archived: {
    label: 'Lưu trữ',
    variant: 'destructive',
    className: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
  }
}
```

### Custom Status Colors

Để thay đổi màu status, sửa trong `idea-card.tsx`:

```tsx
const statusConfig = {
  draft: {
    label: 'Draft',
    variant: 'secondary' as const,
    className: 'bg-yellow-100 text-yellow-800'  // Custom color
  },
  // ...
}
```

## Actions & Handlers

### Edit Handler

```tsx
const handleEdit = async (idea: Idea) => {
  try {
    // Call API to update idea
    const response = await fetch(`/api/ideas/${idea.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updatedData)
    })
    
    if (!response.ok) throw new Error('Failed to update')
    
    // Success handled automatically by component
  } catch (error) {
    // Error handled automatically by component
    throw error
  }
}
```

### Delete Handler

```tsx
const handleDelete = async (ideaId: string | number) => {
  // Confirm dialog
  if (!confirm('Bạn có chắc muốn xóa ý tưởng này?')) return
  
  try {
    const response = await fetch(`/api/ideas/${ideaId}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Failed to delete')
    
    // Update local state
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
  } catch (error) {
    throw error
  }
}
```

### Create Brief Handler

```tsx
const handleCreateBrief = async (idea: Idea) => {
  try {
    const response = await fetch('/api/briefs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ideaId: idea.id })
    })
    
    const brief = await response.json()
    
    // Navigate to brief page
    router.push(`/briefs/${brief.id}`)
  } catch (error) {
    throw error
  }
}
```

## Loading States

Component tự động quản lý loading states:

```tsx
// Loading overlay hiển thị khi đang xử lý
{isLoading && (
  <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10">
    <div className="flex items-center gap-2">
      <Loader2 className="h-4 w-4 animate-spin" />
      <span>{loadingAction}...</span>
    </div>
  </div>
)}
```

### Custom Loading Messages

```tsx
const actionMessages = {
  'edit': 'Đang chỉnh sửa',
  'delete': 'Đang xóa', 
  'create-brief': 'Đang tạo brief'
}
```

## Animations

### Hover Animation

```tsx
<motion.div
  whileHover={{ 
    scale: 1.02,
    boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)"
  }}
  transition={{ duration: 0.2, ease: "easeOut" }}
>
```

### Entry Animation

```tsx
<motion.div
  initial={{ opacity: 0, y: 20 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ duration: 0.3 }}
>
```

### Custom Animations

```tsx
<IdeaCard
  idea={idea}
  className="hover:scale-105 transition-transform duration-300"
  // Custom hover effect
/>
```

## Responsive Design

### Breakpoints

- **Mobile (< 768px)**: Single column, compact layout
- **Tablet (768px - 1024px)**: 2 columns grid
- **Desktop (> 1024px)**: 3 columns grid

### Grid Layout Examples

```tsx
// Responsive grid
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
  {ideas.map(idea => <IdeaCard key={idea.id} idea={idea} />)}
</div>

// List layout
<div className="space-y-4">
  {ideas.map(idea => (
    <IdeaCard key={idea.id} idea={idea} className="max-w-none" />
  ))}
</div>
```

## Toast Notifications

Component sử dụng shadcn/ui toast system:

```tsx
import { toast } from '@/hooks/use-toast'

// Success notification
toast({
  title: "Thành công",
  description: "Ý tưởng đã được cập nhật.",
})

// Error notification  
toast({
  title: "Lỗi",
  description: "Có lỗi xảy ra khi cập nhật.",
  variant: "destructive",
})
```

### Custom Toast Messages

```tsx
const toastMessages = {
  edit: {
    success: "Ý tưởng đã được cập nhật thành công",
    error: "Không thể cập nhật ý tưởng"
  },
  delete: {
    success: "Ý tưởng đã được xóa",
    error: "Không thể xóa ý tưởng"
  },
  createBrief: {
    success: "Brief đã được tạo thành công", 
    error: "Không thể tạo brief"
  }
}
```

## Customization

### Custom Styling

```tsx
<IdeaCard
  idea={idea}
  className="border-2 border-primary shadow-lg"
  // Custom border and shadow
/>
```

### Custom Action Icons

Sửa trong component để thay đổi icons:

```tsx
import { CustomEditIcon, CustomDeleteIcon } from 'your-icon-library'

// Trong dropdown menu
<DropdownMenuItem onClick={handleEdit}>
  <CustomEditIcon className="mr-2 h-4 w-4" />
  Chỉnh sửa
</DropdownMenuItem>
```

### Custom Status Display

```tsx
// Custom status component
const CustomStatusBadge = ({ status }: { status: Idea['status'] }) => {
  const icons = {
    draft: <DraftIcon />,
    selected: <SelectedIcon />,
    archived: <ArchivedIcon />
  }
  
  return (
    <div className="flex items-center gap-2">
      {icons[status]}
      <span>{statusConfig[status].label}</span>
    </div>
  )
}
```

## Examples

### Basic Implementation

```tsx
'use client'

import { useState } from 'react'
import { IdeaCard, type Idea } from '@/components/ui/idea-card'
import { Toaster } from '@/components/ui/toaster'

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<Idea[]>([
    {
      id: '1',
      title: 'Content Marketing Strategy',
      persona: 'Young Professionals',
      industry: 'Tech',
      status: 'selected'
    }
  ])

  const handleEdit = async (idea: Idea) => {
    // Edit logic
  }

  const handleDelete = async (ideaId: string | number) => {
    setIdeas(prev => prev.filter(idea => idea.id !== ideaId))
  }

  const handleCreateBrief = async (idea: Idea) => {
    // Create brief logic
  }

  return (
    <div className="container mx-auto p-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {ideas.map((idea) => (
          <IdeaCard
            key={idea.id}
            idea={idea}
            onEdit={handleEdit}
            onDelete={handleDelete}
            onSelectAndCreateBrief={handleCreateBrief}
          />
        ))}
      </div>
      <Toaster />
    </div>
  )
}
```

### With Search & Filter

```tsx
export default function IdeasWithFilter() {
  const [ideas, setIdeas] = useState<Idea[]>([])
  const [filter, setFilter] = useState<Idea['status'] | 'all'>('all')
  const [search, setSearch] = useState('')

  const filteredIdeas = ideas.filter(idea => {
    const matchesFilter = filter === 'all' || idea.status === filter
    const matchesSearch = idea.title.toLowerCase().includes(search.toLowerCase())
    return matchesFilter && matchesSearch
  })

  return (
    <div className="space-y-6">
      {/* Filter controls */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Tìm kiếm..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border rounded px-3 py-2"
        />
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as any)}
          className="border rounded px-3 py-2"
        >
          <option value="all">Tất cả</option>
          <option value="draft">Nháp</option>
          <option value="selected">Đã chọn</option>
          <option value="archived">Lưu trữ</option>
        </select>
      </div>

      {/* Ideas grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredIdeas.map((idea) => (
          <IdeaCard key={idea.id} idea={idea} {...handlers} />
        ))}
      </div>
    </div>
  )
}
```

### With Infinite Scroll

```tsx
import { useInfiniteQuery } from '@tanstack/react-query'

export default function InfiniteIdeas() {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery({
    queryKey: ['ideas'],
    queryFn: ({ pageParam = 0 }) => fetchIdeas(pageParam),
    getNextPageParam: (lastPage, pages) => lastPage.nextCursor,
  })

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {data?.pages.flatMap(page => page.ideas).map((idea) => (
          <IdeaCard key={idea.id} idea={idea} {...handlers} />
        ))}
      </div>
      
      {hasNextPage && (
        <Button onClick={() => fetchNextPage()} disabled={isFetchingNextPage}>
          {isFetchingNextPage ? 'Đang tải...' : 'Tải thêm'}
        </Button>
      )}
    </div>
  )
}
```

## Best Practices

1. **Luôn cung cấp key** khi render danh sách IdeaCard
2. **Sử dụng async handlers** để xử lý API calls
3. **Test error cases** để đảm bảo error handling hoạt động
4. **Optimize re-renders** bằng useMemo và useCallback
5. **Provide loading feedback** cho user experience tốt hơn
6. **Implement proper error boundaries** cho production
7. **Test responsive behavior** trên các breakpoint
8. **Use semantic HTML** với proper ARIA labels

## Troubleshooting

### Animation không hoạt động
- Kiểm tra framer-motion đã được cài đặt
- Verify component được wrap trong Client Component

### Toast không hiển thị  
- Đảm bảo `<Toaster />` được import và render
- Kiểm tra toast hook import đúng path

### Dropdown menu không mở
- Verify dropdown-menu component được cài đúng
- Kiểm tra z-index conflicts

### Status badge màu sắc không đúng
- Kiểm tra Tailwind CSS classes
- Verify dark mode support nếu cần

## Demo

Truy cập `/demo-idea-card` để xem demo đầy đủ tính năng của IdeaCard component.

---

## Support

Component này được xây dựng với:
- **Next.js 14** - App Router
- **Tailwind CSS** - Styling  
- **shadcn/ui** - Base components
- **Framer Motion** - Animations
- **Lucide React** - Icons