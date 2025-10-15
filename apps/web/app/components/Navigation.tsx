'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { useLanguage } from '../contexts/LanguageContext'

export default function Navigation() {
    const pathname = usePathname()
    const { language, setLanguage } = useLanguage()

    const navItems = [
        { href: '/', label: '🏠 Home', description: 'Dashboard' },
        { href: '/ideas', label: '💡 Ideas', description: 'Generate & select ideas' },
        { href: '/briefs', label: '📋 Briefs', description: 'Research & create briefs' },
        { href: '/packs', label: '📦 Content Packs', description: 'Draft & manage content' },
        { href: '/settings', label: '⚙️ Settings', description: 'Configure LLM & API keys' }
    ]

    const isActive = (href: string) => {
        if (href === '/') return pathname === '/'
        return pathname.startsWith(href)
    }

    return (
        <nav style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            background: '#2d3748',
            color: 'white',
            padding: '1rem 2rem',
            boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
            zIndex: 1000,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '1rem'
        }}>
            {/* Logo/Brand */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <h1 style={{
                    margin: 0,
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                    Content Multiplier
                </h1>
                <span style={{
                    fontSize: '0.8rem',
                    opacity: 0.95,
                    background: 'rgba(255,255,255,0.25)',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '12px',
                    fontWeight: '500'
                }}>
                    AI-Powered
                </span>
            </div>

            {/* Navigation Links */}
            <div style={{
                display: 'flex',
                gap: '0.5rem',
                flexWrap: 'wrap',
                alignItems: 'center'
            }}>
                {navItems.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            padding: '0.5rem 1rem',
                            borderRadius: '8px',
                            textDecoration: 'none',
                            color: 'white',
                            background: isActive(item.href)
                                ? 'rgba(255,255,255,0.25)'
                                : 'rgba(255,255,255,0.1)',
                            border: isActive(item.href)
                                ? '2px solid rgba(255,255,255,0.4)'
                                : '2px solid transparent',
                            transition: 'all 0.2s ease',
                            minWidth: '120px',
                            textAlign: 'center',
                            fontWeight: isActive(item.href) ? '600' : '400'
                        }}
                        onMouseEnter={(e) => {
                            if (!isActive(item.href)) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                                e.currentTarget.style.transform = 'translateY(-1px)'
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!isActive(item.href)) {
                                e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
                                e.currentTarget.style.transform = 'translateY(0)'
                            }
                        }}
                    >
                        <span style={{
                            fontSize: '1.1rem',
                            fontWeight: isActive(item.href) ? 'bold' : 'normal',
                            marginBottom: '0.2rem'
                        }}>
                            {item.label}
                        </span>
                        <span style={{
                            fontSize: '0.75rem',
                            opacity: 0.8,
                            lineHeight: 1.2
                        }}>
                            {item.description}
                        </span>
                    </Link>
                ))}
            </div>

            {/* Language Toggle & Publish Filter */}
            <div style={{
                display: 'flex',
                gap: '1rem',
                alignItems: 'center',
                flexWrap: 'wrap'
            }}>
                {/* Language Toggle */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(255,255,255,0.15)',
                    borderRadius: '20px',
                    padding: '0.25rem',
                    border: '1px solid rgba(255,255,255,0.3)'
                }}>
                    <button
                        onClick={() => setLanguage('en')}
                        style={{
                            background: language === 'en' ? 'rgba(255,255,255,0.4)' : 'transparent',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        🇺🇸 ENG
                    </button>
                    <button
                        onClick={() => setLanguage('vn')}
                        style={{
                            background: language === 'vn' ? 'rgba(255,255,255,0.4)' : 'transparent',
                            color: 'white',
                            border: 'none',
                            padding: '0.5rem 1rem',
                            borderRadius: '16px',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            fontWeight: 'bold',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        🇻🇳 VN
                    </button>
                </div>

                {/* Publish Section */}
                <Link
                    href="/packs?filter=published"
                    style={{
                        background: 'rgba(255,255,255,0.15)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.3)',
                        padding: '0.5rem 1rem',
                        borderRadius: '20px',
                        textDecoration: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.25rem'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.25)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.5)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'rgba(255,255,255,0.15)'
                        e.currentTarget.style.borderColor = 'rgba(255,255,255,0.3)'
                    }}
                >
                    🚀 Publish
                </Link>
            </div>
        </nav>
    )
}




