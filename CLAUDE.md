# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Full-stack idea management application with multi-platform content distribution and AI integration. Built for "Vibe Coding" course (Week 1: Advanced Backend with Fastify & TypeScript). Features comprehensive platform integration system with authentication, content optimization, and automated publishing across social media, email, and CMS platforms.

## Architecture

### Backend (Fastify + TypeScript)
- **Entry**: `backend/src/index.ts` - Main server (port 4000)
- **Routes**: `backend/src/routes/` - ideas, ai, contentPlans, platforms, derivatives
- **Services**: `backend/src/services/` - aiService, ideaGenerator, llmClient
- **Platforms**: `backend/src/platforms/` - Multi-platform integration system
- **Database**: PostgreSQL via Docker (port 5433 mapped from 5432)
- **Schemas**: `backend/src/schemas/` - Validation schemas
- **Types**: `backend/src/types.ts` - TypeScript definitions

### Platform Integration System
- **Base Architecture**: Abstract `BasePlatform` class with standardized interface
- **Supported Platforms**: 7 platforms across 3 categories
  - **Social Media**: Twitter, Facebook, LinkedIn, Instagram, TikTok  
  - **Email Marketing**: MailChimp
  - **Content Management**: WordPress
- **Authentication**: Platform-specific credential management with encryption
- **Content Optimization**: Automatic formatting per platform requirements
- **Analytics**: Performance tracking and engagement metrics

### Frontend (Next.js 14)
- **Structure**: App Router in `frontend/src/app/`
- **Components**: UI components in `frontend/src/components/ui/` (Radix UI + shadcn pattern)
- **Styling**: TailwindCSS
- **Port**: 3000 (default Next.js)

### Database Schema
- **ideas**: id, title, description, persona, industry, status, created_at
- **content_plans**: id, idea_id (FK), content_type, title, outline, keywords, created_at
- **platform_configurations**: id, user_id, platform_type, platform_name, configuration, credentials, is_active, is_connected
- **derivatives**: id, pack_id, content_plan_id, platform, content, character_count, hashtags, mentions, status, scheduled_at
- **platform_analytics**: id, platform_config_id, derivative_id, event_type, occurred_at, metadata

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

# Test platform integration
curl http://localhost:4000/platforms/supported    # Get all platforms
curl http://localhost:4000/platforms/configurations    # List configured platforms
curl -H "Content-Type: application/json" -d '{"platform_type":"twitter","credentials":{"apiKey":"test"}}' http://localhost:4000/platforms/test-connection

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

### Core Content Management
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

### Platform Integration
- `GET /platforms/supported` - List all supported platforms with capabilities
- `GET /platforms/configurations` - Get user's platform configurations
- `POST /platforms/configurations` - Create new platform configuration
- `PUT /platforms/configurations/:id` - Update platform configuration
- `DELETE /platforms/configurations/:id` - Delete platform configuration
- `POST /platforms/test-connection` - Test platform credentials
- `POST /platforms/configurations/:id/test` - Test existing configuration
- `GET /platforms/analytics` - Get platform performance analytics

### Content Distribution
- `GET /derivatives` - List all content derivatives
- `POST /derivatives` - Generate platform-specific content derivatives
- `PUT /derivatives/:id` - Update derivative content
- `POST /derivatives/:id/schedule` - Schedule content for publishing
- `POST /derivatives/:id/publish` - Publish content immediately

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

## Platform Integration Features

### Authentication System
Each platform requires specific credentials:
- **Twitter**: API Key, Secret, Access Token, Access Token Secret
- **Facebook**: App ID, App Secret, Access Token, Page ID  
- **LinkedIn**: Client ID, Client Secret, Access Token
- **Instagram**: App ID, App Secret, Access Token, User ID
- **TikTok**: App ID, App Secret, Access Token
- **MailChimp**: API Key, Server Prefix
- **WordPress**: Site URL, Username, Application Password

### Content Optimization
- **Character Limits**: Platform-specific (Twitter: 280, LinkedIn: 3000, etc.)
- **Hashtag Integration**: Automatic hashtag addition per platform style
- **Media Support**: Platform capabilities for images/videos
- **Content Formatting**: Optimized for each platform's audience

### Publishing Workflow
1. **Create Ideas** → Generate content plans
2. **Generate Derivatives** → Platform-optimized content versions  
3. **Schedule Publishing** → Automated posting across platforms
4. **Track Analytics** → Performance metrics and engagement data

## Environment Variables

Backend requires `.env` file with:
- `PORT` (default: 4000)
- `DATABASE_URL` or individual DB config  
- AI provider API keys (optional)
- Platform API credentials (configured via UI)

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