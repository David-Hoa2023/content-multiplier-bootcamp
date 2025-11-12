# Twitter OAuth 2.0 Setup Guide

## Error: "Something went wrong - You weren't able to give access to the App"

This error occurs when Twitter OAuth is not properly configured. Here's how to fix it:

---

## Prerequisites

You need a Twitter Developer account and a Twitter App with OAuth 2.0 enabled.

---

## Step 1: Create/Configure Twitter App

### 1.1 Go to Twitter Developer Portal
Visit: https://developer.twitter.com/en/portal/dashboard

### 1.2 Create a New App (or use existing)
- Navigate to "Projects & Apps"
- Create a new app or select an existing one
- Note down the App ID

### 1.3 Enable OAuth 2.0
- Go to your app settings
- Navigate to "User authentication settings"
- Click "Set up" or "Edit"

### 1.4 Configure OAuth 2.0 Settings

**App permissions:**
- Select: ✅ Read and Write

**Type of App:**
- Select: ✅ Web App, Automated App or Bot

**App info:**
- **Callback URI / Redirect URL:**
  ```
  http://localhost:3003/api/publishing/auth/twitter/callback
  ```
  ⚠️ **CRITICAL**: This must match your `TWITTER_REDIRECT_URI` environment variable exactly!

- **Website URL:**
  ```
  http://localhost:3000
  ```

- **Organization name:** Your organization name
- **Organization website:** Your website URL

### 1.5 Get Your Credentials
After saving, you'll receive:
- **Client ID** (looks like: `eW03WHhGX0NKVVlOc1d5...`)
- **Client Secret** (looks like: `xHf_OWCHqcfxk6dqAhKA...`)

⚠️ **SAVE THESE IMMEDIATELY** - You can only see the Client Secret once!

---

## Step 2: Configure Environment Variables

### 2.1 Check Current .env File
```bash
cat .env | grep TWITTER
```

### 2.2 Update .env File
Add or update these variables in your root `.env` file:

```bash
# Twitter OAuth 2.0 Credentials
TWITTER_CLIENT_ID=your_client_id_here
TWITTER_CLIENT_SECRET=your_client_secret_here
TWITTER_REDIRECT_URI=http://localhost:3003/api/publishing/auth/twitter/callback
```

**Example with real values:**
```bash
TWITTER_CLIENT_ID=eW03WHhGX0NKVVlOc1d5NFV6aUE6MTpjaQ
TWITTER_CLIENT_SECRET=xHf_OWCHqcfxk6dqAhKA_R2X0EhTj-aNUaKDAVG7YDFbNDLmy1
TWITTER_REDIRECT_URI=http://localhost:3003/api/publishing/auth/twitter/callback
```

### 2.3 Verify Environment Variable Format
```bash
# Check that variables are set correctly
echo $TWITTER_CLIENT_ID
echo $TWITTER_REDIRECT_URI
```

---

## Step 3: Restart API Server

The API server needs to reload environment variables:

```bash
# Kill all node processes
taskkill //F //IM node.exe

# Or kill specific API server
# (find PID with: netstat -ano | findstr :3003)
# Then: taskkill /PID <pid_number> /F

# Restart API server with environment variables
cd apps/api
OPENAI_API_KEY="your-key" TWITTER_CLIENT_ID="your-client-id" TWITTER_CLIENT_SECRET="your-secret" TWITTER_REDIRECT_URI="http://localhost:3003/api/publishing/auth/twitter/callback" DATABASE_URL="postgres://cm:cm@localhost:5432/cm" PORT=3003 yarn dev
```

---

## Step 4: Test Twitter Connection

### 4.1 Open Application
Navigate to: http://localhost:3000

### 4.2 Go to Content Pack
- Click on "Packs"
- Select any existing pack
- Scroll to "Publishing" section

### 4.3 Connect Twitter
- Click "Connect Twitter"
- You should be redirected to Twitter's authorization page
- Click "Authorize app"
- You should be redirected back to your app

### 4.4 Verify Connection
After authorization, you should see:
- ✅ "Twitter connected successfully"
- Twitter account name displayed
- Option to disconnect

---

## Troubleshooting

