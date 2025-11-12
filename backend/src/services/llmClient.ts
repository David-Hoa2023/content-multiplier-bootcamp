import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'

dotenv.config()

export type LLMProvider = 'openai' | 'gemini' | 'anthropic' | 'deepseek'

export interface LLMCompletionOptions {
  prompt: string
  model?: string
  temperature?: number
  maxTokens?: number
}

export interface LLMCompletionResponse {
  success: boolean
  content?: string
  error?: string
  provider: LLMProvider
  model: string
}

/**
 * LLMClient - Unified client for multiple LLM providers
 * Supports OpenAI, Gemini, Anthropic, and Deepseek
 */
export class LLMClient {
  private openaiClient: OpenAI | null = null
  private geminiClient: GoogleGenerativeAI | null = null
  private anthropicClient: Anthropic | null = null
  private deepseekClient: OpenAI | null = null

  // Default models for each provider
  private readonly DEFAULT_MODELS = {
    openai: 'gpt-4o-mini',
    gemini: 'gemini-pro',
    anthropic: 'claude-3-5-sonnet-20241022',
    deepseek: 'deepseek-chat',
  }

  constructor() {
    // Log available API keys (without exposing the actual keys)
    console.log('🔑 Checking API keys...')
    console.log(`OpenAI: ${process.env.OPENAI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
    console.log(`Gemini: ${process.env.GEMINI_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
    console.log(`Anthropic: ${process.env.ANTHROPIC_API_KEY ? '✅ Configured' : '❌ Not configured'}`)
    console.log(`Deepseek: ${process.env.DEEPSEEK_API_KEY ? '✅ Configured' : '❌ Not configured'}`)

    // Initialize OpenAI client
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
    }

    // Initialize Gemini client
    if (process.env.GEMINI_API_KEY) {
      this.geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    }

    // Initialize Anthropic client
    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropicClient = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
    }

    // Initialize Deepseek client (OpenAI-compatible)
    if (process.env.DEEPSEEK_API_KEY) {
      this.deepseekClient = new OpenAI({
        apiKey: process.env.DEEPSEEK_API_KEY,
        baseURL: 'https://api.deepseek.com',
      })
    }
  }

  /**
   * Generate completion using specified provider
   */
  async generateCompletion(
    provider: LLMProvider,
    options: LLMCompletionOptions
  ): Promise<LLMCompletionResponse> {
    const { prompt, model, temperature = 0.7, maxTokens = 2000 } = options
    const selectedModel = model || this.DEFAULT_MODELS[provider]

    try {
      switch (provider) {
        case 'openai':
          return await this.callOpenAI(prompt, selectedModel, temperature, maxTokens)
        case 'gemini':
          return await this.callGemini(prompt, selectedModel, temperature, maxTokens)
        case 'anthropic':
          return await this.callAnthropic(prompt, selectedModel, temperature, maxTokens)
        case 'deepseek':
          return await this.callDeepseek(prompt, selectedModel, temperature, maxTokens)
        default:
          return {
            success: false,
            error: `Unknown provider: ${provider}`,
            provider,
            model: selectedModel,
          }
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        provider,
        model: selectedModel,
      }
    }
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LLMCompletionResponse> {
    if (!this.openaiClient) {
      return {
        success: false,
        error: 'OpenAI API key not configured',
        provider: 'openai',
        model,
      }
    }

    const response = await this.openaiClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return {
        success: false,
        error: 'No content in response',
        provider: 'openai',
        model,
      }
    }

    return {
      success: true,
      content,
      provider: 'openai',
      model,
    }
  }

  /**
   * Call Gemini API
   */
  private async callGemini(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LLMCompletionResponse> {
    if (!this.geminiClient) {
      return {
        success: false,
        error: 'Gemini API key not configured',
        provider: 'gemini',
        model,
      }
    }

    const genModel = this.geminiClient.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    })

    const result = await genModel.generateContent(prompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      return {
        success: false,
        error: 'No content in response',
        provider: 'gemini',
        model,
      }
    }

