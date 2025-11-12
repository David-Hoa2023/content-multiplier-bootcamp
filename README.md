# 🎯 Idea Management App

Ứng dụng quản lý ý tưởng nội dung đơn giản với Fastify backend (TypeScript), PostgreSQL database, và Next.js frontend.

## 📋 Tính năng

### Ideas (Ý tưởng)
- ✅ Tạo ý tưởng mới với đầy đủ thông tin (title, description, persona, industry, status)
- ✅ Hiển thị danh sách tất cả ý tưởng
- ✅ Xóa và cập nhật ý tưởng
- 🤖 **AI Integration**: Generate ideas tự động với OpenAI, Gemini, Anthropic, Deepseek

### Content Plans (Kế hoạch nội dung)
- ✅ Tạo kế hoạch nội dung từ ý tưởng
- ✅ Xem chi tiết kế hoạch với thông tin ý tưởng gốc
- ✅ Tạo brief từ kế hoạch nội dung
- 🤖 **AI Integration**: Generate content plans tự động

### Briefs
- ✅ Tạo brief từ content plan
- ✅ Xem danh sách briefs với search
- ✅ Xem chi tiết brief với markdown rendering
- ✅ Xóa brief với icon dustbin
- ✅ Copy content to clipboard

### Workflow
- ✅ **Quy trình tạo nội dung**: Ideas → Briefs → Content Packs → Chỉnh sửa → Duyệt → Derivatives → Xuất bản
- ✅ Navigation giữa các bước trong workflow
- ✅ Hiển thị bước hiện tại và bước tiếp theo

### Technical
- ✅ API RESTful với Fastify
- ✅ Database PostgreSQL chạy trong Docker
- ✅ Frontend responsive với Next.js và TailwindCSS
- 🔄 **Retry Logic**: Tự động thử lại khi gọi AI bị lỗi (max 3 lần)

## 🛠️ Tech Stack

**Backend:**
- Fastify (Node.js framework)
- TypeScript
- PostgreSQL
- Docker
- OpenAI SDK, Gemini SDK, Anthropic SDK

**Frontend:**
- Next.js 14
- React 18
- TypeScript
- TailwindCSS

## 📦 Yêu cầu hệ thống

- Node.js 18+
- Docker và Docker Compose
- npm hoặc yarn

## 🚀 Hướng dẫn cài đặt và chạy

### Bước 1: Khởi động PostgreSQL Database

```bash
# Ở thư mục gốc của project
docker-compose up -d

# Kiểm tra database đã chạy chưa
docker ps
```

Database sẽ chạy ở `localhost:5433` với:
- Database: `ideas_db`
- Username: `postgres`
- Password: `postgres`
- Port mapping: `5433:5432` (external:internal)

### Bước 2: Chạy Backend API

```bash
# Di chuyển vào thư mục backend
cd backend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Backend sẽ chạy ở `http://localhost:4000`

**API Endpoints:**

**Ideas:**
- `GET /ideas` - Lấy tất cả ý tưởng
- `GET /ideas/:id` - Lấy một ý tưởng theo ID
- `POST /ideas` - Tạo ý tưởng mới
- `PUT /ideas/:id` - Cập nhật ý tưởng
- `DELETE /ideas/:id` - Xóa ý tưởng
- `POST /ideas/generate` - Generate ideas với AI

**Content Plans:**
- `GET /content-plans` - Lấy tất cả kế hoạch nội dung
- `GET /content-plans/:id` - Lấy chi tiết kế hoạch
- `POST /content-plans` - Tạo kế hoạch mới
- `POST /content-plans/generate-from-idea/:ideaId` - Generate kế hoạch từ ý tưởng với AI
- `PUT /content-plans/:id` - Cập nhật kế hoạch
- `DELETE /content-plans/:id` - Xóa kế hoạch

