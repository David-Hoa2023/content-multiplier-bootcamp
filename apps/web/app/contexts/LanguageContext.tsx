'use client'
import { createContext, useContext, useState, useEffect } from 'react'
import { Language } from '../translations'

interface LanguageContextType {
    language: Language
    setLanguage: (lang: Language) => void
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
    const [language, setLanguage] = useState<Language>('en')

    useEffect(() => {
        // Load language from localStorage
        const saved = localStorage.getItem('content-multiplier-language')
        if (saved && (saved === 'en' || saved === 'vn')) {
            setLanguage(saved)
        }
    }, [])

    useEffect(() => {
        // Save language to localStorage
        localStorage.setItem('content-multiplier-language', language)
    }, [language])

    return (
        <LanguageContext.Provider value={{ language, setLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export function useLanguage() {
    const context = useContext(LanguageContext)
    if (context === undefined) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
