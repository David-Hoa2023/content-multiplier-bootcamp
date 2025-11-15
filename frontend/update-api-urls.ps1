# PowerShell script to replace hardcoded localhost:4000 URLs with API_URL from config
# This updates all frontend files to use the centralized API configuration

Write-Host "🔄 Updating API URLs in frontend files..." -ForegroundColor Cyan

# List of files to update
$files = @(
  "src\app\test-packs-draft\page.tsx",
  "src\app\review\page.tsx",
  "src\app\derivatives\page.tsx",
  "src\app\components\MarkdownEditor.tsx",
  "src\app\components\ContentPlansPage.tsx",
  "src\components\ui\platform-configuration-modal.tsx",
  "src\app\analytics\page.tsx",
  "src\app\packs\[pack_id]\edit\page.tsx",
  "src\components\ui\content-pack-selector.tsx",
  "src\components\knowledge\knowledge-query.tsx",
  "src\components\knowledge\category-manager.tsx",
  "src\components\knowledge\document-list.tsx",
  "src\components\knowledge\document-uploader.tsx",
  "src\app\settings\platforms\page.tsx",
  "src\app\test-brief\page.tsx",
  "src\app\publish\page.tsx",
  "src\app\knowledge\page.tsx",
  "src\app\documents\page.tsx",
  "src\app\drafts\page.tsx",
  "src\app\edit\page.tsx",
  "src\app\components\ContentPlanView.tsx",
  "src\app\briefs\[brief_id]\page.tsx",
  "src\app\briefs\page.tsx"
)

$count = 0

foreach ($file in $files) {
  if (Test-Path $file) {
    Write-Host "  📝 Processing $file" -ForegroundColor Yellow

    $content = Get-Content $file -Raw

    # Check if file already imports API_URL
    if ($content -match "import.*API_URL.*from.*@/lib/api-config") {
      Write-Host "    ✅ Already has API_URL import" -ForegroundColor Green
    }
    else {
      # Add import after the last import statement
      if ($content -match "(.*)(import .* from .*\n)(.*)") {
        $lastImportIndex = $content.LastIndexOf("import")
        $lineEnd = $content.IndexOf("`n", $lastImportIndex)
        $content = $content.Insert($lineEnd + 1, "import { API_URL } from '@/lib/api-config';`n")
        Write-Host "    ✅ Added API_URL import" -ForegroundColor Green
      }
    }

    # Replace patterns
    # Pattern 1: const API_URL = 'http://localhost:4000'
    $pattern1 = "const API_URL = 'http://localhost:4000'"
    $replace1 = '// API_URL imported from @/lib/api-config'
    $content = $content -replace [regex]::Escape($pattern1), $replace1

    # Pattern 2: Direct fetch URLs with single quotes
    $pattern2 = "'http://localhost:4000"
    $replace2 = '`${API_URL}'
    $content = $content -replace [regex]::Escape($pattern2), $replace2

    # Pattern 3: Direct fetch URLs with double quotes
    $pattern3 = '"http://localhost:4000'
    $content = $content -replace [regex]::Escape($pattern3), $replace2

    # Save the file
    $content | Set-Content $file -NoNewline
    $count++

    Write-Host "    ✅ Updated" -ForegroundColor Green
  }
  else {
    Write-Host "  ⚠️  File not found: $file" -ForegroundColor Red
  }
}

Write-Host ""
Write-Host "✅ Updated $count files" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Review the changes with: git diff" -ForegroundColor White
Write-Host "   2. Test locally with: npm run dev" -ForegroundColor White
Write-Host "   3. Set NEXT_PUBLIC_API_URL in Vercel environment variables" -ForegroundColor White
Write-Host "   4. Deploy to Vercel" -ForegroundColor White