**Briefs:**
- `GET /briefs` - Lấy tất cả briefs
- `GET /briefs/:id` - Lấy chi tiết brief
- `POST /briefs` - Tạo brief mới
- `POST /briefs/create-from-plan/:planId` - Tạo brief từ content plan
- `PUT /briefs/:id` - Cập nhật brief
- `DELETE /briefs/:id` - Xóa brief

**Health:**
- `GET /health` - Health check

### Bước 3: Chạy Frontend

```bash
# Mở terminal mới, di chuyển vào thư mục frontend
cd frontend

# Cài đặt dependencies
npm install

# Chạy development server
npm run dev
```

Frontend sẽ chạy ở `http://localhost:3000`

## 🎨 Sử dụng ứng dụng

### Workflow: Ideas → Briefs → Content Packs → Chỉnh sửa → Duyệt → Derivatives → Xuất bản

1. **Tạo Ideas (Ý tưởng)**
   - Mở `http://localhost:3000`
   - Tab "Ý tưởng": Tạo ý tưởng mới hoặc generate với AI
   - Điền thông tin: Tiêu đề, Mô tả, Persona, Ngành nghề, Trạng thái

2. **Tạo Content Plans (Kế hoạch nội dung)**
   - Tab "Kế hoạch nội dung": Xem danh sách kế hoạch
   - Click vào ý tưởng để generate kế hoạch với AI
   - Xem chi tiết kế hoạch với thông tin đầy đủ

3. **Tạo Briefs**
   - Từ trang chi tiết content plan, click "Tạo Brief từ kế hoạch này"
   - Brief sẽ được tạo tự động từ thông tin kế hoạch
   - Xem danh sách briefs tại `/briefs`
   - Click vào brief để xem chi tiết với markdown rendering
   - Xóa brief bằng icon dustbin ở góc phải mỗi card

4. **Content Packs & Tiếp theo**
   - Từ brief detail, click "Tạo Content Pack từ brief"
   - Tiếp tục workflow: Chỉnh sửa → Duyệt → Derivatives → Xuất bản

## 📂 Cấu trúc thư mục

```
idea-management-app/
├── docker-compose.yml          # Docker configuration
├── init.sql                    # Database initialization
├── database/                    # Database schemas
│   ├── documents_schema.sql
│   └── documents_schema_basic.sql
├── backend/                    # Fastify API
│   ├── src/
│   │   ├── index.ts           # Main server file
│   │   ├── db.ts              # Database connection
│   │   ├── types.ts           # TypeScript types
│   │   ├── routes/
│   │   │   ├── ideas.ts       # Ideas API routes
│   │   │   ├── contentPlans.ts # Content plans API routes
│   │   │   ├── briefs.ts      # Briefs API routes
│   │   │   ├── packs.ts       # Content packs API routes
│   │   │   ├── documents.ts   # Documents API routes
│   │   │   └── ai.ts          # AI API routes
│   │   ├── services/
│   │   │   ├── aiService.ts   # AI service
│   │   │   ├── llmClient.ts   # LLM client
│   │   │   └── ideaGenerator.ts # Idea generator
│   │   └── migrations/        # Database migrations
│   ├── package.json
│   ├── tsconfig.json
│   └── .env
└── frontend/                   # Next.js app
    ├── src/
    │   └── app/
    │       ├── page.tsx        # Main page (Ideas & Content Plans)
    │       ├── briefs/
    │       │   ├── page.tsx    # Briefs list
    │       │   └── [brief_id]/
    │       │       └── page.tsx # Brief detail
    │       ├── components/
    │       │   ├── ContentPlansPage.tsx
    │       │   └── ContentPlanView.tsx
    │       ├── layout.tsx       # Root layout
    │       └── globals.css     # Global styles
    ├── package.json
    ├── tsconfig.json
    ├── tailwind.config.ts
    └── next.config.js
```

## 🧪 Test API với curl

