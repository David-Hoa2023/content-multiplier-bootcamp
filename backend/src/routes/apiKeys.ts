import { FastifyInstance } from 'fastify';
import { APIKeyService, APIKeyData } from '../services/apiKeyService.js';

const apiKeyRoutes = async (fastify: FastifyInstance) => {
  const apiKeyService = new APIKeyService(fastify.db);

  // Get all API key configurations (without actual keys)
  fastify.get('/', async (request, reply) => {
    try {
      const apiKeys = await apiKeyService.getAllApiKeys();
      return reply.code(200).send(apiKeys);
    } catch (error) {
      console.error('Error fetching API keys:', error);
      return reply.code(500).send({ error: 'Failed to fetch API keys' });
    }
  });

  // Get active providers
  fastify.get('/providers', async (request, reply) => {
    try {
      const providers = await apiKeyService.getActiveProviders();
      return reply.code(200).send({ providers });
    } catch (error) {
      console.error('Error fetching active providers:', error);
      return reply.code(500).send({ error: 'Failed to fetch active providers' });
    }
  });

  // Store or update API key
  fastify.post('/', {
    schema: {
      body: {
        type: 'object',
        required: ['provider_name', 'api_key'],
        properties: {
          provider_name: { type: 'string', enum: ['openai', 'gemini', 'anthropic', 'deepseek'] },
          api_key: { type: 'string', minLength: 10 },
          is_active: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const keyData = request.body as APIKeyData;
      const result = await apiKeyService.storeApiKey(keyData);
      
      // Return result without the encrypted key
      const { api_key_encrypted, ...safeResult } = result;
      
      return reply.code(200).send({
        success: true,
        message: 'API key stored successfully',
        data: safeResult
      });
    } catch (error) {
      console.error('Error storing API key:', error);
      return reply.code(500).send({ error: 'Failed to store API key' });
    }
  });

  // Update API key status
  fastify.put('/:provider/status', {
    schema: {
      params: {
        type: 'object',
        properties: {
          provider: { type: 'string' }
        },
        required: ['provider']
      },
      body: {
        type: 'object',
        required: ['is_active'],
        properties: {
          is_active: { type: 'boolean' }
        }
      }
    }
  }, async (request, reply) => {
    try {
      const { provider } = request.params as { provider: string };
      const { is_active } = request.body as { is_active: boolean };
      
      const success = await apiKeyService.updateApiKeyStatus(provider, is_active);
      
      if (!success) {
        return reply.code(404).send({ error: 'API key not found' });
      }
      
      return reply.code(200).send({
        success: true,
        message: `API key ${is_active ? 'activated' : 'deactivated'} successfully`
      });
    } catch (error) {
      console.error('Error updating API key status:', error);
      return reply.code(500).send({ error: 'Failed to update API key status' });
    }
  });

  // Delete API key
  fastify.delete('/:provider', {
    schema: {
      params: {
        type: 'object',
        properties: {
          provider: { type: 'string' }
        },
        required: ['provider']
      }
    }
  }, async (request, reply) => {
    try {
      const { provider } = request.params as { provider: string };
      
      const success = await apiKeyService.deleteApiKey(provider);
      
      if (!success) {
        return reply.code(404).send({ error: 'API key not found' });
      }
      
      return reply.code(200).send({
        success: true,
        message: 'API key deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting API key:', error);
      return reply.code(500).send({ error: 'Failed to delete API key' });
    }
  });

  // Test API key connection
  fastify.post('/:provider/test', {
    schema: {
      params: {
        type: 'object',
        properties: {
          provider: { type: 'string' }
        },
        required: ['provider']
      }
    }
  }, async (request, reply) => {
    try {
      const { provider } = request.params as { provider: string };
      
      // Check if API key exists and is active
      const hasKey = await apiKeyService.hasActiveApiKey(provider);
      
      if (!hasKey) {
        return reply.code(404).send({ 
          success: false,
          error: 'No active API key found for this provider' 
        });
      }

      // Get the actual API key for testing
      const apiKey = await apiKeyService.getApiKey(provider);
      
      if (!apiKey) {
        return reply.code(404).send({ 
          success: false,
          error: 'Failed to retrieve API key' 
        });
      }

      // TODO: Implement actual API testing for each provider
      // For now, just return success if key exists
      return reply.code(200).send({
        success: true,
        message: 'API key is configured and ready for testing',
        provider: provider,
        hasKey: true
      });
      
    } catch (error) {
      console.error('Error testing API key:', error);
      return reply.code(500).send({ 
        success: false,
        error: 'Failed to test API key' 
      });
    }
  });
};

export default apiKeyRoutes;