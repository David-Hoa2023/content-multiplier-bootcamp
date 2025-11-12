"use client"

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Copy, Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

export interface CopyToClipboardProps {
  text: string                              // Nội dung cần sao chép
  label?: string                           // Text hiển thị trên nút (optional)
  variant?: 'default' | 'secondary' | 'ghost' | 'outline' | 'destructive' | 'link'  // Button variant
  size?: 'default' | 'sm' | 'lg' | 'icon'  // Button size
  iconOnly?: boolean                       // Chỉ hiển thị icon, không có label
  disabled?: boolean                       // Disable button
  className?: string                       // Additional CSS classes
  tooltipText?: string                     // Custom tooltip text
  successMessage?: string                  // Custom success message
  errorMessage?: string                    // Custom error message
  resetDelay?: number                      // Thời gian reset icon (ms), default 2000
  toastPosition?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center' // Toast position
  showToast?: boolean                      // Show toast notification, default true
  formatJSON?: boolean                     // Auto-format JSON content
  onCopy?: (text: string) => void         // Callback when copy succeeds
  onError?: (error: Error) => void        // Callback when copy fails
}

const iconVariants = {
  initial: { scale: 0.8, opacity: 0, rotate: -180 },
  animate: { 
    scale: 1, 
    opacity: 1, 
    rotate: 0,
    transition: { 
      type: "spring", 
      stiffness: 200, 
      damping: 15,
      duration: 0.4
    }
  },
  exit: { 
    scale: 0.8, 
    opacity: 0, 
    rotate: 180,
    transition: { duration: 0.2 }
  }
}

const buttonVariants = {
  idle: { scale: 1 },
  hover: { scale: 1.02 },
  tap: { scale: 0.98 },
  copied: { 
    scale: 1.05,
    transition: { 
      type: "spring", 
      stiffness: 400, 
      damping: 10,
      duration: 0.3
    }
  }
}

