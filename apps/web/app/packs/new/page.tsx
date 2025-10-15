'use client'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '../../contexts/LanguageContext'
import Button from '../../components/Button'

export default function NewPackPage() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const briefId = searchParams.get('brief_id')
    const [loading, setLoading] = useState(false)
    const { language } = useLanguage()

    async function createDraft() {
        setLoading(true)
        const packId = `pack-${Date.now()}`
        await fetch('/api/packs/draft', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                pack_id: packId,
                brief_id: briefId,
                audience: 'Technical decision-makers',
                language: language
            })
        })
        setLoading(false)
        router.push(`/packs/${packId}`)
    }

    return (
        <main>
            <h1>Create Content Pack</h1>
            <Link href="/briefs">← Back to Briefs</Link>

            <div style={{ marginTop: '2rem' }}>
                <p>Brief ID: {briefId}</p>
                <p>This will generate a 1200-1600 word draft with grade ≤10 reading level.</p>

                <Button onClick={createDraft} disabled={loading} variant={loading ? 'neutral' : 'primary'}>
                    {loading ? 'Creating Draft...' : 'Generate Draft'}
                </Button>
            </div>
        </main>
    )
}

