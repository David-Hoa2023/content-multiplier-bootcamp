'use client'

import { AlertCircle } from 'lucide-react'

interface ErrorMessageProps {
  message: string
  onRetry?: () => void
  className?: string
}

export default function ErrorMessage({ message, onRetry, className = '' }: ErrorMessageProps) {
  return (
    <div className={`border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg ${className}`}>
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-700 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <p className="text-red-700 text-sm font-medium">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-sm font-semibold rounded transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

