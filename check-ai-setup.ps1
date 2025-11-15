# PowerShell script to check AI setup

Write-Host "Checking AI Setup..." -ForegroundColor Cyan
Write-Host ""

# Check if backend is running
Write-Host "1. Checking if backend is running..." -ForegroundColor Yellow
try {
  $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 5 -ErrorAction Stop
  Write-Host "   [OK] Backend is running at http://localhost:4000" -ForegroundColor Green
}
catch {
  Write-Host "   [FAIL] Backend is NOT running" -ForegroundColor Red
  Write-Host "   -> Start it with: cd backend && npm run dev" -ForegroundColor Yellow
  exit 1
}

Write-Host ""

# Check available AI providers
Write-Host "2. Checking configured AI providers..." -ForegroundColor Yellow
try {
  $response = Invoke-RestMethod -Uri "http://localhost:4000/ai/providers" -Method Get -TimeoutSec 5

  if ($response.data -and $response.data.Count -gt 0) {
    Write-Host "   [OK] Configured providers: $($response.data -join ', ')" -ForegroundColor Green
  }
  else {
    Write-Host "   [FAIL] No AI providers configured" -ForegroundColor Red
    Write-Host ""
    Write-Host "   To fix this:" -ForegroundColor Yellow
    Write-Host "   1. Open backend\.env file"
    Write-Host "   2. Add at least one API key:"
    Write-Host "      OPENAI_API_KEY=sk-..."
    Write-Host "      ANTHROPIC_API_KEY=sk-ant-..."
    Write-Host "      DEEPSEEK_API_KEY=..."
    Write-Host "      GEMINI_API_KEY=..."
    Write-Host "   3. Restart the backend"
    Write-Host ""
    Write-Host "   OR use the Settings page in the frontend to add API keys" -ForegroundColor Cyan
    exit 1
  }
}
catch {
  Write-Host "   [FAIL] Failed to check providers: $($_.Exception.Message)" -ForegroundColor Red
  exit 1
}

Write-Host ""

# Check database
Write-Host "3. Checking database connection..." -ForegroundColor Yellow
try {
  $dockerPs = docker ps --filter "name=ideas_db" --format "{{.Names}}" 2>$null

  if ($dockerPs -match "ideas_db") {
    Write-Host "   [OK] Database container is running" -ForegroundColor Green
  }
  else {
    Write-Host "   [FAIL] Database container is NOT running" -ForegroundColor Red
    Write-Host "   -> Start it with: docker-compose up -d" -ForegroundColor Yellow
    exit 1
  }
}
catch {
  Write-Host "   [WARN] Could not check Docker (Docker might not be installed or not running)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "All checks passed! You should be able to generate AI content." -ForegroundColor Green
Write-Host ""
Write-Host "Test it:" -ForegroundColor Cyan
Write-Host "   1. Go to http://localhost:3000"
Write-Host "   2. Enter a title in the idea form"
Write-Host "   3. Click the AI generate button"
Write-Host "   4. Wait a few seconds for the AI to generate content"
Write-Host ""
