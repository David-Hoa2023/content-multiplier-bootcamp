# Tính năng Generate Ideas với AI

## Tổng quan

Tính năng này cho phép tự động sinh 10 ý tưởng nội dung bằng AI dựa trên Persona và Industry được nhập vào.

## Cấu trúc Backend

### 1. LLMClient (`backend/src/services/llmClient.ts`)
- Class quản lý kết nối đến các LLM providers: OpenAI, Gemini, Anthropic, Deepseek
- Method `generateCompletion()` để gọi API của từng provider
- Tự động detect providers có sẵn dựa trên API keys trong `.env`

### 2. IdeaGenerator (`backend/src/services/ideaGenerator.ts`)
- Service xử lý logic generate ideas với retry
- Retry tối đa 3 lần với exponential backoff (1s, 2s, 4s)
- Prompt template được tối ưu để LLM trả về JSON đúng format

### 3. Validation Schema (`backend/src/schemas/ideaSchema.ts`)
- Dùng AJV để validate JSON response từ LLM
- Hỗ trợ 2 format: `{ ideas: [...] }` và `[...]` (direct array)
- Đảm bảo mỗi idea có đủ: title, description, rationale

### 4. API Endpoint (`backend/src/routes/ideas.ts`)
- **POST `/ideas/generate`**
- Body: `{ persona: string, industry: string, provider?: 'openai' | 'gemini' | 'anthropic' | 'deepseek' }`
- Response: `{ success: boolean, data: { generated, saved, failed, ideas, errors }, attempts }`

## Cấu trúc Frontend

### Form Generate Ideas
- Section riêng ở đầu trang với form nhập Persona và Industry
- Button "Generate Ideas" với loading spinner
- Hiển thị error message nếu fail
- Hiển thị danh sách 10 ý tưởng đã tạo thành công

### Features
- ✅ Loading state với spinner (Loader2 từ lucide-react)
- ✅ Error handling với message rõ ràng
- ✅ Disabled state khi đang generate
- ✅ Auto refresh danh sách ideas sau khi generate thành công

## Flow hoạt động

1. User nhập Persona và Industry
2. Click "Generate Ideas"
3. Frontend gọi POST `/ideas/generate`
4. Backend:
   - Validate input
   - Tạo prompt với template
   - Gọi LLM API (retry tối đa 3 lần nếu JSON sai format)
   - Validate JSON response với AJV
   - Lưu 10 ideas vào database
5. Frontend nhận response và hiển thị kết quả

## Retry Logic

- **Attempt 1**: Gọi LLM → Validate JSON
- **Nếu fail**: Đợi 1s → Retry
- **Attempt 2**: Gọi LLM lại → Validate JSON
- **Nếu fail**: Đợi 2s → Retry
- **Attempt 3**: Gọi LLM lần cuối → Validate JSON
- **Nếu vẫn fail**: Trả về error

## Cài đặt API Keys

Thêm vào `.env` file trong `backend/`:

```env
OPENAI_API_KEY=your_openai_key
GEMINI_API_KEY=your_gemini_key
ANTHROPIC_API_KEY=your_anthropic_key
DEEPSEEK_API_KEY=your_deepseek_key
```

Ít nhất một provider phải được cấu hình để tính năng hoạt động.

## Testing

1. Đảm bảo backend đang chạy: `cd backend && npm run dev`
2. Đảm bảo frontend đang chạy: `cd frontend && npm run dev`
3. Truy cập http://localhost:3000
4. Nhập Persona (ví dụ: "Marketing Manager")
5. Nhập Industry (ví dụ: "Technology")
6. Click "Generate Ideas"
7. Chờ vài giây để LLM generate
8. Kiểm tra 10 ideas mới trong danh sách

## Troubleshooting

### JSON validation failed
- LLM có thể trả về JSON không đúng format
- Hệ thống sẽ tự động retry với exponential backoff
- Nếu vẫn fail sau 3 lần, kiểm tra prompt template

### Provider not available
- Kiểm tra API key đã được thêm vào `.env` chưa
- Restart backend sau khi thêm API key

### Ideas không được lưu vào database
- Kiểm tra kết nối database
- Xem logs trong backend console

