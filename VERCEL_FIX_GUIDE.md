# Vercel Deployment Fix Guide

## Problem
The frontend deployed on Vercel shows the error:
```
availableProviders.includes is not a function
```

## Root Cause
The frontend application had **hardcoded `http://localhost:4000` API URLs** in 27 files. When deployed to Vercel:
1. The frontend tries to connect to `http://localhost:4000` which doesn't exist in production
2. API calls fail, returning errors or undefined values
3. The backend code expects an array but receives undefined/error, causing `.includes()` to fail

## Solution Overview
1. ✅ Created centralized API configuration (`frontend/src/lib/api-config.ts`)
2. ✅ Updated all 27 files to use the centralized API URL
3. ⏳ Deploy backend to a production server
4. ⏳ Configure Vercel environment variables
5. ⏳ Redeploy frontend to Vercel

---

## Step 1: Backend Deployment (Choose One)

### Option A: Deploy to Railway (Recommended)

Railway is a modern platform that makes deploying Node.js apps simple.

1. **Sign up for Railway**
   - Go to https://railway.app
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Connect your repository
   - Select the backend directory

3. **Configure Backend**
   - Railway will auto-detect Node.js
   - Set the following environment variables in Railway:
     ```
     DATABASE_URL=<your-postgres-connection-string>
     PORT=4000
     OPENAI_API_KEY=<your-key>
     ANTHROPIC_API_KEY=<your-key>
     GEMINI_API_KEY=<your-key>
     DEEPSEEK_API_KEY=<your-key>
     ```

4. **Get Your Backend URL**
   - After deployment, Railway provides a URL like:
     `https://your-backend.railway.app`
   - Copy this URL for Step 2

### Option B: Deploy to Render

1. Go to https://render.com
2. Create a new Web Service
3. Connect your GitHub repository
4. Set build command: `cd backend && npm install && npm run build`
5. Set start command: `cd backend && npm start`
6. Add environment variables (same as Railway)
7. Copy the provided URL

### Option C: Deploy to Heroku

1. Install Heroku CLI
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
5. Set environment variables:
   ```bash
   heroku config:set OPENAI_API_KEY=your-key
   heroku config:set ANTHROPIC_API_KEY=your-key
   # ... etc
   ```
6. Deploy:
   ```bash
   git subtree push --prefix backend heroku main
   ```
7. Copy the app URL: `https://your-app-name.herokuapp.com`

---

## Step 2: Configure Vercel Environment Variables

1. **Go to Vercel Dashboard**
   - Navigate to your project
   - Go to "Settings" → "Environment Variables"

2. **Add the Backend URL**
   - Variable name: `NEXT_PUBLIC_API_URL`
   - Value: Your backend URL from Step 1 (without trailing slash)
   - Example: `https://your-backend.railway.app`
   - Scope: Production, Preview, Development

3. **Optional: Add Other Variables**
   ```
   NODE_ENV=production
   ```

---

## Step 3: Redeploy Frontend

### Option A: Through Vercel Dashboard
1. Go to "Deployments" tab
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Select "Use existing build cache" = No
5. Click "Redeploy"

### Option B: Through Git Push
1. Make any small change (e.g., update README)
2. Commit and push to your repository:
   ```bash
   git add .
   git commit -m "fix: configure API URL for production"
   git push origin main
   ```
3. Vercel will automatically deploy

---

## Step 4: Verify the Fix

1. **Check Environment Variables**
   ```bash
   # In Vercel deployment logs, you should see:
   NEXT_PUBLIC_API_URL=https://your-backend.railway.app
   ```

2. **Test the Deployed Site**
   - Visit your Vercel URL
   - Open Browser DevTools → Network tab
   - Try creating an idea or generating content
   - Verify API calls go to your backend URL (not localhost)

3. **Check for Errors**
   - Open Browser DevTools → Console
   - Look for any errors
   - The "availableProviders.includes" error should be gone

---

## Troubleshooting

### Error: "Failed to fetch" or CORS errors

**Solution:** Add CORS configuration to your backend

In `backend/src/index.ts`, ensure CORS is configured:

```typescript
import cors from '@fastify/cors';

await fastify.register(cors, {
  origin: [
    'https://your-frontend.vercel.app',
    'http://localhost:3000'
  ],
  credentials: true
});
```

### Error: "Database connection failed"

**Solution:** Update DATABASE_URL in your backend deployment

- Ensure PostgreSQL is running
- Verify connection string includes all parameters:
  ```
  postgresql://user:password@host:port/database
  ```

### Environment variable not updating

**Solution:**
1. Clear Vercel build cache
2. Redeploy with "Use existing build cache" = No
3. Or trigger a new deployment by pushing a commit

### Still seeing localhost:4000 in Network tab

**Solution:** Hard refresh the browser
- Windows: Ctrl + Shift + R
- Mac: Cmd + Shift + R
- Or clear browser cache

---

## Testing Locally First

Before deploying, test the changes locally:

1. **Create `.env.local` in frontend directory**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:4000
   ```

2. **Start backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Start frontend**
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test functionality**
   - Create ideas
   - Generate content
   - Check Network tab - all requests should use `http://localhost:4000`

---

## Files Changed

The following files were updated to use centralized API configuration:

### Created:
- ✅ `frontend/src/lib/api-config.ts` - Centralized API configuration

### Updated (27 files):
- ✅ `frontend/src/app/page.tsx`
- ✅ `frontend/src/app/settings/page.tsx`
- ✅ `frontend/src/components/ui/llm-provider-switcher.tsx`
- ✅ And 24 other component/page files

### Scripts:
- ✅ `frontend/update-api-urls.js` - Automated update script (Node.js)
- ✅ `frontend/update-api-urls.sh` - Bash version
- ✅ `frontend/update-api-urls.ps1` - PowerShell version

---

## Summary

✅ **What was fixed:**
- Replaced 27 hardcoded `localhost:4000` URLs
- Created centralized API configuration
- Made frontend work in both dev and production

🎯 **What you need to do:**
1. Deploy backend to Railway/Render/Heroku
2. Set `NEXT_PUBLIC_API_URL` in Vercel
3. Redeploy frontend
4. Verify it works

💡 **Key Concept:**
The frontend now uses `process.env.NEXT_PUBLIC_API_URL` which:
- In development: Defaults to `http://localhost:4000`
- In production: Uses the value from Vercel environment variables

---

## Questions?

If you encounter issues:
1. Check Vercel deployment logs
2. Check backend deployment logs
3. Check browser console for errors
4. Verify environment variables are set correctly
5. Try clearing build cache and redeploying

Good luck! 🚀
