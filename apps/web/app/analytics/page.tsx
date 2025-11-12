'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'

interface AnalyticsData {
    pack_id: string
    platform: string
    external_id: string
    external_url: string
    metrics: Record<string, any>
    published_at: string
    status: string
    error_message?: string
}

interface PlatformSummary {
    platform: string
    total_posts: number
    successful_posts: number
    failed_posts: number
    success_rate: number
    total_engagement: number
}

const PLATFORM_ICONS: Record<string, string> = {
    twitter: '𝕏',
    linkedin: '💼',
    facebook: '📘',
    instagram: '📷',
    sendgrid: '📧',
    mailchimp: '📬',
    wordpress: '📝',
    medium: '📖'
}

export default function AnalyticsPage() {
    const [analytics, setAnalytics] = useState<AnalyticsData[]>([])
    const [platformSummary, setPlatformSummary] = useState<PlatformSummary[]>([])
    const [loading, setLoading] = useState(false)
    const [selectedPlatform, setSelectedPlatform] = useState<string>('all')
    const [dateRange, setDateRange] = useState({
        from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    })

    async function loadAnalytics() {
        setLoading(true)
        try {
            // Load analytics for all content packs
            const packsRes = await fetch('/api/packs')
            const packsData = await packsRes.json()
            
            const allAnalytics: AnalyticsData[] = []
            
            for (const pack of packsData.packs || []) {
                try {
                    const analyticsRes = await fetch(`/api/publishing/analytics/${pack.pack_id}`)
                    const analyticsData = await analyticsRes.json()
                    
                    if (analyticsData.ok && analyticsData.analytics) {
                        allAnalytics.push(...analyticsData.analytics.map((item: any) => ({
                            ...item,
                            pack_id: pack.pack_id
                        })))
                    }
                } catch (error) {
                    console.error(`Failed to load analytics for pack ${pack.pack_id}:`, error)
                }
            }
            
            setAnalytics(allAnalytics)
            calculatePlatformSummary(allAnalytics)
        } catch (error) {
            console.error('Failed to load analytics:', error)
        } finally {
            setLoading(false)
        }
    }

    function calculatePlatformSummary(data: AnalyticsData[]) {
        const platformStats: Record<string, PlatformSummary> = {}
        
        data.forEach(item => {
            if (!platformStats[item.platform]) {
                platformStats[item.platform] = {
                    platform: item.platform,
                    total_posts: 0,
                    successful_posts: 0,
                    failed_posts: 0,
                    success_rate: 0,
                    total_engagement: 0
                }
            }
            
            const stats = platformStats[item.platform]
            stats.total_posts++
            
            if (item.status === 'published') {
                stats.successful_posts++
                
                // Calculate engagement based on platform
                let engagement = 0
                if (item.metrics) {
                    switch (item.platform) {
                        case 'twitter':
                            engagement = (item.metrics.like_count || 0) + 
                                       (item.metrics.retweet_count || 0) + 
                                       (item.metrics.reply_count || 0)
                            break
                        case 'linkedin':
                            engagement = (item.metrics.views || 0) + 
                                       (item.metrics.likes || 0) + 
                                       (item.metrics.comments || 0) + 
                                       (item.metrics.shares || 0)
                            break
                        case 'facebook':
                            engagement = (item.metrics.reach || 0) + 
                                       (item.metrics.likes || 0) + 
                                       (item.metrics.comments || 0) + 
                                       (item.metrics.shares || 0)
                            break
                        case 'instagram':
                            engagement = (item.metrics.views || 0) + 
                                       (item.metrics.likes || 0) + 
                                       (item.metrics.comments || 0) + 
                                       (item.metrics.saves || 0)
                            break
                        case 'sendgrid':
                        case 'mailchimp':
                            engagement = (item.metrics.opens || 0) + 
                                       (item.metrics.clicks || 0)
                            break
                        default:
                            engagement = item.metrics.views || item.metrics.visits || 0
                    }
                }
                stats.total_engagement += engagement
            } else {
                stats.failed_posts++
            }
            
            stats.success_rate = (stats.successful_posts / stats.total_posts) * 100
        })
        
        setPlatformSummary(Object.values(platformStats))
    }

    const filteredAnalytics = analytics.filter(item => {
        const publishedDate = new Date(item.published_at)
        const fromDate = new Date(dateRange.from)
        const toDate = new Date(dateRange.to)
        
        const withinDateRange = publishedDate >= fromDate && publishedDate <= toDate
        const matchesPlatform = selectedPlatform === 'all' || item.platform === selectedPlatform
        
        return withinDateRange && matchesPlatform
    })

    const totalPosts = filteredAnalytics.length
    const successfulPosts = filteredAnalytics.filter(item => item.status === 'published').length
    const failedPosts = totalPosts - successfulPosts
    const overallSuccessRate = totalPosts > 0 ? (successfulPosts / totalPosts) * 100 : 0

    useEffect(() => {
        loadAnalytics()
    }, [])

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <PageHeader
                title="Publishing Analytics"
                subtitle="Track performance and engagement across all your publishing platforms"
                backLink={{ href: '/', label: 'Dashboard' }}
                badge={totalPosts > 0 ? { text: `${totalPosts} published posts`, color: '#10b981' } : undefined}
                actions={
                    <Button onClick={loadAnalytics} disabled={loading} variant="neutral">
                        {loading ? '🔄 Loading...' : '🔄 Refresh Data'}
                    </Button>
                }
            />

            {/* Filters */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Filters</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    alignItems: 'end'
                }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Platform
                        </label>
                        <select
                            value={selectedPlatform}
                            onChange={(e) => setSelectedPlatform(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px'
                            }}
                        >
                            <option value="all">All Platforms</option>
                            {Object.keys(PLATFORM_ICONS).map(platform => (
                                <option key={platform} value={platform}>
                                    {PLATFORM_ICONS[platform]} {platform}
                                </option>
                            ))}
                        </select>
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            From Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.from}
                            onChange={(e) => setDateRange({ ...dateRange, from: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            To Date
                        </label>
                        <input
                            type="date"
                            value={dateRange.to}
                            onChange={(e) => setDateRange({ ...dateRange, to: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px'
                            }}
                        />
                    </div>
                    
                    <Button
                        onClick={loadAnalytics}
                        disabled={loading}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        {loading ? 'Loading...' : 'Refresh'}
                    </Button>
                </div>
            </div>

            {/* Overall Statistics */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        Total Posts
                    </h3>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#1f2937' }}>
                        {totalPosts}
                    </p>
                </div>
                
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        Successful
                    </h3>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#059669' }}>
                        {successfulPosts}
                    </p>
                </div>
                
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        Failed
                    </h3>
                    <p style={{ margin: 0, fontSize: '2rem', fontWeight: 'bold', color: '#dc2626' }}>
                        {failedPosts}
                    </p>
                </div>
                
                <div style={{
                    background: 'white',
                    border: '1px solid #e5e7eb',
                    borderRadius: '8px',
                    padding: '1.5rem',
                    textAlign: 'center'
                }}>
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#6b7280', fontSize: '0.9rem' }}>
                        Success Rate
                    </h3>
                    <p style={{
                        margin: 0,
                        fontSize: '2rem',
                        fontWeight: 'bold',
                        color: overallSuccessRate >= 90 ? '#059669' :
                               overallSuccessRate >= 70 ? '#d97706' : '#dc2626'
                    }}>
                        {overallSuccessRate.toFixed(1)}%
                    </p>
                </div>
            </div>

            {/* Platform Summary */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Platform Performance</h2>
                {platformSummary.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                        No data available for the selected filters.
                    </p>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{
                            width: '100%',
                            borderCollapse: 'collapse',
                            fontSize: '0.9rem'
                        }}>
                            <thead>
                                <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                                    <th style={{ textAlign: 'left', padding: '0.75rem', color: '#374151' }}>Platform</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', color: '#374151' }}>Total Posts</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', color: '#374151' }}>Successful</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', color: '#374151' }}>Failed</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', color: '#374151' }}>Success Rate</th>
                                    <th style={{ textAlign: 'center', padding: '0.75rem', color: '#374151' }}>Total Engagement</th>
                                </tr>
                            </thead>
                            <tbody>
                                {platformSummary.map(platform => (
                                    <tr key={platform.platform} style={{ borderBottom: '1px solid #f3f4f6' }}>
                                        <td style={{ padding: '0.75rem' }}>
                                            {PLATFORM_ICONS[platform.platform]} {platform.platform}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                                            {platform.total_posts}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '0.75rem', color: '#059669' }}>
                                            {platform.successful_posts}
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '0.75rem', color: '#dc2626' }}>
                                            {platform.failed_posts}
                                        </td>
                                        <td style={{
                                            textAlign: 'center',
                                            padding: '0.75rem',
                                            color: platform.success_rate >= 90 ? '#059669' :
                                                   platform.success_rate >= 70 ? '#d97706' : '#dc2626'
                                        }}>
                                            {platform.success_rate.toFixed(1)}%
                                        </td>
                                        <td style={{ textAlign: 'center', padding: '0.75rem' }}>
                                            {platform.total_engagement.toLocaleString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Recent Posts */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem'
            }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Recent Posts</h2>
                {filteredAnalytics.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                        No posts found for the selected filters.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {filteredAnalytics
                            .sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime())
                            .slice(0, 10)
                            .map((item, index) => (
                            <div key={index} style={{
                                border: '1px solid #e5e7eb',
                                borderRadius: '8px',
                                padding: '1rem',
                                background: item.status === 'published' ? '#f0fdf4' : '#fef2f2'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        <span style={{ fontSize: '1.2rem' }}>
                                            {PLATFORM_ICONS[item.platform]}
                                        </span>
                                        <span style={{ fontWeight: 'bold' }}>
                                            {item.platform}
                                        </span>
                                        <span style={{
                                            padding: '0.25rem 0.5rem',
                                            borderRadius: '4px',
                                            fontSize: '0.8rem',
                                            fontWeight: 'bold',
                                            background: item.status === 'published' ? '#dcfce7' : '#fef2f2',
                                            color: item.status === 'published' ? '#166534' : '#dc2626'
                                        }}>
                                            {item.status}
                                        </span>
                                    </div>
                                    <span style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                        {new Date(item.published_at).toLocaleDateString()}
                                    </span>
                                </div>
                                
                                {item.external_url && (
                                    <p style={{ margin: '0.5rem 0', fontSize: '0.9rem' }}>
                                        <a
                                            href={item.external_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{ color: '#2563eb', textDecoration: 'none' }}
                                        >
                                            View Post →
                                        </a>
                                    </p>
                                )}
                                
                                {item.metrics && Object.keys(item.metrics).length > 0 && (
                                    <div style={{ fontSize: '0.9rem', color: '#6b7280' }}>
                                        <strong>Metrics:</strong> {JSON.stringify(item.metrics)}
                                    </div>
                                )}
                                
                                {item.error_message && (
                                    <div style={{ fontSize: '0.9rem', color: '#dc2626', marginTop: '0.5rem' }}>
                                        <strong>Error:</strong> {item.error_message}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}