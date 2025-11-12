#!/bin/bash

echo "🧪 Testing AI Integration"
echo "=========================="
echo ""

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

API_URL="http://localhost:4000"

# Test 1: Get available providers
echo -e "${YELLOW}Test 1: Get Available Providers${NC}"
curl -s "$API_URL/ai/providers" | python -m json.tool
echo ""
echo ""

# Test 2: Get OpenAI models
echo -e "${YELLOW}Test 2: Get OpenAI Models${NC}"
curl -s "$API_URL/ai/providers/openai/models" | python -m json.tool
echo ""
echo ""

# Test 3: Get Gemini models
echo -e "${YELLOW}Test 3: Get Gemini Models${NC}"
curl -s "$API_URL/ai/providers/gemini/models" | python -m json.tool
echo ""
echo ""

# Test 4: Generate content (if you have API key)
echo -e "${YELLOW}Test 4: Generate Content with AI${NC}"
echo "Note: This will only work if you have configured an API key in .env"
echo ""

# Example with Gemini (change provider based on your API key)
curl -s -X POST "$API_URL/ai/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write 3 short content ideas about using AI in education",
    "provider": "gemini",
    "model": "gemini-pro",
    "temperature": 0.8,
    "maxTokens": 300
  }' | python -m json.tool

echo ""
echo ""

# Test 5: Generate idea description
echo -e "${YELLOW}Test 5: Generate Idea Description${NC}"
curl -s -X POST "$API_URL/ai/generate-idea" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Social Media Campaign for AI Product",
    "persona": "Marketing Manager",
    "industry": "Technology",
    "provider": "gemini",
    "temperature": 0.7
  }' | python -m json.tool

echo ""
echo ""
echo -e "${GREEN}✅ All tests completed!${NC}"
echo ""
echo "Note: If you see errors, make sure you have:"
echo "1. Added API keys to backend/.env"
echo "2. Restarted the backend server"
echo "3. The provider you're testing is configured"