export function CopyToClipboard({
  text,
  label,
  variant = 'outline',
  size = 'default',
  iconOnly = false,
  disabled = false,
  className,
  tooltipText = "Copy to clipboard",
  successMessage = "Copied to clipboard!",
  errorMessage = "Failed to copy to clipboard",
  resetDelay = 2000,
  toastPosition = 'top-right',
  showToast = true,
  formatJSON = false,
  onCopy,
  onError
}: CopyToClipboardProps) {
  const [copied, setCopied] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Reset copied state after delay
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => {
        setCopied(false)
      }, resetDelay)

      return () => clearTimeout(timer)
    }
  }, [copied, resetDelay])

  // Format text for copying
  const formatTextForCopy = (textToCopy: string): string => {
    if (formatJSON) {
      try {
        const parsed = JSON.parse(textToCopy)
        return JSON.stringify(parsed, null, 2)
      } catch {
        // If not valid JSON, return as is
        return textToCopy
      }
    }
    return textToCopy
  }

  // Get toast position classes for animation
  const getToastAnimationClass = () => {
    switch (toastPosition) {
      case 'top-right':
        return 'slide-in-from-right-4 slide-in-from-top-4'
      case 'top-left':
        return 'slide-in-from-left-4 slide-in-from-top-4'
      case 'bottom-right':
        return 'slide-in-from-right-4 slide-in-from-bottom-4'
      case 'bottom-left':
        return 'slide-in-from-left-4 slide-in-from-bottom-4'
      case 'top-center':
        return 'slide-in-from-top-4'
      case 'bottom-center':
        return 'slide-in-from-bottom-4'
      default:
        return 'slide-in-from-right-4 slide-in-from-top-4'
    }
  }

  const handleCopy = async () => {
    if (disabled || isLoading || !text) return

    setIsLoading(true)

    try {
      // Check if clipboard API is available
      if (!navigator.clipboard) {
        throw new Error('Clipboard API not supported')
      }

      // Format and copy text to clipboard
      const formattedText = formatTextForCopy(text)
      await navigator.clipboard.writeText(formattedText)
      
      setCopied(true)
      
      // Show success toast with animation and position
      if (showToast) {
        toast({
          title: "✅ Success",
          description: `${successMessage} (${formattedText.length} characters)`,
          duration: 3000,
          className: cn(
            "animate-in fade-in-0 zoom-in-95 duration-300",
            getToastAnimationClass()
          )
        })
      }

      // Call onCopy callback if provided
      onCopy?.(formattedText)

    } catch (error) {
      console.error('Failed to copy text:', error)
      
      // Fallback: try using deprecated execCommand
      try {
        const textArea = document.createElement('textarea')
        textArea.value = text
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        
        const successful = document.execCommand('copy')
        document.body.removeChild(textArea)
        
        if (successful) {
          setCopied(true)
          const formattedText = formatTextForCopy(text)
          if (showToast) {
            toast({
              title: "✅ Success",
              description: `${successMessage} (${formattedText.length} characters)`,
              duration: 3000,
              className: cn(
                "animate-in fade-in-0 zoom-in-95 duration-300",
                getToastAnimationClass()
              )
            })
          }
          onCopy?.(formattedText)
        } else {
          throw new Error('execCommand copy failed')
        }
      } catch (fallbackError) {
        // Show error toast with animation
        if (showToast) {
          toast({
            title: "❌ Error",
            description: errorMessage,
            variant: "destructive",
            duration: 4000,
            className: cn(
              "animate-in fade-in-0 zoom-in-95 duration-300",
              getToastAnimationClass()
            )
          })
        }

        // Call onError callback if provided
        onError?.(error as Error)
      }
    } finally {
      setIsLoading(false)
    }
  }

  const renderIcon = () => (
    <AnimatePresence mode="wait" initial={false}>
      {copied ? (
        <motion.div
          key="check"
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Check className="h-4 w-4 text-green-500" />
        </motion.div>
      ) : (
        <motion.div
          key="copy"
          variants={iconVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <Copy className="h-4 w-4" />
        </motion.div>
      )}
    </AnimatePresence>
  )

  const renderButton = () => (
    <motion.div
      variants={buttonVariants}
      initial="idle"
      whileHover={!disabled ? "hover" : "idle"}
      whileTap={!disabled ? "tap" : "idle"}
      animate={copied ? "copied" : "idle"}
    >
      <Button
        variant={variant}
        size={size}
        disabled={disabled || isLoading}
        onClick={handleCopy}
        className={cn(
          "relative transition-all duration-200",
          copied && "text-green-600 border-green-300 bg-green-50 dark:bg-green-950 dark:border-green-600",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      >
        {iconOnly ? (
          renderIcon()
        ) : (
          <div className="flex items-center gap-2">
            {renderIcon()}
            {label && (
              <motion.span
                key={copied ? 'copied' : 'copy'}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                transition={{ duration: 0.2 }}
              >
                {copied ? 'Copied!' : label}
              </motion.span>
            )}
          </div>
        )}
      </Button>
    </motion.div>
  )

  // Show button without tooltip if no tooltip text
  if (!tooltipText || disabled) {
    return renderButton()
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {renderButton()}
        </TooltipTrigger>
        <TooltipContent>
          <p>{copied ? 'Copied!' : tooltipText}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Utility function to format text for copying
export const formatTextForCopy = (data: any, format: 'text' | 'json' = 'text'): string => {
  if (format === 'json') {
    return JSON.stringify(data, null, 2)
  }
  
  if (typeof data === 'string') {
    return data
  }
  
  if (typeof data === 'object') {
    return JSON.stringify(data, null, 2)
  }
  
  return String(data)
}

// Pre-configured variants for common use cases
export const CopyText = (props: Omit<CopyToClipboardProps, 'iconOnly'>) => (
  <CopyToClipboard {...props} iconOnly={false} />
)

export const CopyIcon = (props: Omit<CopyToClipboardProps, 'iconOnly' | 'label'>) => (
  <CopyToClipboard {...props} iconOnly={true} size="icon" />
)

export const CopyJSON = ({ data, ...props }: Omit<CopyToClipboardProps, 'text' | 'formatJSON'> & { data: any }) => (
  <CopyToClipboard 
    {...props} 
    text={typeof data === 'string' ? data : JSON.stringify(data)}
    formatJSON={true}
    label={props.label || 'Copy JSON'}
    tooltipText={props.tooltipText || 'Copy JSON to clipboard'}
  />
)

export const CopyCode = ({ code, language, ...props }: Omit<CopyToClipboardProps, 'text'> & { 
  code: string
  language?: string 
}) => (
  <CopyToClipboard 
    {...props} 
    text={code}
    label={props.label || `Copy ${language || 'Code'}`}
    tooltipText={props.tooltipText || `Copy ${language || 'code'} to clipboard`}
    variant={props.variant || 'ghost'}
  />
)

export default CopyToClipboard