import Fastify from 'fastify';
import cors from '@fastify/cors';
import { Pool } from 'pg';
import dotenv from 'dotenv';

// Extend Fastify instance with database pool
declare module 'fastify' {
  interface FastifyInstance {
    db: Pool;
  }
}
import { ideaRoutes } from './routes/ideas';
import { aiRoutes } from './routes/ai';
import { contentPlanRoutes } from './routes/contentPlans';
import { packRoutes } from './routes/packs';
import { documentRoutes } from './routes/documents';
import { briefRoutes } from './routes/briefs';
import derivativesRoutes from './routes/derivatives';
import platformRoutes from './routes/platforms';
import { knowledgeRoutes } from './routes/knowledge';
import apiKeyRoutes from './routes/apiKeys';
import analyticsRoutes from './routes/analytics';
import { getAvailableProviders, initializeAIService } from './services/aiService';
import pool from './db';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

// Add database pool to fastify instance
fastify.decorate('db', pool);

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start() {
  try {
    // Register CORS
    const allowedOrigins = [
      process.env.FRONTEND_ORIGIN,
      process.env.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:3001',
    ].filter(Boolean) // Remove undefined values

    await fastify.register(cors, {
      origin: (origin, cb) => {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) {
          cb(null, true)
          return
        }
        
        // Check if origin matches allowed origins or Vercel preview deployments
        if (
          allowedOrigins.some(allowed => origin.startsWith(allowed as string)) ||
          origin.match(/\.vercel\.app$/) ||
          origin.includes('localhost')
        ) {
          cb(null, true)
        } else if (process.env.NODE_ENV === 'development') {
          // Allow all origins in development
          cb(null, true)
        } else {
          cb(new Error('Not allowed by CORS'), false)
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    });

    // Health check endpoint
    fastify.get('/health', async () => {
      return { status: 'ok', timestamp: new Date().toISOString() };
    });

    // Register routes
    await fastify.register(ideaRoutes);
    await fastify.register(aiRoutes);
    await fastify.register(contentPlanRoutes);
    await fastify.register(packRoutes);
    await fastify.register(documentRoutes);
    await fastify.register(briefRoutes);
    await fastify.register(derivativesRoutes);
    await fastify.register(platformRoutes);
    await fastify.register(knowledgeRoutes);
    await fastify.register(apiKeyRoutes, { prefix: '/api/api-keys' });
    await fastify.register(analyticsRoutes);

    // Test database connection (non-blocking)
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');
      
      // Initialize AI service with database pool
      initializeAIService(pool);
      console.log('✅ AI service initialized');
      
    } catch (dbError) {
      console.warn('⚠️  Database connection failed:', dbError instanceof Error ? dbError.message : 'Unknown error');
      console.warn('⚠️  Server will start but database operations will fail');
      console.warn('⚠️  Please ensure Docker Desktop is running and database is started: docker-compose up -d');
    }

    // Start server
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
  } catch (error) {
    console.error('❌ Error starting server:', error);
    process.exit(1);
  }
}

start();
