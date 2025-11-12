# API Endpoint: POST /api/packs/draft

## Overview
Endpoint để tạo draft content từ brief sử dụng LLM với Server-Sent Events (SSE) streaming.

## Endpoint
```
POST http://localhost:4000/api/packs/draft
```

## Request Body
```json
{
  "pack_id": "uuid-string (optional)",
  "brief_id": "uuid-string (required)",
  "audience": "string (optional)",
  "provider": "openai|anthropic|deepseek|gemini (optional)",
  "model": "string (optional)"
}
```

### Parameters
- **pack_id** (optional): UUID của content pack. Nếu không có, sẽ tạo mới.
- **brief_id** (required): UUID của brief để lấy nội dung.
- **audience** (optional): Đối tượng mục tiêu cho nội dung.
- **provider** (optional): AI provider để sử dụng. Mặc định: provider đầu tiên có sẵn.
- **model** (optional): Model cụ thể để sử dụng. Mặc định: model mặc định của provider.

## Response Format: Server-Sent Events (SSE)

Endpoint trả về SSE stream với các message types:

### 1. Start Message
```json
{
  "type": "start",
  "provider": "openai"
}
```

### 2. Chunk Messages (streaming)
```json
{
  "type": "chunk",
  "content": "text chunk..."
}
```

### 3. Done Message
```json
{
  "type": "done",
  "pack_id": "uuid",
  "word_count": 250,
  "total_length": 1500
}
```

### 4. Error Message
```json
{
  "type": "error",
  "error": "Error message"
}
```

## Usage Examples

### JavaScript/TypeScript (Frontend)

```typescript
async function generateDraft(briefId: string, audience?: string) {
  const response = await fetch('http://localhost:4000/api/packs/draft', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      brief_id: briefId,
      audience: audience,
      provider: 'openai',
    }),
  })

  const reader = response.body?.getReader()
  const decoder = new TextDecoder()

  if (!reader) {
    throw new Error('No reader available')
  }

  let fullContent = ''

  while (true) {
    const { done, value } = await reader.read()
    
    if (done) break

    const chunk = decoder.decode(value)
    const lines = chunk.split('\n')

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = JSON.parse(line.slice(6))
        
        switch (data.type) {
          case 'start':
            console.log('Streaming started with provider:', data.provider)
            break
          
          case 'chunk':
            fullContent += data.content
            // Update UI with new chunk
            updateUI(data.content)
            break
          
          case 'done':
            console.log('Streaming completed!')
            console.log('Pack ID:', data.pack_id)
            console.log('Word count:', data.word_count)
            console.log('Total length:', data.total_length)
            break
          
          case 'error':
            console.error('Error:', data.error)
            break
        }
      }
    }
  }

  return fullContent
}

function updateUI(chunk: string) {
  // Append chunk to your UI element
  const contentElement = document.getElementById('draft-content')
  if (contentElement) {
    contentElement.textContent += chunk
  }
}
```

### Using EventSource (Alternative)

```javascript
// Note: EventSource only supports GET, so we need to use fetch with POST
// But here's an example if you convert to GET with query params:

function generateDraftWithEventSource(briefId, audience) {
  const eventSource = new EventSource(
    `http://localhost:4000/api/packs/draft?brief_id=${briefId}&audience=${audience}`
  )

  eventSource.onmessage = (event) => {
    const data = JSON.parse(event.data)
    
    if (data.type === 'chunk') {
      // Append chunk to UI
      document.getElementById('content').textContent += data.content
    } else if (data.type === 'done') {
      console.log('Completed:', data)
      eventSource.close()
    }
  }

  eventSource.onerror = (error) => {
    console.error('SSE Error:', error)
    eventSource.close()
  }
}
```

### cURL Example

```bash
curl -X POST http://localhost:4000/api/packs/draft \
  -H "Content-Type: application/json" \
  -d '{
    "brief_id": "your-brief-uuid",
    "audience": "Marketing professionals",
    "provider": "openai"
  }' \
  --no-buffer
```

### Python Example

```python
import requests
import json

def generate_draft(brief_id, audience=None):
    url = "http://localhost:4000/api/packs/draft"
    payload = {
        "brief_id": brief_id,
        "audience": audience,
        "provider": "openai"
    }
    
    response = requests.post(url, json=payload, stream=True)
    
    full_content = ""
    
    for line in response.iter_lines():
        if line:
            decoded = line.decode('utf-8')
            if decoded.startswith('data: '):
                data = json.loads(decoded[6:])
                
                if data['type'] == 'chunk':
                    full_content += data['content']
                    print(data['content'], end='', flush=True)
                elif data['type'] == 'done':
                    print(f"\n\nCompleted! Word count: {data['word_count']}")
                    return full_content
                elif data['type'] == 'error':
                    print(f"Error: {data['error']}")
                    return None
    
    return full_content
```

## Database Operations

### On Success:
- Nếu `pack_id` được cung cấp: Cập nhật pack hiện có
- Nếu không có `pack_id`: Tạo pack mới
- Lưu `draft_content`, `word_count`, và `status='draft'`
- Tự động cập nhật `updated_at` timestamp

### Word Count Calculation:
- Đếm số từ bằng cách split theo whitespace
- Loại bỏ các chuỗi rỗng
- Trả về số từ chính xác

## Error Handling

### 400 Bad Request
```json
{
  "success": false,
  "error": "brief_id is required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": "Brief not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": "Failed to generate draft"
}
```

## Supported Providers

- **OpenAI**: gpt-4o-mini, gpt-4o, gpt-4-turbo, gpt-3.5-turbo
- **Anthropic**: claude-3-5-sonnet-20241022, claude-3-opus, claude-3-sonnet, claude-3-haiku
- **Deepseek**: deepseek-chat, deepseek-coder
- **Gemini**: gemini-1.5-pro, gemini-1.5-flash, gemini-pro

## Notes

- SSE connection sẽ tự động đóng sau khi streaming hoàn tất
- Nếu có lỗi trong quá trình streaming, sẽ gửi error message qua SSE
- Word count được tính tự động từ nội dung đã generate
- Status luôn được set là 'draft' khi tạo/update pack








