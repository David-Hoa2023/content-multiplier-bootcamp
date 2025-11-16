import { FastifyInstance } from 'fastify';
import {
  generateContent,
  getAvailableProviders,
  getAvailableModels,
  AIProvider,
} from '../services/aiService';

export async function aiRoutes(fastify: FastifyInstance) {
  // GET available AI providers
  fastify.get('/ai/providers', async (request, reply) => {
    try {
      const providers = await getAvailableProviders();
      return {
        success: true,
        data: providers,
        message:
          providers.length === 0
            ? 'No AI providers configured. Please add API keys to .env file.'
            : `${providers.length} provider(s) available`,
      };
    } catch (error) {
      console.error('Error fetching providers:', error);
      return reply.status(500).send({ success: false, error: 'Failed to fetch providers' });
    }
  });

  // GET available models for a provider
  fastify.get<{ Params: { provider: string } }>(
    '/ai/providers/:provider/models',
    async (request, reply) => {
      try {
        const { provider } = request.params;
        const models = getAvailableModels(provider as AIProvider);

        if (models.length === 0) {
          return reply.status(404).send({
            success: false,
            error: `Unknown provider: ${provider}`,
          });
        }

        return {
          success: true,
          data: models,
          provider,
        };
      } catch (error) {
        console.error('Error fetching models:', error);
        return reply.status(500).send({ success: false, error: 'Failed to fetch models' });
      }
    }
  );

  // POST generate content
  fastify.post<{
    Body: {
      prompt: string;
      provider: AIProvider;
      model?: string;
      temperature?: number;
      maxTokens?: number;
    };
  }>('/ai/generate', async (request, reply) => {
    try {
      const { prompt, provider, model, temperature, maxTokens } = request.body;

      // Validation
      if (!prompt || !prompt.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Prompt is required',
        });
      }

      if (!provider) {
        return reply.status(400).send({
          success: false,
          error: 'Provider is required',
        });
      }

      const availableProviders = await getAvailableProviders();
      if (!availableProviders.includes(provider)) {
        return reply.status(400).send({
          success: false,
          error: `Provider '${provider}' is not available or not configured`,
          availableProviders,
        });
      }

      // Temperature validation
      if (temperature !== undefined && (temperature < 0 || temperature > 2)) {
        return reply.status(400).send({
          success: false,
          error: 'Temperature must be between 0 and 2',
        });
      }

      // Generate content
      const startTime = Date.now();
      const result = await generateContent({
        prompt,
        provider,
        model,
        temperature,
        maxTokens,
      });

      const duration = Date.now() - startTime;

      if (!result.success) {
        return reply.status(500).send({
          success: false,
          error: result.error,
          provider: result.provider,
          model: result.model,
        });
      }

      return {
        success: true,
        data: {
          content: result.content,
          provider: result.provider,
          model: result.model,
          tokensUsed: result.tokensUsed,
          duration: `${duration}ms`,
        },
      };
    } catch (error) {
      console.error('Error generating content:', error);
      return reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate content',
      });
    }
  });

  // POST generate idea content - Convenience endpoint with RAG integration
  fastify.post<{
    Body: {
      title: string;
      persona?: string;
      industry?: string;
      provider?: AIProvider;
      model?: string;
      temperature?: number;
      useKnowledgeBase?: boolean;
      knowledgeQuery?: string;
    };
  }>('/ai/generate-idea', async (request, reply) => {
    try {
      const { title, persona, industry, provider, model, temperature, useKnowledgeBase, knowledgeQuery } = request.body;

      if (!title || !title.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Title is required',
        });
      }

      // Auto-select provider if not provided or not available
      const availableProviders = await getAvailableProviders();
      if (availableProviders.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'No AI providers configured. Please add at least one API key to .env file.',
        });
      }

      // Priority order: openai -> deepseek -> gemini -> anthropic
      const priorityOrder: AIProvider[] = ['openai', 'deepseek', 'gemini', 'anthropic'];
      const requestedProvider = provider || 'openai';
      let selectedProvider = requestedProvider;

      if (!availableProviders.includes(requestedProvider)) {
        selectedProvider = priorityOrder.find(p => availableProviders.includes(p)) || availableProviders[0];
        console.log(`⚠️ Provider '${requestedProvider}' not available. Auto-selecting '${selectedProvider}'`);
      }

      // Get RAG context if requested
      let ragContext = '';
      let ragResults: any[] = [];
      if (useKnowledgeBase) {
        try {
          const query = knowledgeQuery || title;
          const ragResponse = await fetch('http://localhost:4000/api/knowledge/query', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              query,
              limit: 5,
              similarity_threshold: 0.7
            })
          });
          
          const ragData = await ragResponse.json() as any;
          if (ragData.success && ragData.data.results.length > 0) {
            ragResults = ragData.data.results;
            ragContext = '\n\n--- Relevant Context from Knowledge Base ---\n';
            ragResults.forEach((result, index) => {
              ragContext += `\n[Source ${index + 1}: ${result.document.title}]\n`;
              ragContext += `${result.chunk_text}\n`;
            });
            ragContext += '\n--- End of Context ---\n\n';
          }
        } catch (error) {
          console.warn('Failed to fetch RAG context:', error);
          // Continue without RAG context
        }
      }

      // Build prompt for idea generation with optional RAG context
      let prompt = `Generate a detailed content idea description for the following:\n\n`;
      prompt += `Title: ${title}\n`;
      if (persona) prompt += `Target Persona: ${persona}\n`;
      if (industry) prompt += `Industry: ${industry}\n`;
      
      if (ragContext) {
        prompt += ragContext;
        prompt += `Please use the relevant information from the knowledge base context above to inform your response. `;
      }
      
      prompt += `\nPlease provide:\n`;
      prompt += `1. A compelling description (2-3 sentences)\n`;
      prompt += `2. Key talking points or content pillars\n`;
      prompt += `3. Suggested content format or approach\n`;
      
      if (ragContext) {
        prompt += `4. How the context from knowledge base can be leveraged\n`;
      }
      
      prompt += `\nKeep it concise and actionable.`;

      // Try providers with automatic fallback on failure
      let result = await generateContent({
        prompt,
        provider: selectedProvider,
        model,
        temperature: temperature || 0.7,
        maxTokens: ragContext ? 750 : 500,
      });

      // If first provider fails, try fallback providers
      if (!result.success) {
        console.log(`⚠️ Provider '${selectedProvider}' failed: ${result.error}. Trying fallback providers...`);

        const fallbackProviders = availableProviders.filter(p => p !== selectedProvider);
        for (const fallbackProvider of fallbackProviders) {
          console.log(`🔄 Trying fallback provider: ${fallbackProvider}`);
          result = await generateContent({
            prompt,
            provider: fallbackProvider,
            temperature: temperature || 0.7,
            maxTokens: ragContext ? 750 : 500,
          });

          if (result.success) {
            console.log(`✅ Fallback provider '${fallbackProvider}' succeeded`);
            selectedProvider = fallbackProvider;
            break;
          }
          console.log(`⚠️ Fallback provider '${fallbackProvider}' also failed: ${result.error}`);
        }
      }

      if (!result.success) {
        return reply.status(500).send({
          success: false,
          error: `All providers failed. Last error: ${result.error}`,
        });
      }

      return {
        success: true,
        data: {
          description: result.content,
          provider: result.provider,
          model: result.model,
          ragContext: ragResults.length > 0 ? ragResults : undefined,
          knowledgeUsed: ragResults.length > 0,
        },
        requestedProvider: requestedProvider,
        usedProvider: selectedProvider,
      };
    } catch (error) {
      console.error('Error generating idea:', error);
      return reply.status(500).send({
        success: false,
        error: 'Failed to generate idea content',
      });
    }
  });
}
