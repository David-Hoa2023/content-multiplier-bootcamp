'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '../components/Button';
import Card from '../components/Card';
import PageHeader from '../components/PageHeader';
import EmptyState from '../components/EmptyState';
import StatusBadge from '../components/StatusBadge';
import { useLanguage } from '../contexts/LanguageContext';

export default function IdeasPage() {
    const [ideas, setIdeas] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [promptText, setPromptText] = useState('');
    const [count, setCount] = useState(10);
    const [selectedCount, setSelectedCount] = useState(0);
    const [editingTags, setEditingTags] = useState<{ [key: string]: string }>({});
    const { language } = useLanguage();

    async function load() {
        const r = await fetch('/api/ideas');
        const data = await r.json();
        setIdeas(data);
        setSelectedCount(data.filter((i: any) => i.status === 'selected').length);
    }

    async function gen() {
        setLoading(true);
        const r = await fetch('/api/ideas/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                persona: 'Content Lead',
                industry: 'SaaS',
                language: language,
                corpus_hints: promptText,
                count: count
            })
        });
        await r.json(); setLoading(false); load();
    }

    async function selectIdea(ideaId: string) {
        await fetch(`/api/ideas/${ideaId}/select`, { method: 'POST' });
        load();
    }

    async function deleteIdea(ideaId: string) {
        const ok = confirm('Delete this idea? This cannot be undone.')
        if (!ok) return
        const r = await fetch(`/api/ideas/${ideaId}`, { method: 'DELETE' })
        if (!r.ok) {
            const e = await r.json().catch(() => ({}))
            alert(e.error || 'Failed to delete idea')
            return
        }
        load()
    }

    async function updateTags(ideaId: string, tagsString: string) {
        const tags = tagsString.split(',').map(t => t.trim()).filter(t => t);
        await fetch(`/api/ideas/${ideaId}/tags`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ tags })
        });
        load();
        setEditingTags({ ...editingTags, [ideaId]: '' });
    }

    useEffect(() => { load(); }, []);

    return <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
            <Link href="/" style={{
                marginRight: '1rem',
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
                ← Back
            </Link>
            <h1 style={{ margin: 0 }}>Content Ideas</h1>
        </div>

        {/* Stats */}
        <div style={{
            background: '#f8f9fa',
            padding: '1rem',
            borderRadius: '8px',
            marginBottom: '2rem',
            display: 'flex',
            gap: '2rem'
        }}>
            <div>
                <strong>{ideas.length}</strong> ideas total
            </div>
            <div>
                <strong>{selectedCount}</strong> selected
            </div>
        </div>

        {/* Prompt & Generate */}
        <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 140px 200px',
            gap: '0.75rem',
            alignItems: 'center',
            marginBottom: '1rem'
        }}>
            <input
                type="text"
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                placeholder="Enter keywords or a prompt, e.g. 'B2B SaaS onboarding • AI in healthcare • remote team productivity'"
                style={{
                    width: '100%',
                    padding: '0.9rem 1rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                }}
            />
            <input
                type="number"
                min={3}
                max={20}
                value={count}
                onChange={(e) => setCount(Math.max(3, Math.min(20, Number(e.target.value || 0))))}
                style={{
                    padding: '0.9rem 0.75rem',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontSize: '1rem'
                }}
            />
            <Button onClick={gen} disabled={loading} variant={loading ? 'neutral' : 'success'} style={{ padding: '0.9rem 1rem', fontSize: '1rem' }}>
                {loading ? '🤖 Generating...' : '🚀 Generate ideas'}
            </Button>
        </div>
        <div style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Tip: add 2-4 short topics separated by commas or bullets to steer results
        </div>

        {/* Ideas List */}
        {ideas.length > 0 && (
            <div>
                <h2>Your Ideas</h2>
                <div style={{ display: 'grid', gap: '1rem' }}>
                    {ideas.map(i => (
                        <div key={i.idea_id} style={{
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            padding: '1.5rem',
                            background: i.status === 'selected' ? '#e8f5e8' : 'white'
                        }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                                <h3 style={{ margin: 0, color: '#333' }}>{i.one_liner}</h3>
                                <StatusBadge status={i.status} />
                            </div>

                            {i.angle && (
                                <p style={{ margin: '0.5rem 0', color: '#666' }}>
                                    <strong>Angle:</strong> {i.angle}
                                </p>
                            )}

                            <div style={{ display: 'flex', gap: '1rem', margin: '1rem 0' }}>
                                <div><strong>Novelty:</strong> {i.scores?.novelty}/5</div>
                                <div><strong>Demand:</strong> {i.scores?.demand}/5</div>
                                <div><strong>Fit:</strong> {i.scores?.fit}/5</div>
                            </div>

                            {i.personas && i.personas.length > 0 && (
                                <div style={{ margin: '0.5rem 0' }}>
                                    <strong>Audiences:</strong> {i.personas.join(', ')}
                                </div>
                            )}

                            {/* Tags Display/Edit */}
                            <div style={{ margin: '1rem 0' }}>
                                <strong>Tags:</strong>
                                {i.tags && i.tags.length > 0 ? (
                                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
                                        {i.tags.map((tag: string, idx: number) => (
                                            <span key={idx} style={{
                                                background: '#e3f2fd',
                                                color: '#1976d2',
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '12px',
                                                fontSize: '0.85rem',
                                                border: '1px solid #90caf9'
                                            }}>
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                ) : (
                                    <span style={{ color: '#999', marginLeft: '0.5rem', fontSize: '0.9rem' }}>No tags</span>
                                )}
                                <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                    <input
                                        type="text"
                                        placeholder="Add tags (comma-separated)"
                                        value={editingTags[i.idea_id] || ''}
                                        onChange={(e) => setEditingTags({ ...editingTags, [i.idea_id]: e.target.value })}
                                        style={{
                                            flex: 1,
                                            padding: '0.5rem',
                                            border: '1px solid #ddd',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem'
                                        }}
                                    />
                                    <Button
                                        onClick={() => updateTags(i.idea_id, editingTags[i.idea_id] || '')}
                                        variant="neutral"
                                        style={{ padding: '0.5rem 1rem', fontSize: '0.9rem' }}
                                    >
                                        Update Tags
                                    </Button>
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <Button onClick={() => selectIdea(i.idea_id)} disabled={i.status === 'selected'} variant={i.status === 'selected' ? 'success' : 'primary'}>
                                    {i.status === 'selected' ? '✅ Selected' : '⭐ Select'}
                                </Button>
                                <Button onClick={() => deleteIdea(i.idea_id)} variant='danger'>
                                    🗑️ Delete
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Next Steps */}
        {selectedCount > 0 && (
            <div style={{
                background: '#e3f2fd',
                padding: '1.5rem',
                borderRadius: '8px',
                marginTop: '2rem',
                border: '1px solid #2196f3'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#1976d2' }}>🎯 Next Steps</h3>
                <p style={{ margin: '0.5rem 0' }}>
                    ✅ You have {selectedCount} selected idea{selectedCount > 1 ? 's' : ''} ready to develop!
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                    👉 <Link href="/briefs" style={{ color: '#1976d2', textDecoration: 'none', fontWeight: 'bold' }}>
                        Create a Brief →
                    </Link> to turn your selected ideas into detailed content plans
                </p>
                <p style={{ margin: '0.5rem 0' }}>
                    💡 <Link href="/briefs" style={{ color: '#1976d2', textDecoration: 'none' }}>
                        Briefs
                    </Link> help you develop comprehensive content strategies with outlines, key points, and distribution plans
                </p>
            </div>
        )}

        {ideas.length === 0 && !loading && (
            <div style={{
                textAlign: 'center',
                padding: '3rem',
                color: '#666'
            }}>
                <h2>🚀 Ready to Generate Ideas?</h2>
                <p>Click the button above to create your first 10 content ideas!</p>
            </div>
        )}
    </main>;
}