```bash
# Health check
curl http://localhost:4000/health

# Ideas
curl http://localhost:4000/ideas
curl -X POST http://localhost:4000/ideas \
  -H "Content-Type: application/json" \
  -d '{"title": "Test Idea", "description": "Test", "persona": "Developer", "industry": "Tech", "status": "draft"}'

# Content Plans
curl http://localhost:4000/content-plans
curl -X POST http://localhost:4000/content-plans/generate-from-idea/1 \
  -H "Content-Type: application/json" \
  -d '{}'

# Briefs
curl http://localhost:4000/briefs
curl -X POST http://localhost:4000/briefs/create-from-plan/1 \
  -H "Content-Type: application/json" \
  -d '{}'
curl http://localhost:4000/briefs/{brief_id}
```

## 🛑 Dừng ứng dụng

```bash
# Dừng backend: Ctrl+C trong terminal đang chạy backend
# Dừng frontend: Ctrl+C trong terminal đang chạy frontend

# Dừng Docker database
docker-compose down

# Dừng và xóa data
docker-compose down -v
```

## 🐛 Troubleshooting

**Lỗi: Cannot connect to database**
- Kiểm tra Docker đã chạy chưa: `docker ps`
- Khởi động lại database: `docker-compose restart`

**Lỗi: Port already in use**
- Backend port 4000: Đổi PORT trong `backend/.env`
- Frontend port 3000: Chạy `npm run dev -- -p 3001`

**Lỗi: CORS issues**
- Backend đã cấu hình CORS cho phép tất cả origins trong development

## 📝 Notes

- Database có 2 sample records khi khởi tạo
- Tất cả dữ liệu sẽ bị xóa khi chạy `docker-compose down -v`
- Frontend tự động fetch dữ liệu mới sau khi tạo/xóa

## 🎓 Học viên có thể mở rộng

- ✅ Thêm chức năng cập nhật (PUT endpoint) - Đã có
- ✅ Thêm search và filter - Đã có search
- Thêm pagination cho danh sách
- Thêm authentication
- Thêm tính năng chỉnh sửa, duyệt, tạo derivatives
- Thêm tính năng xuất bản
- Deploy lên production (Vercel, Railway, etc.)

## 🔄 Workflow Navigation

Ứng dụng hỗ trợ workflow navigation giữa các bước:
- **Ideas** → Tạo và quản lý ý tưởng
- **Briefs** → Tạo brief từ content plan
- **Content Packs** → Tạo content pack từ brief
- **Chỉnh sửa** → Chỉnh sửa nội dung
- **Duyệt** → Duyệt nội dung
- **Derivatives** → Tạo các biến thể nội dung
- **Xuất bản** → Xuất bản lên các platform

Mỗi trang hiển thị workflow steps với bước hiện tại được highlight.

---

Được tạo cho khóa học Vibe Coding - Tuần 1: Backend với Fastify & TypeScript

## 🤖 AI Integration

Ứng dụng hỗ trợ tích hợp AI để sinh nội dung tự động\!

### Supported Providers:
- **OpenAI** (GPT-4, GPT-3.5)
- **Google Gemini** (Gemini 1.5 Pro/Flash)
- **Anthropic** (Claude 3.5 Sonnet, Opus, Haiku)  
- **Deepseek** (Deepseek Chat/Coder)

### Quick Start:

1. Tạo file `.env` trong thư mục `backend/`:
```env
DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ideas_db
PORT=4000
OPENAI_API_KEY=sk-your-openai-api-key-here
# Optional: GEMINI_API_KEY, ANTHROPIC_API_KEY, DEEPSEEK_API_KEY
```

2. Restart backend server

3. Test API:
```bash
curl -X POST http://localhost:4000/ideas/generate \
  -H "Content-Type: application/json" \
  -d '{"persona": "Marketing Manager", "industry": "Technology"}'
```
### Features:
- ✅ Multi-provider support
- ✅ Automatic retry với exponential backoff (3 lần)
- ✅ Temperature control (0-2)
- ✅ Token limit configuration
- ✅ Error handling

📖 **Chi tiết**: Xem [AI_INTEGRATION.md](AI_INTEGRATION.md) để biết thêm thông tin.


