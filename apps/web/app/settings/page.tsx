'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Button from '../components/Button'

interface LLMConfig {
    provider: 'openai' | 'deepseek' | 'anthropic' | 'gemini' | 'grok'
    apiKey: string
    model: string
    baseUrl?: string
}

const LLM_PROVIDERS = {
    openai: {
        name: 'OpenAI',
        models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4', 'gpt-3.5-turbo'],
        defaultModel: 'gpt-4o-mini',
        requiresApiKey: true
    },
    deepseek: {
        name: 'DeepSeek',
        models: ['deepseek-chat', 'deepseek-coder'],
        defaultModel: 'deepseek-chat',
        baseUrl: 'https://api.deepseek.com',
        requiresApiKey: true
    },
    anthropic: {
        name: 'Anthropic',
        models: ['claude-3-5-sonnet-20241022', 'claude-3-5-haiku-20241022', 'claude-3-opus-20240229'],
        defaultModel: 'claude-3-5-sonnet-20241022',
        requiresApiKey: true
    },
    gemini: {
        name: 'Google Gemini',
        models: ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-pro'],
        defaultModel: 'gemini-1.5-flash',
        baseUrl: 'https://generativelanguage.googleapis.com',
        requiresApiKey: true
    },
    grok: {
        name: 'xAI Grok',
        models: ['grok-beta', 'grok-1.5', 'grok-4-fast-non-reasoning'],
        defaultModel: 'grok-beta',
        baseUrl: 'https://api.x.ai',
        requiresApiKey: true
    }
}

