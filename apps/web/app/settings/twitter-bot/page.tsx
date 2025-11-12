'use client'

import Link from 'next/link'
import { TwitterBotPanel } from '../../components/TwitterBotPanel'

export default function TwitterBotPage() {
    return (
        <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
                <Link href="/settings" style={{
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
                    ← Back to Settings
                </Link>
                <h1 style={{ margin: 0 }}>🐦 Twitter Bot</h1>
            </div>

            <div style={{ marginBottom: '2rem' }}>
                <p style={{ color: '#6c757d', margin: 0 }}>
                    Automate your Twitter presence with AI-generated content. Configure scheduling, content topics, 
                    and templates to maintain consistent posting without manual intervention.
                </p>
            </div>

            <TwitterBotPanel />

            <div style={{ 
                marginTop: '3rem', 
                padding: '1.5rem', 
                background: '#f8f9fa', 
                borderRadius: '8px',
                border: '1px solid #dee2e6'
            }}>
                <h3 style={{ margin: '0 0 1rem 0', color: '#495057' }}>📖 Getting Started</h3>
                <div style={{ fontSize: '0.9rem', color: '#6c757d' }}>
                    <p><strong>1. Configure Topics:</strong> Set the content topics you want the bot to tweet about</p>
                    <p><strong>2. Set Schedule:</strong> Define when you want tweets to be posted (e.g., 09:00, 15:00, 21:00)</p>
                    <p><strong>3. Enable & Start:</strong> Enable automatic posting and start the bot service</p>
                    <p><strong>4. Monitor:</strong> Check the activity logs and adjust settings as needed</p>
                </div>
            </div>

            <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem', 
                background: '#fff3cd', 
                borderRadius: '8px',
                border: '1px solid #ffeaa7'
            }}>
                <h4 style={{ margin: '0 0 0.5rem 0', color: '#856404' }}>⚠️ Prerequisites</h4>
                <p style={{ margin: 0, fontSize: '0.9rem', color: '#856404' }}>
                    Make sure you have:
                </p>
                <ul style={{ margin: '0.5rem 0 0 1rem', fontSize: '0.9rem', color: '#856404' }}>
                    <li>Twitter API credentials configured in <Link href="/settings/publishing" style={{ color: '#0066cc' }}>Publishing Settings</Link></li>
                    <li>LLM provider configured in <Link href="/settings" style={{ color: '#0066cc' }}>Settings</Link></li>
                    <li>Appropriate posting permissions for your Twitter account</li>
                </ul>
            </div>
        </main>
    )
}