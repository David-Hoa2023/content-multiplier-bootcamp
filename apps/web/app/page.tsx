export default function Home() {
    return (
        <div>
            <div style={{
                background: '#2d3748',
                color: 'white',
                padding: '3rem 2rem',
                borderRadius: '12px',
                marginBottom: '2rem',
                textAlign: 'center',
                boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                border: '1px solid rgba(255,255,255,0.1)'
            }}>
                <h1 style={{
                    margin: '0 0 1rem 0',
                    fontSize: '2.5rem',
                    fontWeight: 'bold',
                    textShadow: '0 1px 2px rgba(0,0,0,0.3)'
                }}>
                    Welcome to Content Multiplier
                </h1>
                <p style={{
                    fontSize: '1.2rem',
                    margin: 0,
                    opacity: 0.95,
                    fontWeight: '400'
                }}>
                    AI-powered content ideation, research, and distribution
                </p>
            </div>

            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                gap: '2rem',
                marginBottom: '3rem'
            }}>
                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                }}>
                    <h3 style={{ color: '#2d3748', marginTop: 0, fontWeight: '600' }}>🚀 Quick Start</h3>
                    <p style={{ color: '#4a5568', lineHeight: '1.6' }}>Begin your content creation journey by generating AI-powered ideas tailored to your audience and goals.</p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                }}>
                    <h3 style={{ color: '#2d3748', marginTop: 0, fontWeight: '600' }}>📊 Analytics</h3>
                    <p style={{ color: '#4a5568', lineHeight: '1.6' }}>Track your content performance and optimize your strategy with detailed insights and metrics.</p>
                </div>

                <div style={{
                    background: 'white',
                    padding: '2rem',
                    borderRadius: '12px',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    border: '1px solid #e2e8f0',
                    transition: 'all 0.2s ease'
                }}>
                    <h3 style={{ color: '#2d3748', marginTop: 0, fontWeight: '600' }}>⚙️ Configuration</h3>
                    <p style={{ color: '#4a5568', lineHeight: '1.6' }}>Set up your preferred AI models and API keys to customize your content generation experience.</p>
                </div>
            </div>

            <div style={{
                background: 'white',
                padding: '2rem',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                border: '1px solid #e2e8f0'
            }}>
                <h2 style={{ color: '#2d3748', marginTop: 0, fontWeight: '600' }}>Content Creation Workflow</h2>
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                    gap: '1rem',
                    marginTop: '1rem'
                }}>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>💡</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontWeight: '600' }}>1. Generate Ideas</h4>
                        <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0 }}>AI-powered content ideas</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📋</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontWeight: '600' }}>2. Create Briefs</h4>
                        <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0 }}>Research & structure</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>📦</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontWeight: '600' }}>3. Content Packs</h4>
                        <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0 }}>Draft & manage content</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🔄</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontWeight: '600' }}>4. Generate Derivatives</h4>
                        <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0 }}>Multi-channel content</p>
                    </div>
                    <div style={{ textAlign: 'center', padding: '1rem' }}>
                        <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🚀</div>
                        <h4 style={{ margin: '0 0 0.5rem 0', color: '#2d3748', fontWeight: '600' }}>5. Publish & Distribute</h4>
                        <p style={{ fontSize: '0.9rem', color: '#4a5568', margin: 0 }}>Launch your content</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

