'use client'
import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import RichTextEditor from '../../components/RichTextEditor'
import { useLanguage } from '../../contexts/LanguageContext'
import Button from '../../components/Button'
import PublishingPanel from '../../components/PublishingPanel'

const EditorModal = ({ title, content, onSave, onClose }: {
    title: string
    content: string
    onSave: (content: string) => void
    onClose: () => void
}) => (
    <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000
    }}>
        <div style={{
            background: 'white',
            borderRadius: '8px',
            padding: '2rem',
            maxWidth: '90vw',
            maxHeight: '90vh',
            width: '800px',
            overflow: 'auto'
        }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3>{title}</h3>
                <button onClick={onClose} style={{
                    background: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.5rem 1rem',
                    cursor: 'pointer'
                }}>
                    ✕ Close
                </button>
            </div>
            <RichTextEditor
                value={content}
                onChange={onSave}
                placeholder={`Edit ${title.toLowerCase()}...`}
            />
            <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                <button onClick={onClose} style={{
                    background: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    padding: '0.75rem 1.5rem',
                    cursor: 'pointer',
                    marginRight: '0.5rem'
                }}>
                    ✓ Done
                </button>
            </div>
        </div>
    </div>
)

export default function PackDetailPage() {
    const params = useParams()
    const [pack, setPack] = useState<any>(null)
    const [loading, setLoading] = useState(false)
    const [isEditing, setIsEditing] = useState(false)
    const [showPreview, setShowPreview] = useState(false)
    const { language } = useLanguage()
    const [editedDraft, setEditedDraft] = useState('')
    const [editedNewsletter, setEditedNewsletter] = useState('')
    const [editedLinkedIn, setEditedLinkedIn] = useState<string[]>([])
    const [editedX, setEditedX] = useState<string[]>([])
    const [editedSEO, setEditedSEO] = useState({ title: '', description: '', keywords: [] as string[] })
    const [activeEditor, setActiveEditor] = useState<string | null>(null)

    async function loadPack() {
        const r = await fetch(`/api/packs/${params.id}`)
        const data = await r.json()
        setPack(data)
        console.log('Loaded draft_markdown:', data.draft_markdown?.substring(0, 200) + '...')
        setEditedDraft(data.draft_markdown || '')
        setEditedNewsletter(typeof data.derivatives?.newsletter === 'string'
            ? data.derivatives.newsletter
            : JSON.stringify(data.derivatives?.newsletter || ''))
        const linkedin = Array.isArray(data.derivatives?.linkedin)
            ? data.derivatives.linkedin.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p))
            : []
        const x = Array.isArray(data.derivatives?.x)
            ? data.derivatives.x.map((p: any) => typeof p === 'string' ? p : JSON.stringify(p))
            : []

        // Initialize with 3 empty posts if none exist
        const linkedInPosts = linkedin.length >= 3 ? linkedin : [...linkedin, ...Array(3 - linkedin.length).fill('')]
        const xPosts = x.length >= 3 ? x : [...x, ...Array(3 - x.length).fill('')]

        setEditedLinkedIn(linkedInPosts)
        setEditedX(xPosts)
        setEditedSEO(data.seo || { title: '', description: '', keywords: [] })
    }

    async function saveEdits() {
        setLoading(true)
        const updates: any = {}

        if (editedDraft !== pack.draft_markdown) {
            console.log('Saving draft_markdown:', editedDraft.substring(0, 200) + '...')
            updates.draft_markdown = editedDraft
        }

        if (pack.derivatives) {
            updates.derivatives = {
                ...pack.derivatives,
                newsletter: editedNewsletter,
                linkedin: editedLinkedIn,
                x: editedX
            }
        }

        if (pack.seo) {
            updates.seo = editedSEO
        }

        await fetch(`/api/packs/${params.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates)
        })

        setIsEditing(false)
        setActiveEditor(null)
        setLoading(false)
        loadPack()
    }

    async function generateDerivatives() {
        setLoading(true)
        try {
            const res = await fetch('/api/packs/derivatives', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pack_id: params.id, language: language })
            })
            if (!res.ok) {
                const data = await res.json().catch(() => ({}))
                const errorMsg = data.error || 'Failed to generate derivatives'
                alert(errorMsg)

                // If it's an API key issue, suggest going to settings
                if (errorMsg.includes('API key') || errorMsg.includes('Settings page')) {
                    if (confirm('Would you like to go to Settings to configure your API key?')) {
                        window.location.href = '/settings'
                    }
                }
                return
            }
            await loadPack()
        } catch (err: any) {
            console.error('Generate derivatives error:', err)
            alert('Failed to generate derivatives')
        } finally {
            setLoading(false)
        }
    }

    async function publishPack() {
        setLoading(true)
        try {
            console.log('Attempting to publish pack:', params.id)
            const res = await fetch('/api/packs/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ pack_id: params.id })
            })
            const data = await res.json()
            console.log('Publish response:', res.status, data)

            if (!res.ok) {
                throw new Error(data.error || 'Publish failed')
            }
            alert('Published successfully!')
            loadPack()
        } catch (err: any) {
            console.error('Publish error:', err)
            alert('Publish failed: ' + err.message)
        }
        setLoading(false)
    }

    useEffect(() => { loadPack() }, [])

    if (!pack) return <p>Loading...</p>

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
                    <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>Content Pack</h1>
                    <p style={{ margin: '0.5rem 0 0 0', color: '#6b7280' }}>
                        Pack ID: {pack.pack_id}
                    </p>
                </div>
                <Link
                    href="/packs"
                    style={{
                        background: '#f3f4f6',
                        color: '#374151',
                        padding: '0.5rem 1rem',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        fontWeight: 'bold',
                        border: '1px solid #d1d5db'
                    }}
                >
                    ← Back to Packs
                </Link>
            </div>

            <p>Status: <b>{pack.status}</b></p>

            <h2>Draft</h2>
            {isEditing ? (
                <RichTextEditor
                    value={editedDraft}
                    onChange={setEditedDraft}
                    placeholder="Write your article content here..."
                    packId={pack.pack_id}
                />
            ) : (
                <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '1rem' }}>
                    {pack.draft_markdown?.slice(0, 500)}...
                </pre>
            )}

            <Button style={{ marginTop: '1rem' }} onClick={() => isEditing ? saveEdits() : setIsEditing(true)} disabled={loading}>
                {isEditing ? 'Save Changes' : 'Edit Draft'}
            </Button>
            {isEditing && (
                <Button style={{ marginLeft: '0.5rem' }} onClick={() => { setIsEditing(false); setEditedDraft(pack.draft_markdown) }} variant='neutral'>
                    Cancel
                </Button>
            )}

            {!pack.derivatives && (
                <Button type="button" style={{ marginTop: '1rem' }} onClick={generateDerivatives} disabled={loading}>
                    {loading ? 'Generating...' : 'Generate Derivatives'}
                </Button>
            )}

            {pack.derivatives && (
                <>
                    <h2>Derivatives</h2>
                    <Button
                        style={{ marginBottom: '1rem', padding: '0.25rem 0.5rem', cursor: 'pointer' }}
                        onClick={() => {
                            if (confirm('Regenerate derivatives? This will overwrite existing ones.')) {
                                generateDerivatives()
                            }
                        }}
                        disabled={loading}
                    >
                        Regenerate Derivatives
                    </Button>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3>Newsletter</h3>
                        {isEditing && (
                            <Button
                                onClick={() => setActiveEditor('newsletter')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#0056b3'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#007bff'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                            >
                                ✏️ Edit Newsletter
                            </Button>
                        )}
                    </div>
                    <p>{typeof pack.derivatives.newsletter === 'string'
                        ? pack.derivatives.newsletter.slice(0, 200)
                        : JSON.stringify(pack.derivatives.newsletter).slice(0, 200)}...</p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3>LinkedIn Posts ({pack.derivatives?.linkedin?.length || 0})</h3>
                        {isEditing && (
                            <Button
                                onClick={() => setActiveEditor('linkedin')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#0056b3'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#007bff'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                            >
                                ✏️ Edit LinkedIn Posts
                            </Button>
                        )}
                    </div>
                    {pack.derivatives?.linkedin?.length > 0 ? (
                        <ul>{pack.derivatives.linkedin.map((p: any, i: number) => (
                            <li key={i}>{typeof p === 'string' ? p.slice(0, 100) : JSON.stringify(p).slice(0, 100)}...</li>
                        ))}</ul>
                    ) : (
                        <p>No LinkedIn posts generated. Click "Edit Draft" to add them manually.</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3>X Posts ({pack.derivatives?.x?.length || 0})</h3>
                        {isEditing && (
                            <Button
                                onClick={() => setActiveEditor('x')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#0056b3'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#007bff'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                            >
                                ✏️ Edit X Posts
                            </Button>
                        )}
                    </div>
                    {pack.derivatives?.x?.length > 0 ? (
                        <ul>{pack.derivatives.x.map((p: any, i: number) => (
                            <li key={i}>{typeof p === 'string' ? p : JSON.stringify(p)}</li>
                        ))}</ul>
                    ) : (
                        <p>No X posts generated. Click "Edit Draft" to add them manually.</p>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <h3>SEO</h3>
                        {isEditing && (
                            <Button
                                onClick={() => setActiveEditor('seo')}
                                style={{
                                    padding: '0.5rem 1rem',
                                    background: '#007bff',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: '500',
                                    transition: 'all 0.2s ease',
                                    boxShadow: '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                                onMouseOver={(e) => {
                                    e.currentTarget.style.background = '#0056b3'
                                    e.currentTarget.style.transform = 'translateY(-1px)'
                                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,123,255,0.3)'
                                }}
                                onMouseOut={(e) => {
                                    e.currentTarget.style.background = '#007bff'
                                    e.currentTarget.style.transform = 'translateY(0)'
                                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,123,255,0.2)'
                                }}
                            >
                                ✏️ Edit SEO
                            </Button>
                        )}
                    </div>
                    <p><strong>Title:</strong> {pack.seo?.title}</p>
                    <p><strong>Description:</strong> {pack.seo?.description}</p>

                    {pack.status !== 'published' && (
                        <Button
                            style={{ marginTop: '2rem', padding: '0.5rem 1rem', cursor: 'pointer', background: 'green', color: 'white' }}
                            onClick={publishPack}
                            disabled={loading}
                        >
                            {loading ? 'Publishing...' : 'Publish'}
                        </Button>
                    )}

                    {/* Publishing Panel */}
                    <PublishingPanel packId={pack.pack_id} />
                </>
            )}
            {/* Editor Modals */}
            {activeEditor === 'newsletter' && (
                <EditorModal
                    title="Newsletter"
                    content={editedNewsletter}
                    onSave={(content) => {
                        setEditedNewsletter(content)
                        setActiveEditor(null)
                    }}
                    onClose={() => setActiveEditor(null)}
                />
            )}

            {activeEditor === 'linkedin' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '2rem',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        width: '800px',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Edit LinkedIn Posts</h3>
                            <button onClick={() => setActiveEditor(null)} style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer'
                            }}>
                                ✕ Close
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1rem'
                        }}>
                            {[0, 1, 2].map((i) => (
                                <div key={i}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                        Post {i + 1} ({(editedLinkedIn[i] || '').length}/150 chars)
                                    </label>
                                    <textarea
                                        value={editedLinkedIn[i] || ''}
                                        onChange={(e) => {
                                            const updated = [...editedLinkedIn]
                                            updated[i] = e.target.value
                                            setEditedLinkedIn(updated)
                                        }}
                                        placeholder={`LinkedIn post ${i + 1}...`}
                                        style={{
                                            width: '100%',
                                            minHeight: '100px',
                                            padding: '0.75rem',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button onClick={() => setActiveEditor(null)} style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.75rem 1.5rem',
                                cursor: 'pointer'
                            }}>
                                ✓ Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeEditor === 'x' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '2rem',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        width: '800px',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Edit X Posts</h3>
                            <button onClick={() => setActiveEditor(null)} style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer'
                            }}>
                                ✕ Close
                            </button>
                        </div>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                            gap: '1rem'
                        }}>
                            {[0, 1, 2].map((i) => (
                                <div key={i}>
                                    <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                        Post {i + 1} ({(editedX[i] || '').length}/280 chars)
                                    </label>
                                    <textarea
                                        value={editedX[i] || ''}
                                        onChange={(e) => {
                                            const updated = [...editedX]
                                            updated[i] = e.target.value
                                            setEditedX(updated)
                                        }}
                                        placeholder={`X post ${i + 1}...`}
                                        style={{
                                            width: '100%',
                                            minHeight: '80px',
                                            padding: '0.75rem',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            fontSize: '14px',
                                            resize: 'vertical'
                                        }}
                                    />
                                </div>
                            ))}
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button onClick={() => setActiveEditor(null)} style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.75rem 1.5rem',
                                cursor: 'pointer'
                            }}>
                                ✓ Done
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {activeEditor === 'seo' && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 1000
                }}>
                    <div style={{
                        background: 'white',
                        borderRadius: '8px',
                        padding: '2rem',
                        maxWidth: '90vw',
                        maxHeight: '90vh',
                        width: '600px',
                        overflow: 'auto'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                            <h3>Edit SEO</h3>
                            <button onClick={() => setActiveEditor(null)} style={{
                                background: '#dc3545',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.5rem 1rem',
                                cursor: 'pointer'
                            }}>
                                ✕ Close
                            </button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                Title ({editedSEO.title?.length || 0}/60 chars)
                            </label>
                            <input
                                type="text"
                                value={editedSEO.title || ''}
                                onChange={(e) => setEditedSEO({ ...editedSEO, title: e.target.value })}
                                placeholder="SEO title..."
                                style={{
                                    width: '100%',
                                    padding: '0.75rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px'
                                }}
                            />
                        </div>

                        <div>
                            <label style={{ fontWeight: 'bold', display: 'block', marginBottom: '0.5rem' }}>
                                Description ({editedSEO.description?.length || 0}/160 chars)
                            </label>
                            <textarea
                                value={editedSEO.description || ''}
                                onChange={(e) => setEditedSEO({ ...editedSEO, description: e.target.value })}
                                placeholder="SEO description..."
                                style={{
                                    width: '100%',
                                    minHeight: '80px',
                                    padding: '0.75rem',
                                    border: '1px solid #ccc',
                                    borderRadius: '4px',
                                    fontSize: '14px',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
                            <button onClick={() => setActiveEditor(null)} style={{
                                background: '#007bff',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                padding: '0.75rem 1.5rem',
                                cursor: 'pointer'
                            }}>
                                ✓ Done
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

