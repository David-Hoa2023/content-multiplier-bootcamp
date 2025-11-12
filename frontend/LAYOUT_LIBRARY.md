# Layout Component Library

## Tổng quan

Đây là UI component library được xây dựng với **Next.js 14**, **Tailwind CSS**, và **shadcn/ui** components, bao gồm:

- 📱 **Responsive Layout** với sidebar và header
- 🎨 **Dark/Light mode** support
- ✨ **Smooth animations** với Framer Motion
- 🧭 **Navigation** với active states
- 📋 **Breadcrumbs** support
- 👤 **User management** interface

## Components

### 1. AppLayout

Component chính cho toàn bộ layout của ứng dụng.

```tsx
import { AppLayout } from '@/components/layout'

function MyPage() {
  return (
    <AppLayout 
      pageTitle="Trang của tôi"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Trang của tôi' }
      ]}
      user={{
        name: 'John Doe',
        email: 'john@example.com',
        avatar: '/avatar.jpg'
      }}
    >
      {/* Nội dung trang */}
      <h1>Hello World!</h1>
    </AppLayout>
  )
}
```

**Props:**
- `children`: React.ReactNode - Nội dung trang
- `pageTitle?`: string - Tiêu đề hiển thị ở header
- `breadcrumbs?`: Array - Breadcrumbs navigation
- `user?`: Object - Thông tin user
- `withTransitions?`: boolean - Bật/tắt page transitions

### 2. Layout

Component layout cơ bản (được sử dụng bên trong AppLayout).

```tsx
import { Layout } from '@/components/layout'

function CustomLayout() {
  return (
    <Layout pageTitle="Custom Page">
      <div>Custom content here</div>
    </Layout>
  )
}
```

### 3. PageTransition

Component để tạo animation khi chuyển trang.

```tsx
import { PageTransition } from '@/components/layout'

function AnimatedContent() {
  return (
    <PageTransition>
      <div>Content with transition effects</div>
    </PageTransition>
  )
}
```

### 4. ThemeToggle

Component để chuyển đổi dark/light mode.

```tsx
import { ThemeToggle } from '@/components/theme-toggle'

function Header() {
  return (
    <div className="header">
      <ThemeToggle />
    </div>
  )
}
```

## Features

### 🎨 Dark/Light Mode

Theme được quản lý bởi `next-themes` và lưu trong localStorage:

```tsx
// Trong _app.tsx hoặc layout.tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function App({ children }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </ThemeProvider>
  )
}
```

### 📱 Responsive Design

- **Desktop**: Sidebar cố định 240px bên trái
- **Mobile**: Sidebar ẩn, hiện bằng hamburger menu
- **Tablet**: Responsive breakpoints

### 🧭 Navigation

Sidebar navigation với active state detection:

```tsx
const navigation = [
  { name: 'Ideas', href: '/', icon: Lightbulb },
  { name: 'Briefs', href: '/briefs', icon: FileText },
  { name: 'Drafts', href: '/drafts', icon: Pen },
  { name: 'Settings', href: '/settings', icon: Settings },
]
```

### ✨ Animations

Các animation được implement với Framer Motion:

- Page transitions (fade + slide)
- Sidebar collapse/expand
- Hover effects
- Loading states

### 📋 Breadcrumbs

```tsx
// Simple breadcrumbs
<AppLayout breadcrumbs={[
  { label: 'Home', href: '/' },
  { label: 'Products', href: '/products' },
  { label: 'iPhone 15' } // Current page (no href)
]} />

// Multi-level breadcrumbs
<AppLayout breadcrumbs={[
  { label: 'Dashboard', href: '/' },
  { label: 'E-commerce', href: '/ecommerce' },
  { label: 'Products', href: '/ecommerce/products' },
  { label: 'Categories' }
]} />
```

## Cài đặt

### 1. Dependencies

