# Start All Servers Script
# Usage: .\start-all.ps1

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Starting Idea Management App" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Start Database
Write-Host "📦 Starting database..." -ForegroundColor Yellow
docker-compose up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to start database" -ForegroundColor Red
    exit 1
}

Write-Host "⏳ Waiting for database to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Check database status
$dbStatus = docker-compose ps --format json | ConvertFrom-Json
if ($dbStatus.Status -like "*healthy*" -or $dbStatus.Status -like "*Up*") {
    Write-Host "✅ Database is running" -ForegroundColor Green
} else {
    Write-Host "⚠️  Database status: $($dbStatus.Status)" -ForegroundColor Yellow
    Write-Host "   Checking logs..." -ForegroundColor Yellow
    docker-compose logs --tail=10 postgres
}

# Start Backend
Write-Host "`n🚀 Starting backend server..." -ForegroundColor Yellow
Write-Host "   Opening new terminal for backend..." -ForegroundColor Gray

$backendScript = @"
cd '$PWD\backend'
npm run dev
"@

$backendScript | Out-File -FilePath "$PWD\backend\start-backend.ps1" -Encoding UTF8
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PWD\backend'; npm run dev"

Start-Sleep -Seconds 3

# Check backend
Write-Host "`n🔍 Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 3 -ErrorAction Stop
    Write-Host "✅ Backend is running (Status: $($response.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "⏳ Backend is starting... Please check the backend terminal window" -ForegroundColor Yellow
    Write-Host "   It may take a few more seconds to start" -ForegroundColor Gray
}

# Summary
Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "   Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Cyan
Write-Host "📍 Frontend: " -NoNewline -ForegroundColor White
Write-Host "http://localhost:3000" -ForegroundColor Cyan
Write-Host "📍 Backend:  " -NoNewline -ForegroundColor White
Write-Host "http://localhost:4000" -ForegroundColor Cyan
Write-Host "📍 Database: " -NoNewline -ForegroundColor White
Write-Host "localhost:5433" -ForegroundColor Cyan
Write-Host "`n💡 Tip: Check the backend terminal window for any errors`n" -ForegroundColor Gray