### Error: "Invalid redirect_uri"
**Problem:** The callback URL doesn't match what's configured in Twitter Developer Portal

**Solution:**
1. Check Twitter Developer Portal → App Settings → OAuth 2.0 settings
2. Ensure callback URL is EXACTLY: `http://localhost:3003/api/publishing/auth/twitter/callback`
3. No trailing slash, must use `http://` (not `https://` for localhost)
4. Port must match your API server port (3003 in this case)

### Error: "Invalid client_id"
**Problem:** Client ID is incorrect or not set

**Solution:**
1. Verify TWITTER_CLIENT_ID in `.env` matches Twitter Developer Portal
2. No extra quotes or spaces
3. Restart API server after changing

### Error: "You weren't able to give access to the App"
**Problem:** Usually means OAuth 2.0 settings are incomplete or incorrect

**Solution:**
1. Verify all OAuth 2.0 settings in Twitter Developer Portal
2. Ensure "User authentication settings" are properly saved
3. Check that your app has "Read and Write" permissions
4. Verify callback URL matches exactly

### Error: "Client authentication failed"
**Problem:** Client Secret is wrong or authentication method incorrect

**Solution:**
1. Regenerate Client Secret in Twitter Developer Portal
2. Update `.env` with new secret
3. Restart API server

---

## Common Configuration Mistakes

### ❌ Wrong Port in Callback URL
```
# WRONG
TWITTER_REDIRECT_URI=http://localhost:3000/api/publishing/auth/twitter/callback

# CORRECT (must match API port, not frontend port)
TWITTER_REDIRECT_URI=http://localhost:3003/api/publishing/auth/twitter/callback
```

### ❌ HTTPS for Localhost
```
# WRONG
TWITTER_REDIRECT_URI=https://localhost:3003/api/publishing/auth/twitter/callback

# CORRECT (use http for localhost)
TWITTER_REDIRECT_URI=http://localhost:3003/api/publishing/auth/twitter/callback
```

### ❌ Trailing Slash
```
# WRONG
TWITTER_REDIRECT_URI=http://localhost:3003/api/publishing/auth/twitter/callback/

# CORRECT (no trailing slash)
TWITTER_REDIRECT_URI=http://localhost:3003/api/publishing/auth/twitter/callback
```

### ❌ Missing Environment Variables
```bash
# Check all required variables are set
env | grep TWITTER

# Should show:
# TWITTER_CLIENT_ID=...
# TWITTER_CLIENT_SECRET=...
# TWITTER_REDIRECT_URI=...
```

---

## Production Deployment

When deploying to production, update:

```bash
# Production environment variables
TWITTER_REDIRECT_URI=https://yourdomain.com/api/publishing/auth/twitter/callback
```

And add this callback URL in Twitter Developer Portal alongside the localhost one.

---

## Verification Checklist

- [ ] Twitter Developer account created
- [ ] Twitter App created/configured
- [ ] OAuth 2.0 enabled with "Read and Write" permissions
- [ ] Callback URL configured in Twitter Developer Portal
- [ ] Client ID and Client Secret obtained
- [ ] Environment variables set in `.env`
- [ ] API server restarted with new environment variables
- [ ] Callback URL matches exactly between Twitter Portal and `.env`
- [ ] Using correct port (API port, not frontend port)
- [ ] No trailing slashes in callback URL
- [ ] Using `http://` for localhost (not `https://`)

---

## Need Help?

If you're still experiencing issues:

1. Check API server logs for specific error messages
2. Verify environment variables are loaded: `console.log(process.env.TWITTER_CLIENT_ID)`
3. Test OAuth flow manually: Visit `http://localhost:3003/api/publishing/auth/twitter`
4. Check database for oauth_states table: `SELECT * FROM oauth_states;`
5. Verify publishing_credentials table exists: `\d publishing_credentials`

---

## Related Files

- OAuth Implementation: [apps/api/src/services/publishing/oauth.ts](apps/api/src/services/publishing/oauth.ts)
- Publishing Routes: [apps/api/src/routes/publishing.ts](apps/api/src/routes/publishing.ts)
- Environment Template: [.env.publishing.example](.env.publishing.example)
