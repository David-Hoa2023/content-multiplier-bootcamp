#!/bin/bash

# Script to replace hardcoded localhost:4000 URLs with API_URL from config
# This updates all frontend files to use the centralized API configuration

echo "🔄 Updating API URLs in frontend files..."

# List of files to update (found via grep)
files=(
  "src/app/test-packs-draft/page.tsx"
  "src/app/review/page.tsx"
  "src/app/derivatives/page.tsx"
  "src/app/components/MarkdownEditor.tsx"
  "src/app/components/ContentPlansPage.tsx"
  "src/components/ui/platform-configuration-modal.tsx"
  "src/app/analytics/page.tsx"
  "src/app/packs/[pack_id]/edit/page.tsx"
  "src/components/ui/content-pack-selector.tsx"
  "src/components/knowledge/knowledge-query.tsx"
  "src/components/knowledge/category-manager.tsx"
  "src/components/knowledge/document-list.tsx"
  "src/components/knowledge/document-uploader.tsx"
  "src/app/settings/platforms/page.tsx"
  "src/app/test-brief/page.tsx"
  "src/app/publish/page.tsx"
  "src/app/knowledge/page.tsx"
  "src/app/documents/page.tsx"
  "src/app/drafts/page.tsx"
  "src/app/edit/page.tsx"
  "src/app/components/ContentPlanView.tsx"
  "src/app/briefs/[brief_id]/page.tsx"
  "src/app/briefs/page.tsx"
)

count=0

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  📝 Processing $file"

    # Check if file already imports API_URL
    if grep -q "import.*API_URL.*from.*@/lib/api-config" "$file"; then
      echo "    ✅ Already has API_URL import"
    else
      # Add import after other imports (look for last import statement)
      sed -i "/^import.*from/a import { API_URL } from '@/lib/api-config';" "$file" 2>/dev/null || {
        echo "    ⚠️  Could not add import automatically - please add manually"
      }
    fi

    # Replace hardcoded URLs
    # Pattern 1: const API_URL = 'http://localhost:4000'
    sed -i "s/const API_URL = 'http:\/\/localhost:4000'/\/\/ API_URL imported from @\/lib\/api-config/" "$file"

    # Pattern 2: Direct fetch with http://localhost:4000
    sed -i "s/'http:\/\/localhost:4000/\`\${API_URL}/g" "$file"
    sed -i "s/\"http:\/\/localhost:4000/\`\${API_URL}/g" "$file"

    # Fix template literal closing
    sed -i "s/\`\${API_URL}\([^'\"]*\)'/\`\${API_URL}\1\`/g" "$file"
    sed -i "s/\`\${API_URL}\([^'\"]*\)\"/\`\${API_URL}\1\`/g" "$file"

    ((count++))
  else
    echo "  ⚠️  File not found: $file"
  fi
done

echo ""
echo "✅ Updated $count files"
echo "📋 Next steps:"
echo "   1. Review the changes with: git diff"
echo "   2. Test locally with: npm run dev"
echo "   3. Set NEXT_PUBLIC_API_URL in Vercel environment variables"
echo "   4. Deploy to Vercel"
