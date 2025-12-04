# 🚀 Hướng dẫn Deploy StudySpace

## 📋 Tổng quan

- **Frontend**: Next.js → Deploy lên **Vercel**
- **Backend**: FastAPI → Deploy lên **Railway/Render**
- **Database**: PostgreSQL → Sử dụng managed database

---

## 🎨 Frontend (Next.js) - Deploy lên Vercel

### Bước 1: Chuẩn bị

1. Đảm bảo backend đã deploy và có URL
2. Push code lên GitHub repository

### Bước 2: Deploy lên Vercel

1. Truy cập [Vercel](https://vercel.com)
2. Click **"Add New Project"**
3. Import repository từ GitHub
4. **Configure Project:**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `.next`
   - **Install Command**: `npm install`

### Bước 3: Environment Variables

Thêm biến môi trường trong Vercel Settings:

| Key | Value | Example |
|-----|-------|---------|
| `NEXT_PUBLIC_API_URL` | URL của backend API | `https://studyspace-api.railway.app` |

### Bước 4: Deploy

Click **Deploy** và đợi build hoàn tất!

---

## ⚙️ Backend (FastAPI) - Deploy lên Railway

### Bước 1: Chuẩn bị Database

1. Tạo PostgreSQL database trên Railway/Render/Neon
2. Lấy `DATABASE_URL` connection string

### Bước 2: Deploy Backend

#### Option 1: Railway

1. Truy cập [Railway](https://railway.app)
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Chọn repository và branch
4. Railway sẽ tự động detect Dockerfile trong `backend/`

#### Option 2: Render

1. Truy cập [Render](https://render.com)
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository
4. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Bước 3: Environment Variables cho Backend

```env
DATABASE_URL=postgresql://user:password@host:port/dbname
SECRET_KEY=super-secret-key-min-32-chars-change-this
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-frontend.vercel.app
```

**⚠️ Quan trọng về CORS:**
- **Development mode** (`ENVIRONMENT=development`): Cho phép **ALL origins** (`*`)
- **Production mode** (`ENVIRONMENT=production`): Chỉ cho phép origins trong `ALLOWED_ORIGINS`

**Ví dụ ALLOWED_ORIGINS:**
```env
# Single origin
ALLOWED_ORIGINS=https://studyspace.vercel.app

# Multiple origins (comma-separated)
ALLOWED_ORIGINS=https://studyspace.vercel.app,https://www.studyspace.com,https://studyspace-preview.vercel.app
```

### Bước 4: Deploy

Sau khi config xong, click **Deploy**!

---

## 🗄️ Database Setup

### Option 1: Railway PostgreSQL
1. Railway Dashboard → **New** → **Database** → **PostgreSQL**
2. Copy `DATABASE_URL` từ Variables tab

### Option 2: Neon (Serverless Postgres)
1. Truy cập [Neon](https://neon.tech)
2. Tạo project mới
3. Copy connection string

### Option 3: Render PostgreSQL
1. Render Dashboard → **New +** → **PostgreSQL**
2. Copy Internal/External Database URL

### Initialize Database Schema

Chạy SQL script để tạo tables:

```bash
# Connect to database và run
psql <DATABASE_URL> < database_init.sql
```

Hoặc backend sẽ tự động tạo tables khi start lần đầu (nếu dùng SQLAlchemy migrations).

---

## 🧪 Local Development

### Frontend

```bash
cd frontend

# Copy env example
cp .env.example .env.local

# Install dependencies
npm install

# Run dev server
npm run dev
```

### Backend

```bash
cd backend

# Copy env example
cp .env.example .env

# Install dependencies (with venv)
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt

# Run dev server
uvicorn app.main:app --reload
```

### Docker Compose (Full Stack)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

---

## ✅ Post-Deployment Checklist

- [ ] Backend health check: `https://your-backend.com/health`
- [ ] API docs accessible: `https://your-backend.com/docs`
- [ ] Frontend loads correctly
- [ ] CORS working (no errors in browser console)
- [ ] Database connection successful
- [ ] User registration/login working
- [ ] API calls from frontend to backend working

---

## 🐛 Troubleshooting

### CORS Errors

**Triệu chứng**: Browser console shows CORS errors

**Giải pháp**:
1. Kiểm tra `ALLOWED_ORIGINS` trong backend env vars
2. Đảm bảo URL frontend chính xác (không có trailing slash)
3. Set `ENVIRONMENT=production` trong backend

```env
# Backend .env
ENVIRONMENT=production
ALLOWED_ORIGINS=https://your-app.vercel.app
```

### Database Connection Failed

**Triệu chứng**: Backend logs show database connection errors

**Giải pháp**:
1. Verify `DATABASE_URL` format: `postgresql://user:pass@host:port/db`
2. Check database service is running
3. Ensure IP whitelist includes backend server IP

### Build Failures

**Frontend build fails**:
- Check `NEXT_PUBLIC_API_URL` is set
- Run `npm run build` locally first
- Check for TypeScript errors

**Backend build fails**:
- Verify `requirements.txt` is up to date
- Check Python version compatibility
- Ensure all dependencies are available

---

## 📚 Resources

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [FastAPI Deployment Docs](https://fastapi.tiangolo.com/deployment/)
- [Vercel Docs](https://vercel.com/docs)
- [Railway Docs](https://docs.railway.app)
- [Render Docs](https://render.com/docs)

---

**Happy Deploying! 🎉**
