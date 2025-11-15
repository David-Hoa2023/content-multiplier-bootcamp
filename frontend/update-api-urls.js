const fs = require('fs');
const path = require('path');

// List of files to update
const files = [
  "src/app/test-packs-draft/page.tsx",
  "src/app/review/page.tsx",
  "src/app/derivatives/page.tsx",
  "src/app/components/MarkdownEditor.tsx",
  "src/app/components/ContentPlansPage.tsx",
  "src/components/ui/platform-configuration-modal.tsx",
  "src/app/analytics/page.tsx",
  "src/app/packs/[pack_id]/edit/page.tsx",
  "src/components/ui/content-pack-selector.tsx",
  "src/components/knowledge/knowledge-query.tsx",
  "src/components/knowledge/category-manager.tsx",
  "src/components/knowledge/document-list.tsx",
  "src/components/knowledge/document-uploader.tsx",
  "src/app/settings/platforms/page.tsx",
  "src/app/test-brief/page.tsx",
  "src/app/publish/page.tsx",
  "src/app/knowledge/page.tsx",
  "src/app/documents/page.tsx",
  "src/app/drafts/page.tsx",
  "src/app/edit/page.tsx",
  "src/app/components/ContentPlanView.tsx",
  "src/app/briefs/[brief_id]/page.tsx",
  "src/app/briefs/page.tsx"
];

console.log('🔄 Updating API URLs in frontend files...\n');

let count = 0;

files.forEach(file => {
  const filePath = path.join(__dirname, file);

  if (!fs.existsSync(filePath)) {
    console.log(`  ⚠️  File not found: ${file}`);
    return;
  }

  console.log(`  📝 Processing ${file}`);

  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  // Check if file already imports API_URL
  if (!content.includes("import { API_URL } from '@/lib/api-config'")) {
    // Find the last import statement
    const importMatches = [...content.matchAll(/^import .* from .*$/gm)];
    if (importMatches.length > 0) {
      const lastImport = importMatches[importMatches.length - 1];
      const insertPos = lastImport.index + lastImport[0].length + 1;
      content = content.slice(0, insertPos) +
                "import { API_URL } from '@/lib/api-config';\n" +
                content.slice(insertPos);
      modified = true;
      console.log('    ✅ Added API_URL import');
    }
  } else {
    console.log('    ✅ Already has API_URL import');
  }

  // Replace const API_URL = 'http://localhost:4000'
  if (content.includes("const API_URL = 'http://localhost:4000'")) {
    content = content.replace(
      /const API_URL = ['"]http:\/\/localhost:4000['"]/g,
      "// API_URL imported from @/lib/api-config"
    );
    modified = true;
  }

  // Replace direct fetch URLs
  const oldPattern1 = /'http:\/\/localhost:4000/g;
  const oldPattern2 = /"http:\/\/localhost:4000/g;

  if (oldPattern1.test(content) || oldPattern2.test(content)) {
    content = content.replace(oldPattern1, '`${API_URL}');
    content = content.replace(oldPattern2, '`${API_URL}');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    count++;
    console.log('    ✅ Updated\n');
  } else {
    console.log('    ℹ️  No changes needed\n');
  }
});

console.log(`\n✅ Updated ${count} files\n`);
console.log('📋 Next steps:');
console.log('   1. Review the changes with: git diff');
console.log('   2. Test locally with: npm run dev');
console.log('   3. Set NEXT_PUBLIC_API_URL in Vercel environment variables');
console.log('   4. Deploy to Vercel');
