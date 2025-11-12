"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  Lightbulb,
  FileText,
  Plus,
  Search,
  Archive,
  Users,
  Settings,
  Inbox,
  Image as ImageIcon,
  FolderOpen,
  Share2
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface EmptyStateProps {
  title: string
  description: string
  ctaLabel?: string
  onClick?: () => void
  icon?: React.ReactNode
  variant?: 'default' | 'compact' | 'minimal'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  showCTA?: boolean
}

// Default illustrations for common scenarios
const defaultIcons = {
  ideas: <Lightbulb className="h-16 w-16 text-muted-foreground/40" />,
  briefs: <FileText className="h-16 w-16 text-muted-foreground/40" />,
  search: <Search className="h-16 w-16 text-muted-foreground/40" />,
  archive: <Archive className="h-16 w-16 text-muted-foreground/40" />,
  users: <Users className="h-16 w-16 text-muted-foreground/40" />,
  settings: <Settings className="h-16 w-16 text-muted-foreground/40" />,
  inbox: <Inbox className="h-16 w-16 text-muted-foreground/40" />,
  images: <ImageIcon className="h-16 w-16 text-muted-foreground/40" />,
  folder: <FolderOpen className="h-16 w-16 text-muted-foreground/40" />
}

// Custom illustration component
const DefaultIllustration = () => (
  <div className="relative">
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
      className="absolute inset-0 opacity-20"
    >
      <div className="w-24 h-24 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full blur-xl" />
    </motion.div>
    
    <motion.div
      animate={{ 
        scale: [1, 1.05, 1],
      }}
      transition={{ 
        duration: 3, 
        repeat: Infinity, 
        ease: "easeInOut" 
      }}
      className="relative z-10"
    >
      <div className="w-20 h-20 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl flex items-center justify-center border border-border/50">
        <FolderOpen className="h-10 w-10 text-muted-foreground/60" />
      </div>
    </motion.div>
  </div>
)

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
} as const

const containerVariants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    scale: 0.95
  },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: {
      duration: 0.6,
      ease: "easeOut",
      staggerChildren: 0.1
    }
  }
}

const itemVariants = {
  hidden: { 
    opacity: 0, 
    y: 10 
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut"
    }
  }
}

export function EmptyState({
  title,
  description,
  ctaLabel,
  onClick,
  icon,
  variant = 'default',
  size = 'md',
  className,
  showCTA = true
}: EmptyStateProps) {
  const config = sizeConfig[size]
  
  const renderIcon = () => {
    if (icon) {
      return React.cloneElement(icon as React.ReactElement, {
        className: cn(config.icon, "text-muted-foreground/50")
      })
    }
    return <DefaultIllustration />
  }

  const renderContent = () => {
    switch (variant) {
      case 'minimal':
        return (
          <div className="text-center space-y-2">
            <motion.h3 
              variants={itemVariants}
              className={cn("font-medium text-foreground", config.title)}
            >
              {title}
            </motion.h3>
            <motion.p 
              variants={itemVariants}
              className={cn("text-muted-foreground", config.description)}
            >
              {description}
            </motion.p>
          </div>
        )
      
      case 'compact':
        return (
          <div className="text-center space-y-3">
            <motion.div
              variants={itemVariants}
              className="flex justify-center"
            >
              {renderIcon()}
            </motion.div>
            <div className="space-y-1">
              <motion.h3 
                variants={itemVariants}
                className={cn("font-semibold text-foreground", config.title)}
              >
                {title}
              </motion.h3>
              <motion.p 
                variants={itemVariants}
                className={cn("text-muted-foreground", config.description)}
              >
                {description}
              </motion.p>
            </div>
          </div>
        )
      
      default:
        return (
          <div className="text-center space-y-6">
            <motion.div
              variants={itemVariants}
              className="flex justify-center"
            >
              {renderIcon()}
            </motion.div>
            
            <div className="space-y-2">
              <motion.h2 
                variants={itemVariants}
                className={cn("font-semibold text-foreground tracking-tight", config.title)}
              >
                {title}
              </motion.h2>
              <motion.p 
                variants={itemVariants}
                className={cn("text-muted-foreground max-w-md mx-auto leading-relaxed", config.description)}
              >
                {description}
              </motion.p>
            </div>
          </div>
        )
    }
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        "flex flex-col items-center justify-center text-center",
        config.container,
        className
      )}
    >
      {renderContent()}
      
      {showCTA && ctaLabel && onClick && (
        <motion.div
          variants={itemVariants}
          className={cn("mt-6", variant === 'minimal' && "mt-4")}
        >
          <Button 
            onClick={onClick}
            size={config.button as any}
            className="gap-2 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
          >
            <Plus className="h-4 w-4" />
            {ctaLabel}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

// Preset components for common scenarios
export const EmptyIdeas = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState
    icon={defaultIcons.ideas}
    {...props}
  />
)

export const EmptyBriefs = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState
    icon={defaultIcons.briefs}
    {...props}
  />
)

export const EmptySearch = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState
    icon={defaultIcons.search}
    {...props}
  />
)

export const EmptyArchive = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState
    icon={defaultIcons.archive}
    {...props}
  />
)

export const EmptyDerivatives = (props: Omit<EmptyStateProps, 'icon'>) => (
  <EmptyState
    icon={
      <div className="relative">
        <motion.div
          animate={{ 
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0]
          }}
          transition={{ 
            duration: 4, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="absolute inset-0 opacity-20"
        >
          <div className="w-24 h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-xl" />
        </motion.div>
        <motion.div
          animate={{ 
            scale: [1, 1.05, 1],
          }}
          transition={{ 
            duration: 3, 
            repeat: Infinity, 
            ease: "easeInOut" 
          }}
          className="relative z-10"
        >
          <Share2 className="h-16 w-16 text-muted-foreground/40" />
        </motion.div>
      </div>
    }
    {...props}
  />
)

export default EmptyState