'use client'

import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
    ({ className = '', variant = 'default', ...props }, ref) => {
        const variantClasses = {
            default: 'bg-indigo-600 text-white hover:bg-indigo-700',
            secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300',
            outline: 'border border-gray-300 text-gray-900',
            destructive: 'bg-red-600 text-white hover:bg-red-700'
        }

        return (
            <div
                ref={ref}
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors ${variantClasses[variant]} ${className}`}
                {...props}
            />
        )
    }
)
Badge.displayName = 'Badge'

