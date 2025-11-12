# Sidebar Component Documentation

## Tổng quan

`Sidebar` là một component React được xây dựng với **Tailwind CSS** và **shadcn/ui**, cung cấp navigation sidebar với đầy đủ tính năng cho ứng dụng web.

## Features

- ✅ **Responsive Design**: Desktop sidebar cố định, mobile hamburger menu
- ✅ **Collapsible**: Thu gọn/mở rộng với animation mượt
- ✅ **Active State**: Highlight tab đang active
- ✅ **Tooltips**: Hiển thị tooltip khi collapsed
- ✅ **Dark Mode**: Hỗ trợ dark/light theme
- ✅ **Badge Support**: Hiển thị số thông báo
- ✅ **Smooth Animations**: Framer Motion animations
- ✅ **Custom Logo**: Hỗ trợ logo tùy chỉnh
- ✅ **Version Display**: Hiển thị phiên bản app
- ✅ **Logout Button**: Nút đăng xuất tích hợp

## Installation

### 1. Dependencies

```bash
npm install framer-motion next-themes
npm install @radix-ui/react-sheet @radix-ui/react-tooltip @radix-ui/react-separator @radix-ui/react-scroll-area
```

### 2. shadcn/ui Components

```bash
npx shadcn@latest add button sheet tooltip separator scroll-area badge
```

## Basic Usage

### Standalone Sidebar

```tsx
import { Sidebar, useSidebar } from '@/components/ui/sidebar'

function App() {
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        appName="MyApp"
        version="v1.0.0"
        onLogout={() => console.log('Logout')}
      />
      
      <main className={`flex-1 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-60'}`}>
        {/* Main content */}
      </main>
    </div>
  )
}
```

### With SidebarLayout

```tsx
import SidebarLayout from '@/components/layout/SidebarLayout'

function MyPage() {
  return (
    <SidebarLayout
      pageTitle="My Page"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'My Page' }
      ]}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatar.jpg'
      }}
      onLogout={() => handleLogout()}
    >
      <h1>Page Content</h1>
    </SidebarLayout>
  )
}
```

## Props

### Sidebar Props

```tsx
interface SidebarProps {
  className?: string                    // CSS classes bổ sung
  appName?: string                     // Tên ứng dụng (default: "ContentHub")
  appLogo?: React.ReactNode            // Logo tùy chỉnh
  version?: string                     // Phiên bản app (default: "v1.0.0")
  onLogout?: () => void               // Handler cho nút logout
  isCollapsed?: boolean               // Trạng thái thu gọn
  onToggleCollapse?: () => void       // Handler toggle collapse
  showCollapseButton?: boolean        // Hiển thị nút collapse (default: true)
}
```

### SidebarLayout Props

```tsx
interface SidebarLayoutProps {
  children: React.ReactNode           // Nội dung trang
  pageTitle?: string                  // Tiêu đề trang
  breadcrumbs?: Array<{               // Breadcrumbs navigation
    label: string
    href?: string
  }>
  user?: {                           // Thông tin user
    name: string
    email: string
    avatar?: string
  }
  appName?: string                   // Tên app
  appLogo?: React.ReactNode          // Logo app
  version?: string                   // Phiên bản
  onLogout?: () => void             // Handler logout
}
```

## Navigation Configuration

### Default Navigation Items

```tsx
const navigationItems: NavigationItem[] = [
  { 
    name: 'Ideas', 
    href: '/', 
    icon: Lightbulb,
    description: 'Quản lý ý tưởng nội dung'
  },
  { 
    name: 'Briefs', 
    href: '/briefs', 
    icon: FileText,
    description: 'Tạo và quản lý briefs'
  },
  { 
    name: 'Drafts', 
    href: '/drafts', 
    icon: Pen,
    badge: 3,
    description: 'Bản thảo đang soạn'
  },
  { 
    name: 'Settings', 
    href: '/settings', 
    icon: Settings,
    description: 'Cài đặt ứng dụng'
  },
]
```

### Custom Navigation

Để tùy chỉnh navigation, sửa trong `components/ui/sidebar.tsx`:

```tsx
const navigationItems: NavigationItem[] = [
  { 
    name: 'Dashboard', 
    href: '/', 
    icon: Home,
    description: 'Trang chủ'
  },
  { 
    name: 'Analytics', 
    href: '/analytics', 
    icon: BarChart,
    description: 'Thống kê'
  },
  { 
    name: 'Users', 
    href: '/users', 
    icon: Users,
    badge: 5,
    description: 'Quản lý người dùng'
  },
  // Thêm items khác...
]
```

## Responsive Behavior

### Desktop (lg và lớn hơn)
- Sidebar cố định bên trái
- Width mặc định: 240px
- Có thể collapse xuống 64px
- Tooltips hiện khi collapsed

### Mobile (nhỏ hơn lg)
- Sidebar ẩn hoàn toàn
- Hamburger menu button ở góc trên trái
- Sidebar mở dưới dạng Sheet overlay
- Full functionality trên mobile

## Animations

### Collapse/Expand Animation

```tsx
const sidebarVariants = {
  expanded: {
    width: 240,
    transition: { duration: 0.3, ease: "easeInOut" }
  },
  collapsed: {
    width: 64,
    transition: { duration: 0.3, ease: "easeInOut" }
  }
}
```

### Content Fade Animation

```tsx
const contentVariants = {
  expanded: {
    opacity: 1,
    transition: { duration: 0.2, delay: 0.1 }
  },
  collapsed: {
    opacity: 0,
    transition: { duration: 0.1 }
  }
}
```

## useSidebar Hook

Hook để quản lý trạng thái sidebar:

```tsx
const { isCollapsed, toggleCollapse, expand, collapse } = useSidebar()

