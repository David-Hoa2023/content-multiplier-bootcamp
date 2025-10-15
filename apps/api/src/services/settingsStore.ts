import fs from 'fs'
import path from 'path'

export type LLMProvider = 'openai' | 'deepseek' | 'anthropic' | 'gemini' | 'grok'

export interface SavedLLMConfig {
    provider: LLMProvider
    apiKey: string
    model: string
    baseUrl?: string
}

const DATA_DIR = path.resolve(process.cwd(), '.data')
const SETTINGS_PATH = path.join(DATA_DIR, 'llm-settings.json')

function ensureDataDir() {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true })
}

export function loadLLMSettings(): SavedLLMConfig | null {
    try {
        if (!fs.existsSync(SETTINGS_PATH)) return null
        const raw = fs.readFileSync(SETTINGS_PATH, 'utf8')
        const parsed = JSON.parse(raw)
        if (!parsed || typeof parsed !== 'object') return null
        return parsed as SavedLLMConfig
    } catch {
        return null
    }
}

export function saveLLMSettings(cfg: SavedLLMConfig): void {
    ensureDataDir()
    fs.writeFileSync(SETTINGS_PATH, JSON.stringify(cfg, null, 2), 'utf8')
}



