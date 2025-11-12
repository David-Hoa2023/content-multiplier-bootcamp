import Navigation from './components/Navigation'
import { LanguageProvider } from './contexts/LanguageContext'
import './globals.css'

export const metadata = {
    title: 'Content Multiplier',
    description: 'AI-powered content workflow'
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body style={{
                fontFamily: 'system-ui, -apple-system, sans-serif',
                margin: 0,
                padding: 0,
                background: '#f8fafc'
            }}>
                <LanguageProvider>
                    <Navigation />
                    <main style={{
                        paddingTop: '100px', // Space for fixed navigation
                        padding: '100px 2rem 2rem 2rem',
                        maxWidth: '1200px',
                        margin: '0 auto',
                        minHeight: 'calc(100vh - 100px)'
                    }}>
                        {children}
                    </main>
                </LanguageProvider>
            </body>
        </html>
    )
}

