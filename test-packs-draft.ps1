# Test script for POST /api/packs/draft endpoint
# Tests SSE streaming with LLMClient

$API_URL = "http://localhost:4000"

Write-Host "Testing POST /api/packs/draft endpoint" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Check if server is running
Write-Host "Step 1: Checking if server is running..." -ForegroundColor Yellow
try {
    $healthCheck = Invoke-RestMethod -Uri "$API_URL/health" -Method Get -ErrorAction Stop
    Write-Host "OK: Server is running" -ForegroundColor Green
    Write-Host "   Status: $($healthCheck.status)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "ERROR: Server is not running. Please start the backend server first." -ForegroundColor Red
    Write-Host "   Run: cd backend; npm run dev" -ForegroundColor Yellow
    Write-Host ""
    exit 1
}

# Step 2: Check available AI providers
Write-Host "Step 2: Checking available AI providers..." -ForegroundColor Yellow
try {
    $providers = Invoke-RestMethod -Uri "$API_URL/ai/providers" -Method Get
    if ($providers.data.Count -eq 0) {
        Write-Host "WARNING: No AI providers configured. Please add API keys to backend/.env" -ForegroundColor Yellow
        Write-Host "   The test will still run but may fail if no providers are available." -ForegroundColor Gray
        Write-Host ""
    } else {
        Write-Host "OK: Available providers: $($providers.data -join ', ')" -ForegroundColor Green
        Write-Host "   Message: $($providers.message)" -ForegroundColor Gray
        Write-Host ""
    }
} catch {
    Write-Host "WARNING: Could not check providers: $_" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Create a test brief in database (if needed)
Write-Host "Step 3: Checking for test brief in database..." -ForegroundColor Yellow
Write-Host "   Note: You may need to create a brief first using:" -ForegroundColor Gray
Write-Host "   INSERT INTO briefs (title, content) VALUES ('Test Brief', 'This is a test brief for content generation');" -ForegroundColor Gray
Write-Host ""

# Step 4: Test the endpoint (you'll need to provide a valid brief_id)
Write-Host "Step 4: Testing POST /api/packs/draft endpoint..." -ForegroundColor Yellow
Write-Host "   This test requires a valid brief_id from the database." -ForegroundColor Gray
Write-Host ""

# Prompt for brief_id or use a placeholder
$briefId = Read-Host "Enter a brief_id (or press Enter to skip this test)"

if ([string]::IsNullOrWhiteSpace($briefId)) {
    Write-Host "SKIP: Skipping endpoint test. To test manually, use:" -ForegroundColor Yellow
    Write-Host "" -ForegroundColor Cyan
    Write-Host "   curl -X POST $API_URL/api/packs/draft `" -ForegroundColor Cyan
    Write-Host "     -H 'Content-Type: application/json' `" -ForegroundColor Cyan
    Write-Host "     -d '{\"brief_id\": \"YOUR_BRIEF_ID\", \"audience\": \"Marketing professionals\"}' `" -ForegroundColor Cyan
    Write-Host "     --no-buffer" -ForegroundColor Cyan
    Write-Host ""
    exit 0
}

# Test the endpoint
Write-Host ""
Write-Host "REQUEST: Sending request to /api/packs/draft..." -ForegroundColor Cyan
Write-Host "   Brief ID: $briefId" -ForegroundColor Gray
Write-Host "   Audience: Marketing professionals" -ForegroundColor Gray
Write-Host ""

try {
    $body = @{
        brief_id = $briefId
        audience = "Marketing professionals"
    } | ConvertTo-Json

    # Use Invoke-WebRequest for SSE streaming
    $response = Invoke-WebRequest -Uri "$API_URL/api/packs/draft" -Method POST -ContentType "application/json" -Body $body -UseBasicParsing -ErrorAction Stop

    Write-Host "OK: Request sent successfully" -ForegroundColor Green
    Write-Host "   Status Code: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host ""
    
    # Parse SSE stream
    Write-Host "STREAM: Streaming response (SSE):" -ForegroundColor Cyan
    $lines = $response.Content -split "`r?`n"
    foreach ($line in $lines) {
        if ($line -match "^data: (.+)$") {
            try {
                $data = $matches[1] | ConvertFrom-Json
                switch ($data.type) {
                    "start" {
                        Write-Host "   START: Provider: $($data.provider)" -ForegroundColor Green
                    }
                    "chunk" {
                        Write-Host $data.content -NoNewline -ForegroundColor White
                    }
                    "done" {
                        Write-Host ""
                        Write-Host "   DONE: Pack ID: $($data.pack_id)" -ForegroundColor Green
                        Write-Host "          Word Count: $($data.word_count)" -ForegroundColor Green
                        Write-Host "          Total Length: $($data.total_length)" -ForegroundColor Green
                    }
                    "error" {
                        Write-Host ""
                        Write-Host "   ERROR: $($data.error)" -ForegroundColor Red
                    }
                }
            } catch {
                # Skip invalid JSON lines
            }
        }
    }
    
    Write-Host ""
    Write-Host "OK: Test completed successfully!" -ForegroundColor Green
    Write-Host ""
    
} catch {
    Write-Host ""
    Write-Host "ERROR: Test failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "   Response: $responseBody" -ForegroundColor Red
    }
    exit 1
}

Write-Host "SUCCESS: All tests completed!" -ForegroundColor Green
Write-Host ""
