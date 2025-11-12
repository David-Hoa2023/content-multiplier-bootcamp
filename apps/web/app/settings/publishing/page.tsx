'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '../../components/Button'

interface PublishingCredential {
    platform: string
    credential_type: string
    is_active: boolean
    expires_at?: string
    created_at: string
}

interface WebhookConfig {
    webhook_id: string
    name: string
    url: string
    events: string[]
    is_active: boolean
    created_at: string
}

const PLATFORMS = [
    { id: 'twitter', name: 'Twitter/X', type: 'oauth' },
    { id: 'linkedin', name: 'LinkedIn', type: 'oauth' },
    { id: 'facebook', name: 'Facebook', type: 'oauth' },
    { id: 'instagram', name: 'Instagram', type: 'oauth' },
    { id: 'sendgrid', name: 'SendGrid', type: 'api_key' },
    { id: 'mailchimp', name: 'Mailchimp', type: 'api_key' },
    { id: 'wordpress', name: 'WordPress', type: 'basic_auth' },
    { id: 'medium', name: 'Medium', type: 'oauth' }
]

const WEBHOOK_EVENTS = [
    'pack.published',
    'pack.draft_created',
    'pack.derivatives_created',
    'publishing.started',
    'publishing.completed',
    'publishing.failed'
]

