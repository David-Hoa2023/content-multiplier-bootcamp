import Fastify from 'fastify';
import cors from '@fastify/cors';
import dotenv from 'dotenv';
import { ideaRoutes } from './routes/ideas';
import { aiRoutes } from './routes/ai';
import { contentPlanRoutes } from './routes/contentPlans';
import { packRoutes } from './routes/packs';
import { documentRoutes } from './routes/documents';
import { briefRoutes } from './routes/briefs';
import { getAvailableProviders } from './services/aiService';
import pool from './db';

dotenv.config();

const fastify = Fastify({
  logger: true,
});

const PORT = parseInt(process.env.PORT || '4000', 10);

async function start() {
  try {
    // Register CORS
    await fastify.register(cors, {
      origin: true, // Allow all origins in development
      credentials: true,
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

    // Test database connection (non-blocking)
    try {
      await pool.query('SELECT NOW()');
      console.log('✅ Database connection successful');
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
