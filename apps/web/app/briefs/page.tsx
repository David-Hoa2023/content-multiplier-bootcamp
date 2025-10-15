'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../contexts/LanguageContext'
import Button from '../components/Button'

export default function BriefsPage() {
    const [selectedIdea, setSelectedIdea] = useState<any>(null)
    const [ideas, setIdeas] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const { language } = useLanguage()

    async function loadIdeas() {
        const r = await fetch('/api/ideas')
        const all = await r.json()
        setIdeas(all.filter((i: any) => i.status === 'selected'))
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
        <main>
            <h1>Briefs</h1>
            <Link href="/ideas" style={{
                padding: '0.5rem 1rem',
                background: '#2d3748',
                color: 'white',
                textDecoration: 'none',
                borderRadius: '8px',
                border: '1px solid rgba(0,0,0,0.2)',
                boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
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
                }}>
                ← Back to Ideas
            </Link>

            <h2 style={{ marginTop: '2rem' }}>Selected Ideas</h2>
            {ideas.length === 0 && <p>No selected ideas. Go select an idea first.</p>}

            <ul>
                {ideas.map(idea => (
                    <li key={idea.idea_id} style={{ marginBottom: '1rem' }}>
                        <b>{idea.one_liner}</b>
                        <Button style={{ marginLeft: '1rem' }} onClick={() => setSelectedIdea(idea)} disabled={loading}>
                            Research This
                        </Button>
                    </li>
                ))}
            </ul>

            {selectedIdea && (
                <div style={{ marginTop: '2rem', padding: '1rem', border: '1px solid #ccc' }}>
                    <h3>Research: {selectedIdea.one_liner}</h3>
                    <p>This will search the knowledge base and create a brief with sources.</p>
                    <Button onClick={() => generateBrief(selectedIdea.idea_id)} disabled={loading} variant={loading ? 'neutral' : 'primary'}>
                        {loading ? 'Generating Brief...' : 'Generate Brief'}
                    </Button>
                </div>
            )}
        </main>
    )
}

