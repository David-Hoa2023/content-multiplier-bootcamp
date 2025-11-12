'use client'
import { useState, useEffect } from 'react'
import Button from './Button'

interface PublishingCredential {
    platform: string
    credential_type: string
    is_active: boolean
    expires_at?: string
    created_at: string
}

interface PublishingStatus {
    pack_status: {
        publishing_status?: string
        last_published_at?: string
        publishing_errors?: any
    }
    jobs: Array<{
        platform: string
        status: string
        external_url?: string
        published_at?: string
        error_message?: string
    }>
}

interface TwitterTemplate {
    template_id: string
    name: string
    prompt: string
    topics: string[]
    tone: string
    hashtags?: string[]
}

const PLATFORMS = [
    { id: 'twitter', name: 'Twitter/X', icon: '𝕏' },
    { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
    { id: 'facebook', name: 'Facebook', icon: '📘' },
    { id: 'instagram', name: 'Instagram', icon: '📷' },
    { id: 'sendgrid', name: 'SendGrid Email', icon: '📧' },
    { id: 'mailchimp', name: 'Mailchimp', icon: '📬' },
    { id: 'wordpress', name: 'WordPress', icon: '📝' },
    { id: 'medium', name: 'Medium', icon: '📖' }
]

export default function PublishingPanel({ packId }: { packId: string }) {
    const [credentials, setCredentials] = useState<PublishingCredential[]>([])
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([])
    const [publishingStatus, setPublishingStatus] = useState<PublishingStatus | null>(null)
    const [loading, setLoading] = useState(false)
    const [showOAuthModal, setShowOAuthModal] = useState<string | null>(null)
    const [scheduledAt, setScheduledAt] = useState('')
    const [twitterTemplates, setTwitterTemplates] = useState<TwitterTemplate[]>([])
    const [selectedTemplate, setSelectedTemplate] = useState<string>('')
    const [generatedContent, setGeneratedContent] = useState<any>(null)
    const [showTwitterBot, setShowTwitterBot] = useState(false)
    const [generateLoading, setGenerateLoading] = useState(false)

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

    async function loadPublishingStatus() {
        try {
            const res = await fetch(`/api/publishing/status/${packId}`)
            const data = await res.json()
            if (data.ok) {
                setPublishingStatus(data.status)
            }
        } catch (error) {
            console.error('Failed to load publishing status:', error)
        }
    }

    async function authenticatePlatform(platform: string) {
        try {
            setLoading(true)
            const res = await fetch(`/api/publishing/auth/${platform}`)
            const data = await res.json()
            
            if (data.auth_url) {
                window.open(data.auth_url, '_blank', 'width=600,height=600')
                setShowOAuthModal(platform)
            } else if (data.already_configured) {
                alert(`✅ ${platform} is already configured and ready to use!`)
                await loadCredentials() // Refresh to show the platform as authenticated
            } else if (data.requires_api_key) {
                alert(`${platform} is configured with API key. If you see this message, the platform should be ready to use.`)
                await loadCredentials() // Refresh credentials
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

    async function publishContent() {
        if (selectedPlatforms.length === 0) {
            alert('Please select at least one platform')
            return
        }

        try {
            setLoading(true)
            
            // Get pack content for publishing
            const packRes = await fetch(`/api/packs/${packId}`)
            const pack = await packRes.json()
            
            // Use generated content for Twitter if available
            const twitterContent = generatedContent && selectedPlatforms.includes('twitter') 
                ? {
                    text: generatedContent.text,
                    thread: generatedContent.thread || []
                }
                : {
                    text: pack.derivatives?.x?.[0] || pack.draft_markdown?.substring(0, 280)
                }

            const publishData = {
                pack_id: packId,
                platforms: selectedPlatforms,
                content: {
                    title: pack.seo?.title || 'Content Pack',
                    text: selectedPlatforms.includes('twitter') ? twitterContent.text : pack.derivatives?.x?.[0] || pack.draft_markdown?.substring(0, 280),
                    thread: selectedPlatforms.includes('twitter') ? twitterContent.thread : undefined,
                    content: pack.draft_markdown,
                    subject: pack.seo?.title || 'Newsletter from Content Multiplier',
                    html_content: pack.derivatives?.newsletter || pack.draft_markdown,
                    text_content: pack.draft_markdown,
                    from_email: 'fo.cuahang@gmail.com',
                    from_name: 'Content Multiplier'
                },
                scheduled_at: scheduledAt || undefined
            }

            const res = await fetch('/api/publishing/publish', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(publishData)
            })

            const data = await res.json()
            
            if (data.ok) {
                alert(scheduledAt ? 'Publishing scheduled successfully!' : 'Publishing started successfully!')
                await loadPublishingStatus()
            } else {
                alert('Publishing failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Publishing error:', error)
            alert('Publishing failed')
        } finally {
            setLoading(false)
        }
    }

    async function retryFailed() {
        try {
            setLoading(true)
            const res = await fetch(`/api/publishing/retry/${packId}`, { method: 'POST' })
            const data = await res.json()
            
            if (data.ok) {
                alert('Retry started successfully!')
                await loadPublishingStatus()
            } else {
                alert('Retry failed: ' + (data.error || 'Unknown error'))
            }
        } catch (error) {
            console.error('Retry error:', error)
            alert('Retry failed')
        } finally {
            setLoading(false)
        }
    }

    async function loadTwitterTemplates() {
        try {
            const res = await fetch('/api/twitter-bot/templates')
            const data = await res.json()
            if (data.success) {
                setTwitterTemplates(data.data)
            }
        } catch (error) {
            console.error('Failed to load Twitter templates:', error)
        }
    }

    async function generateTwitterContent() {
        if (!selectedTemplate) {
            alert('Please select a template first')
            return
        }

        try {
            setGenerateLoading(true)
            
            // Get pack content for context
            const packRes = await fetch(`/api/packs/${packId}`)
            const pack = await packRes.json()
            
            const res = await fetch('/api/twitter-bot/test-generate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    template_id: selectedTemplate,
                    topic: pack.seo?.title || pack.idea_title || 'technology'
                })
            })
            
            const data = await res.json()
            if (data.success) {
                setGeneratedContent(data.data)
            } else {
                alert('Content generation failed: ' + data.error)
            }
        } catch (error) {
            console.error('Content generation error:', error)
            alert('Content generation failed')
        } finally {
            setGenerateLoading(false)
        }
    }

    async function useGeneratedContent() {
        if (!generatedContent) return
        
        // Update the selected platforms to include Twitter if not already selected
        if (!selectedPlatforms.includes('twitter')) {
            setSelectedPlatforms([...selectedPlatforms, 'twitter'])
        }
        
        // You could also update the pack content here or modify publishContent to use generated content
        alert('Generated content will be used for Twitter when publishing!')
    }

    useEffect(() => {
        loadCredentials()
        loadPublishingStatus()
        loadTwitterTemplates()
        
        // Check for OAuth completion
        const checkOAuth = () => {
            if (showOAuthModal) {
                loadCredentials()
                setShowOAuthModal(null)
            }
        }
        
        const interval = setInterval(checkOAuth, 2000)
        return () => clearInterval(interval)
    }, [showOAuthModal])

    const authenticatedPlatforms = credentials.filter(c => c.is_active).map(c => c.platform)
    const availablePlatforms = PLATFORMS.filter(p => authenticatedPlatforms.includes(p.id))

    return (
        <div style={{
            background: 'white',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            padding: '1.5rem',
            marginTop: '2rem'
        }}>
            <h2 style={{ margin: '0 0 1rem 0', color: '#1f2937' }}>Publishing</h2>

            {/* Platform Authentication */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>
                    Connect Platforms
                </h3>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                    gap: '0.5rem'
                }}>
                    {PLATFORMS.map(platform => {
                        const isAuthenticated = authenticatedPlatforms.includes(platform.id)
                        return (
                            <div key={platform.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                background: isAuthenticated ? '#f0fdf4' : '#f9fafb'
                            }}>
                                <span style={{ fontSize: '0.9rem' }}>
                                    {platform.icon} {platform.name}
                                </span>
                                {isAuthenticated ? (
                                    <span style={{ color: '#059669', fontSize: '0.8rem' }}>✓</span>
                                ) : (
                                    <Button
                                        onClick={() => authenticatePlatform(platform.id)}
                                        disabled={loading}
                                        style={{ 
                                            padding: '0.25rem 0.5rem',
                                            fontSize: '0.8rem',
                                            minHeight: 'auto'
                                        }}
                                    >
                                        Connect
                                    </Button>
                                )}
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Platform Selection */}
            {availablePlatforms.length > 0 && (
                <div style={{ marginBottom: '2rem' }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>
                        Select Platforms to Publish
                    </h3>
                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                        gap: '0.5rem'
                    }}>
                        {availablePlatforms.map(platform => (
                            <label key={platform.id} style={{
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0.5rem',
                                border: '1px solid #d1d5db',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                background: selectedPlatforms.includes(platform.id) ? '#dbeafe' : 'white'
                            }}>
                                <input
                                    type="checkbox"
                                    checked={selectedPlatforms.includes(platform.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedPlatforms([...selectedPlatforms, platform.id])
                                            // Show Twitter bot options when Twitter is selected
                                            if (platform.id === 'twitter') {
                                                setShowTwitterBot(true)
                                            }
                                        } else {
                                            setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform.id))
                                            // Hide Twitter bot options when Twitter is deselected
                                            if (platform.id === 'twitter') {
                                                setShowTwitterBot(false)
                                                setGeneratedContent(null)
                                            }
                                        }
                                    }}
                                    style={{ marginRight: '0.5rem' }}
                                />
                                <span style={{ fontSize: '0.9rem' }}>
                                    {platform.icon} {platform.name}
                                </span>
                            </label>
                        ))}
                    </div>
                </div>
            )}

            {/* Twitter Bot Content Generation */}
            {showTwitterBot && selectedPlatforms.includes('twitter') && (
                <div style={{ 
                    marginBottom: '2rem',
                    background: '#f0f9ff',
                    border: '1px solid #0ea5e9',
                    borderRadius: '8px',
                    padding: '1.5rem'
                }}>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#0c4a6e' }}>
                        🤖 AI-Generated Twitter Content
                    </h3>
                    <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem', color: '#075985' }}>
                        Use the Twitter bot's AI templates to generate optimized content for your post.
                    </p>

                    <div style={{ marginBottom: '1rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold', color: '#0c4a6e' }}>
                            Content Template
                        </label>
                        <select
                            value={selectedTemplate}
                            onChange={(e) => setSelectedTemplate(e.target.value)}
                            style={{
                                width: '100%',
                                padding: '0.5rem',
                                border: '1px solid #0ea5e9',
                                borderRadius: '4px',
                                fontSize: '0.9rem'
                            }}
                        >
                            <option value="">Select a template...</option>
                            {twitterTemplates.map(template => (
                                <option key={template.template_id} value={template.template_id}>
                                    {template.name} ({template.tone}) - {template.topics.join(', ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                        <Button
                            onClick={generateTwitterContent}
                            disabled={generateLoading || !selectedTemplate}
                            style={{
                                background: '#0ea5e9',
                                color: 'white',
                                padding: '0.5rem 1rem'
                            }}
                        >
                            {generateLoading ? '🔄 Generating...' : '✨ Generate Content'}
                        </Button>
                    </div>

                    {generatedContent && (
                        <div style={{
                            background: 'white',
                            border: '1px solid #0ea5e9',
                            borderRadius: '4px',
                            padding: '1rem',
                            marginTop: '1rem'
                        }}>
                            <h4 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e' }}>Generated Tweet:</h4>
                            <p style={{ 
                                margin: '0 0 1rem 0', 
                                padding: '0.5rem',
                                background: '#f8fafc',
                                border: '1px solid #e2e8f0',
                                borderRadius: '4px',
                                fontStyle: 'italic'
                            }}>
                                "{generatedContent.text}"
                            </p>
                            
                            {generatedContent.thread && generatedContent.thread.length > 0 && (
                                <div>
                                    <h5 style={{ margin: '0 0 0.5rem 0', color: '#0c4a6e' }}>Thread:</h5>
                                    {generatedContent.thread.map((tweet: string, index: number) => (
                                        <p key={index} style={{
                                            margin: '0 0 0.5rem 0',
                                            padding: '0.5rem',
                                            background: '#f8fafc',
                                            border: '1px solid #e2e8f0',
                                            borderRadius: '4px',
                                            fontSize: '0.9rem'
                                        }}>
                                            {index + 2}. "{tweet}"
                                        </p>
                                    ))}
                                </div>
                            )}

                            {generatedContent.hashtags && generatedContent.hashtags.length > 0 && (
                                <div style={{ marginTop: '0.5rem' }}>
                                    <strong style={{ color: '#0c4a6e' }}>Suggested hashtags:</strong> {generatedContent.hashtags.join(' ')}
                                </div>
                            )}

                            <div style={{ marginTop: '1rem', fontSize: '0.8rem', color: '#64748b' }}>
                                ✅ This content will be used when publishing to Twitter
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Scheduling */}
            <div style={{ marginBottom: '2rem' }}>
                <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>
                    Schedule Publishing (Optional)
                </h3>
                <input
                    type="datetime-local"
                    value={scheduledAt}
                    onChange={(e) => setScheduledAt(e.target.value)}
                    style={{
                        padding: '0.5rem',
                        border: '1px solid #d1d5db',
                        borderRadius: '4px',
                        fontSize: '0.9rem'
                    }}
                />
            </div>

            {/* Publish Button */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
                <Button
                    onClick={publishContent}
                    disabled={loading || selectedPlatforms.length === 0}
                    style={{
                        background: '#059669',
                        color: 'white',
                        padding: '0.75rem 1.5rem'
                    }}
                >
                    {loading ? 'Publishing...' : (scheduledAt ? 'Schedule Publish' : 'Publish Now')}
                </Button>
                
                {publishingStatus?.jobs?.some(job => job.status === 'failed') && (
                    <Button
                        onClick={retryFailed}
                        disabled={loading}
                        variant="neutral"
                        style={{ padding: '0.75rem 1.5rem' }}
                    >
                        Retry Failed
                    </Button>
                )}
            </div>

            {/* Publishing Status */}
            {publishingStatus && (
                <div>
                    <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#374151' }}>
                        Publishing Status
                    </h3>
                    <div style={{
                        background: '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: '4px',
                        padding: '1rem'
                    }}>
                        <p style={{ margin: '0 0 0.5rem 0' }}>
                            <strong>Overall Status:</strong> {publishingStatus.pack_status?.publishing_status || 'Not published'}
                        </p>
                        {publishingStatus.pack_status?.last_published_at && (
                            <p style={{ margin: '0 0 1rem 0' }}>
                                <strong>Last Published:</strong> {new Date(publishingStatus.pack_status.last_published_at).toLocaleString()}
                            </p>
                        )}
                        
                        {publishingStatus.jobs.length > 0 && (
                            <div>
                                <strong>Platform Status:</strong>
                                <div style={{ marginTop: '0.5rem' }}>
                                    {publishingStatus.jobs.map((job, index) => (
                                        <div key={index} style={{
                                            display: 'flex',
                                            justifyContent: 'space-between',
                                            alignItems: 'center',
                                            padding: '0.5rem',
                                            border: '1px solid #d1d5db',
                                            borderRadius: '4px',
                                            marginBottom: '0.5rem',
                                            background: job.status === 'published' ? '#f0fdf4' : 
                                                      job.status === 'failed' ? '#fef2f2' : '#fffbeb'
                                        }}>
                                            <span>
                                                {PLATFORMS.find(p => p.id === job.platform)?.icon} {job.platform}
                                            </span>
                                            <div style={{ textAlign: 'right' }}>
                                                <div style={{
                                                    color: job.status === 'published' ? '#059669' :
                                                          job.status === 'failed' ? '#dc2626' : '#d97706',
                                                    fontWeight: 'bold',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {job.status}
                                                </div>
                                                {job.external_url && (
                                                    <a
                                                        href={job.external_url}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        style={{
                                                            color: '#2563eb',
                                                            fontSize: '0.8rem',
                                                            textDecoration: 'none'
                                                        }}
                                                    >
                                                        View Post →
                                                    </a>
                                                )}
                                                {job.error_message && (
                                                    <div style={{
                                                        color: '#dc2626',
                                                        fontSize: '0.8rem',
                                                        marginTop: '0.25rem'
                                                    }}>
                                                        {job.error_message}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* OAuth Modal */}
            {showOAuthModal && (
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
                        maxWidth: '400px',
                        textAlign: 'center'
                    }}>
                        <h3 style={{ margin: '0 0 1rem 0' }}>Connecting to {showOAuthModal}</h3>
                        <p style={{ margin: '0 0 1.5rem 0', color: '#6b7280' }}>
                            Please complete the authentication in the popup window.
                        </p>
                        <Button
                            onClick={() => setShowOAuthModal(null)}
                            variant="neutral"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    )
}