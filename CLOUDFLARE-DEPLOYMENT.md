# Cloudflare Pages Deployment Guide (OpenNext)

This project uses **OpenNext Cloudflare** to deploy Next.js to Cloudflare Workers/Pages with full SSR support.

## Fixed Issues

### 1. npm ci Failures
- **Problem**: Mixed package managers (Bun and npm) causing conflicts
- **Solution**: Standardized on npm, removed Bun lock file, regenerated package-lock.json

### 2. Monorepo Workspace Support
- **Problem**: Cloudflare Pages doesn't natively understand npm workspaces
- **Solution**: Updated build command to run `npm ci --include=dev` at root before building

### 3. OpenNext Interactive Prompt Error (FIXED)
- **Problem**: `@opennextjs/cloudflare` package prompting for `open-next.config.ts` file during CI build
- **Error**: `? Missing required open-next.config.ts file, do you want to create one? (Y/n)`
- **Solution**: Added `open-next.config.ts` file with minimal configuration
- **Result**: Build now runs non-interactively in CI/CD

## Cloudflare Pages Configuration

### Build Settings

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to **Settings** → **Builds & deployments**
4. Configure as follows:

```
Framework preset: None (OpenNext handles the build)
Root directory: frontend
Build command: npm ci --include=dev && npx --yes -p @opennextjs/cloudflare@latest -p wrangler@latest opennextjs-cloudflare build && npx --yes -p @opennextjs/cloudflare@latest -p wrangler@latest opennextjs-cloudflare deploy
Build output directory: (leave BLANK - not needed for Workers builds)
Node.js version: 18.17.0 or higher
```

**Important**:
- **Root directory** must be set to `frontend` - this ensures OpenNext runs in the correct context
- **Build command** installs dependencies first (`npm ci --include=dev`) before running OpenNext
- **Do NOT set Build output directory** - OpenNext deploys to Cloudflare Workers, not static files
- The build command is non-interactive and fully automated

### Environment Variables (Optional)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## Important Notes

1. **Root Directory MUST be `frontend`**
   - OpenNext requires running from the app directory
   - Build command handles dependency installation first
   - `npm ci --include=dev` ensures all deps (including devDependencies) are installed

2. **npm ci Works Correctly**
   - `frontend/package-lock.json` exists and is committed
   - Clean dependency installation every build
   - All dependencies properly resolved

3. **Non-Interactive Build**
   - `open-next.config.ts` file prevents interactive prompts
   - Build command uses `--yes` flag for npx
   - Fully automated CI/CD pipeline

## Build Process

The build follows these steps:
1. Cloudflare sets working directory to `frontend/` (based on Root directory setting)
2. Runs the build command which:
   - **Step 1**: `npm ci --include=dev` - Installs all dependencies from `frontend/package-lock.json`
   - **Step 2**: `npm run build` - Runs Next.js build (`next build`), fails early if TypeScript/config errors
   - **Step 3**: `npm run build:cf` - OpenNext adapts the Next.js build for Cloudflare Workers
3. Runs the deploy command:
   - **Step 4**: `npm run deploy:cf` - Wrangler deploys to Cloudflare Workers
4. Deployment completes automatically

**Benefits of OpenNext**:
- Full Next.js SSR/ISR support on Cloudflare
- Server components work properly
- API routes run on Cloudflare Workers
- Automatic edge caching with R2 (optional)
- No need to manage static files manually

## Troubleshooting

### If build still fails:

1. **Check Build Logs**
   - Look for specific error messages
   - Verify npm ci completes successfully
   - Check if Next.js build runs

2. **Verify Settings**
   - Root directory should be empty/blank
   - Build command: `npm run build:cloudflare`
   - Output directory: `frontend/out`

3. **Common Issues**
   - If "Root directory not found": Leave Root directory blank
   - If "Command not found": Ensure package.json has build:cloudflare script
   - If "Output directory empty": Check if frontend/out exists after build

## Success Indicators

Build succeeds when you see:
```
✓ Compiled successfully
✓ Generating static pages (46/46)
✓ Finalizing page optimization
```

All 46 pages should be generated as static HTML files.

## Post-Deployment

After successful deployment:
- Frontend will be available at your Cloudflare Pages URL
- Dynamic routes will work via client-side routing
- Backend API must be deployed separately (Railway, etc.)
- Update `NEXT_PUBLIC_API_URL` to point to deployed backend

## Files Added for OpenNext

The following files are required for OpenNext to work:

### `frontend/open-next.config.ts`
```typescript
import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default defineCloudflareConfig({});
```

**Critical**: This file MUST exist and be committed to prevent interactive prompts during CI builds.

## Quick Fix Checklist

If you're seeing the OpenNext build error, follow these steps:

### ✅ Files (Already Done)
- [x] ✅ Added `frontend/open-next.config.ts` file with minimal config
- [x] ✅ Installed `@opennextjs/cloudflare` package in frontend
- [x] ✅ `frontend/package-lock.json` exists and is committed
- [x] ✅ Upgraded Next.js to 14.2.33 (meets OpenNext requirement)

### 🔧 Cloudflare Pages Configuration (Do This Now)
1. Go to Cloudflare Pages dashboard → Your Project → **Settings** → **Builds & deployments**
2. Click **Edit configuration** or **Configure build**
3. Set the following:
   - **Root directory**: `frontend`
   - **Build command**:
     ```bash
     npm ci --include=dev && npm run build && npm run build:cf
     ```
   - **Deploy command**:
     ```bash
     npm run deploy:cf
     ```
   - **Build output directory**: (leave BLANK)
   - **Node.js version**: 18.17.0 or higher
4. **Save** and **Retry deployment**

**Why This Works**:
- `npm ci --include=dev` installs @opennextjs/cloudflare and wrangler locally (no npx needed)
- `npm run build` runs Next.js build first, surfaces errors early
- `npm run build:cf` uses local OpenNext CLI (more reliable)
- `npm run deploy:cf` uses local Wrangler CLI for deployment
- Separate deploy command ensures build completes before deployment

After updating settings, OpenNext will build and deploy automatically.

---

Last Updated: November 15, 2025
