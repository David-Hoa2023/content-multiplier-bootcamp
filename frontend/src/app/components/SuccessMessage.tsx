'use client'

import { CheckCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

interface SuccessMessageProps {
  message: string
  onDismiss?: () => void
  autoDismiss?: boolean
  dismissDelay?: number
  className?: string
}

export default function SuccessMessage({
  message,
  onDismiss,
  autoDismiss = true,
  dismissDelay = 5000,
  className = '',
}: SuccessMessageProps) {
  const [isVisible, setIsVisible] = useState(true)
  const [shouldRender, setShouldRender] = useState(true)

  useEffect(() => {
    if (autoDismiss) {
      const timer = setTimeout(() => {
        setIsVisible(false)
        // Wait for fade-out animation before removing from DOM
        setTimeout(() => {
          setShouldRender(false)
          onDismiss?.()
        }, 300)
      }, dismissDelay)

      return () => clearTimeout(timer)
    }
    return undefined
  }, [autoDismiss, dismissDelay, onDismiss])

  if (!shouldRender) {
    return null
  }

  return (
    <div
      className={`border-l-4 border-green-500 bg-green-50 p-4 rounded-r-lg transition-opacity duration-300 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      } ${className}`}
    >
      <div className="flex items-start gap-3">
        <CheckCircle className="w-5 h-5 text-green-700 flex-shrink-0 mt-0.5" />
        <p className="text-green-700 text-sm font-medium flex-1">{message}</p>
      </div>
    </div>
  )
}

