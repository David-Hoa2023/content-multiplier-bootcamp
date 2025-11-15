# AI Setup Guide - Fix "Failed to generate idea content" Error

## Quick Diagnosis

Run this command to check what's wrong:

```bash
# Windows PowerShell
powershell -ExecutionPolicy Bypass -File check-ai-setup.ps1

# Mac/Linux
bash check-ai-setup.sh
```

This will tell you exactly what needs to be fixed!

---

## Problem: "Failed to generate idea content"

This error appears when you click the "Tạo mô tả bằng AI" button. The most common cause is **missing AI API keys**.

## Solution: Add AI API Keys

### Option 1: Via Settings Page (Recommended)

1. **Get an API Key**

   Choose one of these providers (you only need ONE):

   | Provider | Cost | Sign Up URL | Best For |
   |----------|------|-------------|----------|
   | **DeepSeek** | $0.14/1M tokens | https://platform.deepseek.com/ | Cheapest option |
   | **OpenAI** | $0.50-$5.00/1M | https://platform.openai.com/api-keys | Most popular |
   | **Google Gemini** | $3.50/1M | https://makersuite.google.com/app/apikey | Large context |
   | **Anthropic** | $3.00-$15.00/1M | https://console.anthropic.com/ | Best quality |

2. **Add Key in App**

   a. Start your development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

   b. Open http://localhost:3000/settings

   c. Scroll to "AI Provider" section

   d. Select your provider from the dropdown

   e. Paste your API key in the input field

   f. The key is automatically saved to the database (encrypted)

3. **Test It**

   a. Go back to http://localhost:3000

   b. Enter a title like "Marketing campaign for new product"

   c. Click "Tạo mô tả bằng AI"

   d. Wait 2-5 seconds

   e. You should see the generated description! ✅

### Option 2: Via .env File (Backend)

1. **Get an API Key** (same as Option 1)

2. **Create/Edit backend/.env**

   ```bash
   cd backend
   # Create .env file if it doesn't exist
   notepad .env  # Windows
   nano .env     # Mac/Linux
   ```

3. **Add Your Keys**

   Add at least ONE of these (you can add multiple):

   ```env
   # OpenAI (recommended for beginners)
   OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # DeepSeek (cheapest option)
   DEEPSEEK_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Anthropic (Claude)
   ANTHROPIC_API_KEY=sk-ant-xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Google Gemini
   GEMINI_API_KEY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxx

   # Optional: Database (if not using Docker defaults)
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ideas_db
   PORT=4000
   ```

4. **Restart Backend**

   ```bash
   # Stop the backend (Ctrl+C in the terminal)
   # Then start it again:
   npm run dev
   ```

5. **Verify It Works**

   ```bash
   # Run the diagnostic
   powershell -ExecutionPolicy Bypass -File check-ai-setup.ps1
   ```

   You should see:
   ```
   [OK] Configured providers: openai
   ```

---

## Getting API Keys - Step by Step

### OpenAI (Most Popular)

1. Go to https://platform.openai.com/api-keys
2. Sign up / Log in
3. Click "Create new secret key"
4. Copy the key (starts with `sk-proj-...`)
5. Add it to your settings or .env file

**Cost:**
- GPT-4o: $5.00/1M tokens (~$0.005 per request)
- GPT-4o-mini: $0.15/1M tokens (~$0.0002 per request)
- GPT-3.5-turbo: $0.50/1M tokens (~$0.0005 per request)

**Free Tier:** $5 credit for new accounts

### DeepSeek (Cheapest)

1. Go to https://platform.deepseek.com/
2. Sign up with email
3. Go to API Keys section
4. Create new key
5. Copy the key

**Cost:**
- $0.14/1M tokens (~$0.00014 per request)
- **70x cheaper than OpenAI!**

**Free Tier:** Some free credits on signup

### Anthropic (Claude)

1. Go to https://console.anthropic.com/
2. Sign up / Log in
3. Settings → API Keys
4. Create key
5. Copy the key (starts with `sk-ant-...`)

**Cost:**
- Claude 3 Opus: $15/1M tokens (best quality)
- Claude 3 Sonnet: $3/1M tokens (balanced)
- Claude 3 Haiku: $0.25/1M tokens (fast & cheap)

**Free Tier:** $5 credit for new accounts

### Google Gemini

1. Go to https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy the key

**Cost:**
- Gemini 1.5 Pro: $3.50/1M tokens
- Gemini 1.5 Flash: $0.35/1M tokens

**Free Tier:** Generous free quota

---

## Troubleshooting

### "Backend is NOT running"

```bash
cd backend
npm install
npm run dev
```

Backend should start on http://localhost:4000

### "Database container is NOT running"

```bash
# Make sure Docker Desktop is running first!
docker-compose up -d

# Check if it started:
docker ps
```

You should see `ideas_db` in the list.

### "Failed to fetch" or Connection Errors

