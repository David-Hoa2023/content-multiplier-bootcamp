# Cloudflare Pages Deployment Guide

## Fixed Issues

### 1. npm ci Failures
- **Problem**: Mixed package managers (Bun and npm) causing conflicts
- **Solution**: Standardized on npm, removed Bun lock file, regenerated package-lock.json

### 2. Monorepo Workspace Support
- **Problem**: Cloudflare Pages doesn't natively understand npm workspaces
- **Solution**: Created custom build script (`build-cloudflare.sh`) to handle workspace installation and build

### 3. Static Export Configuration
- **Problem**: Static export needs to be conditional for Railway vs Cloudflare deployments
- **Solution**: Made static export conditional via `ENABLE_STATIC_EXPORT` environment variable

### 4. OpenNext Interactive Prompt Error (LATEST FIX)
- **Problem**: `@opennextjs/cloudflare` package causing interactive prompt errors during build
- **Error**: `? Missing required open-next.config.ts file, do you want to create one? (Y/n)`
- **Solution**: Removed `@opennextjs/cloudflare` dependency entirely, using standard Next.js static export instead
- **IMPORTANT**: You MUST update your Cloudflare Pages build settings (see below)

## Cloudflare Pages Configuration

**CRITICAL**: You must update these settings in your Cloudflare Pages dashboard. The recent changes require updating the build command!

### How to Update Settings

1. Go to Cloudflare Pages dashboard
2. Select your project
3. Go to **Settings** → **Builds & deployments**
4. Click **Configure Production deployments** (or Edit configuration)
5. Update the settings as shown below:

### Build Settings
```
Framework preset: Next.js
Build command: npm run build:cloudflare
Build output directory: frontend/out
Root directory: (leave blank - use repository root)
Node.js version: 18.17.0 or higher
```

### Environment Variables (REQUIRED)
```
ENABLE_STATIC_EXPORT=true
NEXT_PUBLIC_API_URL=https://your-backend-api.com
```

**Important**: The `ENABLE_STATIC_EXPORT=true` variable is REQUIRED for Cloudflare deployment. Without it, the static export will be disabled.

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
1. Cloudflare runs `npm ci` to install workspace dependencies at repository root
2. Runs `npm run build:cloudflare` which executes `build-cloudflare.sh`:
   - Confirms workspace dependencies are installed
   - Navigates to frontend directory
   - Runs `npm run build` with Next.js static export (enabled via ENABLE_STATIC_EXPORT=true)
3. Next.js generates static HTML files to `frontend/out` directory
4. Cloudflare deploys the static files from `frontend/out`

**Note**: The `@opennextjs/cloudflare` package is NO LONGER used. We use standard Next.js static export instead.

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

## Quick Fix Checklist

If you're seeing the OpenNext interactive prompt error, follow these steps:

- [ ] Go to Cloudflare Pages dashboard → Your Project → Settings
- [ ] Update **Build command** to: `npm run build:cloudflare`
- [ ] Update **Build output directory** to: `frontend/out`
- [ ] Ensure **Root directory** is blank/empty
- [ ] Add environment variable: `ENABLE_STATIC_EXPORT=true`
- [ ] Add environment variable: `NEXT_PUBLIC_API_URL=<your-backend-url>`
- [ ] Save settings
- [ ] Retry deployment

After updating settings, trigger a new deployment. The OpenNext error should be gone.

---

Last Updated: November 15, 2025
