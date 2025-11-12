'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'

export default function BriefDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [brief, setBrief] = useState<any>(null)
    const [loading, setLoading] = useState(false)

    async function loadBrief() {
        const r = await fetch(`/api/briefs/${params.id}`)
        setBrief(await r.json())
    }

    async function approveBrief() {
        setLoading(true)
        await fetch(`/api/briefs/${params.id}/approve`, { method: 'POST' })
        setLoading(false)
        router.push(`/packs/new?brief_id=${params.id}`)
    }

    useEffect(() => { loadBrief() }, [])

    if (!brief) return <p>Loading...</p>

    return (
        <main>
            <h1>Brief Details</h1>
            <Link href="/briefs">← Back to Briefs</Link>

            <div style={{ marginTop: '2rem' }}>
                <h2>Key Points</h2>
                <ul>{brief.key_points?.map((p: string, i: number) => <li key={i}>{p}</li>)}</ul>

                <h2>Outline</h2>
                <ol>{brief.outline?.map((section: any, i: number) => (
                    <li key={i}>
                        <b>{section.h2 || section}</b>
                        {section.bullets && (
                            <ul>
                                {section.bullets.map((bullet: string, j: number) => (
                                    <li key={j}>{bullet}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}</ol>

                <h2>Claims ({brief.claims_ledger?.length || 0})</h2>
                <ul>
                    {brief.claims_ledger?.map((c: any, i: number) => (
                        <li key={i}>
                            {c.claim}
                            <small style={{ marginLeft: '1rem' }}>
                                [{c.sources?.map((s: any) => s.url).join(', ')}]
                            </small>
                        </li>
                    ))}
                </ul>

                <button
                    style={{ marginTop: '2rem', padding: '0.5rem 1rem', cursor: 'pointer' }}
                    onClick={approveBrief}
                    disabled={loading}
                >
                    {loading ? 'Approving...' : 'Approve & Create Draft →'}
                </button>
            </div>
        </main>
    )
}