export default function PublishingSettingsPage() {
    const [credentials, setCredentials] = useState<PublishingCredential[]>([])
    const [webhooks, setWebhooks] = useState<WebhookConfig[]>([])
    const [loading, setLoading] = useState(false)
    const [showWebhookForm, setShowWebhookForm] = useState(false)
    const [newWebhook, setNewWebhook] = useState({
        name: '',
        url: '',
        secret: '',
        events: [] as string[]
    })

    async function loadCredentials() {
        try {
            const res = await fetch('/api/publishing/credentials')
            const data = await res.json()
            if (data.ok) {
                setCredentials(data.credentials || [])
            }
        } catch (error) {
            console.error('Failed to load credentials:', error)
        }
    }

    async function loadWebhooks() {
        try {
            const res = await fetch('/api/publishing/webhooks')
            const data = await res.json()
            if (data.ok) {
                setWebhooks(data.webhooks || [])
            }
        } catch (error) {
            console.error('Failed to load webhooks:', error)
        }
    }

    async function authenticatePlatform(platform: string) {
        try {
            setLoading(true)
            const res = await fetch(`/api/publishing/auth/${platform}`)
            const data = await res.json()
            
            if (data.auth_url) {
                window.open(data.auth_url, '_blank', 'width=600,height=600')
                // Poll for completion
                const checkInterval = setInterval(async () => {
                    await loadCredentials()
                    const updatedCred = credentials.find(c => c.platform === platform && c.is_active)
                    if (updatedCred) {
                        clearInterval(checkInterval)
                        alert(`${platform} connected successfully!`)
                    }
                }, 2000)
                
                // Stop polling after 5 minutes
                setTimeout(() => clearInterval(checkInterval), 300000)
            } else {
                alert('Authentication failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Authentication error:', error)
            alert('Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    async function disconnectPlatform(platform: string) {
        if (!confirm(`Are you sure you want to disconnect ${platform}?`)) {
            return
        }

        try {
            setLoading(true)
            const res = await fetch(`/api/publishing/credentials/${platform}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            
            if (data.ok) {
                alert(`${platform} disconnected successfully!`)
                await loadCredentials()
            } else {
                alert('Disconnect failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Disconnect error:', error)
            alert('Disconnect failed')
        } finally {
            setLoading(false)
        }
    }

    async function createWebhook() {
        if (!newWebhook.name || !newWebhook.url || !newWebhook.secret || newWebhook.events.length === 0) {
            alert('Please fill in all fields and select at least one event')
            return
        }

        try {
            setLoading(true)
            const res = await fetch('/api/publishing/webhooks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newWebhook)
            })
            const data = await res.json()
            
            if (data.ok) {
                alert('Webhook created successfully!')
                setShowWebhookForm(false)
                setNewWebhook({ name: '', url: '', secret: '', events: [] })
                await loadWebhooks()
            } else {
                alert('Webhook creation failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Webhook creation error:', error)
            alert('Webhook creation failed')
        } finally {
            setLoading(false)
        }
    }

    async function deleteWebhook(webhookId: string) {
        if (!confirm('Are you sure you want to delete this webhook?')) {
            return
        }

        try {
            setLoading(true)
            const res = await fetch(`/api/publishing/webhooks/${webhookId}`, {
                method: 'DELETE'
            })
            const data = await res.json()
            
            if (data.ok) {
                alert('Webhook deleted successfully!')
                await loadWebhooks()
            } else {
                alert('Webhook deletion failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Webhook deletion error:', error)
            alert('Webhook deletion failed')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        loadCredentials()
        loadWebhooks()
    }, [])

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '2rem'
            }}>
                <h1 style={{ margin: 0, fontSize: '2rem', color: '#1f2937' }}>
                    Publishing Settings
                </h1>
                <Link
                    href="/settings"
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
                    ← Back to Settings
                </Link>
            </div>

            {/* Platform Connections */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem',
                marginBottom: '2rem'
            }}>
                <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Platform Connections</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '1rem'
                }}>
                    {PLATFORMS.map(platform => {
                        const credential = credentials.find(c => c.platform === platform.id && c.is_active)
                        return (
                            <div key={platform.id} style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '1rem',
                                background: credential ? '#f0fdf4' : '#f9fafb'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#374151' }}>
                                        {platform.name}
                                    </h3>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        background: credential ? '#dcfce7' : '#fef3c7',
                                        color: credential ? '#166534' : '#92400e'
                                    }}>
                                        {credential ? 'Connected' : 'Not Connected'}
                                    </span>
                                </div>
                                
                                <p style={{ 
                                    margin: '0 0 1rem 0', 
                                    fontSize: '0.9rem', 
                                    color: '#6b7280' 
                                }}>
                                    Type: {platform.type}
                                </p>

                                {credential && (
                                    <div style={{ marginBottom: '1rem', fontSize: '0.8rem', color: '#6b7280' }}>
                                        <p style={{ margin: '0.25rem 0' }}>
                                            Connected: {new Date(credential.created_at).toLocaleDateString()}
                                        </p>
                                        {credential.expires_at && (
                                            <p style={{ margin: '0.25rem 0' }}>
                                                Expires: {new Date(credential.expires_at).toLocaleDateString()}
                                            </p>
                                        )}
                                    </div>
                                )}

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {credential ? (
                                        <Button
                                            onClick={() => disconnectPlatform(platform.id)}
                                            disabled={loading}
                                            style={{
                                                background: '#dc2626',
                                                color: 'white',
                                                padding: '0.5rem 1rem'
                                            }}
                                        >
                                            Disconnect
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => authenticatePlatform(platform.id)}
                                            disabled={loading}
                                            style={{ padding: '0.5rem 1rem' }}
                                        >
                                            Connect
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Webhooks */}
            <div style={{
                background: 'white',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                padding: '1.5rem'
            }}>
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '1rem'
                }}>
                    <h2 style={{ margin: 0, color: '#1f2937' }}>Webhooks</h2>
                    <Button
                        onClick={() => setShowWebhookForm(true)}
                        style={{ padding: '0.5rem 1rem' }}
                    >
                        Add Webhook
                    </Button>
                </div>

                {webhooks.length === 0 ? (
                    <p style={{ color: '#6b7280', textAlign: 'center', padding: '2rem' }}>
                        No webhooks configured. Add a webhook to receive publishing notifications.
                    </p>
                ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {webhooks.map(webhook => (
                            <div key={webhook.webhook_id} style={{
                                border: '1px solid #d1d5db',
                                borderRadius: '8px',
                                padding: '1rem'
                            }}>
                                <div style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    alignItems: 'center',
                                    marginBottom: '0.5rem'
                                }}>
                                    <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#374151' }}>
                                        {webhook.name}
                                    </h3>
                                    <span style={{
                                        padding: '0.25rem 0.5rem',
                                        borderRadius: '4px',
                                        fontSize: '0.8rem',
                                        fontWeight: 'bold',
                                        background: webhook.is_active ? '#dcfce7' : '#fef3c7',
                                        color: webhook.is_active ? '#166534' : '#92400e'
                                    }}>
                                        {webhook.is_active ? 'Active' : 'Inactive'}
                                    </span>
                                </div>
                                
                                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                    URL: {webhook.url}
                                </p>
                                
                                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: '#6b7280' }}>
                                    Events: {webhook.events.join(', ')}
                                </p>
                                
                                <p style={{ margin: '0.5rem 0 1rem 0', fontSize: '0.8rem', color: '#6b7280' }}>
                                    Created: {new Date(webhook.created_at).toLocaleDateString()}
                                </p>

                                <Button
                                    onClick={() => deleteWebhook(webhook.webhook_id)}
                                    disabled={loading}
                                    style={{
                                        background: '#dc2626',
                                        color: 'white',
                                        padding: '0.5rem 1rem'
                                    }}
                                >
                                    Delete
                                </Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Webhook Form Modal */}
            {showWebhookForm && (
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
                        maxWidth: '500px',
                        width: '90vw',
                        maxHeight: '90vh',
                        overflow: 'auto'
                    }}>
                        <div style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            marginBottom: '1.5rem'
                        }}>
                            <h3 style={{ margin: 0 }}>Add Webhook</h3>
                            <button
                                onClick={() => setShowWebhookForm(false)}
                                style={{
                                    background: '#dc3545',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '4px',
                                    padding: '0.5rem',
                                    cursor: 'pointer'
                                }}
                            >
                                ✕
                            </button>
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Name
                            </label>
                            <input
                                type="text"
                                value={newWebhook.name}
                                onChange={(e) => setNewWebhook({ ...newWebhook, name: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px'
                                }}
                                placeholder="My webhook"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                URL
                            </label>
                            <input
                                type="url"
                                value={newWebhook.url}
                                onChange={(e) => setNewWebhook({ ...newWebhook, url: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px'
                                }}
                                placeholder="https://example.com/webhook"
                            />
                        </div>

                        <div style={{ marginBottom: '1rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Secret
                            </label>
                            <input
                                type="password"
                                value={newWebhook.secret}
                                onChange={(e) => setNewWebhook({ ...newWebhook, secret: e.target.value })}
                                style={{
                                    width: '100%',
                                    padding: '0.5rem',
                                    border: '1px solid #d1d5db',
                                    borderRadius: '4px'
                                }}
                                placeholder="webhook-secret-key"
                            />
                        </div>

                        <div style={{ marginBottom: '1.5rem' }}>
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                                Events
                            </label>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                {WEBHOOK_EVENTS.map(event => (
                                    <label key={event} style={{ display: 'flex', alignItems: 'center' }}>
                                        <input
                                            type="checkbox"
                                            checked={newWebhook.events.includes(event)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setNewWebhook({
                                                        ...newWebhook,
                                                        events: [...newWebhook.events, event]
                                                    })
                                                } else {
                                                    setNewWebhook({
                                                        ...newWebhook,
                                                        events: newWebhook.events.filter(e => e !== event)
                                                    })
                                                }
                                            }}
                                            style={{ marginRight: '0.5rem' }}
                                        />
                                        {event}
                                    </label>
                                ))}
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'flex-end' }}>
                            <Button
                                onClick={() => setShowWebhookForm(false)}
                                variant="neutral"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={createWebhook}
                                disabled={loading}
                            >
                                Create Webhook
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}