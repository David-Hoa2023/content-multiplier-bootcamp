'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function Dashboard() {
    const router = useRouter()

    const featureCards = [
        {
            id: 'ideas',
            title: 'Content Ideas',
            description: 'Generate AI-powered content ideas tailored to your audience',
            icon: '💡',
            gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            href: '/ideas',
            stats: { label: 'Active Ideas', value: '24' }
        },
        {
            id: 'briefs',
            title: 'Research Briefs',
            description: 'Create comprehensive research briefs with citations',
            icon: '📋',
            gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            href: '/briefs',
            stats: { label: 'Briefs Created', value: '12' }
        },
        {
            id: 'packs',
            title: 'Content Packs',
            description: 'Draft and manage your content collections',
            icon: '📦',
            gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            href: '/packs',
            stats: { label: 'Ready to Publish', value: '8' }
        },
        {
            id: 'publishing',
            title: 'Multi-Platform Publishing',
            description: 'Distribute content across all your channels',
            icon: '🚀',
            gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
            href: '/settings/publishing',
            stats: { label: 'Platforms Connected', value: '5' }
        },
        {
            id: 'twitter-bot',
            title: 'Twitter Bot',
            description: 'Automate your Twitter presence with AI',
            icon: '🤖',
            gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
            href: '/settings/twitter-bot',
            stats: { label: 'Posts Today', value: '3' }
        },
        {
            id: 'analytics',
            title: 'Analytics',
            description: 'Track performance and optimize your strategy',
            icon: '📊',
            gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
            href: '/analytics',
            stats: { label: 'Total Reach', value: '45.2K' }
        }
    ]

    const workflowSteps = [
        { step: 1, title: 'Ideate', description: 'Generate ideas with AI' },
        { step: 2, title: 'Research', description: 'Build comprehensive briefs' },
        { step: 3, title: 'Create', description: 'Draft your content' },
        { step: 4, title: 'Optimize', description: 'Create variations' },
        { step: 5, title: 'Publish', description: 'Distribute everywhere' }
    ]

    return (
        <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                borderRadius: '20px',
                padding: '3rem',
                color: 'white',
                marginBottom: '3rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{
                    position: 'absolute',
                    top: -50,
                    right: -50,
                    width: '200px',
                    height: '200px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '50%'
                }}></div>
                <h1 style={{
                    fontSize: '2.5rem',
                    fontWeight: '700',
                    marginBottom: '1rem'
                }}>
                    Content Multiplier Dashboard
                </h1>
                <p style={{
                    fontSize: '1.25rem',
                    opacity: 0.95,
                    marginBottom: '2rem'
                }}>
                    Transform your ideas into multi-platform content with AI
                </p>
                <button
                    onClick={() => router.push('/packs/new')}
                    style={{
                        background: 'white',
                        color: '#667eea',
                        padding: '0.75rem 2rem',
                        borderRadius: '50px',
                        border: 'none',
                        fontSize: '1.1rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        boxShadow: '0 10px 20px rgba(0,0,0,0.2)',
                        transition: 'transform 0.2s'
                    }}
                    onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ✨ Start New Content Pack
                </button>
            </div>

            {/* Feature Cards Grid */}
            <h2 style={{
                fontSize: '1.75rem',
                fontWeight: '600',
                marginBottom: '2rem',
                color: '#2d3748'
            }}>
                Your Content Tools
            </h2>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '1.5rem',
                marginBottom: '3rem'
            }}>
                {featureCards.map((card) => (
                    <Link
                        key={card.id}
                        href={card.href}
                        style={{ textDecoration: 'none' }}
                    >
                        <div style={{
                            background: 'white',
                            borderRadius: '16px',
                            padding: '1.5rem',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.3s',
                            cursor: 'pointer',
                            height: '100%',
                            position: 'relative',
                            overflow: 'hidden'
                        }}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = 'translateY(-5px)'
                                e.currentTarget.style.boxShadow = '0 20px 40px rgba(0,0,0,0.15)'
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)'
                                e.currentTarget.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)'
                            }}>
                            {/* Gradient accent bar */}
                            <div style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                height: '4px',
                                background: card.gradient
                            }}></div>

                            {/* Icon with gradient background */}
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '12px',
                                background: card.gradient,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.75rem',
                                marginBottom: '1rem',
                                boxShadow: '0 8px 16px rgba(0,0,0,0.1)'
                            }}>
                                {card.icon}
                            </div>

                            <h3 style={{
                                fontSize: '1.25rem',
                                fontWeight: '600',
                                marginBottom: '0.5rem',
                                color: '#2d3748'
                            }}>
                                {card.title}
                            </h3>

                            <p style={{
                                color: '#718096',
                                fontSize: '0.95rem',
                                marginBottom: '1rem',
                                lineHeight: '1.5'
                            }}>
                                {card.description}
                            </p>

                            {/* Stats section */}
                            <div style={{
                                borderTop: '1px solid #e2e8f0',
                                paddingTop: '1rem',
                                marginTop: 'auto',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <span style={{
                                    fontSize: '0.85rem',
                                    color: '#a0aec0'
                                }}>
                                    {card.stats.label}
                                </span>
                                <span style={{
                                    fontSize: '1.25rem',
                                    fontWeight: '700',
                                    background: card.gradient,
                                    WebkitBackgroundClip: 'text',
                                    WebkitTextFillColor: 'transparent'
                                }}>
                                    {card.stats.value}
                                </span>
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Workflow Builder Section */}
            <div style={{
                background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
                borderRadius: '20px',
                padding: '3rem',
                boxShadow: '0 20px 40px rgba(0,0,0,0.1)'
            }}>
                <h2 style={{
                    fontSize: '1.75rem',
                    fontWeight: '600',
                    marginBottom: '1rem',
                    color: '#2d3748'
                }}>
                    Content Creation Workflow
                </h2>
                <p style={{
                    color: '#4a5568',
                    marginBottom: '2rem',
                    fontSize: '1.1rem'
                }}>
                    Build workflows that connect your content creation to distribution channels
                </p>

                {/* Workflow Steps */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '2rem',
                    flexWrap: 'wrap',
                    gap: '1rem'
                }}>
                    {workflowSteps.map((step, index) => (
                        <div key={step.step} style={{
                            flex: '1',
                            minWidth: '150px',
                            textAlign: 'center',
                            position: 'relative'
                        }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                background: 'white',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                margin: '0 auto 0.75rem',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: '#667eea'
                            }}>
                                {step.step}
                            </div>
                            <h4 style={{
                                margin: '0 0 0.25rem',
                                color: '#2d3748',
                                fontWeight: '600'
                            }}>
                                {step.title}
                            </h4>
                            <p style={{
                                fontSize: '0.85rem',
                                color: '#718096',
                                margin: 0
                            }}>
                                {step.description}
                            </p>
                            {index < workflowSteps.length - 1 && (
                                <div style={{
                                    position: 'absolute',
                                    top: '30px',
                                    left: '60%',
                                    width: '80%',
                                    height: '2px',
                                    background: 'rgba(102, 126, 234, 0.3)',
                                    zIndex: -1
                                }}></div>
                            )}
                        </div>
                    ))}
                </div>

                {/* Workflow Preview */}
                <div style={{
                    background: 'white',
                    borderRadius: '12px',
                    padding: '2rem',
                    boxShadow: '0 10px 20px rgba(0,0,0,0.05)'
                }}>
                    <h3 style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        marginBottom: '1rem',
                        color: '#2d3748'
                    }}>
                        Recent Workflow Activity
                    </h3>
                    <div style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.75rem'
                    }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: '#f7fafc',
                            borderRadius: '8px'
                        }}>
                            <span style={{ marginRight: '1rem', fontSize: '1.25rem' }}>✅</span>
                            <span style={{ flex: 1, color: '#4a5568' }}>
                                Published "AI Trends 2024" to 5 platforms
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>2 hours ago</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: '#f7fafc',
                            borderRadius: '8px'
                        }}>
                            <span style={{ marginRight: '1rem', fontSize: '1.25rem' }}>🔄</span>
                            <span style={{ flex: 1, color: '#4a5568' }}>
                                Generated 10 content variations for "Marketing Guide"
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>5 hours ago</span>
                        </div>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            padding: '0.75rem',
                            background: '#f7fafc',
                            borderRadius: '8px'
                        }}>
                            <span style={{ marginRight: '1rem', fontSize: '1.25rem' }}>📋</span>
                            <span style={{ flex: 1, color: '#4a5568' }}>
                                Created research brief for "Social Media Strategy"
                            </span>
                            <span style={{ fontSize: '0.85rem', color: '#a0aec0' }}>1 day ago</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}