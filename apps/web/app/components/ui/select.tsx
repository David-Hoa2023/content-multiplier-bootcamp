'use client'

import React, { createContext, useContext } from 'react'

interface SelectContextValue {
    value: string
    onValueChange: (value: string) => void
    open: boolean
    setOpen: (open: boolean) => void
}

const SelectContext = createContext<SelectContextValue | undefined>(undefined)

interface SelectProps {
    defaultValue?: string
    value?: string
    onValueChange?: (value: string) => void
    children: React.ReactNode
}

export const Select = ({ defaultValue, value: controlledValue, onValueChange, children }: SelectProps) => {
    const [internalValue, setInternalValue] = React.useState<string>(defaultValue || '')
    const [open, setOpen] = React.useState(false)
    const value = controlledValue ?? internalValue

    const handleValueChange = (newValue: string) => {
        if (controlledValue === undefined) {
            setInternalValue(newValue)
        }
        onValueChange?.(newValue)
        setOpen(false)
    }

    return (
        <SelectContext.Provider value={{ value, onValueChange: handleValueChange, open, setOpen }}>
            <div className="relative">{children}</div>
        </SelectContext.Provider>
    )
}

export const SelectTrigger = React.forwardRef<
    HTMLButtonElement,
    React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className = '', children, ...props }, ref) => {
    const context = useContext(SelectContext)

    return (
        <button
            ref={ref}
            type="button"
            onClick={() => context?.setOpen(!context.open)}
            className={`flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
            {...props}
        >
            {children}
        </button>
    )
})
SelectTrigger.displayName = 'SelectTrigger'

export const SelectValue = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }
>(({ className = '', placeholder, ...props }, ref) => {
    const context = useContext(SelectContext)

    return (
        <span ref={ref} className={`block truncate ${className}`} {...props}>
            {context?.value || placeholder}
        </span>
    )
})
SelectValue.displayName = 'SelectValue'

export const SelectContent = React.forwardRef<
    HTMLDivElement,
    React.HTMLAttributes<HTMLDivElement>
>(({ className = '', children, ...props }, ref) => {
    const context = useContext(SelectContext)

    if (!context?.open) return null

    return (
        <div
            ref={ref}
            className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border border-gray-300 bg-white p-1 text-gray-950 shadow-lg"
            {...props}
        >
            {children}
        </div>
    )
})
SelectContent.displayName = 'SelectContent'

interface SelectItemProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    value: string
}

export const SelectItem = React.forwardRef<HTMLButtonElement, SelectItemProps>(
    ({ className = '', value, children, ...props }, ref) => {
        const context = useContext(SelectContext)
        const isSelected = context?.value === value

        return (
            <button
                ref={ref}
                type="button"
                onClick={() => context?.onValueChange(value)}
                className={`relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none focus:bg-gray-100 hover:bg-gray-100 ${isSelected ? 'bg-gray-100' : ''
                    } ${className}`}
                {...props}
            >
                {children}
            </button>
        )
    }
)
SelectItem.displayName = 'SelectItem'

