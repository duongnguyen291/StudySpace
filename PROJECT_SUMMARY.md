# 📊 STUDYSPACE - TÓM TẮT DỰ ÁN

> Tài liệu tổng hợp về dự án StudySpace - nền tảng học tập cá nhân

---

## 🎯 THÔNG TIN DỰ ÁN

### Tên dự án
**StudySpace** - Personal Learning Platform

### Mô tả
Nền tảng học tập cá nhân trực tuyến, giúp người dùng tạo không gian học tập tập trung, hiệu quả và có động lực hơn.

### Đối tượng người dùng
- Học sinh, sinh viên
- Người tự học
- Hỗ trợ iPad, Laptop, PC

---

## 🏗️ KIẾN TRÚC HỆ THỐNG

```
┌─────────────────────────────────────────────────────┐
│                   FRONTEND LAYER                     │
│  Next.js 14 (App Router) + TypeScript + TailwindCSS │
│                    Port: 3000                        │
└───────────────────┬─────────────────────────────────┘
                    │ HTTP/REST API
                    ▼
┌─────────────────────────────────────────────────────┐
│                   BACKEND LAYER                      │
│         FastAPI + Python + SQLAlchemy                │
│                    Port: 8000                        │
└───────────────────┬─────────────────────────────────┘
                    │ PostgreSQL Connection
                    ▼
┌─────────────────────────────────────────────────────┐
│                  DATABASE LAYER                      │
│            PostgreSQL 15 + pgAdmin                   │
│                    Port: 5432                        │
└─────────────────────────────────────────────────────┘
```

---

## 📦 CÁC TÍNH NĂNG CHÍNH

### 🧭 Nhóm 1: Core Learning Tools
| Tính năng | Mô tả | Backend API | Frontend Feature |
|-----------|-------|-------------|------------------|
| Pomodoro Timer | Bộ đếm giờ 25-5 phút | `/api/v1/pomodoro` | `features/pomodoro/` |
| Daily Goals | Đặt mục tiêu học hàng ngày | `/api/v1/goals` | `features/goals/` |
| Quote of the Day | Câu nói truyền cảm hứng | `/api/v1/quotes` | `features/quotes/` |
| Music Playlist | Nhạc nền học tập | `/api/v1/music` | `features/music/` |
| Progress Tracker | Theo dõi tiến độ | `/api/v1/progress` | `features/progress/` |

### 📝 Nhóm 2: Notes & Task Management
| Tính năng | Mô tả | Backend API | Frontend Feature |
|-----------|-------|-------------|------------------|
| Notes System | Ghi chú có tag | `/api/v1/notes` | `features/notes/` |
| Task Management | Todo list | `/api/v1/tasks` | `features/tasks/` |
| Categories | Phân loại nội dung | `/api/v1/categories` | Shared |

### 🧩 Nhóm 3: Interactive Learning
| Tính năng | Mô tả | Backend API | Frontend Feature |
|-----------|-------|-------------|------------------|
| Quiz System | Tạo và làm quiz | `/api/v1/quiz` | `features/quiz/` |
| Flashcards | Hệ thống thẻ học | `/api/v1/flashcards` | `features/flashcards/` |

### 💬 Nhóm 4: AI Assistant
| Tính năng | Mô tả | Backend API | Frontend Feature |
|-----------|-------|-------------|------------------|
| AI Chatbot | Hỗ trợ học tập | `/api/v1/chat` | `features/ai-chat/` |

### 🌟 Nhóm 5: User Experience
| Tính năng | Mô tả | Backend API | Frontend Feature |
|-----------|-------|-------------|------------------|
| User Profile | Thông tin người dùng | `/api/v1/profile` | `features/profile/` |
| Achievements | Hệ thống huy hiệu | `/api/v1/achievements` | `features/achievements/` |
| Analytics | Thống kê học tập | `/api/v1/analytics` | `features/analytics/` |

---

## 🗄️ DATABASE SCHEMA

### Tổng quan

