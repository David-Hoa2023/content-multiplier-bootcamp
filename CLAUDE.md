# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack idea management application with AI content generation capabilities. Built for "Vibe Coding" course (Week 1: Advanced Backend with Fastify & TypeScript). Features PostgreSQL database, Fastify backend, Next.js frontend, and multi-provider AI integration (OpenAI, Gemini, Anthropic, Deepseek).

## Architecture

### Backend (Fastify + TypeScript)
- **Entry**: `backend/src/index.ts` - Main server (port 4000)
- **Routes**: `backend/src/routes/` - ideas, ai, contentPlans endpoints
- **Services**: `backend/src/services/` - aiService, ideaGenerator, llmClient
- **Database**: PostgreSQL via Docker (port 5433 mapped from 5432)
- **Schemas**: `backend/src/schemas/` - Validation schemas
- **Types**: `backend/src/types.ts` - TypeScript definitions

### Frontend (Next.js 14)
- **Structure**: App Router in `frontend/src/app/`
- **Components**: UI components in `frontend/src/components/ui/` (Radix UI + shadcn pattern)
- **Styling**: TailwindCSS
- **Port**: 3000 (default Next.js)

### Database Schema
- **ideas**: id, title, description, persona, industry, status, created_at
- **content_plans**: id, idea_id (FK), content_type, title, outline, keywords, created_at

## Development Commands

### Initial Setup
```bash
# 1. Start database
docker-compose up -d

# 2. Backend (terminal 1)
cd backend
npm install
npm run dev    # Runs: tsx watch src/index.ts

# 3. Frontend (terminal 2)
cd frontend
npm install
npm run dev    # Next.js dev server
```

### Common Tasks
```bash
# Build backend
cd backend && npm run build    # Runs: tsc

# Build frontend  
cd frontend && npm run build    # Next.js build

# Test AI integration
./test-ai.sh    # Comprehensive AI testing script

# Database operations
docker-compose down       # Stop database
docker-compose down -v    # Stop and remove data
docker ps                 # Check if running
```

## Testing Approach

Manual testing only - no unit test framework. Use:
- `test-ai.sh` for AI integration testing
- curl commands or browser for API testing
- Chrome DevTools for frontend debugging

## API Endpoints

Base URL: `http://localhost:4000`

- `GET /health` - Health check
- `GET /ideas` - List all ideas
- `GET /ideas/:id` - Get single idea
- `POST /ideas` - Create idea
- `PUT /ideas/:id` - Update idea
- `DELETE /ideas/:id` - Delete idea
- `POST /ai/generate-content` - Generate AI content
- `GET /ai/providers` - List available AI providers
- `POST /content-plans` - Create content plan
- `GET /content-plans/idea/:ideaId` - Get plans for idea

## AI Integration

Configure providers in `backend/.env`:
```
OPENAI_API_KEY=sk-...
GOOGLE_API_KEY=...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=...
```

Features:
- Retry logic (3 attempts with exponential backoff)
- Temperature control (0-2)
- Token limits configuration
- Multi-provider fallback support

## Environment Variables

Backend requires `.env` file with:
- `PORT` (default: 4000)
- `DATABASE_URL` or individual DB config
- AI provider API keys (optional)

## Key Libraries

Backend:
- `fastify`, `@fastify/cors`
- `pg` for PostgreSQL
- `openai`, `@anthropic-ai/sdk`, `@google/generative-ai`
- `tsx` for TypeScript development

Frontend:
- Next.js 14, React 18
- `@radix-ui/*` components
- `lucide-react` icons
- `tailwindcss`

## File Structure Patterns

- Backend routes follow pattern: `backend/src/routes/{resource}.ts`
- Frontend components: `frontend/src/components/ui/{component}.tsx`
- Database migrations: `init.sql` at project root
- TypeScript configs separate for backend/frontend