# Cloudflare Pages Deployment Guide

## Fixed Issues

### 1. npm ci Failures
- **Problem**: Mixed package managers (Bun and npm) causing conflicts
- **Solution**: Standardized on npm, removed Bun lock file, regenerated package-lock.json

### 2. Monorepo Workspace Support
- **Problem**: Cloudflare Pages doesn't natively understand npm workspaces
- **Solution**: Created custom build script (`build-cloudflare.sh`) to handle workspace installation and build

### 3. Static Export Configuration
- **Problem**: `output: 'export'` was disabled, preventing static deployment
- **Solution**: Re-enabled static export - both dynamic routes use client components, compatible with static builds

## Cloudflare Pages Configuration

Configure these settings in your Cloudflare Pages dashboard:

### Build Settings
```
Framework preset: Next.js
Build command: npm run build:cloudflare
Build output directory: frontend/out
Root directory: (leave blank - use repository root)
Node.js version: 18.17.0
```

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
1. Cloudflare runs `npm ci` to install dependencies
2. Runs `npm run build:cloudflare`
3. Executes `build-cloudflare.sh`:
   - Installs workspace dependencies
   - Navigates to frontend directory
   - Runs Next.js build with static export
4. Outputs to `frontend/out` directory
5. Cloudflare deploys static files

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

---

Last Updated: November 14, 2025
