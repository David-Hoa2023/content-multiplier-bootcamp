# 🎯 Idea Management App with Multi-Platform Distribution

Ứng dụng quản lý ý tưởng nội dung toàn diện với Fastify backend (TypeScript), PostgreSQL database, Next.js frontend, và hệ thống tích hợp đa nền tảng phân phối nội dung.

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

### Multi-Platform Integration 🚀
- ✅ **Hệ thống tích hợp đa nền tảng**: 7 platforms across 3 categories
  - **Social Media**: Twitter, Facebook, LinkedIn, Instagram, TikTok
  - **Email Marketing**: MailChimp  
  - **Content Management**: WordPress
- ✅ **Authentication System**: Platform-specific credential management với encryption
- ✅ **Content Optimization**: Tự động format content cho từng platform (character limits, hashtags, etc.)
- ✅ **Connection Testing**: Real-time credential validation
- ✅ **Analytics**: Performance tracking và engagement metrics

### Content Distribution
- ✅ **Derivatives Generation**: Tạo nội dung tối ưu cho từng platform
- ✅ **Scheduling System**: Lên lịch đăng tự động
- ✅ **Platform Configuration**: Quản lý cấu hình từng platform
- ✅ **Publishing Workflow**: Xuất bản đồng loạt lên multiple platforms

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

**Platform Integration:**
- `GET /platforms/supported` - List all supported platforms với capabilities
- `GET /platforms/configurations` - Get user's platform configurations
- `POST /platforms/configurations` - Create new platform configuration
- `PUT /platforms/configurations/:id` - Update platform configuration
- `DELETE /platforms/configurations/:id` - Delete platform configuration
- `POST /platforms/test-connection` - Test platform credentials
- `POST /platforms/configurations/:id/test` - Test existing configuration
- `GET /platforms/analytics` - Get platform performance analytics

**Content Distribution:**
- `GET /derivatives` - List all content derivatives
- `POST /derivatives` - Generate platform-specific content derivatives
- `PUT /derivatives/:id` - Update derivative content
- `POST /derivatives/:id/schedule` - Schedule content for publishing
- `POST /derivatives/:id/publish` - Publish content immediately

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

### 🔄 Complete Content Workflow

```
💡 Ideas → 📄 Briefs → 📦 Content Packs → ✏️ Chỉnh sửa → ✅ Duyệt → 🔀 Derivatives → 🚀 Xuất bản
```

**Visual Flow:**
```
┌─────────────┐
│   Ideas     │  Generate ideas manually or with AI
│     💡      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Briefs    │  Create detailed content briefs
│     📄      │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│Content Packs│  AI generates draft content (SSE streaming)
│     📦      │  Status: 'draft'
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Chỉnh sửa   │  Edit with Markdown editor
│     ✏️      │  Real-time preview & auto-save
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Duyệt     │  Approve content
│     ✅      │  Status: 'draft' → 'approved'
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Derivatives │  Generate platform-specific variants
│     🔀      │  Optimize for each platform
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Xuất bản    │  Publish to multiple platforms
│     🚀      │  Schedule & track performance
└─────────────┘
```

#### 1. **Ideas (Ý tưởng)** 💡
   - Mở `http://localhost:3000`
   - Tab "Ideas": Tạo ý tưởng mới hoặc generate với AI
   - Điền thông tin: Tiêu đề, Mô tả, Persona, Ngành nghề, Trạng thái
   - **Navigation**: Ideas → Content Plans

#### 2. **Briefs** 📄
   - Từ trang chi tiết content plan, click "Tạo Brief từ kế hoạch này"
   - Brief sẽ được tạo tự động từ thông tin kế hoạch
   - Xem danh sách briefs tại `/briefs`
   - Click vào brief để xem chi tiết với markdown rendering
   - Copy content to clipboard hoặc xóa brief
   - **Navigation**: Briefs → Content Packs

#### 3. **Content Packs (Bản thảo)** 📦
   - Từ brief detail, click "Tạo Content Pack"
   - AI sẽ generate draft content với SSE streaming
   - Xem real-time generation progress
   - Draft content được lưu tự động
   - Xem danh sách content packs tại `/drafts`
   - **Navigation**: Content Packs → Chỉnh sửa

#### 4. **Chỉnh sửa (Edit)** ✏️
   - Route: `/packs/[pack_id]/edit`
   - Markdown editor với live preview
   - Auto-save khi có thay đổi
   - Hiển thị workflow navigation
   - Hiển thị pack info: word count, status, timestamps
   - Button "Lưu" để save thay đổi manual
   - **Navigation**: Chỉnh sửa → Duyệt & Tiếp tục