**Tổng số bảng**: 18 tables

**Nhóm bảng**:
1. **User & Authentication** (2 tables): users, user_settings
2. **Learning Sessions** (3 tables): study_sessions, daily_goals, user_achievements
3. **Notes & Tasks** (4 tables): categories, notes, note_tags, tasks
4. **Quiz & Flashcards** (6 tables): quiz_sets, quiz_questions, quiz_attempts, flashcard_decks, flashcards, flashcard_progress
5. **AI Chat** (2 tables): chat_conversations, chat_messages
6. **Content** (2 tables): quotes, music_playlists

### Quan hệ chính

```
users (1) ──────── (N) study_sessions
users (1) ──────── (N) daily_goals
users (1) ──────── (N) notes
users (1) ──────── (N) tasks
users (1) ──────── (N) quiz_sets
users (1) ──────── (N) flashcard_decks
users (1) ──────── (N) chat_conversations

categories (1) ─── (N) notes
categories (1) ─── (N) tasks
categories (1) ─── (N) quiz_sets

notes (1) ────────  (N) note_tags
quiz_sets (1) ───── (N) quiz_questions
flashcard_decks (1) (N) flashcards
```

### File liên quan
- `database_schema.puml` - PlantUML diagram
- `database_init.sql` - SQL initialization script

---

## 📂 CẤU TRÚC FOLDER

### Backend (FastAPI)
```
backend/
├── app/
│   ├── main.py              # Entry point
│   ├── api/v1/              # API endpoints (versioned)
│   │   ├── auth.py
│   │   ├── pomodoro.py
│   │   ├── notes.py
│   │   └── ...
│   ├── models/              # SQLAlchemy models
│   ├── schemas/             # Pydantic schemas
│   ├── services/            # Business logic
│   ├── repositories/        # Data access
│   └── core/                # Config & database
├── tests/                   # Test suites
├── alembic/                 # Migrations
└── requirements.txt
```

### Frontend (Next.js)
```
frontend/
├── src/
│   ├── app/                 # App Router pages
│   ├── features/            # Feature modules (CORE)
│   │   ├── pomodoro/
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── services/
│   │   │   ├── types/
│   │   │   └── index.ts
│   │   ├── notes/
│   │   ├── quiz/
│   │   └── ...
│   ├── shared/              # Shared resources
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   └── store/               # Global state
└── package.json
```

---

## 🔧 TECH STACK CHI TIẾT

### Frontend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | Next.js | 14.x | React framework |
| Language | TypeScript | 5.3+ | Type safety |
| Styling | TailwindCSS | 3.4+ | Utility-first CSS |
| State | Zustand | 4.4+ | State management |
| Forms | React Hook Form | 7.x | Form handling |
| Validation | Zod | 3.x | Schema validation |
| Charts | Chart.js | 4.4+ | Data visualization |
| Icons | Lucide React | Latest | Icon library |
| HTTP Client | Axios | 1.6+ | API calls |

### Backend Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| Framework | FastAPI | 0.109+ | Web framework |
| Language | Python | 3.11+ | Programming language |
| ORM | SQLAlchemy | 2.0+ | Database ORM |
| Migration | Alembic | 1.13+ | Database migrations |
| Validation | Pydantic | 2.5+ | Data validation |
| Auth | python-jose | 3.3+ | JWT handling |
| Password | passlib | 1.7+ | Password hashing |
| Server | Uvicorn | 0.27+ | ASGI server |
| Testing | Pytest | 7.4+ | Testing framework |

### Database

| Technology | Version | Purpose |
|-----------|---------|---------|
| PostgreSQL | 15+ | Primary database |
| pgAdmin | 4 | Database management |

### DevOps

| Technology | Purpose |
|-----------|---------|
| Docker | Containerization |
| Docker Compose | Multi-container orchestration |
| Git | Version control |
| GitHub Actions | CI/CD |

---

## 🚦 API ENDPOINTS

