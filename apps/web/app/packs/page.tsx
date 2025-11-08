'use client'
import { useEffect, useState, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import Button from '../components/Button'

interface ContentPack {
    pack_id: string
    status: string
    draft_markdown?: string
    derivatives?: any
    seo?: any
    created_at: string
    brief_id?: string
}

function PacksContent() {
    const [packs, setPacks] = useState<ContentPack[]>([])
    const [loading, setLoading] = useState(true)
    const searchParams = useSearchParams()
    const publishFilter = searchParams.get('filter') || 'all'

    async function loadPacks() {
        try {
            const res = await fetch('/api/packs')
            const data = await res.json()
            // Ensure we always have an array, even if the API returns an error or unexpected data
            if (Array.isArray(data)) {
                setPacks(data)
            } else {
                console.error('Unexpected data format from API:', data)
                setPacks([])
            }
        } catch (err) {
            console.error('Failed to load packs:', err)
            setPacks([])
        }
        setLoading(false)
    }

    useEffect(() => {
        loadPacks()
    }, [])

    // Filter packs based on publish filter
    const filteredPacks = packs.filter(pack => {
        if (publishFilter === 'all') return true
        if (publishFilter === 'published') return pack.status === 'published'
        if (publishFilter === 'pending') return pack.status !== 'published'
        return true
    })

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return '#f59e0b'
            case 'ready_for_review': return '#3b82f6'
            case 'published': return '#10b981'
            default: return '#6b7280'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'draft': return '📝'
            case 'ready_for_review': return '👀'
            case 'published': return '✅'
            default: return '❓'
        }
    }

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '2rem' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⏳</div>
                <p>Loading content packs...</p>
            </div>
        )
    }

    return (
        <div>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem',
                flexWrap: 'wrap',
                gap: '1rem'
            }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Content Packs</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
                        Manage your content drafts and published packs
                        {publishFilter !== 'all' && (
                            <span style={{
                                background: '#667eea',
                                color: 'white',
                                padding: '0.25rem 0.75rem',
                                borderRadius: '12px',
                                fontSize: '0.8rem',
                                marginLeft: '0.5rem',
                                fontWeight: 'bold'
                            }}>
                                {publishFilter === 'published' ? '✅ Published' : '⏳ Pending'}
                            </span>
                        )}
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                    <Link
                        href="/briefs"
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
                        ← Back
                    </Link>
                    <Link
                        href="/packs/new"
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
                        ➕ Create New Pack
                    </Link>
                </div>
            </div>

            {filteredPacks.length === 0 ? (
                <div style={{
                    textAlign: 'center',
                    padding: '4rem 2rem',
                    background: 'white',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0'
                }}>
                    <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>📦</div>
                    <h3 style={{ margin: '0 0 1rem 0', color: '#374151' }}>No Content Packs Yet</h3>
                    <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
                        Start by creating your first content pack from an approved brief.
                    </p>
                    <Link
                        href="/briefs"
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
                        Go to Briefs →
                    </Link>
                </div>
            ) : (
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                    gap: '1.5rem'
                }}>
                    {filteredPacks.map((pack) => (
                        <div
                            key={pack.pack_id}
                            style={{
                                background: 'white',
                                borderRadius: '12px',
                                boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                                border: '1px solid #e2e8f0',
                                overflow: 'hidden',
                                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-4px)'
                                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)'
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)'
                            }}
                        >
                            {/* Header */}
                            <div style={{
                                padding: '1.5rem 1.5rem 1rem 1.5rem',
                                borderBottom: '1px solid #f3f4f6'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h3 style={{
                                        margin: 0,
                                        fontSize: '1.1rem',
                                        color: '#1f2937',
                                        fontWeight: 'bold'
                                    }}>
                                        Content Pack
                                    </h3>
                                    <span style={{
                                        background: getStatusColor(pack.status),
                                        color: 'white',
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '0.25rem'
                                    }}>
                                        {getStatusIcon(pack.status)} {pack.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <p style={{
                                    margin: 0,
                                    fontSize: '0.9rem',
                                    color: '#6b7280'
                                }}>
                                    Created {new Date(pack.created_at).toLocaleDateString()}
                                </p>
                            </div>

                            {/* Content Preview */}
                            <div style={{ padding: '1rem 1.5rem' }}>
                                {pack.draft_markdown ? (
                                    <div style={{
                                        background: '#f8fafc',
                                        padding: '1rem',
                                        borderRadius: '8px',
                                        border: '1px solid #e2e8f0',
                                        maxHeight: '120px',
                                        overflow: 'hidden',
                                        position: 'relative'
                                    }}>
                                        <p style={{
                                            margin: 0,
                                            fontSize: '0.9rem',
                                            color: '#374151',
                                            lineHeight: 1.5,
                                            display: '-webkit-box',
                                            WebkitLineClamp: 4,
                                            WebkitBoxOrient: 'vertical',
                                            overflow: 'hidden'
                                        }}>
                                            {pack.draft_markdown.substring(0, 200)}...
                                        </p>
                                    </div>
                                ) : (
                                    <div style={{
                                        textAlign: 'center',
                                        padding: '2rem 1rem',
                                        color: '#9ca3af'
                                    }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📝</div>
                                        <p style={{ margin: 0, fontSize: '0.9rem' }}>No draft content yet</p>
                                    </div>
                                )}
                            </div>

                            {/* Footer */}
                            <div style={{
                                padding: '1rem 1.5rem',
                                background: '#f8fafc',
                                borderTop: '1px solid #f3f4f6',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                                    {pack.derivatives ? 'Has derivatives' : 'No derivatives'}
                                </div>
                                <Link
                                    href={`/packs/${pack.pack_id}`}
                                    style={{
                                        background: '#2d3748',
                                        color: 'white',
                                        padding: '0.5rem 1rem',
                                        borderRadius: '6px',
                                        textDecoration: 'none',
                                        fontSize: '0.9rem',
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
                                    View Details →
                                </Link>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}

export default function PacksPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PacksContent />
        </Suspense>
    )
}




