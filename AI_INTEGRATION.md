# 🤖 AI Integration Guide

## Tổng quan

Ứng dụng hỗ trợ tích hợp với 4 AI providers:
- **OpenAI** (GPT-4, GPT-3.5)
- **Google Gemini** (Gemini 1.5 Pro/Flash)
- **Anthropic Claude** (Claude 3.5 Sonnet, Opus, Haiku)
- **Deepseek** (Deepseek Chat/Coder)

## Cấu hình API Keys

### Bước 1: Lấy API Keys

1. **OpenAI**: https://platform.openai.com/api-keys
2. **Gemini**: https://makersuite.google.com/app/apikey
3. **Anthropic**: https://console.anthropic.com/
4. **Deepseek**: https://platform.deepseek.com/

### Bước 2: Thêm vào `.env`

Mở file `backend/.env` và thêm API keys:

```env
# AI API Keys
OPENAI_API_KEY=sk-...
GEMINI_API_KEY=AIza...
ANTHROPIC_API_KEY=sk-ant-...
DEEPSEEK_API_KEY=sk-...
```

**Lưu ý:** Bạn chỉ cần thêm API key của provider nào bạn muốn sử dụng.

### Bước 3: Restart Backend

```bash
# Backend sẽ tự động phát hiện providers có sẵn
# Xem log để kiểm tra: "🤖 AI Providers available: ..."
```

## API Endpoints

### 1. Lấy danh sách providers có sẵn

```bash
GET /ai/providers
```

Response:
```json
{
  "success": true,
  "data": ["openai", "gemini", "anthropic"],
  "message": "3 provider(s) available"
}
```

### 2. Lấy danh sách models của provider

```bash
GET /ai/providers/:provider/models
```

Example:
```bash
curl http://localhost:4000/ai/providers/openai/models
```

Response:
```json
{
  "success": true,
  "data": ["gpt-4o", "gpt-4o-mini", "gpt-4-turbo", "gpt-3.5-turbo"],
  "provider": "openai"
}
```

### 3. Generate content với AI

```bash
POST /ai/generate
```

Request body:
```json
{
  "prompt": "Write a blog post about AI",
  "provider": "openai",
  "model": "gpt-4o-mini",
  "temperature": 0.7,
  "maxTokens": 2000
}
```

Parameters:
- `prompt` (required): Yêu cầu cho AI
- `provider` (required): `openai` | `gemini` | `anthropic` | `deepseek`
- `model` (optional): Tên model cụ thể. Mặc định sử dụng model tốt nhất của provider
- `temperature` (optional): 0-2. Mặc định 0.7. Càng cao càng sáng tạo
- `maxTokens` (optional): Số tokens tối đa. Mặc định 2000

Response:
```json
{
  "success": true,
  "data": {
    "content": "AI has revolutionized...",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "tokensUsed": 150,
    "duration": "1234ms"
  }
}
```

### 4. Generate idea content (Convenience endpoint)

```bash
POST /ai/generate-idea
```

Request body:
```json
{
  "title": "Social Media Campaign",
  "persona": "Marketing Manager",
  "industry": "Technology",
  "provider": "gemini",
  "temperature": 0.8
}
```

Response:
```json
{
  "success": true,
  "data": {
    "description": "A comprehensive social media campaign...",
    "provider": "gemini",
    "model": "gemini-1.5-flash"
  }
}
```

## Retry Logic

Tất cả AI calls đều có **automatic retry** với exponential backoff:
- Retry tối đa: **3 lần**
- Base delay: 1000ms (tăng gấp đôi mỗi lần retry: 1s, 2s, 4s)
- Không retry với lỗi authentication (401)

## Ví dụ sử dụng

### Ví dụ 1: Generate với OpenAI

```bash
curl -X POST http://localhost:4000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Viết 3 ý tưởng nội dung về AI trong marketing",
    "provider": "openai",
    "model": "gpt-4o-mini",
    "temperature": 0.9
  }'
```

### Ví dụ 2: Generate idea với Gemini

```bash
curl -X POST http://localhost:4000/ai/generate-idea \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Video Tutorial về TypeScript",
    "persona": "Lập trình viên mới",
    "industry": "Technology",
    "provider": "gemini"
  }'
```

### Ví dụ 3: Generate với Claude

```bash
curl -X POST http://localhost:4000/ai/generate \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Phân tích xu hướng AI 2024",
    "provider": "anthropic",
    "model": "claude-3-5-sonnet-20241022",
    "temperature": 0.5,
    "maxTokens": 1500
  }'
```

## Default Models

Mỗi provider có default model được chọn tự động:

| Provider | Default Model |
|----------|---------------|
| OpenAI | gpt-4o-mini |
| Gemini | gemini-1.5-flash |
| Anthropic | claude-3-5-sonnet-20241022 |
| Deepseek | deepseek-chat |

## Error Handling

Các lỗi phổ biến:

1. **Provider not configured**
```json
{
  "success": false,
  "error": "OpenAI API key not configured"
}
```
→ Thêm API key vào `.env`

2. **Invalid temperature**
```json
{
  "success": false,
  "error": "Temperature must be between 0 and 2"
}
```

3. **API Error** (sau 3 retries)
```json
{
  "success": false,
  "error": "Rate limit exceeded"
}
```

## Code Structure

```
backend/src/
├── services/
│   └── aiService.ts       # Core AI logic với retry
├── routes/
│   └── ai.ts              # API endpoints
└── index.ts               # Register routes
```

## Pricing Tips

- **Development**: Dùng `gpt-4o-mini`, `gemini-1.5-flash` (rẻ, nhanh)
- **Production**: Dùng `gpt-4o`, `claude-3-5-sonnet` (chất lượng cao)
- Set `maxTokens` thấp để tiết kiệm chi phí
- Use lower `temperature` (0.3-0.5) cho nội dung factual

## Best Practices

1. **Always check available providers first**
```javascript
const providers = await fetch('/ai/providers').then(r => r.json());
```

2. **Handle errors gracefully**
```javascript
const result = await generateAI({ ... });
if (!result.success) {
  console.error(result.error);
  // Fallback logic
}
```

3. **Use appropriate temperature**
- Creative content: 0.7-1.0
- Factual content: 0.3-0.5
- Code generation: 0.2-0.4

4. **Optimize prompts**
- Rõ ràng, cụ thể
- Cho ví dụ nếu cần
- Giới hạn độ dài output

---

🎉 Happy AI Generation!
