# 📝 Ví dụ Sử dụng AI Integration

## Ví dụ 1: Generate Content Ideas

### Request:
```bash
curl -X POST http://localhost:4000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Generate 5 creative content ideas for a tech startup selling AI-powered productivity tools",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.9,
    "maxTokens": 500
  }'
```

### Response:
```json
{
  "success": true,
  "data": {
    "content": "1. **AI Productivity Hacks Series**: Create a weekly video series showcasing different AI tools...\n2. **Before & After Case Studies**: Share real customer stories...\n3. **AI Myth-Busting Blog**: Address common misconceptions...\n4. **Interactive Tool Comparison**: Build an interactive calculator...\n5. **Behind-the-Scenes AI Development**: Show the human side...",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "tokensUsed": 245,
    "duration": "1823ms"
  }
}
```

---

## Ví dụ 2: Generate Idea Description

### Request:
```bash
curl -X POST http://localhost:4000/ai/generate-idea \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Video Tutorial Series về Next.js 14",
    "persona": "Beginner Developer",
    "industry": "Education",
    "provider": "gemini",
    "temperature": 0.7
  }'
```

### Response:
```json
{
  "success": true,
  "data": {
    "description": "**Description:**\nA comprehensive video tutorial series designed for developers new to Next.js 14. This series will cover everything from basic concepts like routing and data fetching to advanced topics such as server components and streaming.\n\n**Key Talking Points:**\n- Server Components vs Client Components\n- App Router fundamentals\n- Data fetching strategies (SSR, SSG, ISR)\n- SEO optimization\n- Performance best practices\n\n**Content Format:**\n- 10-15 minute bite-sized videos\n- Hands-on coding examples\n- GitHub repository with code samples\n- Weekly Q&A sessions",
    "provider": "gemini",
    "model": "gemini-pro"
  }
}
```

---

## Ví dụ 3: Creative Writing với High Temperature

### Request:
```bash
curl -X POST http://localhost:4000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Write a catchy social media post announcing a new AI feature launch",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 1.2,
    "maxTokens": 200
  }'
```

### Temperature Guide:
- **0.0-0.3**: Factual, deterministic (documentation, technical content)
- **0.4-0.7**: Balanced (blog posts, tutorials)
- **0.8-1.2**: Creative (social media, marketing)
- **1.3-2.0**: Highly creative (brainstorming, fiction)

---

## Ví dụ 4: Technical Content với Low Temperature

### Request:
```bash
curl -X POST http://localhost:4000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Explain how TypeScript generics work with a simple example",
    "provider": "deepseek",
    "model": "deepseek-chat",
    "temperature": 0.3,
    "maxTokens": 400
  }'
```

---

## Ví dụ 5: Batch Processing Multiple Ideas

```javascript
// Node.js example
const ideas = [
  { title: "AI in Healthcare", persona: "Doctor", industry: "Healthcare" },
  { title: "Blockchain for Supply Chain", persona: "Logistics Manager", industry: "Logistics" },
  { title: "Remote Work Tips", persona: "Team Lead", industry: "Tech" }
];

async function generateAllDescriptions() {
  const results = await Promise.all(
    ideas.map(idea =>
      fetch('http://localhost:4000/ai/generate-idea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...idea,
          provider: 'openai',
          temperature: 0.7
        })
      }).then(r => r.json())
    )
  );

  return results;
}
```

---

## Ví dụ 6: Error Handling

### Scenario: Provider không được config

```bash
curl -X POST http://localhost:4000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test",
    "provider": "openai"
  }'
```

### Response (nếu chưa có API key):
```json
{
  "success": false,
  "error": "OpenAI API key not configured",
  "provider": "openai",
  "model": "gpt-4o-mini"
}
```

### Scenario: Invalid temperature

```bash
curl -X POST http://localhost:4000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Test",
    "provider": "gemini",
    "temperature": 3.5
  }'
```

### Response:
```json
{
  "success": false,
  "error": "Temperature must be between 0 and 2"
}
```

---

## Ví dụ 7: Retry Logic in Action

Khi gọi AI bị lỗi tạm thời (network issues, rate limits), hệ thống sẽ tự động retry:

```
Attempt 1 failed, retrying in 1000ms...
Attempt 2 failed, retrying in 2000ms...
Attempt 3 failed, retrying in 4000ms...
Error: Max retries reached
```

Console log sẽ hiển thị quá trình retry.

---

## Best Practices

### 1. Check Available Providers First
```javascript
const providers = await fetch('http://localhost:4000/ai/providers')
  .then(r => r.json());

if (providers.data.length === 0) {
  console.log('No AI providers configured');
  return;
}
```

### 2. Handle Errors Gracefully
```javascript
const result = await generateContent({ ... });

if (!result.success) {
  // Fallback to manual input
  console.error('AI generation failed:', result.error);
  return defaultDescription;
}

return result.data.content;
```

### 3. Optimize Token Usage
```javascript
// Sử dụng maxTokens để kiểm soát chi phí
const result = await fetch('/ai/generate', {
  method: 'POST',
  body: JSON.stringify({
    prompt: 'Short summary...',
    provider: 'openai',
    maxTokens: 150  // Limit to ~150 tokens
  })
});
```

### 4. Choose Right Provider for Task
- **Code generation**: Deepseek, GPT-4
- **Creative content**: Claude, GPT-4
- **Quick summaries**: Gemini Flash, GPT-3.5
- **Complex reasoning**: Claude Opus, GPT-4

---

## Cost Optimization Tips

1. **Start with cheaper models**: `gpt-4o-mini`, `gemini-1.5-flash`
2. **Set appropriate maxTokens**: Don't over-generate
3. **Cache results**: Don't regenerate same content
4. **Batch requests**: Use Promise.all for multiple requests
5. **Monitor usage**: Track tokensUsed in responses

---

🎯 **Ready to try?** Copy bất kỳ ví dụ nào ở trên và chạy ngay!
