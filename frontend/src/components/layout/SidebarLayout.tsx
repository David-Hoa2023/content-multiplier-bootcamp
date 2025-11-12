"use client"

import React from 'react'
import { Sidebar, useSidebar } from '@/components/ui/sidebar'
import { ThemeToggle } from '@/components/theme-toggle'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Button } from '@/components/ui/button'
import { ChevronRight, Home } from 'lucide-react'
import Link from 'next/link'

interface User {
  name: string
  email: string
  avatar?: string
}

interface SidebarLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  user?: User
  appName?: string
  appLogo?: React.ReactNode
  version?: string
  onLogout?: () => void
}

export default function SidebarLayout({
  children,
  pageTitle = "ContentHub",
  breadcrumbs,
  user = {
    name: 'Vibe Coder',
    email: 'coder@vibecoding.com',
    avatar: undefined
  },
  appName = "ContentHub",
  appLogo,
  version = "v1.0.0",
  onLogout
}: SidebarLayoutProps) {
  const { isCollapsed, toggleCollapse } = useSidebar()

  const handleLogout = () => {
    if (onLogout) {
      onLogout()
    } else {
      // Default logout behavior
      console.log('Logout clicked')
      alert('Logout functionality not implemented')
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <Sidebar
        isCollapsed={isCollapsed}
        onToggleCollapse={toggleCollapse}
        appName={appName}
        appLogo={appLogo}
        version={version}
        onLogout={handleLogout}
        showCollapseButton={true}
      />

      {/* Main Content */}
      <div 
        className={`flex-1 flex flex-col min-h-0 transition-all duration-300 ${
          isCollapsed ? 'lg:ml-16' : 'lg:ml-60'
        }`}
      >
        {/* Header */}
        <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4 shadow-sm sm:gap-x-6 sm:px-6 lg:px-8">
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