    return {
      success: true,
      content,
      provider: 'gemini',
      model,
    }
  }

  /**
   * Call Anthropic API
   */
  private async callAnthropic(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LLMCompletionResponse> {
    if (!this.anthropicClient) {
      return {
        success: false,
        error: 'Anthropic API key not configured',
        provider: 'anthropic',
        model,
      }
    }

    const message = await this.anthropicClient.messages.create({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      return {
        success: false,
        error: 'Invalid response type',
        provider: 'anthropic',
        model,
      }
    }

    return {
      success: true,
      content: content.text,
      provider: 'anthropic',
      model,
    }
  }

  /**
   * Call Deepseek API (OpenAI-compatible)
   */
  private async callDeepseek(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): Promise<LLMCompletionResponse> {
    if (!this.deepseekClient) {
      return {
        success: false,
        error: 'Deepseek API key not configured',
        provider: 'deepseek',
        model,
      }
    }

    const response = await this.deepseekClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
    })

    const content = response.choices[0]?.message?.content
    if (!content) {
      return {
        success: false,
        error: 'No content in response',
        provider: 'deepseek',
        model,
      }
    }

    return {
      success: true,
      content,
      provider: 'deepseek',
      model,
    }
  }

  /**
   * Stream completion using specified provider
   * Returns an async generator that yields content chunks
   */
  async* streamCompletion(
    provider: LLMProvider,
    options: LLMCompletionOptions
  ): AsyncGenerator<string, void, unknown> {
    const { prompt, model, temperature = 0.7, maxTokens = 2000 } = options
    const selectedModel = model || this.DEFAULT_MODELS[provider]

    switch (provider) {
      case 'openai':
        yield* this.streamOpenAI(prompt, selectedModel, temperature, maxTokens)
        break
      case 'gemini':
        yield* this.streamGemini(prompt, selectedModel, temperature, maxTokens)
        break
      case 'anthropic':
        yield* this.streamAnthropic(prompt, selectedModel, temperature, maxTokens)
        break
      case 'deepseek':
        yield* this.streamDeepseek(prompt, selectedModel, temperature, maxTokens)
        break
      default:
        throw new Error(`Unsupported provider for streaming: ${provider}`)
    }
  }

  /**
   * Stream completion from OpenAI
   */
  private async* streamOpenAI(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string, void, unknown> {
    if (!this.openaiClient) {
      throw new Error('OpenAI API key not configured')
    }

    const stream = await this.openaiClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }

  /**
   * Stream completion from Anthropic
   */
  private async* streamAnthropic(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string, void, unknown> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic API key not configured')
    }

    const stream = await this.anthropicClient.messages.stream({
      model,
      max_tokens: maxTokens,
      temperature,
      messages: [{ role: 'user', content: prompt }],
    })

    for await (const chunk of stream) {
      if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
        yield chunk.delta.text
      }
    }
  }

  /**
   * Stream completion from Deepseek (OpenAI-compatible)
   */
  private async* streamDeepseek(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string, void, unknown> {
    if (!this.deepseekClient) {
      throw new Error('Deepseek API key not configured')
    }

    const stream = await this.deepseekClient.chat.completions.create({
      model,
      messages: [{ role: 'user', content: prompt }],
      temperature,
      max_tokens: maxTokens,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }

  /**
   * Stream completion from Gemini
   */
  private async* streamGemini(
    prompt: string,
    model: string,
    temperature: number,
    maxTokens: number
  ): AsyncGenerator<string, void, unknown> {
    if (!this.geminiClient) {
      throw new Error('Gemini API key not configured')
    }

    const genModel = this.geminiClient.getGenerativeModel({
      model,
      generationConfig: {
        temperature,
        maxOutputTokens: maxTokens,
      },
    })

    const result = await genModel.generateContentStream(prompt)

    for await (const chunk of result.stream) {
      const text = chunk.text()
      if (text) {
        yield text
      }
    }
  }

  /**
   * Get available providers based on configured API keys
   */
  getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = []
    if (this.openaiClient) providers.push('openai')
    if (this.geminiClient) providers.push('gemini')
    if (this.anthropicClient) providers.push('anthropic')
    if (this.deepseekClient) providers.push('deepseek')
    return providers
  }
}

