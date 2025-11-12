"use client"

import React, { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { 
  Lightbulb, 
  FileText, 
  Pen, 
  Settings, 
  Menu,
  User,
  ChevronRight,
  Home,
  Package,
  BookOpen,
  FolderOpen,
  Edit,
  CheckCircle,
  Share2,
  Send,
  ArrowDown,
  Globe
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ThemeToggle } from '@/components/theme-toggle'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  badge?: number
}

interface LayoutProps {
  children: React.ReactNode
  pageTitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  user?: {
    name: string
    email: string
    avatar?: string
  }
}

const navigation: NavigationItem[] = [
  // Resources & Knowledge
  { name: 'Knowledge Base', href: '/knowledge', icon: BookOpen },
  { name: 'Documents', href: '/documents', icon: FolderOpen },
]

export default function Layout({ 
  children, 
  pageTitle = 'Content Management',
  breadcrumbs,
  user = {
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/placeholder-avatar.jpg'
  }
}: LayoutProps) {
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  // Sidebar content component
  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo/Brand */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Lightbulb className="h-4 w-4" />
          </div>
          <span className="text-lg font-semibold">ContentHub</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-4 py-4 overflow-y-auto">
        <TooltipProvider>
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href))
            
            return (
              <Tooltip key={item.name}>
                <TooltipTrigger asChild>
                  <Link
                    href={item.href}
                    onClick={() => mobile && setIsMobileMenuOpen(false)}
                    className={cn(
                      'group flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all hover:bg-accent hover:text-accent-foreground',
                      isActive 
                        ? 'bg-accent text-accent-foreground shadow-sm' 
                        : 'text-muted-foreground'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.name}</span>
                    {item.badge && (
                      <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </TooltipTrigger>
                <TooltipContent side="right" className="lg:hidden">
                  {item.name}
                </TooltipContent>
              </Tooltip>
            )
          })}
        </TooltipProvider>

        {/* Main Content Workflow */}
        <div className="mt-6 pt-6 border-t">
          <div className="px-3 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Quy trình tạo nội dung
            </h3>
          </div>
          <div className="space-y-1">
            {[
              { 
                name: '1. Ideas', 
                icon: Lightbulb, 
                href: '/', 
                active: pathname === '/',
                description: 'Tạo và quản lý ý tưởng'
              },
              { 
                name: '2. Briefs', 
                icon: FileText, 
                href: '/briefs', 
                active: pathname.startsWith('/briefs'),
                description: 'Tạo brief chi tiết'
              },
              { 
                name: '3. Content Packs', 
                icon: Package, 
                href: '/test-packs-draft', 
                active: pathname.startsWith('/test-packs-draft') || pathname.startsWith('/packs'),
                description: 'Tạo gói nội dung'
              },
              { 
                name: '4. Chỉnh sửa', 
                icon: Edit, 
                href: '/drafts', 
                active: pathname.startsWith('/drafts') || pathname.startsWith('/edit'),
                description: 'Chỉnh sửa nội dung'
              },
              { 
                name: '5. Duyệt', 
                icon: CheckCircle, 
                href: '/review', 
                active: pathname.startsWith('/review'),
                description: 'Duyệt nội dung'
              },
              { 
                name: '6. Nội dung Platform', 
                icon: Share2, 
                href: '/derivatives', 
                active: pathname.startsWith('/derivatives'),
                description: 'Tạo nội dung cho từng platform'
              },
              { 
                name: '7. Xuất bản', 
                icon: Send, 
                href: '/multi-platform-publisher', 
                active: pathname.startsWith('/multi-platform-publisher') || pathname.startsWith('/publish'),
                description: 'Xuất bản đa platform'
              },
            ].map((step, index) => (
              <React.Fragment key={step.name}>
                {index > 0 && (
                  <div className="flex justify-center py-0.5">
                    <ArrowDown className="h-3 w-3 text-muted-foreground/40" />
                  </div>
                )}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Link
                      href={step.href}
                      onClick={() => mobile && setIsMobileMenuOpen(false)}
                      className={cn(
                        'group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:bg-accent hover:text-accent-foreground w-full',
                        step.active 
                          ? 'bg-accent text-accent-foreground' 
                          : 'text-muted-foreground'
                      )}
                    >
                      <step.icon className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{step.name}</span>
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    <div className="text-sm">
                      <div className="font-medium">{step.name}</div>
                      <div className="text-xs text-muted-foreground">{step.description}</div>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* Utilities & Settings */}
        <div className="mt-6 pt-6 border-t">
          <div className="px-3 mb-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Tiện ích
            </h3>
          </div>
          <div className="space-y-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/settings"
                  onClick={() => mobile && setIsMobileMenuOpen(false)}
                  className={cn(
                    'group flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium transition-all hover:bg-accent hover:text-accent-foreground w-full',
                    pathname.startsWith('/settings') 
                      ? 'bg-accent text-accent-foreground' 
                      : 'text-muted-foreground'
                  )}
                >
                  <Settings className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">Settings</span>
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right" className="lg:hidden">
                Settings
              </TooltipContent>
            </Tooltip>
          </div>
        </div>
      </nav>

      {/* User section */}
      <div className="border-t p-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-8 w-8">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback>
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user.name}</p>
            <p className="text-xs text-muted-foreground truncate">{user.email}</p>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-60 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r bg-card shadow-sm">
          <SidebarContent />
        </div>
      </div>

      {/* Mobile Sidebar */}
      <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
        <SheetContent side="left" className="w-60 p-0">
          <SidebarContent mobile />
        </SheetContent>
      </Sheet>

      {/* Main Content */}
      <div className="lg:pl-60 flex-1 flex flex-col min-h-0">
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b bg-background px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile menu button */}
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden"
                onClick={() => setIsMobileMenuOpen(true)}
              >
                <Menu className="h-4 w-4" />
                <span className="sr-only">Open sidebar</span>
              </Button>
            </SheetTrigger>
          </Sheet>

          {/* Breadcrumbs */}
          <div className="flex flex-1 items-center gap-x-4 self-stretch lg:gap-x-6">
            {breadcrumbs && breadcrumbs.length > 0 ? (
              <nav className="flex items-center space-x-1 text-sm text-muted-foreground">
                <Home className="h-4 w-4" />
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={index}>
                    <ChevronRight className="h-4 w-4" />
                    {crumb.href ? (
                      <Link 
                        href={crumb.href}
                        className="hover:text-foreground transition-colors"
                      >
                        {crumb.label}
                      </Link>
                    ) : (
                      <span className="text-foreground font-medium">{crumb.label}</span>
                    )}
                  </React.Fragment>
                ))}
              </nav>
            ) : (
              <h1 className="text-lg font-semibold">{pageTitle}</h1>
            )}
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-x-4 lg:gap-x-6">
            <ThemeToggle />
            
            <Separator orientation="vertical" className="h-6" />
            
            {/* User profile */}
            <div className="flex items-center gap-x-2">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.avatar} alt={user.name} />
                <AvatarFallback>
                  {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:block">
                <p className="text-sm font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <div className="px-4 py-6 sm:px-6 lg:px-8 h-full">
            <div className="mx-auto max-w-7xl">
              {children}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}