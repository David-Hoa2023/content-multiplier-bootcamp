import { LLMClient, LLMProvider } from './llmClient'
import { validateIdeasJSON, IdeaItem } from '../schemas/ideaSchema'

/**
 * Generate ideas with retry logic and exponential backoff
 */
export class IdeaGenerator {
  private llmClient: LLMClient
  private readonly MAX_RETRIES = 3

  constructor(llmClient: LLMClient) {
    this.llmClient = llmClient
  }

  /**
   * Generate 10 content ideas for a persona in an industry
   * Retries up to 3 times with exponential backoff if JSON validation fails
   */
  async generateIdeas(
    persona: string,
    industry: string,
    provider: LLMProvider = 'openai'
  ): Promise<{
    success: boolean
    ideas?: IdeaItem[]
    error?: string
    attempts?: number
  }> {
    // Build prompt template
    const prompt = this.buildPrompt(persona, industry)

    let lastError: string | undefined
    let attempts = 0

    // Retry loop with exponential backoff
    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      attempts = attempt

      try {
        // Call LLM
        const response = await this.llmClient.generateCompletion(provider, {
          prompt,
          temperature: 0.7,
          maxTokens: 2000,
        })

        if (!response.success || !response.content) {
          lastError = response.error || 'Failed to generate content'
          // Exponential backoff: wait 1s, 2s, 4s
          if (attempt < this.MAX_RETRIES) {
            await this.sleep(Math.pow(2, attempt - 1) * 1000)
          }
          continue
        }

        // Validate JSON response
        const validation = validateIdeasJSON(response.content)

        if (validation.valid && validation.ideas) {
          return {
            success: true,
            ideas: validation.ideas,
            attempts: attempt,
          }
        }

        // JSON validation failed - retry with exponential backoff
        lastError = validation.error || 'Invalid JSON format'
        console.log(`Attempt ${attempt} failed: ${lastError}`)

        if (attempt < this.MAX_RETRIES) {
          // Exponential backoff: wait 1s, 2s, 4s
          const waitTime = Math.pow(2, attempt - 1) * 1000
          console.log(`Retrying in ${waitTime}ms...`)
          await this.sleep(waitTime)
        }
      } catch (error) {
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.error(`Attempt ${attempt} error:`, lastError)

        if (attempt < this.MAX_RETRIES) {
          await this.sleep(Math.pow(2, attempt - 1) * 1000)
        }
      }
    }

    // All retries failed
    return {
      success: false,
      error: `Failed after ${attempts} attempts. Last error: ${lastError}`,
      attempts,
    }
  }

  /**
   * Build prompt template for idea generation
   */
  private buildPrompt(persona: string, industry: string): string {
    return `Generate 10 content ideas for a ${persona} in ${industry}.

Format your response as a JSON array with exactly 10 items. Each item must have:
- title: A concise, engaging title for the content idea
- description: A detailed description (2-3 sentences) explaining what the content will cover
- rationale: The reasoning behind why this content would be valuable for the target persona

Important:
- Return ONLY valid JSON, no markdown formatting
- The JSON should be an array of objects: [{title, description, rationale}, ...]
- Include exactly 10 ideas, no more, no less
- Make ideas creative, practical, and relevant to ${persona} in ${industry}

Example format:
[
  {
    "title": "How to...",
    "description": "This content will...",
    "rationale": "This is valuable because..."
  },
  ...
]`
  }

  /**
   * Sleep utility for exponential backoff
   */
  private sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

