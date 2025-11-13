# 🚀 Deployment Guide: Content Multiplier Bootcamp

This guide will help you deploy the Content Multiplier application to production using Cloudflare Pages (frontend) and Railway (backend).

## 📋 Prerequisites

Before deploying, ensure you have:

- ✅ GitHub account with repository access
- ✅ Cloudflare account (free tier available)
- ✅ Railway account (free tier available)
- ✅ AI API keys (OpenAI, Anthropic, etc.)
- ✅ Platform integration keys (optional: Twitter, Facebook, etc.)

## 🔧 Repository Structure

```
idea-management-app/
├── frontend/                 # Next.js application (Cloudflare Pages)
├── backend/                  # Fastify API (Railway)
├── database/                 # SQL migration scripts
└── DEPLOYMENT_GUIDE.md       # This file
```

## 🗄️ Step 1: Database Setup on Railway

### 1.1 Create PostgreSQL Database

1. **Login to Railway**: Go to [railway.app](https://railway.app)
2. **Create New Project**: Click "New Project" → "Deploy PostgreSQL"
3. **Wait for Deployment**: Database will be automatically provisioned
4. **Get Connection Details**: Go to your PostgreSQL service → "Connect" tab

### 1.2 Enable pgvector Extension

1. **Access Database**: Use Railway's built-in database client or connect via psql
2. **Run Migration**: Execute the migration script:

```sql
-- Copy and paste the contents of database/railway-migration.sql
-- This includes pgvector setup and all required tables
```

### 1.3 Get Database URL

From Railway PostgreSQL service → "Connect" tab, copy:
```
DATABASE_URL=postgresql://username:password@hostname:port/railway
```

## 🖥️ Step 2: Backend Deployment on Railway

### 2.1 Deploy Backend Service

1. **Create New Service**: In your Railway project → "Add Service" → "GitHub Repo"
2. **Select Repository**: Choose your forked repository
3. **Configure Build**: Railway will auto-detect the Node.js backend
4. **Set Root Directory**: Go to Settings → set "Root Directory" to `idea-management-app/backend`

### 2.2 Configure Environment Variables

In Railway backend service → "Variables" tab, add:

```bash
# Database (Railway will auto-inject DATABASE_URL)
NODE_ENV=production
PORT=4000

# AI Services (Required for core functionality)
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key
GEMINI_API_KEY=your-gemini-key
DEEPSEEK_API_KEY=your-deepseek-key

# CORS Configuration
FRONTEND_URL=https://your-app.pages.dev
ALLOWED_ORIGINS=https://your-app.pages.dev,http://localhost:3000

# Optional: Platform Integration Keys
TWITTER_API_KEY=your-twitter-key
TWITTER_API_SECRET=your-twitter-secret
TWITTER_ACCESS_TOKEN=your-access-token
TWITTER_ACCESS_TOKEN_SECRET=your-access-token-secret

FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-secret
MAILCHIMP_API_KEY=your-mailchimp-key
WORDPRESS_SITE_URL=your-wordpress-site
```

### 2.3 Deploy and Test

1. **Deploy**: Railway will automatically build and deploy
2. **Get Backend URL**: Copy your Railway backend URL (e.g., `https://your-backend.railway.app`)
3. **Test Health**: Visit `https://your-backend.railway.app/health`

## 🌐 Step 3: Frontend Deployment on Cloudflare Pages

### 3.1 Create Cloudflare Pages Project

1. **Login to Cloudflare**: Go to [dash.cloudflare.com](https://dash.cloudflare.com)
2. **Navigate to Pages**: Sidebar → "Pages"
3. **Connect to Git**: "Create a project" → "Connect to Git"
4. **Select Repository**: Choose your repository
5. **Configure Build**:
   - **Framework preset**: Next.js
   - **Build command**: `npm run build`
   - **Build output directory**: `.next`
   - **Root directory**: `idea-management-app/frontend`
   - **Note**: Do NOT use OpenNext adapter - Cloudflare Pages supports Next.js natively. The `output: 'standalone'` has been removed from next.config.js for Cloudflare compatibility.

### 3.2 Configure Environment Variables

In Cloudflare Pages → "Settings" → "Environment variables":

```bash
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

### 3.3 Deploy

1. **Deploy**: Cloudflare will build and deploy automatically
2. **Get Frontend URL**: Copy your Cloudflare Pages URL
3. **Update Backend CORS**: Add your frontend URL to backend's `ALLOWED_ORIGINS`

## 🔗 Step 4: Connect Frontend and Backend

### 4.1 Update Backend CORS

In Railway backend → "Variables", update:
```bash
FRONTEND_URL=https://your-actual-cloudflare-url.pages.dev
ALLOWED_ORIGINS=https://your-actual-cloudflare-url.pages.dev,http://localhost:3000
```

### 4.2 Redeploy Backend

Railway will automatically redeploy when you update environment variables.

### 4.3 Test Integration

1. **Visit Frontend**: Go to your Cloudflare Pages URL
2. **Test API Connection**: Try creating an idea or generating AI content
3. **Check Network Tab**: Verify API calls are hitting your Railway backend

## 🧪 Step 5: Verify Deployment

### 5.1 Core Functionality Tests

- ✅ **Health Check**: `https://your-backend.railway.app/health`
- ✅ **Frontend Loading**: Visit your Cloudflare Pages URL
- ✅ **API Integration**: Create an idea from the frontend
- ✅ **AI Generation**: Test AI content generation with your API keys
- ✅ **Knowledge Base**: Upload a document and test RAG functionality

### 5.2 Performance Tests

- ✅ **Page Load Speed**: Check frontend performance
- ✅ **API Response Times**: Monitor backend response times
- ✅ **Database Connections**: Verify pgvector queries work

## 🔧 Step 6: Optional Platform Integration Setup

### 6.1 Social Media Platforms

For Twitter, Facebook, LinkedIn, etc., add respective API keys to Railway backend environment variables.

### 6.2 CMS Integration

For WordPress integration, add site URL and credentials to backend environment.

### 6.3 Email Marketing

For MailChimp integration, add API keys and server prefix.

## 📊 Step 7: Monitoring and Maintenance

### 7.1 Railway Monitoring

- Monitor logs in Railway dashboard
- Set up uptime monitoring
- Check database performance

### 7.2 Cloudflare Analytics

- Monitor page views and performance
- Set up error tracking
- Check Core Web Vitals

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - ✅ Check `ALLOWED_ORIGINS` in backend
   - ✅ Verify frontend URL is correct

2. **Database Connection Errors**
   - ✅ Verify `DATABASE_URL` is set
   - ✅ Check pgvector extension is installed

3. **AI API Errors**
   - ✅ Verify API keys are set correctly
   - ✅ Check API key permissions and quotas

4. **Build Failures**
   - ✅ Check build logs in both platforms
   - ✅ Verify all dependencies are in package.json

### Getting Help

- **Railway**: Check Railway docs and community
- **Cloudflare**: Check Cloudflare Pages docs
- **Application**: Check application logs and error messages

## 🎉 Success!

Your Content Multiplier application should now be live:

- **Frontend**: `https://your-app.pages.dev`
- **Backend API**: `https://your-backend.railway.app`
- **Health Check**: `https://your-backend.railway.app/health`

The application includes:
- ✅ AI-powered content generation
- ✅ RAG-enabled knowledge base
- ✅ Multi-platform content distribution
- ✅ Platform integrations (when configured)
- ✅ Real-time analytics

## 📝 Next Steps

1. **Custom Domain**: Set up custom domain in Cloudflare Pages
2. **SSL/TLS**: Configure SSL certificates (auto-managed by Cloudflare)
3. **CDN**: Leverage Cloudflare's global CDN for better performance
4. **Monitoring**: Set up comprehensive monitoring and alerting
5. **Backup**: Configure database backups in Railway
6. **Scaling**: Monitor usage and scale resources as needed

---

**Happy Deploying! 🚀**

For issues or questions, check the troubleshooting section above or consult the respective platform documentation.