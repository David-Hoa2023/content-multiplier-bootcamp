#!/usr/bin/env node

/**
 * Deployment Readiness Verification Script
 * Checks if the application is ready for production deployment
 */

const fs = require('fs');
const path = require('path');

console.log('🔍 Verifying deployment readiness...\n');

const checks = [];

// Check if required files exist
const requiredFiles = [
  'backend/package.json',
  'frontend/package.json',
  'backend/Dockerfile',
  'backend/.env.example',
  'frontend/.env.example',
  'frontend/wrangler.toml',
  'database/railway-migration.sql',
  'DEPLOYMENT_GUIDE.md',
  'PRODUCTION_README.md'
];

console.log('📁 Checking required files:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(path.join(__dirname, file));
  console.log(`  ${exists ? '✅' : '❌'} ${file}`);
  checks.push({ name: file, passed: exists });
});

// Check package.json configurations
console.log('\n📦 Checking package.json configurations:');

// Backend package.json
try {
  const backendPkg = require('./backend/package.json');
  const hasStartScript = backendPkg.scripts && backendPkg.scripts.start;
  const hasBuildScript = backendPkg.scripts && backendPkg.scripts.build;
  
  console.log(`  ${hasStartScript ? '✅' : '❌'} Backend start script`);
  console.log(`  ${hasBuildScript ? '✅' : '❌'} Backend build script`);
  
  checks.push({ name: 'Backend start script', passed: hasStartScript });
  checks.push({ name: 'Backend build script', passed: hasBuildScript });
} catch (error) {
  console.log('  ❌ Backend package.json not found or invalid');
  checks.push({ name: 'Backend package.json', passed: false });
}

// Frontend package.json
try {
  const frontendPkg = require('./frontend/package.json');
  const hasStartScript = frontendPkg.scripts && frontendPkg.scripts.start;
  const hasBuildScript = frontendPkg.scripts && frontendPkg.scripts.build;
  
  console.log(`  ${hasStartScript ? '✅' : '❌'} Frontend start script`);
  console.log(`  ${hasBuildScript ? '✅' : '❌'} Frontend build script`);
  
  checks.push({ name: 'Frontend start script', passed: hasStartScript });
  checks.push({ name: 'Frontend build script', passed: hasBuildScript });
} catch (error) {
  console.log('  ❌ Frontend package.json not found or invalid');
  checks.push({ name: 'Frontend package.json', passed: false });
}

// Check environment examples
console.log('\n🔐 Checking environment configuration:');

const backendEnvExample = path.join(__dirname, 'backend/.env.example');
const frontendEnvExample = path.join(__dirname, 'frontend/.env.example');

if (fs.existsSync(backendEnvExample)) {
  const backendEnv = fs.readFileSync(backendEnvExample, 'utf8');
  const hasDbUrl = backendEnv.includes('DATABASE_URL');
  const hasOpenAI = backendEnv.includes('OPENAI_API_KEY');
  const hasCors = backendEnv.includes('FRONTEND_URL');
  
  console.log(`  ${hasDbUrl ? '✅' : '❌'} Backend DATABASE_URL configured`);
  console.log(`  ${hasOpenAI ? '✅' : '❌'} Backend AI API keys configured`);
  console.log(`  ${hasCors ? '✅' : '❌'} Backend CORS configured`);
  
  checks.push({ name: 'Backend env DATABASE_URL', passed: hasDbUrl });
  checks.push({ name: 'Backend env AI keys', passed: hasOpenAI });
  checks.push({ name: 'Backend env CORS', passed: hasCors });
}

if (fs.existsSync(frontendEnvExample)) {
  const frontendEnv = fs.readFileSync(frontendEnvExample, 'utf8');
  const hasApiUrl = frontendEnv.includes('NEXT_PUBLIC_API_URL');
  
  console.log(`  ${hasApiUrl ? '✅' : '❌'} Frontend API URL configured`);
  
  checks.push({ name: 'Frontend env API URL', passed: hasApiUrl });
}

// Check directory structure
console.log('\n📂 Checking directory structure:');

const requiredDirs = [
  'backend/src',
  'frontend/src',
  'backend/uploads',
  'backend/uploads/knowledge',
  'database'
];

requiredDirs.forEach(dir => {
  const exists = fs.existsSync(path.join(__dirname, dir));
  console.log(`  ${exists ? '✅' : '❌'} ${dir}/`);
  checks.push({ name: `Directory ${dir}`, passed: exists });
});

// Summary
console.log('\n📊 Summary:');
const totalChecks = checks.length;
const passedChecks = checks.filter(check => check.passed).length;
const failedChecks = totalChecks - passedChecks;

console.log(`  Total checks: ${totalChecks}`);
console.log(`  ✅ Passed: ${passedChecks}`);
console.log(`  ❌ Failed: ${failedChecks}`);

if (failedChecks === 0) {
  console.log('\n🎉 All checks passed! Your application is ready for deployment.');
  console.log('\n📖 Next steps:');
  console.log('  1. Push your code to GitHub');
  console.log('  2. Follow the DEPLOYMENT_GUIDE.md');
  console.log('  3. Deploy backend to Railway');
  console.log('  4. Deploy frontend to Cloudflare Pages');
  console.log('  5. Configure environment variables');
  console.log('  6. Test your deployed application');
} else {
  console.log('\n⚠️  Some checks failed. Please address the issues above before deploying.');
  console.log('\n📖 Failed checks:');
  checks.filter(check => !check.passed).forEach(check => {
    console.log(`    - ${check.name}`);
  });
}

console.log('\n🚀 Happy deploying!');