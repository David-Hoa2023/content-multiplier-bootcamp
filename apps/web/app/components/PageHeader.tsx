'use client'
import Link from 'next/link'
import { ReactNode } from 'react'

interface PageHeaderProps {
    title: string
    subtitle?: string
    backLink?: { href: string; label: string }
    actions?: ReactNode
    badge?: { text: string; color?: string }
}

export default function PageHeader({ 
    title, 
    subtitle, 
    backLink,
    actions,
    badge
}: PageHeaderProps) {
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '2rem',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                {backLink && (
                    <Link
                        href={backLink.href}
                        style={{
                            background: '#2d3748',
                            color: 'white',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            fontWeight: 'bold',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                            border: '1px solid rgba(0,0,0,0.2)',
                            transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.background = '#3b475e'
                            e.currentTarget.style.transform = 'translateY(-1px)'
                            e.currentTarget.style.boxShadow = '0 4px 10px rgba(0,0,0,0.25)'
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.background = '#2d3748'
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.15)'
                        }}
                    >
                        ← {backLink.label}
                    </Link>
                )}
                <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <h1 style={{ 
                            margin: 0, 
                            fontSize: '2rem', 
                            color: '#1f2937',
                            fontWeight: '700'
                        }}>
                            {title}
                        </h1>
                        {badge && (
                            <span style={{
                                background: badge.color || '#667eea',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                fontWeight: 'bold'
                            }}>
                                {badge.text}
                            </span>
                        )}
                    </div>
                    {subtitle && (
                        <p style={{ 
                            margin: '0.5rem 0 0 0', 
                            color: '#6b7280',
                            fontSize: '1rem'
                        }}>
                            {subtitle}
                        </p>
                    )}
                </div>
            </div>
            {actions && (
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    {actions}
                </div>
            )}
        </div>
    )
}