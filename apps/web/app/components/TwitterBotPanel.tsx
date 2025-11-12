'use client'

import { useState, useEffect } from 'react'
import { Button } from './Button'

interface TwitterBotStatus {
    running: boolean
    config: {
        enabled: boolean
        interval_hours: number
        content_topics: string[]
        max_tweets_per_day: number
        schedule_times: string[]
    }
    last_post: any
    next_scheduled: string | null
    stats: {
        total_posts: number
        successful_posts: number
        failed_posts: number
    }
}

interface TwitterBotHistory {
    pack_id: string
    status: string
    published_at: string
    content_data: string
    external_url?: string
    error_message?: string
}

export function TwitterBotPanel() {
    const [status, setStatus] = useState<TwitterBotStatus | null>(null)
    const [history, setHistory] = useState<TwitterBotHistory[]>([])
    const [loading, setLoading] = useState(false)
    const [config, setConfig] = useState<any>({})
    const [showConfig, setShowConfig] = useState(false)

    useEffect(() => {
        loadStatus()
        loadHistory()
        loadConfig()
    }, [])

    const loadStatus = async () => {
        try {
            const response = await fetch('/api/twitter-bot/status')
            const result = await response.json()
            if (result.success) {
                setStatus(result.data)
            }
        } catch (error) {
            console.error('Failed to load status:', error)
        }
    }

    const loadHistory = async () => {
        try {
            const response = await fetch('/api/twitter-bot/history?limit=10')
            const result = await response.json()
            if (result.success) {
                setHistory(result.data)
            }
        } catch (error) {
            console.error('Failed to load history:', error)
        }
    }

    const loadConfig = async () => {
        try {
            const response = await fetch('/api/twitter-bot/config')
            const result = await response.json()
            if (result.success) {
                setConfig(result.data)
            }
        } catch (error) {
            console.error('Failed to load config:', error)
        }
    }

    const handleStart = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/twitter-bot/start', { method: 'POST' })
            const result = await response.json()
            if (result.success) {
                await loadStatus()
            } else {
                alert('Failed to start bot: ' + result.error)
            }
        } catch (error) {
            alert('Error starting bot: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleStop = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/twitter-bot/stop', { method: 'POST' })
            const result = await response.json()
            if (result.success) {
                await loadStatus()
            } else {
                alert('Failed to stop bot: ' + result.error)
            }
        } catch (error) {
            alert('Error stopping bot: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const handleConfigUpdate = async () => {
        setLoading(true)
        try {
            const response = await fetch('/api/twitter-bot/config', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(config)
            })
            const result = await response.json()
            if (result.success) {
                await loadStatus()
                setShowConfig(false)
            } else {
                alert('Failed to update config: ' + result.error)
            }
        } catch (error) {
            alert('Error updating config: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'published': return 'text-green-600'
            case 'failed': return 'text-red-600'
            case 'processing': return 'text-yellow-600'
            case 'pending': return 'text-blue-600'
            default: return 'text-gray-600'
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'published': return '✅'
            case 'failed': return '❌'
            case 'processing': return '⏳'
            case 'pending': return '⏸️'
            default: return '❓'
        }
    }

    if (!status) {
        return <div className="p-4">Loading Twitter bot status...</div>
    }

    return (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold flex items-center">
                        🐦 Twitter Bot
                        <span className={`ml-2 px-2 py-1 rounded text-sm ${status.running ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                            {status.running ? 'RUNNING' : 'STOPPED'}
                        </span>
                    </h2>
                    <div className="space-x-2">
                        <Button
                            onClick={() => setShowConfig(!showConfig)}
                            variant="secondary"
                        >
                            ⚙️ Config
                        </Button>
                        {status.running ? (
                            <Button
                                onClick={handleStop}
                                disabled={loading}
                                variant="secondary"
                            >
                                ⏹️ Stop
                            </Button>
                        ) : (
                            <Button
                                onClick={handleStart}
                                disabled={loading || !status.config.enabled}
                                variant="primary"
                            >
                                ▶️ Start
                            </Button>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    <div className="bg-gray-50 rounded p-4">
                        <div className="text-sm text-gray-600">Total Posts</div>
                        <div className="text-2xl font-bold">{status.stats.total_posts}</div>
                    </div>
                    <div className="bg-green-50 rounded p-4">
                        <div className="text-sm text-gray-600">Successful</div>
                        <div className="text-2xl font-bold text-green-600">{status.stats.successful_posts}</div>
                    </div>
                    <div className="bg-red-50 rounded p-4">
                        <div className="text-sm text-gray-600">Failed</div>
                        <div className="text-2xl font-bold text-red-600">{status.stats.failed_posts}</div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                        <strong>Schedule:</strong> {status.config.schedule_times.join(', ')}
                    </div>
                    <div>
                        <strong>Max tweets/day:</strong> {status.config.max_tweets_per_day}
                    </div>
                    <div>
                        <strong>Topics:</strong> {status.config.content_topics.slice(0, 3).join(', ')}
                        {status.config.content_topics.length > 3 && ` +${status.config.content_topics.length - 3} more`}
                    </div>
                    {status.next_scheduled && (
                        <div>
                            <strong>Next post:</strong> {new Date(status.next_scheduled).toLocaleString()}
                        </div>
                    )}
                </div>
            </div>

            {showConfig && (
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="text-lg font-semibold mb-4">Configuration</h3>
                    <div className="space-y-4">
                        <label className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={config.enabled || false}
                                onChange={(e) => setConfig({...config, enabled: e.target.checked})}
                            />
                            <span>Enable automatic posting</span>
                        </label>
                        
                        <div>
                            <label className="block text-sm font-medium mb-1">Max tweets per day</label>
                            <input
                                type="number"
                                min="1"
                                max="24"
                                value={config.max_tweets_per_day || 3}
                                onChange={(e) => setConfig({...config, max_tweets_per_day: parseInt(e.target.value)})}
                                className="border rounded px-3 py-2 w-32"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Content topics (comma separated)</label>
                            <input
                                type="text"
                                value={config.content_topics?.join(', ') || ''}
                                onChange={(e) => setConfig({...config, content_topics: e.target.value.split(',').map(t => t.trim())})}
                                className="border rounded px-3 py-2 w-full"
                                placeholder="AI, technology, programming, startups"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Schedule times (comma separated, 24h format)</label>
                            <input
                                type="text"
                                value={config.schedule_times?.join(', ') || ''}
                                onChange={(e) => setConfig({...config, schedule_times: e.target.value.split(',').map(t => t.trim())})}
                                className="border rounded px-3 py-2 w-full"
                                placeholder="09:00, 15:00, 21:00"
                            />
                        </div>

                        <div className="flex space-x-2">
                            <Button onClick={handleConfigUpdate} disabled={loading}>
                                Save Configuration
                            </Button>
                            <Button onClick={() => setShowConfig(false)} variant="secondary">
                                Cancel
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
                {history.length === 0 ? (
                    <p className="text-gray-500">No recent activity</p>
                ) : (
                    <div className="space-y-4">
                        {history.map((post, index) => {
                            const content = JSON.parse(post.content_data).text
                            const preview = content.length > 100 ? content.substring(0, 100) + '...' : content
                            
                            return (
                                <div key={index} className="border-l-4 border-gray-200 pl-4">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className={`text-sm font-medium ${getStatusColor(post.status)}`}>
                                            {getStatusIcon(post.status)} {post.status.toUpperCase()}
                                        </span>
                                        <span className="text-sm text-gray-500">
                                            {new Date(post.published_at).toLocaleString()}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">"{preview}"</p>
                                    {post.external_url && (
                                        <a
                                            href={post.external_url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-600 hover:underline text-sm"
                                        >
                                            View on Twitter →
                                        </a>
                                    )}
                                    {post.error_message && (
                                        <p className="text-red-600 text-sm mt-1">Error: {post.error_message}</p>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}