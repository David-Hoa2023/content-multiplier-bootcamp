#!/bin/bash

echo "🔍 Checking AI Setup..."
echo ""

# Check if backend is running
echo "1️⃣ Checking if backend is running..."
if curl -s http://localhost:4000/health > /dev/null 2>&1; then
  echo "   ✅ Backend is running at http://localhost:4000"
else
  echo "   ❌ Backend is NOT running"
  echo "   → Start it with: cd backend && npm run dev"
  exit 1
fi

echo ""

# Check available AI providers
echo "2️⃣ Checking configured AI providers..."
response=$(curl -s http://localhost:4000/ai/providers)
echo "   Response: $response"

providers=$(echo $response | grep -o '"data":\[[^]]*\]' | grep -o '\[[^]]*\]')

if [ -z "$providers" ] || [ "$providers" = "[]" ]; then
  echo "   ❌ No AI providers configured"
  echo ""
  echo "   📝 To fix this:"
  echo "   1. Open backend/.env file"
  echo "   2. Add at least one API key:"
  echo "      OPENAI_API_KEY=sk-..."
  echo "      ANTHROPIC_API_KEY=sk-ant-..."
  echo "      DEEPSEEK_API_KEY=..."
  echo "      GEMINI_API_KEY=..."
  echo "   3. Restart the backend"
  echo ""
  echo "   OR use the Settings page in the frontend to add API keys"
  exit 1
else
  echo "   ✅ Configured providers: $providers"
fi

echo ""

# Check database
echo "3️⃣ Checking database connection..."
docker ps | grep ideas_db > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "   ✅ Database container is running"
else
  echo "   ❌ Database container is NOT running"
  echo "   → Start it with: docker-compose up -d"
  exit 1
fi

echo ""
echo "✅ All checks passed! You should be able to generate AI content."
echo ""
echo "🧪 Test it:"
echo "   1. Go to http://localhost:3000"
echo "   2. Enter a title in the idea form"
echo "   3. Click 'Tạo mô tả bằng AI'"
echo "   4. Wait a few seconds for the AI to generate content"
