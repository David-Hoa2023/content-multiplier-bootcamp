import OpenAI from 'openai'
import { env } from '../env.ts'
import { loadLLMSettings } from './settingsStore.ts'
import type { LLMClient, LLMParams } from '../../../../packages/utils/llm.ts'

// Default models used when caller doesn't specify a model explicitly
const DEFAULT_MODELS = {
    openai: {
        json: env.OPENAI_MODEL || 'gpt-4o-mini',
        embedding: env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small'
    },
    deepseek: {
        json: 'deepseek-chat',
        embedding: 'deepseek-chat' // DeepSeek doesn't have separate embedding models
    },
    anthropic: {
        json: 'claude-3-5-sonnet-20241022',
        embedding: 'claude-3-5-sonnet-20241022' // Anthropic doesn't have embedding models
    },
    gemini: {
        json: 'gemini-1.5-flash',
        embedding: 'gemini-1.5-flash' // Gemini doesn't have separate embedding models
    },
    grok: {
        json: 'grok-beta',
        embedding: 'grok-beta' // Grok doesn't have separate embedding models
    }
}

// LLM Provider configurations
const PROVIDER_CONFIGS = {
    openai: {
        createClient: (apiKey: string) => new OpenAI({ apiKey }),
        baseUrl: null
    },
    deepseek: {
        createClient: (apiKey: string, baseUrl?: string) => new OpenAI({
            apiKey,
            baseURL: baseUrl || 'https://api.deepseek.com'
        }),
        baseUrl: 'https://api.deepseek.com'
    },
    anthropic: {
        createClient: (apiKey: string) => {
            // For Anthropic, we'd need a different client implementation
            // For demo, we'll use OpenAI client as a proxy
            return new OpenAI({ apiKey, baseURL: 'https://api.anthropic.com' })
        },
        baseUrl: 'https://api.anthropic.com'
    },
    gemini: {
        createClient: (apiKey: string, baseUrl?: string) => {
            // For Gemini, we'd need a different client implementation
            // For demo, we'll use OpenAI client as a proxy
            return new OpenAI({ apiKey, baseURL: baseUrl || 'https://generativelanguage.googleapis.com' })
        },
        baseUrl: 'https://generativelanguage.googleapis.com'
    },
    grok: {
        createClient: (apiKey: string, baseUrl?: string) => {
            // For Grok, we'd need a different client implementation
            // For demo, we'll use OpenAI client as a proxy
            return new OpenAI({ apiKey, baseURL: baseUrl || 'https://api.x.ai' })
        },
        baseUrl: 'https://api.x.ai'
    }
}

class MultiProviderLLM implements LLMClient {
    private getProviderConfig(provider: string = 'openai') {
        return PROVIDER_CONFIGS[provider as keyof typeof PROVIDER_CONFIGS] || PROVIDER_CONFIGS.openai
    }

    private getDefaultModel(provider: string = 'openai', type: 'json' | 'embedding' = 'json') {
        const models = DEFAULT_MODELS[provider as keyof typeof DEFAULT_MODELS] || DEFAULT_MODELS.openai
        return models[type]
    }

    async completeJSON(p: LLMParams): Promise<any> {
        const saved = loadLLMSettings()
        const inferredProvider = p.model?.includes('deepseek') ? 'deepseek' :
            p.model?.includes('claude') ? 'anthropic' :
                p.model?.includes('gemini') ? 'gemini' :
                    p.model?.includes('grok') ? 'grok' : undefined

        const provider = inferredProvider || saved?.provider || 'openai'
        const config = this.getProviderConfig(provider)
        const apiKey = saved?.apiKey || process.env.OPENAI_API_KEY || ''
        const client = config.createClient(apiKey, saved?.baseUrl || undefined)

        const systemMsg = p.system
            ? `${p.system}\n\nYou must respond with valid JSON only.`
            : 'Respond with valid JSON only.'

        try {
            const response = await client.chat.completions.create({
                model: p.model || saved?.model || this.getDefaultModel(provider, 'json'),
                messages: [
                    { role: 'system' as const, content: systemMsg },
                    { role: 'user' as const, content: p.user }
                ],
                response_format: { type: 'json_object' }
            })
            const content = response.choices[0]?.message?.content || '{}'
            return JSON.parse(content)
        } catch (error) {
            console.error('LLM API error:', error)
            throw error
        }
    }

    async embed(input: string[]): Promise<number[][]> {
        const saved = loadLLMSettings()
        const apiKey = saved?.apiKey || env.OPENAI_API_KEY || ''

        if (!apiKey) {
            throw new Error('OpenAI API key not configured. Set OPENAI_API_KEY environment variable.')
        }

        const client = new OpenAI({ apiKey })
        const embeddingModel = env.EMBEDDING_MODEL || 'text-embedding-3-small'

        try {
            const response = await client.embeddings.create({
                model: embeddingModel,
                input: input,
            })
            return response.data.map(item => item.embedding)
        } catch (error) {
            console.error('Embedding API error:', error)
            throw error
        }
    }
}

export const llm = new MultiProviderLLM()