1. Check backend is running: http://localhost:4000/health
2. Check frontend is using correct API URL
3. Check firewall/antivirus isn't blocking ports
4. Try restarting both frontend and backend

### API Key Not Working

1. **Check the key format:**
   - OpenAI: Should start with `sk-proj-` or `sk-`
   - Anthropic: Should start with `sk-ant-`
   - DeepSeek: Should start with `sk-`

2. **Check for extra spaces:**
   ```env
   # ❌ Wrong - has trailing space
   OPENAI_API_KEY=sk-proj-xxx

   # ✅ Correct - no trailing space
   OPENAI_API_KEY=sk-proj-xxx
   ```

3. **Verify the key is active:**
   - Log in to the provider's dashboard
   - Check if the key is still valid
   - Check if you have remaining credits

4. **Check backend logs:**
   - Look for error messages in the terminal running `npm run dev`
   - Common errors:
     - `401 Unauthorized` = Invalid API key
     - `429 Too Many Requests` = Rate limit exceeded
     - `insufficient_quota` = No credits remaining

### Still Not Working?

1. **Run the diagnostic:**
   ```bash
   powershell -ExecutionPolicy Bypass -File check-ai-setup.ps1
   ```

2. **Check backend logs:**
   - Look at the terminal where backend is running
   - Should show errors like "API key not configured" or "Provider error"

3. **Check browser console:**
   - Open DevTools (F12)
   - Go to Console tab
   - Look for error messages

4. **Test the API directly:**
   ```bash
   # Test if providers are available
   curl http://localhost:4000/ai/providers

   # Should return:
   # {"success":true,"data":["openai"],"message":"1 provider(s) available"}
   ```

---

## Testing Your Setup

### 1. Run Diagnostic

```bash
powershell -ExecutionPolicy Bypass -File check-ai-setup.ps1
```

Expected output:
```
Checking AI Setup...

1. Checking if backend is running...
   [OK] Backend is running at http://localhost:4000

2. Checking configured AI providers...
   [OK] Configured providers: openai

3. Checking database connection...
   [OK] Database container is running

All checks passed! You should be able to generate AI content.
```

### 2. Test in Browser

1. Go to http://localhost:3000
2. Fill in the title: "Marketing campaign for fitness app"
3. (Optional) Add persona: "Young professionals"
4. (Optional) Add industry: "Health & Fitness"
5. Click "Tạo mô tả bằng AI"
6. Wait 2-5 seconds

Expected result:
```
✅ Đã tạo mô tả thành công!
```

And the description field should be filled with AI-generated content.

### 3. Test Different Providers

To test multiple providers:

1. Go to Settings → AI Provider
2. Try each provider you configured
3. Go back to home page
4. Generate content with each one
5. Compare the results!

---

## Cost Estimation

Typical usage for this app:

- **Idea description generation:** ~200 tokens per request
- **Content plan generation:** ~500 tokens per request
- **Brief generation:** ~1000 tokens per request

**Monthly cost estimate** (for 100 generations):
- DeepSeek: $0.01-$0.14
- OpenAI GPT-3.5: $0.10
- OpenAI GPT-4o-mini: $0.30
- Google Gemini: $0.70
- Anthropic Haiku: $0.50
- OpenAI GPT-4o: $1.00
- Anthropic Sonnet: $3.00
- Anthropic Opus: $15.00

**Recommendation:** Start with **DeepSeek** (cheapest) or **OpenAI GPT-4o-mini** (good quality).

---

## Environment Variables Reference

Complete list of backend environment variables:

```env
# Server
PORT=4000
NODE_ENV=development

# Database
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ideas_db
# Or individual settings:
DB_HOST=localhost
DB_PORT=5433
DB_NAME=ideas_db
DB_USER=postgres
DB_PASSWORD=postgres

# AI Providers (add at least one)
OPENAI_API_KEY=sk-proj-...
DEEPSEEK_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
GEMINI_API_KEY=...

# Optional: CORS settings for production
ALLOWED_ORIGINS=http://localhost:3000,https://your-frontend.vercel.app
```

---

## Next Steps

After successfully setting up AI:

1. ✅ Generate some ideas with AI
2. ✅ Try the Knowledge Base feature (upload PDFs)
3. ✅ Create content plans from ideas
4. ✅ Generate platform-specific content derivatives
5. ✅ Configure platform integrations (Twitter, LinkedIn, etc.)

---

## Need More Help?

- Check `VERCEL_FIX_GUIDE.md` for deployment issues
- Check `QUICK_FIX_SUMMARY.md` for quick reference
- Check backend logs for detailed error messages
- Ensure Docker Desktop is running (for database)
- Try restarting everything:
  ```bash
  # Stop all (Ctrl+C in each terminal)
  docker-compose down
  docker-compose up -d
  cd backend && npm run dev  # Terminal 1
  cd frontend && npm run dev # Terminal 2
  ```

Good luck! 🚀