export default function SettingsPage() {
    const [config, setConfig] = useState<LLMConfig>({
        provider: 'openai',
        apiKey: '',
        model: 'gpt-4o-mini'
    })
    const [saving, setSaving] = useState(false)
    const [message, setMessage] = useState('')
    const [prompt, setPrompt] = useState('Write a short haiku about content strategies.')
    const [running, setRunning] = useState(false)

    useEffect(() => {
        loadConfig()
    }, [])

    const loadConfig = async () => {
        try {
            const response = await fetch('/api/settings/llm')
            if (response.ok) {
                const data = await response.json()
                setConfig(data)
            }
        } catch (error) {
            console.error('Failed to load LLM config:', error)
        }
    }

    const saveConfig = async () => {
        setSaving(true)
        setMessage('')

        try {
            const response = await fetch('/api/settings/llm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })

            if (response.ok) {
                setMessage('✅ Settings saved successfully!')
            } else {
                const error = await response.json()
                setMessage(`❌ Error: ${error.error}`)
            }
        } catch (error) {
            setMessage('❌ Failed to save settings')
        }

        setSaving(false)
    }

    const updateConfig = (updates: Partial<LLMConfig>) => {
        setConfig(prev => ({ ...prev, ...updates }))
    }

    const testConnection = async () => {
        setSaving(true)
        setMessage('')

        try {
            const response = await fetch('/api/settings/llm/test', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })

            if (response.ok) {
                const result = await response.json()
                setMessage(`✅ ${result.provider} connected successfully!`)
            } else {
                const error = await response.json()
                setMessage(`❌ Connection failed: ${error.error}`)
            }
        } catch (error) {
            setMessage('❌ Connection test failed')
        }

        setSaving(false)
    }

    const runPrompt = async () => {
        setRunning(true)
        setMessage('')
        try {
            const res = await fetch('/api/settings/llm/run', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prompt })
            })
            const data = await res.json()
            if (!res.ok) throw new Error(data.error || 'Run failed')
            setMessage(`✅ Output (model: ${data.model}):\n\n${data.output}`)
        } catch (e: any) {
            setMessage(`❌ ${e.message}`)
        } finally {
            setRunning(false)
        }
    }

    return (
        <main style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
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
                <h1 style={{ margin: 0 }}>Settings</h1>
            </div>

            {/* Navigation Menu */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '1rem',
                marginBottom: '2rem'
            }}>
                <Link
                    href="/settings/publishing"
                    style={{
                        display: 'block',
                        padding: '1.5rem',
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#495057',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e9ecef'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8f9fa'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                    }}
                >
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#343a40' }}>📡 Publishing Settings</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Connect social media platforms, configure webhooks, and manage publishing credentials
                    </p>
                </Link>
                
                <Link
                    href="/settings/twitter-bot"
                    style={{
                        display: 'block',
                        padding: '1.5rem',
                        background: '#f8f9fa',
                        border: '1px solid #dee2e6',
                        borderRadius: '8px',
                        textDecoration: 'none',
                        color: '#495057',
                        transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e9ecef'
                        e.currentTarget.style.transform = 'translateY(-2px)'
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8f9fa'
                        e.currentTarget.style.transform = 'translateY(0)'
                        e.currentTarget.style.boxShadow = 'none'
                    }}
                >
                    <h3 style={{ margin: '0 0 0.5rem 0', color: '#343a40' }}>🐦 Twitter Bot</h3>
                    <p style={{ margin: 0, fontSize: '0.9rem' }}>
                        Automated Twitter posting with AI-generated content and scheduling
                    </p>
                </Link>
            </div>

            <div style={{
                background: '#f8f9fa',
                padding: '2rem',
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <h2 style={{ marginTop: 0, color: '#495057' }}>LLM Configuration</h2>

                {/* Provider Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        AI Provider
                    </label>
                    <select
                        value={config.provider}
                        onChange={(e) => updateConfig({
                            provider: e.target.value as any,
                            model: LLM_PROVIDERS[e.target.value as keyof typeof LLM_PROVIDERS].defaultModel
                        })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    >
                        {Object.entries(LLM_PROVIDERS).map(([key, provider]) => (
                            <option key={key} value={key}>{provider.name}</option>
                        ))}
                    </select>
                </div>

                {/* API Key */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        API Key ({LLM_PROVIDERS[config.provider].name})
                    </label>
                    <input
                        type="password"
                        value={config.apiKey}
                        onChange={(e) => updateConfig({ apiKey: e.target.value })}
                        placeholder={`Enter your ${LLM_PROVIDERS[config.provider].name} API key`}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    />
                    <small style={{ color: '#6c757d', marginTop: '0.25rem', display: 'block' }}>
                        🔒 Your API key is stored locally and never sent to our servers
                    </small>
                </div>

                {/* Model Selection */}
                <div style={{ marginBottom: '2rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Model
                    </label>
                    <select
                        value={config.model}
                        onChange={(e) => updateConfig({ model: e.target.value })}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '16px'
                        }}
                    >
                        {LLM_PROVIDERS[config.provider].models.map(model => (
                            <option key={model} value={model}>{model}</option>
                        ))}
                    </select>
                </div>

                {/* Custom Base URL (for providers that need it) */}
                {['deepseek', 'gemini', 'grok'].includes(config.provider) && (
                    <div style={{ marginBottom: '2rem' }}>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                            Base URL
                        </label>
                        <input
                            type="text"
                            value={config.baseUrl || (LLM_PROVIDERS[config.provider] as any).baseUrl}
                            onChange={(e) => updateConfig({ baseUrl: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.75rem',
                                border: '1px solid #ced4da',
                                borderRadius: '4px',
                                fontSize: '16px'
                            }}
                        />
                    </div>
                )}

                {/* Action Buttons */}
                <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                    <Button onClick={saveConfig} disabled={saving} variant={saving ? 'neutral' : 'success'} style={{ padding: '0.75rem 1.5rem', fontSize: '16px' }}>
                        {saving ? '💾 Saving...' : '💾 Save Settings'}
                    </Button>

                    <Button onClick={testConnection} disabled={saving || !config.apiKey} variant={saving || !config.apiKey ? 'neutral' : 'primary'} style={{ padding: '0.75rem 1.5rem', fontSize: '16px' }}>
                        🧪 Test Connection
                    </Button>

                    <Button onClick={runPrompt} disabled={running} variant={running ? 'neutral' : 'primary'} style={{ padding: '0.75rem 1.5rem', fontSize: '16px' }}>
                        ▶️ Run prompt
                    </Button>
                </div>

                {/* Prompt Runner */}
                <div style={{ marginTop: '1.5rem' }}>
                    <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                        Test prompt (uses saved provider & model)
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        rows={5}
                        style={{
                            width: '100%',
                            padding: '0.75rem',
                            border: '1px solid #ced4da',
                            borderRadius: '4px',
                            fontSize: '16px',
                            fontFamily: 'inherit'
                        }}
                    />
                </div>

                {/* Status Message */}
                {message && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        borderRadius: '4px',
                        background: message.includes('✅') ? '#d4edda' : '#f8d7da',
                        color: message.includes('✅') ? '#155724' : '#721c24',
                        border: `1px solid ${message.includes('✅') ? '#c3e6cb' : '#f5c6cb'}`
                    }}>
                        {message}
                    </div>
                )}

                {/* Provider Info */}
                <div style={{ marginTop: '2rem', padding: '1rem', background: '#e9ecef', borderRadius: '4px' }}>
                    <h4 style={{ margin: '0 0 0.5rem 0' }}>About {LLM_PROVIDERS[config.provider].name}</h4>
                    <p style={{ margin: 0, fontSize: '14px', color: '#495057' }}>
                        {config.provider === 'openai' && 'OpenAI provides GPT models for general AI tasks with strong language understanding.'}
                        {config.provider === 'deepseek' && 'DeepSeek offers competitive AI models with strong coding capabilities and cost-effective pricing.'}
                        {config.provider === 'anthropic' && 'Anthropic provides Claude models with strong reasoning, safety features, and long context windows.'}
                        {config.provider === 'gemini' && 'Google Gemini offers powerful multimodal AI with strong reasoning and real-time access to current information.'}
                        {config.provider === 'grok' && 'xAI Grok provides helpful AI with a focus on truth-seeking and real-time access to current events.'}
                    </p>
                </div>
            </div>
        </main>
    )
}

