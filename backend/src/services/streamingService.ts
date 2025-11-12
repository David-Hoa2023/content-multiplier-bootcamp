import OpenAI from 'openai'
import { GoogleGenerativeAI } from '@google/generative-ai'
import Anthropic from '@anthropic-ai/sdk'
import dotenv from 'dotenv'
import type { AIProvider } from './aiService'

dotenv.config()

// Initialize AI clients
const openaiClient = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null

const geminiClient = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null

const anthropicClient = process.env.ANTHROPIC_API_KEY
  ? new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })
  : null

const deepseekClient = process.env.DEEPSEEK_API_KEY
  ? new OpenAI({
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: 'https://api.deepseek.com',
    })
  : null

const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-pro',
  anthropic: 'claude-3-5-sonnet-20241022',
  deepseek: 'deepseek-chat',
}

export interface StreamingOptions {
  provider: AIProvider
  model?: string
  temperature?: number
  maxTokens?: number
}

/**
 * Stream completion from OpenAI
 */
export async function* streamOpenAI(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  if (!openaiClient) {
    throw new Error('OpenAI API key not configured')
  }

  const stream = await openaiClient.chat.completions.create({
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
export async function* streamAnthropic(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  if (!anthropicClient) {
    throw new Error('Anthropic API key not configured')
  }

  const stream = await anthropicClient.messages.stream({
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
export async function* streamDeepseek(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  if (!deepseekClient) {
    throw new Error('Deepseek API key not configured')
  }

  const stream = await deepseekClient.chat.completions.create({
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
 * Note: Gemini doesn't support streaming in the same way, so we'll simulate it
 */
export async function* streamGemini(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): AsyncGenerator<string, void, unknown> {
  if (!geminiClient) {
    throw new Error('Gemini API key not configured')
  }

  const genModel = geminiClient.getGenerativeModel({
    model,
    generationConfig: {
      temperature,
      maxOutputTokens: maxTokens,
    },
  })

  // Gemini streaming
  const result = await genModel.generateContentStream(prompt)
  
  for await (const chunk of result.stream) {
    const text = chunk.text()
    if (text) {
      yield text
    }
  }
}

/**
 * Main streaming function
 */
export async function* streamCompletion(
  prompt: string,
  options: StreamingOptions
): AsyncGenerator<string, void, unknown> {
  const {
    provider,
    model = DEFAULT_MODELS[options.provider],
    temperature = 0.7,
    maxTokens = 2000,
  } = options

  switch (provider) {
    case 'openai':
      yield* streamOpenAI(prompt, model, temperature, maxTokens)
      break
    case 'anthropic':
      yield* streamAnthropic(prompt, model, temperature, maxTokens)
      break
    case 'deepseek':
      yield* streamDeepseek(prompt, model, temperature, maxTokens)
      break
    case 'gemini':
      yield* streamGemini(prompt, model, temperature, maxTokens)
      break
    default:
      throw new Error(`Unsupported provider for streaming: ${provider}`)
  }
}

/**
 * Calculate word count from text
 */
export function calculateWordCount(text: string): number {
  if (!text || !text.trim()) return 0
  // Split by whitespace and filter out empty strings
  return text.trim().split(/\s+/).filter(word => word.length > 0).length
}