### Authentication
```
POST   /api/v1/auth/register        # Đăng ký
POST   /api/v1/auth/login           # Đăng nhập
POST   /api/v1/auth/refresh         # Refresh token
GET    /api/v1/auth/me              # Lấy thông tin user hiện tại
```

### Pomodoro
```
POST   /api/v1/pomodoro/sessions           # Tạo session
GET    /api/v1/pomodoro/sessions           # Lấy danh sách sessions
GET    /api/v1/pomodoro/sessions/{id}      # Lấy chi tiết session
PATCH  /api/v1/pomodoro/sessions/{id}/complete  # Hoàn thành session
GET    /api/v1/pomodoro/stats/today        # Thống kê hôm nay
```

### Notes
```
POST   /api/v1/notes              # Tạo note
GET    /api/v1/notes              # Lấy danh sách notes
GET    /api/v1/notes/{id}         # Lấy chi tiết note
PUT    /api/v1/notes/{id}         # Cập nhật note
DELETE /api/v1/notes/{id}         # Xóa note
POST   /api/v1/notes/{id}/tags    # Thêm tag
```

### Tasks
```
POST   /api/v1/tasks              # Tạo task
GET    /api/v1/tasks              # Lấy danh sách tasks
PATCH  /api/v1/tasks/{id}         # Cập nhật task
DELETE /api/v1/tasks/{id}         # Xóa task
```

### Quiz
```
POST   /api/v1/quiz/sets          # Tạo quiz set
GET    /api/v1/quiz/sets          # Lấy danh sách quiz sets
POST   /api/v1/quiz/sets/{id}/questions    # Thêm câu hỏi
POST   /api/v1/quiz/attempts      # Bắt đầu làm quiz
GET    /api/v1/quiz/attempts      # Lịch sử làm quiz
```

### Flashcards
```
POST   /api/v1/flashcards/decks           # Tạo deck
GET    /api/v1/flashcards/decks           # Lấy danh sách decks
POST   /api/v1/flashcards/decks/{id}/cards  # Thêm card
GET    /api/v1/flashcards/progress        # Tiến độ học
```

**Xem đầy đủ tại**: http://localhost:8000/docs (sau khi chạy backend)

---

## 👥 PHÂN CÔNG CÔNG VIỆC

### Development Team Structure

```
Project Lead
    ├── Backend Team
    │   ├── Dev 1: Auth + User Management
    │   ├── Dev 2: Pomodoro + Goals
    │   ├── Dev 3: Notes + Tasks
    │   ├── Dev 4: Quiz + Flashcards
    │   └── Dev 5: AI Chat + Analytics
    │
    ├── Frontend Team
    │   ├── Dev A: UI Components + Shared
    │   ├── Dev B: Pomodoro + Music
    │   ├── Dev C: Notes + Tasks
    │   ├── Dev D: Quiz + Flashcards
    │   └── Dev E: AI Chat + Dashboard
    │
    └── Database Team
        └── DBA: Schema + Optimization
```

### Branching Strategy

```
main                    # Production
  └── develop           # Development
       ├── feature/pomodoro-timer
       ├── feature/notes-system
       ├── feature/quiz-module
       ├── feature/flashcards
       └── feature/ai-chat
```

---

## 📝 TÀI LIỆU QUAN TRỌNG

| File | Mô tả | Đối tượng |
|------|-------|-----------|
| `README.md` | Overview dự án | Tất cả |
| `SETUP_GUIDE.md` | Hướng dẫn setup chi tiết | Developers |
| `project_structure.md` | Cấu trúc dự án | Developers |
| `FEATURE_DEVELOPMENT_GUIDE.md` | Hướng dẫn phát triển feature | Developers |
| `database_schema.puml` | Database schema diagram | Database/Backend |
| `database_init.sql` | SQL initialization script | Database |
| `docker-compose.yml` | Docker configuration | DevOps |
| `.gitignore` | Git ignore rules | Tất cả |

---

## 🚀 QUICK START COMMANDS

### Setup đầu tiên

