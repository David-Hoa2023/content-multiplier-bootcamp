"use client"

import React from 'react'
import Layout from './Layout'
import PageTransition from './PageTransition'
import { TooltipProvider } from '@/components/ui/tooltip'

interface AppLayoutProps {
  children: React.ReactNode
  pageTitle?: string
  breadcrumbs?: Array<{ label: string; href?: string }>
  user?: {
    name: string
    email: string
    avatar?: string
  }
  withTransitions?: boolean
}

export default function AppLayout({ 
  children, 
  pageTitle,
  breadcrumbs,
  user,
  withTransitions = true 
}: AppLayoutProps) {
  const content = withTransitions ? (
    <PageTransition>{children}</PageTransition>
  ) : (
    children
  )

  return (
    <TooltipProvider>
      <Layout 
        pageTitle={pageTitle}
        breadcrumbs={breadcrumbs}
        user={user}
      >
        {content}
      </Layout>
    </TooltipProvider>
  )
}