// Sử dụng
<button onClick={toggleCollapse}>Toggle Sidebar</button>
<button onClick={expand}>Expand Sidebar</button>
<button onClick={collapse}>Collapse Sidebar</button>
```

## Customization

### Custom Logo

```tsx
<Sidebar
  appLogo={
    <div className="flex items-center gap-2">
      <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
      <span className="font-bold">MyApp</span>
    </div>
  }
/>
```

### Custom Styling

```tsx
<Sidebar
  className="border-r-2 border-primary"
  // Các props khác...
/>
```

### Theme Customization

Sidebar sử dụng CSS variables từ shadcn/ui theme:

```css
/* globals.css */
:root {
  --sidebar-bg: hsl(var(--card));
  --sidebar-border: hsl(var(--border));
  --sidebar-text: hsl(var(--foreground));
  --sidebar-muted: hsl(var(--muted-foreground));
}
```

## Examples

### Basic Implementation

```tsx
'use client'

import { Sidebar, useSidebar } from '@/components/ui/sidebar'

export default function Layout({ children }) {
  const { isCollapsed, toggleCollapse } = useSidebar()

  return (
    <div className="flex h-screen">
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        onLogout={() => {
          // Handle logout
          localStorage.removeItem('token')
          window.location.href = '/login'
        }}
      />
      
      <main className={`flex-1 transition-all duration-300 ${
        isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
      }`}>
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  )
}
```

### With Custom App Info

```tsx
<Sidebar
  appName="Content Manager"
  appLogo={<MyCustomLogo />}
  version="v2.1.0"
  isCollapsed={isCollapsed}
  onToggleCollapse={toggleCollapse}
  onLogout={handleLogout}
/>
```

### Full Page Layout

```tsx
import SidebarLayout from '@/components/layout/SidebarLayout'

export default function ProductsPage() {
  return (
    <SidebarLayout
      pageTitle="Products"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'E-commerce', href: '/ecommerce' },
        { label: 'Products' }
      ]}
      user={{
        name: 'Admin User',
        email: 'admin@company.com',
        avatar: '/admin-avatar.jpg'
      }}
      appName="E-commerce Admin"
      version="v3.0.0"
      onLogout={() => signOut()}
    >
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Products Management</h1>
        {/* Products content */}
      </div>
    </SidebarLayout>
  )
}
```

## Best Practices

1. **Luôn sử dụng useSidebar hook** để quản lý state
2. **Test responsive behavior** trên mobile và desktop
3. **Kiểm tra tooltips** khi sidebar collapsed
4. **Sử dụng breadcrumbs** cho navigation phức tạp
5. **Cung cấp onLogout handler** phù hợp
6. **Test dark mode** để đảm bảo tương thích
7. **Sử dụng semantic navigation** với proper ARIA labels

## Troubleshooting

### Sidebar không responsive
- Kiểm tra Tailwind responsive classes (`lg:hidden`, `lg:flex`)
- Đảm bảo đã import đầy đủ components

### Animations không hoạt động
- Kiểm tra framer-motion đã được cài đặt
- Verify motion components được import đúng

### Tooltips không hiển thị
- Đảm bảo TooltipProvider được wrap component
- Kiểm tra `disabled` prop của Tooltip

### Active state không đúng
- Verify usePathname() hoạt động đúng
- Kiểm tra href matching logic

## Demo

Truy cập `/demo-sidebar` để xem demo đầy đủ tính năng của Sidebar component.

---

## Support

Component này được xây dựng với:
- **Next.js 14** - App Router
- **Tailwind CSS** - Styling
- **shadcn/ui** - Base components
- **Framer Motion** - Animations
- **Lucide React** - Icons