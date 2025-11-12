'use client'
import Link from 'next/link'
import { ReactNode } from 'react'

interface EmptyStateProps {
    icon: string
    title: string
    description: string
    action?: {
        label: string
        href?: string
        onClick?: () => void
    }
    children?: ReactNode
}

export default function EmptyState({ 
    icon, 
    title, 
    description, 
    action,
    children
}: EmptyStateProps) {
    return (
        <div style={{
            textAlign: 'center',
            padding: '4rem 2rem',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
            border: '1px solid #e2e8f0'
        }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>
                {icon}
            </div>
            <h3 style={{ 
                margin: '0 0 1rem 0', 
                color: '#374151',
                fontSize: '1.5rem',
                fontWeight: '600'
            }}>
                {title}
            </h3>
            <p style={{ 
                color: '#6b7280', 
                marginBottom: '2rem',
                fontSize: '1rem',
                lineHeight: '1.5'
            }}>
                {description}
            </p>
            {action && (
                action.href ? (
                    <Link
                        href={action.href}
                        style={{
                            background: '#2d3748',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            border: '1px solid rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease',
                            display: 'inline-block'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#3b475e'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#2d3748'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
                        }}
                    >
                        {action.label}
                    </Link>
                ) : (
                    <button
                        onClick={action.onClick}
                        style={{
                            background: '#2d3748',
                            color: 'white',
                            padding: '0.75rem 1.5rem',
                            borderRadius: '8px',
                            border: '1px solid rgba(0,0,0,0.2)',
                            fontWeight: 'bold',
                            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                            transition: 'all 0.2s ease',
                            cursor: 'pointer',
                            fontSize: '1rem'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#3b475e'
                            e.currentTarget.style.transform = 'translateY(-2px)'
                            e.currentTarget.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#2d3748'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)'
                        }}
                    >
                        {action.label}
                    </button>
                )
            )}
            {children}
        </div>
    )
}