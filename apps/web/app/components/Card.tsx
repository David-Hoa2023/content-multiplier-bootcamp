'use client'
import { CSSProperties, ReactNode } from 'react'

interface CardProps {
    children: ReactNode
    title?: string
    subtitle?: string
    icon?: string
    gradient?: string
    onClick?: () => void
    style?: CSSProperties
    hoverable?: boolean
    padding?: string
    className?: string
}

export default function Card({ 
    children, 
    title, 
    subtitle, 
    icon, 
    gradient,
    onClick,
    style,
    hoverable = false,
    padding = '1.5rem',
    className
}: CardProps) {
    const cardStyle: CSSProperties = {
        background: 'white',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
        border: '1px solid #e2e8f0',
        padding,
        transition: hoverable ? 'all 0.2s ease' : undefined,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        position: 'relative',
        ...style
    }

    return (
        <div
            className={className}
            style={cardStyle}
            onClick={onClick}
            onMouseEnter={(e) => {
                if (hoverable) {
                    e.currentTarget.style.transform = 'translateY(-4px)'
                    e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                }
            }}
            onMouseLeave={(e) => {
                if (hoverable) {
                    e.currentTarget.style.transform = 'translateY(0)'
                    e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                }
            }}
        >
            {gradient && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: '4px',
                    background: gradient
                }} />
            )}
            
            {(title || subtitle || icon) && (
                <div style={{ 
                    marginBottom: children ? '1rem' : 0,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '1rem'
                }}>
                    {icon && (
                        <div style={{
                            fontSize: '2rem',
                            lineHeight: 1
                        }}>
                            {icon}
                        </div>
                    )}
                    <div style={{ flex: 1 }}>
                        {title && (
                            <h3 style={{
                                margin: 0,
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                color: '#1f2937'
                            }}>
                                {title}
                            </h3>
                        )}
                        {subtitle && (
                            <p style={{
                                margin: '0.25rem 0 0 0',
                                color: '#6b7280',
                                fontSize: '0.95rem'
                            }}>
                                {subtitle}
                            </p>
                        )}
                    </div>
                </div>
            )}
            
            {children}
        </div>
    )
}