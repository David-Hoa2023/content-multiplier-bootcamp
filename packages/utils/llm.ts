/**
 * LLM utility types and interfaces
 */

export interface LLMParams {
  model?: string
  temperature?: number
  max_tokens?: number
  top_p?: number
  frequency_penalty?: number
  presence_penalty?: number
  stop?: string[]
  stream?: boolean
  response_format?: { type: 'json_object' | 'text' }
  system?: string
  user?: string
  messages?: LLMMessage[]
  jsonSchema?: any
}

export interface LLMMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface LLMClient {
  generate?(params: {
    messages: LLMMessage[]
    model?: string
    temperature?: number
    max_tokens?: number
  }): Promise<string>
  
  generateJSON?(params: {
    messages: LLMMessage[]
    model?: string
    temperature?: number
  }): Promise<any>
  
  completeJSON?(params: LLMParams): Promise<any>
  
  embed(input: string | string[], model?: string): Promise<number[] | number[][]>
}

export interface LLMProvider {
  name: string
  apiKey: string
  baseURL?: string
  models: {
    json: string
    embedding: string
  }
}

export function createLLMClient(_provider: LLMProvider): LLMClient {
  throw new Error('Not implemented - use apps/api/src/services/llm.ts instead')
}