#### 5. **Duyệt (Approval)** ✅
   - Click "Duyệt & Tiếp tục" button
   - Tự động save pending changes
   - Update pack status từ 'draft' → 'approved'
   - Redirect tự động đến Derivatives page
   - **Navigation**: Duyệt → Derivatives

#### 6. **Derivatives (Biến thể nội dung)** 🔀
   - Route: `/derivatives?pack_id=[pack_id]`
   - Generate platform-specific content variants
   - Content được tối ưu cho từng platform:
     - Character limits (Twitter: 280, LinkedIn: 3000, etc.)
     - Hashtags và mentions
     - Formatting và style
   - Preview content trước khi publish
   - **Navigation**: Derivatives → Xuất bản

#### 7. **Xuất bản (Publishing)** 🚀
   - Lên lịch đăng tự động (scheduling)
   - Publish đồng loạt lên multiple platforms
   - Real-time publishing status
   - Error handling và retry logic
   - **Platforms**: Twitter, Facebook, LinkedIn, Instagram, TikTok, MailChimp, WordPress

#### 8. **Platform Configuration** ⚙️
   - Route: `/settings`
   - Configure credentials cho từng platform
   - Test connection real-time
   - Manage active/inactive platforms
   - View configuration status

#### 9. **Analytics & Monitoring** 📊
   - Xem performance analytics của từng platform
   - Track engagement metrics (likes, shares, comments)
   - Monitor reach và impressions
   - Optimize content strategy based on data

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
│   │   │   ├── platforms.ts   # Platform integration routes
│   │   │   ├── derivatives.ts # Content derivatives routes
│   │   │   ├── documents.ts   # Documents API routes
│   │   │   └── ai.ts          # AI API routes
│   │   ├── platforms/         # Platform integration system
│   │   │   ├── base/          # BasePlatform abstract class
│   │   │   ├── social/        # Social media platforms
│   │   │   ├── email/         # Email marketing platforms
│   │   │   ├── cms/           # Content management systems
│   │   │   └── registry.ts    # Platform registry
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

# Platform Integration
curl http://localhost:4000/platforms/supported
curl http://localhost:4000/platforms/configurations
curl -X POST http://localhost:4000/platforms/test-connection \
  -H "Content-Type: application/json" \
  -d '{"platform_type": "twitter", "credentials": {"apiKey": "test", "apiSecret": "test", "accessToken": "test", "accessTokenSecret": "test"}}'

# Content Distribution
curl http://localhost:4000/derivatives
curl -X POST http://localhost:4000/derivatives \
  -H "Content-Type: application/json" \
  -d '{"idea_id": 1, "platforms": ["twitter", "facebook"], "content_types": ["social_post"]}'
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

### ✅ Completed Features
- ✅ Thêm chức năng cập nhật (PUT endpoint) - Đã có
- ✅ Thêm search và filter - Đã có search
- ✅ Thêm tính năng chỉnh sửa, duyệt, tạo derivatives - Đã hoàn thành
- ✅ Thêm tính năng xuất bản - Multi-platform publishing system hoàn chính
- ✅ Platform authentication system - 7 platforms with real authentication
- ✅ Content optimization for each platform - Character limits, hashtags, formatting
- ✅ Analytics and performance tracking - Platform metrics và engagement data

### 🚀 Advanced Extensions
- Thêm pagination cho danh sách
- Thêm user authentication và authorization
- Advanced scheduling với timezone support
- Real-time collaboration features
- Advanced analytics dashboard với charts
- A/B testing for content variations
- Machine learning for content optimization
- Deploy lên production (Vercel, Railway, etc.)

## 🔄 Workflow Navigation System

Ứng dụng có **on-page workflow navigation** hiển thị trên các trang chính:

### Visual Workflow Indicator
Mỗi trang hiển thị workflow steps với:
- **Completed steps**: Dimmed (opacity-50)
- **Current step**: Highlighted với background color
- **Upcoming steps**: Normal opacity
- **Arrow indicators**: Shows flow direction

### Key Workflow Pages

#### `/drafts` - Content Packs List
- Hiển thị tất cả content packs với status
- Filter by status: draft, approved, published
- Quick actions: Edit, Create Derivatives
- Stats dashboard: Total, Draft, Approved, Published

#### `/packs/[pack_id]/edit` - Edit Page
- Markdown editor với live preview
- Workflow navigation card
- "Duyệt & Tiếp tục" button:
  - Auto-saves pending changes
  - Updates status to 'approved'
  - Navigates to derivatives page
- Back to Drafts navigation

#### Sidebar Navigation
- **Drafts** section highlighted when on:
  - `/drafts` - List page
  - `/packs/[pack_id]/edit` - Edit page
- Maintains context across the editing workflow

### Breadcrumbs
Consistent breadcrumb navigation:
```
Dashboard → Drafts → Chỉnh sửa nội dung
```

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


