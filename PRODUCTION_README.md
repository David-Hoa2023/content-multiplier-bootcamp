# 🚀 Content Multiplier - Production Ready

> AI-powered content creation and multi-platform distribution system

## 📸 Screenshot

[Add screenshots of your deployed application here]

## 🌟 Features

- **🤖 AI Content Generation**: Create ideas and content with OpenAI, Anthropic, Gemini
- **📚 Knowledge Base**: RAG-powered document search with pgvector
- **🎯 Multi-Platform Publishing**: Twitter, LinkedIn, Facebook, Instagram, TikTok
- **📊 Analytics Dashboard**: Track content performance across platforms
- **⚡ Real-time Streaming**: Live AI content generation
- **🎨 Modern UI**: Clean, responsive design with dark/light mode
- **🔒 Secure**: Environment-based configuration with proper CORS

## 🛠️ Tech Stack

### Frontend (Cloudflare Pages)
- **Framework**: Next.js 14 with App Router
- **UI**: Radix UI + Tailwind CSS
- **State Management**: React Hooks + Context
- **Deployment**: Cloudflare Pages

### Backend (Railway)
- **Framework**: Fastify + TypeScript
- **Database**: PostgreSQL with pgvector for RAG
- **AI Integration**: OpenAI, Anthropic, Gemini, Deepseek
- **File Processing**: PDF, DOCX, TXT, MD support
- **Deployment**: Railway with Docker

## 🚀 Live Demo

- **Frontend**: [https://your-app.pages.dev](https://your-app.pages.dev)
- **API Documentation**: [https://your-backend.railway.app/health](https://your-backend.railway.app/health)

## 📋 Quick Start (Local Development)

### Prerequisites
- Node.js 18+
- PostgreSQL 15+ with pgvector
- Docker (optional)

### 1. Clone Repository
```bash
git clone https://github.com/David-Hoa2023/content-multiplier-bootcamp
cd content-multiplier-bootcamp/idea-management-app
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Configure your environment variables
npm run build
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
cp .env.example .env.local
# Set NEXT_PUBLIC_API_URL=http://localhost:4000
npm run dev
```

### 4. Database Setup
```bash
# Run Docker PostgreSQL with pgvector
docker-compose up -d

# Run migrations
psql -h localhost -p 5433 -U postgres -d idea_management -f ../database/railway-migration.sql
```

## 🌐 Production Deployment

### Deploy to Production

1. **Fork this repository**
2. **Follow the [Deployment Guide](./DEPLOYMENT_GUIDE.md)**
3. **Configure environment variables**
4. **Deploy to Cloudflare Pages + Railway**

### Environment Variables

#### Backend (.env)
```bash
# Database
DATABASE_URL=postgresql://...

# AI Services
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# CORS
FRONTEND_URL=https://your-app.pages.dev
```

#### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

## 🎯 Usage

### 1. Content Creation Workflow

```
Ideas → Briefs → Content Packs → Edit → Review → Platform Content → Publish
```

1. **Create Ideas**: Generate initial content concepts
2. **Develop Briefs**: Create detailed content plans
3. **Generate Content**: Use AI to create full content
4. **Edit & Review**: Refine content with AI assistance
5. **Platform Adaptation**: Create platform-specific versions
6. **Publish**: Distribute across multiple platforms

### 2. Knowledge Base (RAG)

1. **Upload Documents**: Support for PDF, DOCX, TXT, MD
2. **AI Integration**: Knowledge base enhances AI responses
3. **Semantic Search**: Find relevant content with vector search
4. **Categories**: Organize documents by type/topic

### 3. Multi-Platform Publishing

- **Social Media**: Twitter, LinkedIn, Facebook, Instagram, TikTok
- **Email Marketing**: MailChimp integration
- **CMS**: WordPress publishing
- **Analytics**: Track performance across platforms

## 📊 API Endpoints

### Core Content
- `GET /health` - Health check
- `GET /ideas` - List ideas
- `POST /ideas` - Create idea
- `POST /ai/generate-idea` - AI-powered idea generation

### Knowledge Base
- `POST /api/knowledge/upload` - Upload document
- `POST /api/knowledge/query` - Search knowledge base
- `GET /api/knowledge/documents` - List documents

### Platform Integration
- `GET /platforms/supported` - List supported platforms
- `POST /platforms/configurations` - Configure platform
- `POST /derivatives` - Create platform content

## 🧪 Testing

### Manual Testing
```bash
# Test AI integration
./test-ai.sh

# Test platform connections
curl -X GET http://localhost:4000/platforms/supported
```

### Knowledge Base Testing
```bash
# Upload test document
curl -X POST http://localhost:4000/api/knowledge/upload \
  -F "file=@test.pdf" \
  -F "title=Test Document"

# Query knowledge base
curl -X POST http://localhost:4000/api/knowledge/query \
  -H "Content-Type: application/json" \
  -d '{"query": "test query", "limit": 5}'
```

## 🔧 Configuration

### Platform API Keys

Configure these in Railway backend environment:

```bash
# Twitter/X
TWITTER_API_KEY=your_key
TWITTER_API_SECRET=your_secret

# Facebook
FACEBOOK_APP_ID=your_app_id
FACEBOOK_APP_SECRET=your_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_secret
```

## 📈 Performance

- **Frontend**: Optimized for Core Web Vitals
- **Backend**: Auto-scaling with Railway
- **Database**: Indexed for fast queries
- **CDN**: Global distribution via Cloudflare
- **Caching**: Intelligent caching strategies

## 🛡️ Security

- **Environment Variables**: Secure credential storage
- **CORS**: Properly configured cross-origin requests
- **Input Validation**: Server-side validation with schemas
- **File Upload**: Secure file handling with type restrictions
- **Database**: Prepared statements prevent SQL injection

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 💬 Support

- **Issues**: [GitHub Issues](https://github.com/David-Hoa2023/content-multiplier-bootcamp/issues)
- **Discussions**: [GitHub Discussions](https://github.com/David-Hoa2023/content-multiplier-bootcamp/discussions)
- **Documentation**: [Deployment Guide](./DEPLOYMENT_GUIDE.md)

## 🙏 Acknowledgments

- **Vibe Coding Course**: Advanced Backend with Fastify & TypeScript
- **AI Providers**: OpenAI, Anthropic, Google, Deepseek
- **Infrastructure**: Railway, Cloudflare Pages
- **UI Components**: Radix UI, Tailwind CSS

---

**Made with ❤️ for the Vibe Coding Bootcamp**

Deploy your own Content Multiplier: [Deployment Guide](./DEPLOYMENT_GUIDE.md)