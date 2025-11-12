'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import Button from '../components/Button'
import Card from '../components/Card'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/EmptyState'
import StatusBadge from '../components/StatusBadge'

export default function BriefsPage() {
    const [selectedIdea, setSelectedIdea] = useState<any>(null)
    const [ideas, setIdeas] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const { language } = useLanguage()

    async function loadIdeas() {
        try {
            const r = await fetch('/api/ideas')
            const all = await r.json()
            if (Array.isArray(all)) {
                setIdeas(all.filter((i: any) => i.status === 'selected'))
            } else {
                console.error('API returned non-array:', all)
                setIdeas([])
            }
        } catch (error) {
            console.error('Failed to load ideas:', error)
            setIdeas([])
        }
    }

    async function generateBrief(ideaId: string) {
        setLoading(true)
        const briefId = `brief-${Date.now()}`
        await fetch('/api/briefs/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                brief_id: briefId,
                idea_id: ideaId,
                query: selectedIdea?.one_liner || 'content research',
                language: language
            })
        })
        setLoading(false)
        window.location.href = `/briefs/${briefId}`
    }

    useEffect(() => { loadIdeas() }, [])

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <PageHeader
                title="Research Briefs"
                subtitle="Create comprehensive research briefs from your selected ideas"
                backLink={{ href: '/ideas', label: 'Back to Ideas' }}
                badge={ideas.length > 0 ? { text: `${ideas.length} ideas ready`, color: '#667eea' } : undefined}
            />

            {ideas.length === 0 ? (
                <EmptyState
                    icon="📋"
                    title="No Selected Ideas"
                    description="You need to select some ideas before creating briefs. Go back to the Ideas page and select the ideas you want to develop."
                    action={{
                        label: 'Go to Ideas →',
                        href: '/ideas'
                    }}
                />
            ) : (
                <div>
                    <Card
                        title="Available Ideas for Research"
                        subtitle="Select an idea to create a comprehensive research brief"
                        style={{ marginBottom: '2rem' }}
                    >
                        <div style={{ display: 'grid', gap: '1rem' }}>
                            {ideas.map(idea => (
                                <div
                                    key={idea.idea_id}
                                    style={{
                                        padding: '1rem',
                                        background: selectedIdea?.idea_id === idea.idea_id ? '#f0f9ff' : '#f8fafc',
                                        borderRadius: '8px',
                                        border: selectedIdea?.idea_id === idea.idea_id ? '2px solid #3b82f6' : '1px solid #e2e8f0',
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        transition: 'all 0.2s ease'
                                    }}
                                >
                                    <div style={{ flex: 1 }}>
                                        <h4 style={{ 
                                            margin: '0 0 0.5rem 0', 
                                            color: '#1f2937',
                                            fontSize: '1.1rem'
                                        }}>
                                            {idea.one_liner}
                                        </h4>
                                        {idea.angle && (
                                            <p style={{ 
                                                margin: 0, 
                                                color: '#6b7280',
                                                fontSize: '0.9rem'
                                            }}>
                                                <strong>Angle:</strong> {idea.angle}
                                            </p>
                                        )}
                                    </div>
                                    <Button 
                                        onClick={() => setSelectedIdea(idea)} 
                                        disabled={loading}
                                        variant={selectedIdea?.idea_id === idea.idea_id ? 'success' : 'primary'}
                                    >
                                        {selectedIdea?.idea_id === idea.idea_id ? '✓ Selected' : '📚 Research This'}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </Card>

                    {selectedIdea && (
                        <Card
                            icon="🔬"
                            title={`Research: ${selectedIdea.one_liner}`}
                            gradient="linear-gradient(135deg, #667eea 0%, #764ba2 100%)"
                        >
                            <div style={{ 
                                background: '#f8fafc', 
                                padding: '1rem', 
                                borderRadius: '8px',
                                marginBottom: '1rem'
                            }}>
                                <p style={{ 
                                    margin: '0 0 1rem 0', 
                                    color: '#4a5568',
                                    lineHeight: '1.6'
                                }}>
                                    This will search the knowledge base and create a comprehensive brief with:
                                </p>
                                <ul style={{ 
                                    margin: 0, 
                                    paddingLeft: '1.5rem',
                                    color: '#4a5568'
                                }}>
                                    <li>📊 Market research and statistics</li>
                                    <li>🔍 Relevant sources and citations</li>
                                    <li>📝 Content outline and key points</li>
                                    <li>🎯 Target audience insights</li>
                                    <li>📈 Distribution strategy</li>
                                </ul>
                            </div>
                            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
                                <Button 
                                    onClick={() => generateBrief(selectedIdea.idea_id)} 
                                    disabled={loading} 
                                    variant={loading ? 'neutral' : 'success'}
                                    style={{
                                        padding: '0.75rem 2rem',
                                        fontSize: '1.1rem'
                                    }}
                                >
                                    {loading ? '🔄 Generating Brief...' : '🚀 Generate Research Brief'}
                                </Button>
                                {!loading && (
                                    <Button 
                                        onClick={() => setSelectedIdea(null)} 
                                        variant="neutral"
                                        style={{
                                            padding: '0.75rem 1.5rem'
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                )}
                            </div>
                        </Card>
                    )}
                </div>
            )}
        </div>
    )
}

