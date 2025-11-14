import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { Pool } from 'pg';
import { APIKeyService } from './apiKeyService.js';
import dotenv from 'dotenv';

dotenv.config();

export type AIProvider = 'openai' | 'gemini' | 'anthropic' | 'deepseek';

export interface AIGenerationRequest {
  prompt: string;
  provider: AIProvider;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface AIGenerationResponse {
  success: boolean;
  content?: string;
  error?: string;
  provider: AIProvider;
  model: string;
  tokensUsed?: number;
}

// Database pool for API key service
let dbPool: Pool;
let apiKeyService: APIKeyService;

// Initialize database connection
export function initializeAIService(pool: Pool) {
  dbPool = pool;
  apiKeyService = new APIKeyService(pool);
}

// Dynamic client creation functions
async function getOpenAIClient(): Promise<OpenAI | null> {
  if (!apiKeyService) return null;
  
  const apiKey = process.env.OPENAI_API_KEY || await apiKeyService.getApiKey('openai');
  return apiKey ? new OpenAI({ apiKey }) : null;
}

async function getGeminiClient(): Promise<GoogleGenerativeAI | null> {
  if (!apiKeyService) return null;
  
  const apiKey = process.env.GEMINI_API_KEY || await apiKeyService.getApiKey('gemini');
  return apiKey ? new GoogleGenerativeAI(apiKey) : null;
}

async function getAnthropicClient(): Promise<Anthropic | null> {
  if (!apiKeyService) return null;
  
  const apiKey = process.env.ANTHROPIC_API_KEY || await apiKeyService.getApiKey('anthropic');
  return apiKey ? new Anthropic({ apiKey }) : null;
}

async function getDeepseekClient(): Promise<OpenAI | null> {
  if (!apiKeyService) return null;
  
  const apiKey = process.env.DEEPSEEK_API_KEY || await apiKeyService.getApiKey('deepseek');
  return apiKey ? new OpenAI({
    apiKey,
    baseURL: 'https://api.deepseek.com',
  }) : null;
}

// Default models for each provider
const DEFAULT_MODELS = {
  openai: 'gpt-4o-mini',
  gemini: 'gemini-pro',
  anthropic: 'claude-3-5-sonnet-20241022',
  deepseek: 'deepseek-chat',
};

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes('401')) {
        throw error;
      }

      if (attempt < maxRetries - 1) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`Attempt ${attempt + 1} failed, retrying in ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Max retries reached');
}

/**
 * Call OpenAI API
 */
async function callOpenAI(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<AIGenerationResponse> {
  const openaiClient = await getOpenAIClient();
  
  if (!openaiClient) {
    return {
      success: false,
      error: 'OpenAI API key not configured',
      provider: 'openai',
      model,
    };
  }

  try {
    const response = await withRetry(async () => {
      return await openaiClient.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      });
    });

    return {
      success: true,
      content: response.choices[0]?.message?.content || '',
      provider: 'openai',
      model,
      tokensUsed: response.usage?.total_tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'openai',
      model,
    };
  }
}

/**
 * Call Gemini API
 */
async function callGemini(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<AIGenerationResponse> {
  const geminiClient = await getGeminiClient();
  
  if (!geminiClient) {
    return {
      success: false,
      error: 'Gemini API key not configured',
      provider: 'gemini',
      model,
    };
  }

  try {
    const response = await withRetry(async () => {
      const genModel = geminiClient.getGenerativeModel({
        model,
        generationConfig: {
          temperature,
          maxOutputTokens: maxTokens,
        },
      });

      const result = await genModel.generateContent(prompt);
      return result;
    });

    const text = response.response.text();

    return {
      success: true,
      content: text,
      provider: 'gemini',
      model,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'gemini',
      model,
    };
  }
}

/**
 * Call Anthropic API
 */
async function callAnthropic(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<AIGenerationResponse> {
  const anthropicClient = await getAnthropicClient();
  
  if (!anthropicClient) {
    return {
      success: false,
      error: 'Anthropic API key not configured',
      provider: 'anthropic',
      model,
    };
  }

  try {
    const response = await withRetry(async () => {
      return await anthropicClient.messages.create({
        model,
        max_tokens: maxTokens,
        temperature,
        messages: [{ role: 'user', content: prompt }],
      });
    });

    const content = response.content[0];
    const text = content.type === 'text' ? content.text : '';

    return {
      success: true,
      content: text,
      provider: 'anthropic',
      model,
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'anthropic',
      model,
    };
  }
}

/**
 * Call Deepseek API (OpenAI-compatible)
 */
async function callDeepseek(
  prompt: string,
  model: string,
  temperature: number,
  maxTokens: number
): Promise<AIGenerationResponse> {
  const deepseekClient = await getDeepseekClient();
  
  if (!deepseekClient) {
    return {
      success: false,
      error: 'Deepseek API key not configured',
      provider: 'deepseek',
      model,
    };
  }

  try {
    const response = await withRetry(async () => {
      return await deepseekClient.chat.completions.create({
        model,
        messages: [{ role: 'user', content: prompt }],
        temperature,
        max_tokens: maxTokens,
      });
    });

    return {
      success: true,
      content: response.choices[0]?.message?.content || '',
      provider: 'deepseek',
      model,
      tokensUsed: response.usage?.total_tokens,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      provider: 'deepseek',
      model,
    };
  }
}

/**
 * Main AI generation function
 */
export async function generateContent(
  request: AIGenerationRequest
): Promise<AIGenerationResponse> {
  const {
    prompt,
    provider,
    model = DEFAULT_MODELS[provider],
    temperature = 0.7,
    maxTokens = 2000,
  } = request;

  console.log(`Generating content with ${provider} (${model})...`);

  switch (provider) {
    case 'openai':
      return callOpenAI(prompt, model, temperature, maxTokens);
    case 'gemini':
      return callGemini(prompt, model, temperature, maxTokens);
    case 'anthropic':
      return callAnthropic(prompt, model, temperature, maxTokens);
    case 'deepseek':
      return callDeepseek(prompt, model, temperature, maxTokens);
    default:
      return {
        success: false,
        error: `Unknown provider: ${provider}`,
        provider,
        model,
      };
  }
}

/**
 * Get available providers (based on configured API keys)
 */
export async function getAvailableProviders(): Promise<AIProvider[]> {
  if (!apiKeyService) return [];
  
  const providers: AIProvider[] = [];
  const activeProviders = await apiKeyService.getActiveProviders();

  // Check both environment variables and database
  if (process.env.OPENAI_API_KEY || activeProviders.includes('openai')) {
    providers.push('openai');
  }
  if (process.env.GEMINI_API_KEY || activeProviders.includes('gemini')) {
    providers.push('gemini');
  }
  if (process.env.ANTHROPIC_API_KEY || activeProviders.includes('anthropic')) {
    providers.push('anthropic');
  }
  if (process.env.DEEPSEEK_API_KEY || activeProviders.includes('deepseek')) {
    providers.push('deepseek');
  }

  return providers;
}

/**
 * Get available models for a provider
 */
export function getAvailableModels(provider: AIProvider): string[] {
  const models: Record<AIProvider, string[]> = {
    openai: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-3.5-turbo'],
    gemini: ['gemini-pro', 'gemini-1.5-flash', 'gemini-1.5-pro'],
    anthropic: [
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
    ],
    deepseek: ['deepseek-chat', 'deepseek-coder'],
  };

  return models[provider] || [];
}
