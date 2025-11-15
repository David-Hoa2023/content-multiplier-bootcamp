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
Build command: npm run build:cloudflare
Build output directory: (leave BLANK - not needed for Workers builds)
Root directory: (leave blank - use repository root)
Node.js version: 18.17.0 or higher
```

**Important**:
- **Do NOT set Build output directory** - OpenNext deploys to Cloudflare Workers, not static files
- Root directory must be blank (monorepo workspace installation happens at root)

### Environment Variables (Optional)
```
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

## Important Notes

1. **Do NOT set Root Directory to /frontend**
   - This is a monorepo with npm workspaces
   - Build must run from repository root
   - The build script handles the directory structure

2. **npm ci Works Correctly**
   - Clean package-lock.json generated
   - All dependencies properly resolved
   - Workspace structure maintained

3. **Static Export Enabled**
   - All dynamic routes use client components
   - Client-side routing handles dynamic paths
   - No server-side rendering needed

## Build Process

The build follows these steps:
1. Cloudflare runs the build command: `npm run build:cloudflare`
2. This executes: `npm ci --include=dev && cd frontend && npm run build:cloudflare`
   - Installs all workspace dependencies (including devDependencies)
   - Navigates to frontend directory
   - Runs OpenNext Cloudflare build: `npx --yes -p @opennextjs/cloudflare@latest -p wrangler@latest opennextjs-cloudflare build`
3. OpenNext builds the Next.js app for Cloudflare Workers with full SSR support
4. OpenNext automatically deploys to Cloudflare (no manual upload needed)

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

export default defineCloudflareConfig({
  // Minimal configuration - add options later if needed
  // See: https://opennext.js.org/cloudflare/get-started
});
```

This file prevents the interactive prompt error during CI builds.

## Quick Fix Checklist

If you're seeing the OpenNext interactive prompt error:

- [x] ✅ Added `frontend/open-next.config.ts` file
- [x] ✅ Installed `@opennextjs/cloudflare` package
- [x] ✅ Updated build command to use OpenNext
- [ ] Go to Cloudflare Pages dashboard → Your Project → Settings
- [ ] Update **Build command** to: `npm run build:cloudflare`
- [ ] **REMOVE** Build output directory (leave blank)
- [ ] Ensure **Root directory** is blank/empty
- [ ] Add environment variable (optional): `NEXT_PUBLIC_API_URL=<your-backend-url>`
- [ ] Save settings
- [ ] Retry deployment

After updating settings, OpenNext will build and deploy automatically.

---

Last Updated: November 15, 2025
