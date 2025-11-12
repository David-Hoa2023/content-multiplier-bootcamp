# Cấu hình API Keys

## Bước 1: Tạo file .env

Tạo file `.env` trong thư mục `backend/` với nội dung sau:

```env
# Database Configuration
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ideas_db

# Server Configuration
PORT=4000

# OpenAI API Key (Required for generate ideas feature)
OPENAI_API_KEY=sk-your-openai-api-key-here

# Optional: Other AI Provider API Keys
# GEMINI_API_KEY=your_gemini_api_key_here
# ANTHROPIC_API_KEY=your_anthropic_api_key_here
# DEEPSEEK_API_KEY=your_deepseek_api_key_here
```

## Bước 2: Lấy API Key

### OpenAI (Khuyến nghị)
1. Truy cập https://platform.openai.com/api-keys
2. Đăng nhập hoặc tạo tài khoản
3. Click "Create new secret key"
4. Copy API key và paste vào `.env`

### Gemini (Tùy chọn)
1. Truy cập https://makersuite.google.com/app/apikey
2. Tạo API key mới
3. Copy và paste vào `.env`

### Anthropic (Tùy chọn)
1. Truy cập https://console.anthropic.com/
2. Tạo API key mới
3. Copy và paste vào `.env`

### Deepseek (Tùy chọn)
1. Truy cập https://platform.deepseek.com/
2. Tạo API key mới
3. Copy và paste vào `.env`

## Bước 3: Restart Backend

Sau khi thêm API key vào `.env`, restart backend server:

```bash
cd backend
npm run dev
```

## Kiểm tra

Khi backend khởi động, bạn sẽ thấy log:
```
🔑 Checking API keys...
OpenAI: ✅ Configured
Gemini: ❌ Not configured
Anthropic: ❌ Not configured
Deepseek: ❌ Not configured
```

Nếu thấy `✅ Configured` cho ít nhất một provider, bạn có thể sử dụng tính năng generate ideas!

## Lưu ý

- File `.env` sẽ không được commit vào git (đã có trong .gitignore)
- Ít nhất một API key phải được cấu hình để tính năng hoạt động
- Không chia sẻ API key của bạn với người khác

