import { FastifyInstance } from 'fastify';
import pool from '../db';
import { CreateIdeaInput, UpdateIdeaInput } from '../types';
import { LLMClient, LLMProvider } from '../services/llmClient';
import { IdeaGenerator } from '../services/ideaGenerator';

export async function ideaRoutes(fastify: FastifyInstance) {
  // GET all ideas
  fastify.get('/ideas', async (request, reply) => {
    try {
      const result = await pool.query(
        'SELECT * FROM ideas ORDER BY created_at DESC'
      );
      return { success: true, data: result.rows };
    } catch (error) {
      console.error('Error fetching ideas:', error);
      reply.status(500).send({ success: false, error: 'Failed to fetch ideas' });
    }
  });

  // GET single idea by ID
  fastify.get<{ Params: { id: string } }>('/ideas/:id', async (request, reply) => {
    try {
      const { id } = request.params;
      const result = await pool.query('SELECT * FROM ideas WHERE id = $1', [id]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Idea not found' });
      }

      return { success: true, data: result.rows[0] };
    } catch (error) {
      console.error('Error fetching idea:', error);
      reply.status(500).send({ success: false, error: 'Failed to fetch idea' });
    }
  });

  // POST create new idea
  fastify.post<{ Body: CreateIdeaInput }>('/ideas', async (request, reply) => {
    try {
      let { title, description, persona, industry, status } = request.body;

      if (!title) {
        return reply.status(400).send({ success: false, error: 'Title is required' });
      }

      // Truncate fields to match database limits
      title = title.trim().substring(0, 500);
      if (persona) persona = persona.trim().substring(0, 200);
      if (industry) industry = industry.trim().substring(0, 200);

      const result = await pool.query(
        `INSERT INTO ideas (title, description, persona, industry, status)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING *`,
        [title, description || null, persona || null, industry || null, status || 'draft']
      );

      reply.status(201).send({ success: true, data: result.rows[0] });
    } catch (error) {
      console.error('Error creating idea:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to create idea';
      
      // Provide more specific error message for VARCHAR limit errors
      if (errorMessage.includes('value too long') || errorMessage.includes('character varying')) {
        return reply.status(400).send({ 
          success: false, 
          error: 'One or more fields exceed the maximum length. Title: 500 chars, Persona: 200 chars, Industry: 200 chars' 
        });
      }
      
      reply.status(500).send({ success: false, error: errorMessage });
    }
  });

  // PUT update idea
  fastify.put<{ Params: { id: string }; Body: UpdateIdeaInput }>(
    '/ideas/:id',
    async (request, reply) => {
      try {
        const { id } = request.params;
        const { title, description, persona, industry, status } = request.body;

        // Check if idea exists
        const checkResult = await pool.query('SELECT * FROM ideas WHERE id = $1', [id]);
        if (checkResult.rows.length === 0) {
          return reply.status(404).send({ success: false, error: 'Idea not found' });
        }

        const result = await pool.query(
          `UPDATE ideas
           SET title = COALESCE($1, title),
               description = COALESCE($2, description),
               persona = COALESCE($3, persona),
               industry = COALESCE($4, industry),
               status = COALESCE($5, status)
           WHERE id = $6
           RETURNING *`,
          [title, description, persona, industry, status, id]
        );

        return { success: true, data: result.rows[0] };
      } catch (error) {
        console.error('Error updating idea:', error);
        reply.status(500).send({ success: false, error: 'Failed to update idea' });
      }
    }
  );

  // DELETE idea
  fastify.delete<{ Params: { id: string } }>('/ideas/:id', async (request, reply) => {
    try {
      const { id } = request.params;

      const result = await pool.query('DELETE FROM ideas WHERE id = $1 RETURNING *', [id]);

      if (result.rows.length === 0) {
        return reply.status(404).send({ success: false, error: 'Idea not found' });
      }

      return { success: true, message: 'Idea deleted successfully', data: result.rows[0] };
    } catch (error) {
      console.error('Error deleting idea:', error);
      reply.status(500).send({ success: false, error: 'Failed to delete idea' });
    }
  });

  // POST generate ideas using AI
  fastify.post<{
    Body: {
      persona: string;
      industry: string;
      provider?: LLMProvider;
    };
  }>('/ideas/generate', async (request, reply) => {
    try {
      const { persona, industry, provider = 'openai' } = request.body;

      // Validation
      if (!persona || !persona.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Persona is required',
        });
      }

      if (!industry || !industry.trim()) {
        return reply.status(400).send({
          success: false,
          error: 'Industry is required',
        });
      }

      // Initialize LLM client and generator
      const llmClient = new LLMClient();
      const availableProviders = llmClient.getAvailableProviders();

      // Check if any provider is available
      if (availableProviders.length === 0) {
        return reply.status(400).send({
          success: false,
          error: 'No AI providers configured. Please add at least one API key to .env file. Required: OPENAI_API_KEY, GEMINI_API_KEY, ANTHROPIC_API_KEY, or DEEPSEEK_API_KEY',
          hint: 'Create a .env file in the backend directory with your API key(s)',
        });
      }

      // Auto-select provider: use requested provider if available, otherwise use first available provider
      // Priority order: openai -> deepseek -> gemini -> anthropic
      const priorityOrder: LLMProvider[] = ['openai', 'deepseek', 'gemini', 'anthropic'];
      let selectedProvider = provider;

      if (!availableProviders.includes(provider)) {
        // Find first available provider in priority order
        selectedProvider = priorityOrder.find(p => availableProviders.includes(p)) || availableProviders[0];
        console.log(`⚠️ Provider '${provider}' not available. Auto-selecting '${selectedProvider}' from available providers: ${availableProviders.join(', ')}`);
      }

      const generator = new IdeaGenerator(llmClient);

      // Generate ideas with retry logic
      console.log(`Generating ideas for ${persona} in ${industry} using ${selectedProvider}...`);
      const result = await generator.generateIdeas(persona.trim(), industry.trim(), selectedProvider);

      if (!result.success || !result.ideas) {
        return reply.status(500).send({
          success: false,
          error: result.error || 'Failed to generate ideas',
          attempts: result.attempts,
        });
      }

      // Save ideas to database
      const savedIdeas: any[] = [];
      const errors: any[] = [];

      for (const idea of result.ideas) {
        try {
          // Truncate fields to match database limits
          const truncatedTitle = idea.title.substring(0, 500);
          const truncatedPersona = persona.trim().substring(0, 200);
          const truncatedIndustry = industry.trim().substring(0, 200);
          
          const dbResult = await pool.query(
            `INSERT INTO ideas (title, description, persona, industry, status)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING *`,
            [
              truncatedTitle,
              `${idea.description}\n\nRationale: ${idea.rationale}`,
              truncatedPersona,
              truncatedIndustry,
              'draft',
            ]
          );
          savedIdeas.push(dbResult.rows[0]);
        } catch (error) {
          console.error('Error saving idea:', error);
          errors.push({
            title: idea.title.substring(0, 100),
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return {
        success: true,
        data: {
          generated: result.ideas.length,
          saved: savedIdeas.length,
          failed: errors.length,
          ideas: savedIdeas,
          errors: errors.length > 0 ? errors : undefined,
        },
        provider: selectedProvider,
        requestedProvider: provider,
        attempts: result.attempts,
      };
    } catch (error) {
      console.error('Error generating ideas:', error);
      reply.status(500).send({
        success: false,
        error: error instanceof Error ? error.message : 'Failed to generate ideas',
      });
    }
  });
}
