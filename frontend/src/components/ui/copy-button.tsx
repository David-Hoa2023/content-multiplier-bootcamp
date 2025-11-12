'use client'

import * as React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface CopyButtonProps {
  text: string
  className?: string
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link'
  size?: 'default' | 'sm' | 'lg' | 'icon'
  iconOnly?: boolean
  successMessage?: string
  onCopy?: () => void
}

export function CopyButton({
  text,
  className,
  variant = 'ghost',
  size = 'icon',
  iconOnly = true,
  successMessage = 'Copied to clipboard!',
  onCopy
}: CopyButtonProps) {
  const [copied, setCopied] = React.useState(false)

  React.useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [copied])

  const handleCopy = async () => {
    if (!text) return

    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)

      // Show toast
      toast({
        title: successMessage,
        duration: 2000
      })

      // Call callback if provided
      onCopy?.()
    } catch (error) {
      console.error('Failed to copy:', error)
      toast({
        title: 'Failed to copy',
        variant: 'destructive',
        duration: 2000
      })
    }
  }

  return (
    <motion.div
      animate={copied ? { scale: 1.1 } : { scale: 1 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 17
      }}
    >
      <Button
        variant={variant}
        size={size}
        onClick={handleCopy}
        className={cn(
          'relative transition-colors',
          copied && 'text-green-600 dark:text-green-400',
          className
        )}
      >
        <AnimatePresence mode="wait" initial={false}>
          {copied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 180 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
            >
              <Check className="h-4 w-4" />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -180 }}
              transition={{
                type: 'spring',
                stiffness: 200,
                damping: 15
              }}
            >
              <Copy className="h-4 w-4" />
            </motion.div>
          )}
        </AnimatePresence>
        {!iconOnly && (
          <span className="ml-2">
            {copied ? 'Copied!' : 'Copy'}
          </span>
        )}
      </Button>
    </motion.div>
  )
}