```bash
npm install next-themes framer-motion
npm install @radix-ui/react-avatar @radix-ui/react-sheet @radix-ui/react-toggle @radix-ui/react-tooltip @radix-ui/react-separator
```

### 2. shadcn/ui Components

```bash
npx shadcn@latest add avatar button sheet toggle tooltip separator tabs dropdown-menu
```

### 3. Setup Theme Provider

Trong `app/layout.tsx`:

```tsx
import { ThemeProvider } from '@/components/theme-provider'

export default function RootLayout({ children }) {
  return (
    <html lang="vi" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
}
```

### 4. Tailwind CSS

Đảm bảo `tailwind.config.ts` có:

```ts
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  // ... shadcn/ui theme config
}
```

## Customization

### Thay đổi Navigation

Sửa trong `components/layout/Layout.tsx`:

```tsx
const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/', icon: Home },
  { name: 'Analytics', href: '/analytics', icon: BarChart },
  { name: 'Users', href: '/users', icon: Users },
  // Thêm items mới...
]
```

### Custom Theme Colors

Sửa CSS variables trong `globals.css`:

```css
:root {
  --primary: 210 40% 98%;
  --primary-foreground: 222.2 47.4% 11.2%;
  /* ... other colors */
}

.dark {
  --primary: 222.2 47.4% 11.2%;
  --primary-foreground: 210 40% 98%;
  /* ... other colors */
}
```

### Animation Settings

Sửa trong `components/layout/PageTransition.tsx`:

```tsx
const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 },
}

const pageTransition = {
  type: 'tween',
  ease: 'anticipate',
  duration: 0.3, // Thay đổi thời gian
}
```

## Examples

### Trang cơ bản

```tsx
'use client'

import { AppLayout } from '@/components/layout'

export default function BasicPage() {
  return (
    <AppLayout pageTitle="Trang cơ bản">
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Welcome!</h1>
        <p>Đây là nội dung trang cơ bản.</p>
      </div>
    </AppLayout>
  )
}
```

### Trang với Breadcrumbs

```tsx
'use client'

import { AppLayout } from '@/components/layout'

export default function ProductDetailPage() {
  return (
    <AppLayout 
      pageTitle="Chi tiết sản phẩm"
      breadcrumbs={[
        { label: 'Dashboard', href: '/' },
        { label: 'Sản phẩm', href: '/products' },
        { label: 'iPhone 15 Pro' }
      ]}
    >
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">iPhone 15 Pro</h1>
        {/* Product details */}
      </div>
    </AppLayout>
  )
}
```

### Trang với Custom User

```tsx
'use client'

import { AppLayout } from '@/components/layout'

export default function ProfilePage() {
  return (
    <AppLayout 
      pageTitle="Hồ sơ"
      user={{
        name: 'Nguyễn Văn A',
        email: 'nguyenvana@example.com',
        avatar: '/avatars/user-1.jpg'
      }}
    >
      <div>Profile content here</div>
    </AppLayout>
  )
}
```

## Best Practices

1. **Luôn sử dụng AppLayout** cho consistency
2. **Đặt pageTitle rõ ràng** cho mỗi trang
3. **Sử dụng breadcrumbs** cho navigation phức tạp
4. **Test dark mode** cho tất cả components
5. **Kiểm tra responsive** trên mobile
6. **Sử dụng semantic HTML** trong content

## Troubleshooting

### Hydration Errors
Thêm `suppressHydrationWarning` vào `<html>` tag:

```tsx
<html lang="vi" suppressHydrationWarning>
```

### Theme không switching
Kiểm tra ThemeProvider wrapper và CSS variables.

### Icons không hiển thị
Đảm bảo đã install `lucide-react`:

```bash
npm install lucide-react
```

### Layout bị vỡ trên mobile
Kiểm tra responsive classes và Sheet component setup.

---

## Support

Nếu gặp vấn đề, hãy kiểm tra:
1. Console errors
2. Tailwind CSS classes
3. shadcn/ui component setup
4. Next.js router setup