"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Lightbulb, 
  FileText, 
  Pen, 
  Settings, 
  Menu,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'

interface NavigationItem {
  name: string
  href: string
  icon: React.ComponentType<any>
  badge?: number
  description?: string
}

interface SidebarProps {
  className?: string
  appName?: string
  appLogo?: React.ReactNode
  version?: string
  onLogout?: () => void
  isCollapsed?: boolean
  onToggleCollapse?: () => void
  showCollapseButton?: boolean
}

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

const sidebarVariants = {
  expanded: {
    width: 240,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const
    }
  },
  collapsed: {
    width: 64,
    transition: {
      duration: 0.3,
      ease: "easeInOut" as const
    }
  }
}

const contentVariants = {
  expanded: {
    opacity: 1,
    transition: {
      duration: 0.2,
      delay: 0.1
    }
  },
  collapsed: {
    opacity: 0,
    transition: {
      duration: 0.1
    }
  }
}

export function Sidebar({
  className,
  appName = "ContentHub",
  appLogo,
  version = "v1.0.0",
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  showCollapseButton = true
}: SidebarProps) {
  const pathname = usePathname()

  const SidebarContent = ({ mobile = false }: { mobile?: boolean }) => (
    <div className="flex h-full flex-col">
      {/* Logo/Brand Section */}
      <div className={cn(
        "flex items-center border-b border-border bg-card/50",
        isCollapsed && !mobile ? "justify-center px-2 h-16" : "px-6 h-16"
      )}>
        <AnimatePresence mode="wait">
          {(!isCollapsed || mobile) ? (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="flex items-center gap-3"
            >
              {appLogo || (
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <Lightbulb className="h-4 w-4" />
                </div>
              )}
              <span className="text-lg font-semibold text-foreground">{appName}</span>
            </motion.div>
          ) : (
            <motion.div
              initial="expanded"
              animate="collapsed"
              variants={contentVariants}
              className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground"
            >
              <Lightbulb className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Section */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="space-y-1">
          <TooltipProvider delayDuration={0}>
            {navigationItems.map((item) => {
              const isActive = pathname === item.href || 
                (item.href !== '/' && pathname.startsWith(item.href))
              
              const linkContent = (
                <Link
                  href={item.href}
                  className={cn(
                    'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-accent hover:text-accent-foreground relative',
                    isActive 
                        ? 'bg-accent text-accent-foreground shadow-sm border-l-2 border-primary' 
                        : 'text-muted-foreground hover:text-foreground',
                      isCollapsed && !mobile && 'justify-center px-2'
                    )}
                  >
                    <item.icon className={cn(
                      "h-4 w-4 shrink-0 transition-transform group-hover:scale-110",
                      isActive && "text-primary"
                    )} />
                    
                    <AnimatePresence>
                      {(!isCollapsed || mobile) && (
                        <motion.div
                          initial="collapsed"
                          animate="expanded"
                          exit="collapsed"
                          variants={contentVariants}
                          className="flex-1 flex items-center justify-between min-w-0"
                        >
                          <span className="truncate">{item.name}</span>
                          {item.badge && (
                            <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground font-medium">
                              {item.badge}
                            </span>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Active indicator for collapsed state */}
                    {isCollapsed && !mobile && isActive && (
                      <div className="absolute -right-1 top-1/2 h-4 w-1 -translate-y-1/2 rounded-l bg-primary" />
                    )}
                  </Link>
              )

              if (!isCollapsed || mobile) {
                return <div key={item.name}>{linkContent}</div>
              }

              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    {linkContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="font-medium">
                    <div className="space-y-1">
                      <p>{item.name}</p>
                      {item.description && (
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      )}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </TooltipProvider>
        </nav>
      </ScrollArea>

      {/* Footer Section */}
      <div className="border-t border-border p-3 space-y-2">
        {/* Collapse Button */}
        {showCollapseButton && !mobile && onToggleCollapse && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleCollapse}
            className={cn(
              "w-full transition-all duration-200",
              isCollapsed ? "px-2" : "justify-start"
            )}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span className="text-xs">Thu gọn</span>
              </>
            )}
          </Button>
        )}

        {/* Version Info */}
        <AnimatePresence>
          {(!isCollapsed || mobile) && (
            <motion.div
              initial="collapsed"
              animate="expanded"
              exit="collapsed"
              variants={contentVariants}
              className="text-center"
            >
              <p className="text-xs text-muted-foreground">{version}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logout Button */}
        {onLogout && (
          <>
            {(!isCollapsed || mobile) ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={onLogout}
                className={cn(
                  "w-full text-muted-foreground hover:text-foreground transition-all duration-200",
                  isCollapsed && !mobile ? "px-2" : "justify-start"
                )}
              >
                <LogOut className="h-4 w-4" />
                <AnimatePresence>
                  {(!isCollapsed || mobile) && (
                    <motion.span
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                      variants={contentVariants}
                      className="ml-2 text-xs"
                    >
                      Đăng xuất
                    </motion.span>
                  )}
                </AnimatePresence>
              </Button>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onLogout}
                    className={cn(
                      "w-full text-muted-foreground hover:text-foreground transition-all duration-200",
                      isCollapsed && !mobile ? "px-2" : "justify-start"
                    )}
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent side="right">
                  Đăng xuất
                </TooltipContent>
              </Tooltip>
            )}
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={sidebarVariants}
        className={cn(
          "hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:flex-col bg-card border-r border-border shadow-sm",
          className
        )}
      >
        <SidebarContent />
      </motion.div>

      {/* Mobile Sidebar */}
      <div className="lg:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 lg:hidden bg-background/80 backdrop-blur-sm border border-border shadow-sm"
            >
              <Menu className="h-4 w-4" />
              <span className="sr-only">Mở menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent 
            side="left" 
            className="w-64 p-0 bg-card"
            onOpenAutoFocus={(e) => e.preventDefault()}
          >
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h2 className="text-lg font-semibold">Menu</h2>
              <SheetClose asChild>
                <Button variant="ghost" size="icon">
                  <X className="h-4 w-4" />
                </Button>
              </SheetClose>
            </div>
            <SidebarContent mobile />
          </SheetContent>
        </Sheet>
      </div>
    </>
  )
}

// Hook to manage sidebar state
export function useSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)

  const toggleCollapse = () => setIsCollapsed(!isCollapsed)
  const expand = () => setIsCollapsed(false)
  const collapse = () => setIsCollapsed(true)

  return {
    isCollapsed,
    toggleCollapse,
    expand,
    collapse
  }
}

export default Sidebar