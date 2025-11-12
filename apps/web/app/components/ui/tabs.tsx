'use client'

import React, { createContext, useContext } from 'react'

interface TabsContextValue {
    value: string
    onValueChange: (value: string) => void
}

const TabsContext = createContext<TabsContextValue | undefined>(undefined)

interface TabsProps {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
    className?: string
}

export const Tabs = ({ defaultValue, value: controlledValue, onValueChange, children, className = '' }: TabsProps) => {
    const [internalValue, setInternalValue] = React.useState<string>(defaultValue || '')
    const value = controlledValue ?? internalValue

    const handleValueChange = (newValue: string) => {
        if (controlledValue === undefined) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
    }

    return (
        <TabsContext.Provider value={{ value, onValueChange: handleValueChange }}>
            <div className={className}>{children}</div>
        </TabsContext.Provider>
    )
}

export const TabsList = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = '', ...props }, ref) => (
    <div
        ref={ref}
        className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-500 ${className}`}
        {...props}
    />
))
TabsList.displayName = 'TabsList'

interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

export const TabsTrigger = React.forwardRef<HTMLButtonElement, TabsTriggerProps>(
    ({ className = '', value, ...props }, ref) => {
        const context = useContext(TabsContext)
        const isActive = context?.value === value

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => context?.onValueChange(value)}
                className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${isActive ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500'
                    } ${className}`}
                {...props}
            />
        )
    }
)
TabsTrigger.displayName = 'TabsTrigger'

interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
    value: string
}

export const TabsContent = React.forwardRef<HTMLDivElement, TabsContentProps>(
    ({ className = '', value, ...props }, ref) => {
        const context = useContext(TabsContext)
        if (context?.value !== value) return null

        return (
            <div
                ref={ref}
                className={`mt-2 ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${className}`}
                {...props}
            />
        )
    }
)
TabsContent.displayName = 'TabsContent'

