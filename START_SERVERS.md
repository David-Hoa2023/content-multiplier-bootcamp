# 🚀 Hướng dẫn khởi động Server

## Vấn đề: "Không thể tạo ý tưởng"

Lỗi này xảy ra khi backend server hoặc database chưa được khởi động.

## ✅ Giải pháp nhanh

### Bước 1: Khởi động Database (PostgreSQL)

```powershell
# Từ thư mục idea-management-app
docker-compose up -d
```

Kiểm tra database đã chạy:
```powershell
docker-compose ps
```

Bạn sẽ thấy:
```
NAME       IMAGE                STATUS
ideas_db   postgres:15-alpine   Up (healthy)
```

### Bước 2: Khởi động Backend Server

Mở terminal mới và chạy:

```powershell
cd idea-management-app/backend
npm run dev
```

Bạn sẽ thấy:
```
✅ Database connection successful
🚀 Server is running on http://localhost:4000
```

### Bước 3: Kiểm tra Backend

Mở trình duyệt hoặc dùng curl:
```
http://localhost:4000/health
```

Kết quả mong đợi:
```json
{"status":"ok","timestamp":"2025-11-06T..."}
```

### Bước 4: Kiểm tra Frontend

Frontend đã chạy tại:
```
http://localhost:3000
```

## 🔧 Khắc phục sự cố

### Database không khởi động

1. **Kiểm tra Docker đã cài đặt:**
   ```powershell
   docker --version
   ```

2. **Kiểm tra port 5433 có bị chiếm:**
   ```powershell
   netstat -ano | findstr ":5433"
   ```

3. **Xem logs của database:**
   ```powershell
   docker-compose logs postgres
   ```

### Backend không khởi động

1. **Kiểm tra port 4000 có bị chiếm:**
   ```powershell
   netstat -ano | findstr ":4000"
   ```

2. **Kiểm tra .env file:**
   ```powershell
   cd backend
   cat .env
   ```

   Phải có:
   ```
   PORT=4000
   DATABASE_URL=postgresql://postgres:postgres@localhost:5433/ideas_db
   ```

3. **Xem logs của backend:**
   - Kiểm tra terminal nơi bạn chạy `npm run dev`
   - Tìm lỗi về database connection

### Lỗi kết nối Database

Nếu backend báo lỗi kết nối database:

1. **Đảm bảo database đã healthy:**
   ```powershell
   docker-compose ps
   ```

2. **Kiểm tra database có tồn tại:**
   ```powershell
   docker exec -it ideas_db psql -U postgres -l
   ```

3. **Tạo database nếu chưa có:**
   ```powershell
   docker exec -it ideas_db psql -U postgres -c "CREATE DATABASE ideas_db;"
   ```

## 📝 Script tự động (PowerShell)

Tạo file `start-all.ps1` trong thư mục `idea-management-app`:

```powershell
# Start Database
Write-Host "Starting database..." -ForegroundColor Yellow
docker-compose up -d

Start-Sleep -Seconds 5

# Check database status
$dbStatus = docker-compose ps --format json | ConvertFrom-Json
if ($dbStatus.Status -like "*healthy*") {
    Write-Host "✅ Database is running" -ForegroundColor Green
} else {
    Write-Host "❌ Database failed to start" -ForegroundColor Red
    exit 1
}

# Start Backend
Write-Host "`nStarting backend server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; npm run dev"

Start-Sleep -Seconds 3

# Check backend
try {
    $response = Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing -TimeoutSec 2
    Write-Host "✅ Backend is running" -ForegroundColor Green
} catch {
    Write-Host "⏳ Backend is starting... Please check the backend terminal" -ForegroundColor Yellow
}

Write-Host "`n✅ Setup complete!" -ForegroundColor Green
Write-Host "Frontend: http://localhost:3000" -ForegroundColor Cyan
Write-Host "Backend:  http://localhost:4000" -ForegroundColor Cyan
```

Chạy script:
```powershell
.\start-all.ps1
```

## 🎯 Kiểm tra nhanh

Sau khi khởi động, kiểm tra:

1. **Database:**
   ```powershell
   docker-compose ps
   ```

2. **Backend:**
   ```powershell
   Invoke-WebRequest -Uri "http://localhost:4000/health" -UseBasicParsing
   ```

3. **Frontend:**
   Mở trình duyệt: http://localhost:3000

## 💡 Lưu ý

- Database cần vài giây để khởi động hoàn toàn
- Backend cần database đã sẵn sàng trước khi khởi động
- Nếu đổi port, cập nhật `API_URL` trong frontend code
- Luôn kiểm tra logs nếu có lỗi

## 🆘 Vẫn không hoạt động?

1. Kiểm tra tất cả logs:
   - Backend terminal
   - `docker-compose logs`
   - Browser console (F12)

2. Đảm bảo:
   - Docker Desktop đang chạy
   - Port 3000, 4000, 5433 không bị chiếm
   - Node.js và npm đã cài đặt
   - Dependencies đã cài (`npm install` trong cả frontend và backend)

3. Thử restart:
   ```powershell
   docker-compose down
   docker-compose up -d
   # Sau đó khởi động lại backend
   ```