```bash
# 1. Clone repository
git clone <repository-url>
cd studyspace

# 2. Chạy với Docker
docker-compose up -d

# 3. Truy cập
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
# pgAdmin: http://localhost:5050
```

### Development workflow

```bash
# 1. Tạo feature branch
git checkout -b feature/my-feature

# 2. Backend development
cd backend
source venv/bin/activate
uvicorn app.main:app --reload

# 3. Frontend development
cd frontend
npm run dev

# 4. Testing
pytest                  # Backend
npm test                # Frontend

# 5. Commit & Push
git add .
git commit -m "feat(scope): description"
git push origin feature/my-feature
```

---

## ✅ CHECKLIST BẮT ĐẦU DỰ ÁN

### Cho Team Lead / Project Manager

- [ ] Repository đã được tạo
- [ ] Team members có quyền truy cập
- [ ] Branching strategy đã được thiết lập
- [ ] CI/CD pipeline đã được config (optional)
- [ ] Communication channels setup (Slack/Discord)
- [ ] Task tracking tool setup (Jira/Trello/Linear)
- [ ] Documentation đã được review

### Cho Developers

- [ ] Đã clone repository
- [ ] Đã đọc README.md
- [ ] Đã đọc SETUP_GUIDE.md
- [ ] Database đã được setup
- [ ] Backend chạy thành công
- [ ] Frontend chạy thành công
- [ ] Đã tạo feature branch của mình
- [ ] Đã hiểu feature module structure
- [ ] Đã test tạo một component/endpoint đơn giản

### Cho Database Admin

- [ ] PostgreSQL đã được cài đặt
- [ ] Database đã được khởi tạo
- [ ] Schema đã được import
- [ ] Seed data đã được thêm
- [ ] Backup strategy đã được thiết lập
- [ ] Indexes đã được review

---

## 📊 METRICS & GOALS

### Development Metrics

- **Sprint Duration**: 2 weeks
- **Code Review**: Max 24 hours
- **Test Coverage Target**: 80%
- **API Response Time**: < 200ms
- **Frontend Load Time**: < 2s

### Project Milestones

| Milestone | Target Date | Status |
|-----------|-------------|--------|
| Phase 1: Core Features | Week 4 | 🟡 In Progress |
| Phase 2: Interactive Learning | Week 8 | ⚪ Not Started |
| Phase 3: AI Integration | Week 12 | ⚪ Not Started |
| Phase 4: Beta Release | Week 16 | ⚪ Not Started |

---

## 🔒 SECURITY & BEST PRACTICES

### Security Checklist

- [ ] Environment variables cho sensitive data
- [ ] JWT authentication implemented
- [ ] Password hashing (bcrypt)
- [ ] SQL injection prevention (ORM)
- [ ] CORS properly configured
- [ ] Rate limiting (optional)
- [ ] Input validation
- [ ] HTTPS in production

### Code Quality

- [ ] TypeScript strict mode enabled
- [ ] ESLint configured
- [ ] Prettier for formatting
- [ ] Pre-commit hooks
- [ ] Code review process
- [ ] Testing strategy

---

## 📞 SUPPORT & RESOURCES

### Internal Resources

- **Documentation**: `/docs` folder
- **API Docs**: http://localhost:8000/docs
- **Team Chat**: [Link to Slack/Discord]
- **Task Board**: [Link to Jira/Trello]

### External Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)

### Getting Help

1. Check documentation first
2. Search existing issues/discussions
3. Ask in team chat
4. Create an issue if needed
5. Contact team lead for urgent matters

---

## 🎉 READY TO START!

Bây giờ bạn đã có:
- ✅ Database schema hoàn chỉnh
- ✅ Project structure rõ ràng
- ✅ Development guides chi tiết
- ✅ Docker setup sẵn sàng
- ✅ Example code templates
- ✅ Testing guidelines
- ✅ Best practices

**Chúc team code vui vẻ và hiệu quả! 🚀**

---

*Last updated: [Date]*
*Version: 1.0.0*

