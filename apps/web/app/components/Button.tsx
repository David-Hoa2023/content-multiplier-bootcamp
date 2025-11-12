'use client'

import React from 'react'

type Variant = 'primary' | 'secondary' | 'success' | 'danger' | 'neutral'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant
}

const variantToColors: Record<Variant, { bg: string, hoverBg: string, border: string }> = {
    primary: { bg: '#2d3748', hoverBg: '#3b475e', border: 'rgba(0,0,0,0.2)' },
    secondary: { bg: '#6b7280', hoverBg: '#4b5563', border: 'rgba(0,0,0,0.2)' },
    success: { bg: '#28a745', hoverBg: '#1f8a39', border: 'rgba(0,0,0,0.2)' },
    danger: { bg: '#dc3545', hoverBg: '#b52a37', border: 'rgba(0,0,0,0.2)' },
    neutral: { bg: '#4b5563', hoverBg: '#374151', border: 'rgba(0,0,0,0.2)' }
}

function Button({ variant = 'primary', disabled, style, children, ...rest }: ButtonProps) {
    const colors = variantToColors[variant]
    const baseStyle: React.CSSProperties = {
        background: disabled ? '#9aa3af' : colors.bg,
        color: 'white',
        border: `1px solid ${colors.border}`,
        padding: '0.5rem 1rem',
        borderRadius: '8px',
        cursor: disabled ? 'not-allowed' : 'pointer',
        boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
        transition: 'all 0.2s ease',
        fontWeight: 600
    }

    return (
        <button
            {...rest}
            disabled={disabled}
            style={{ ...baseStyle, ...style }}
            onMouseEnter={(e) => {
                if (disabled) return
                e.currentTarget.style.background = colors.hoverBg
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)'
            }}
            onMouseLeave={(e) => {
                if (disabled) return
                e.currentTarget.style.background = colors.bg
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)'
            }}
        >
            {children}
        </button>
    )
}

export { Button }
export default Button


















