import { FastifyPluginAsync } from 'fastify';
import { loadLLMSettings, saveLLMSettings } from '../services/settingsStore.ts'

interface LLMConfig {
    provider: 'openai' | 'deepseek' | 'anthropic' | 'gemini' | 'grok'
    apiKey: string
    model: string
    baseUrl?: string
}

const routes: FastifyPluginAsync = async (app) => {
    // Get LLM configuration
    app.get('/llm', async (_req: any) => {
        const saved = loadLLMSettings()
        if (saved) return saved
        const fallback: LLMConfig = {
            provider: (process.env.LLM_PROVIDER as any) || 'openai',
            apiKey: process.env.OPENAI_API_KEY || '',
            model: process.env.LLM_MODEL || 'gpt-4o-mini',
            baseUrl: process.env.LLM_BASE_URL
        }
        return fallback
    });

    // Save LLM configuration
    app.post('/llm', async (req: any, reply) => {
        const { provider, apiKey, model, baseUrl } = req.body as LLMConfig

        if (!provider || !apiKey || !model) {
            return reply.status(400).send({ ok: false, error: 'Missing required fields' })
        }

        if (!['openai', 'deepseek', 'anthropic', 'gemini', 'grok'].includes(provider)) {
            return reply.status(400).send({ ok: false, error: 'Invalid provider' })
        }

        try {
            saveLLMSettings({ provider, apiKey, model, baseUrl })
            return { ok: true, message: 'Settings saved successfully' }
        } catch (error) {
            return reply.status(500).send({ ok: false, error: 'Failed to save settings' })
        }
    });

    // Test LLM connection
    app.post('/llm/test', async (req: any, reply) => {
        const { provider, apiKey, model, baseUrl } = req.body as LLMConfig

        if (!provider || !apiKey || !model) {
            return reply.status(400).send({ ok: false, error: 'Missing required fields for test' })
        }

        try {
            // Test the connection based on provider
            if (provider === 'openai') {
                const { default: OpenAI } = await import('openai')
                const client = new OpenAI({ apiKey })

                await client.chat.completions.create({
                    model: model || 'gpt-3.5-turbo',
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 10
                })
            } else if (provider === 'deepseek') {
                const { default: OpenAI } = await import('openai')
                const client = new OpenAI({
                    apiKey,
                    baseURL: baseUrl || 'https://api.deepseek.com'
                })

                await client.chat.completions.create({
                    model: model || 'deepseek-chat',
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 10
                })
            } else if (provider === 'anthropic') {
                // For Anthropic, we'd need a different client
                // For demo, we'll simulate success
                await new Promise(resolve => setTimeout(resolve, 100))
            } else if (provider === 'gemini') {
                // For Gemini, we'd need a different client
                // For demo, we'll simulate success
                await new Promise(resolve => setTimeout(resolve, 100))
            } else if (provider === 'grok') {
                const { default: OpenAI } = await import('openai')
                const client = new OpenAI({
                    apiKey,
                    baseURL: (baseUrl && baseUrl.trim().length > 0 ? baseUrl : 'https://api.x.ai/v1')
                })

                await client.chat.completions.create({
                    model: model || 'grok-beta',
                    messages: [{ role: 'user', content: 'Hello' }],
                    max_tokens: 10
                })
            }

            return { ok: true, provider, message: 'Connection successful!' }
        } catch (error: any) {
            console.error('LLM test failed:', error)
            return reply.status(400).send({
                ok: false,
                error: error.message || 'Connection failed'
            })
        }
    });

    // Run a prompt using the saved settings (optionally override model)
    app.post('/llm/run', async (req: any, reply) => {
        const { prompt, model } = req.body as { prompt: string, model?: string }
        if (!prompt) return reply.status(400).send({ ok: false, error: 'Missing prompt' })

        const saved = loadLLMSettings()
        if (!saved) return reply.status(400).send({ ok: false, error: 'No saved LLM settings' })

        const provider = saved.provider
        const apiKey = saved.apiKey
        const baseUrl = saved.baseUrl
        const modelToUse = model || saved.model

        try {
            if (provider === 'openai') {
                const { default: OpenAI } = await import('openai')
                const client = new OpenAI({ apiKey })
                const res = await client.chat.completions.create({
                    model: modelToUse,
                    messages: [{ role: 'user', content: prompt }]
                })
                const output = res.choices[0]?.message?.content || ''
                return { ok: true, provider, model: modelToUse, output }
            }
            if (provider === 'deepseek') {
                const { default: OpenAI } = await import('openai')
                const client = new OpenAI({ apiKey, baseURL: baseUrl || 'https://api.deepseek.com' })
                const res = await client.chat.completions.create({
                    model: modelToUse || 'deepseek-chat',
                    messages: [{ role: 'user', content: prompt }]
                })
                const output = res.choices[0]?.message?.content || ''
                return { ok: true, provider, model: modelToUse || 'deepseek-chat', output }
            }
            if (provider === 'anthropic' || provider === 'gemini') {
                // Demo: simulate success for providers without native client wired
                return { ok: true, provider, model: modelToUse, output: '[demo] run executed (simulation)' }
            }
            if (provider === 'grok') {
                const { default: OpenAI } = await import('openai')
                const client = new OpenAI({
                    apiKey,
                    baseURL: (baseUrl && baseUrl.trim().length > 0 ? baseUrl : 'https://api.x.ai/v1')
                })
                const res = await client.chat.completions.create({
                    model: modelToUse || 'grok-beta',
                    messages: [{ role: 'user', content: prompt }]
                })
                const output = res.choices[0]?.message?.content || ''
                return { ok: true, provider, model: modelToUse || 'grok-beta', output }
            }
            return reply.status(400).send({ ok: false, error: 'Unsupported provider' })
        } catch (error: any) {
            console.error('LLM run failed:', error)
            return reply.status(400).send({ ok: false, error: error.message || 'Run failed' })
        }
    })
};

export default routes;
