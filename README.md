# 🎓 STUDYSPACE - Personal Learning Platform

<div align="center">

![StudySpace Banner](https://via.placeholder.com/1200x300/3B82F6/FFFFFF?text=StudySpace)

**Nền tảng học tập cá nhân thông minh - Tập trung, Hiệu quả, Có động lực**

[![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat&logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109-009688?style=flat&logo=fastapi)](https://fastapi.tiangolo.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-336791?style=flat&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=flat&logo=python)](https://www.python.org/)

[Project Objectives](#-project-objectives) •
[Tính năng](#-tính-năng) •
[Team Members](#-team-members--assigned-roles) •
[Installation & Usage](#-installation--usage-guide) •
[Documentation](#-documentation) •
[Đóng góp](#-đóng-góp)

</div>

---

## 📖 Giới thiệu

**StudySpace** là một nền tảng học tập cá nhân toàn diện, được thiết kế để giúp học sinh và sinh viên:
- 🎯 Tăng khả năng tập trung với Pomodoro Timer
- 📝 Quản lý ghi chú và công việc có hệ thống
- 🧠 Học hiệu quả qua Quiz & Flashcards
- 🤖 Nhận hỗ trợ học tập từ AI Assistant
- 📊 Theo dõi tiến độ và nhận huy hiệu thành tích

---

## 🎯 Project Objectives

### Mục tiêu chính

**StudySpace** được phát triển với các mục tiêu chính sau:

#### 1. **Tăng hiệu quả học tập**
- Cung cấp công cụ quản lý thời gian (Pomodoro Timer) để tối ưu hóa thời gian học
- Theo dõi và phân tích tiến độ học tập qua biểu đồ và thống kê
- Đặt mục tiêu hàng ngày và theo dõi việc hoàn thành

#### 2. **Tổ chức kiến thức hiệu quả**
- Hệ thống ghi chú có tag và phân loại theo môn học
- Quản lý công việc với Todo List
- Export dữ liệu để backup và chia sẻ

#### 3. **Học tập tương tác và thú vị**
- Quiz system với trộn câu hỏi và lưu lịch sử
- Flashcard system với thuật toán spaced repetition
- Achievement badges để tạo động lực

#### 4. **Hỗ trợ học tập thông minh**
- AI Assistant giúp giải đáp thắc mắc và giải thích khái niệm
- Đề xuất nội dung học tập phù hợp
- Gợi ý cải thiện phương pháp học

#### 5. **Trải nghiệm người dùng tốt**
- Giao diện hiện đại, responsive trên nhiều thiết bị
- Dark/Light mode để bảo vệ mắt
- Nhạc nền giúp tập trung

### Đối tượng mục tiêu

- **Học sinh, sinh viên** cần công cụ quản lý học tập
- **Người tự học** muốn cải thiện hiệu quả
- **Giáo viên** có thể sử dụng để tạo quiz và flashcards

### Kết quả mong đợi

- ✅ Tăng 30% thời gian tập trung học tập
- ✅ Cải thiện khả năng ghi nhớ qua spaced repetition
- ✅ Tổ chức kiến thức tốt hơn với hệ thống tag và category
- ✅ Tạo động lực học tập qua achievements và progress tracking

---

## ✨ Tính năng

### 🧭 Nhóm 1: Core Learning Tools
- **⏱️ Pomodoro Timer**: Bộ đếm giờ 25-5 phút, tùy chỉnh chu kỳ, âm thanh báo hiệu
- **🎯 Daily Goals**: Đặt mục tiêu học hàng ngày (phút học, số quiz)
- **💬 Quote of the Day**: Câu nói truyền cảm hứng mỗi ngày
- **🎵 Music Playlist**: Nhạc lofi, piano, tiếng mưa... cho không gian học tập
- **📈 Progress Tracker**: Biểu đồ theo dõi tiến độ học tập

### 📝 Nhóm 2: Notes & Task Management
- **✅ Todo List**: Tạo, chỉnh sửa, đánh dấu hoàn thành công việc
- **📑 Smart Notes**: Ghi chú có tag, phân loại theo môn học
- **⚡ Quick Note Popup**: Ghi chú nhanh không làm gián đoạn
- **📤 Export**: Xuất ghi chú ra .txt, .csv

### 🧩 Nhóm 3: Interactive Learning
- **🃏 Flashcard System**: Tạo bộ thẻ học, chế độ ôn tập thông minh
- **📝 Quiz System**: Tạo quiz, trộn câu hỏi, lưu lịch sử kết quả
- **📊 Quiz Analytics**: Biểu đồ thể hiện sự tiến bộ
- **📥 Import/Export**: Thêm câu hỏi từ CSV

### 💬 Nhóm 4: AI Learning Assistant
- **🤖 LLM Chatbot**: Hỏi bài, giải thích khái niệm, gợi ý học tập
- **💡 Smart Suggestions**: AI đề xuất nội dung học phù hợp

### 🌟 Nhóm 5: User Experience
- **🌓 Dark/Light Mode**: Tùy chọn giao diện sáng/tối
- **👤 User Profile**: Thông tin cá nhân, avatar, thống kê
- **🏆 Achievement Badges**: Huy hiệu cho các cột mốc (streak, quiz master...)
- **📊 Analytics Dashboard**: Thống kê thời gian học, biểu đồ trực quan

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **State Management**: Zustand
- **Charts**: Chart.js / React-Chartjs-2
- **Forms**: React Hook Form + Zod
- **Icons**: Lucide React

### Backend
- **Framework**: FastAPI
- **Language**: Python 3.11+
- **ORM**: SQLAlchemy
- **Migrations**: Alembic
- **Authentication**: JWT (python-jose)
- **Validation**: Pydantic

### Database
- **Primary**: PostgreSQL 15
- **Type**: Relational Database

### DevOps
- **Containerization**: Docker & Docker Compose
- **CI/CD**: GitHub Actions
- **Database UI**: pgAdmin

---

## 🚀 Installation & Usage Guide

### Prerequisites

Trước khi bắt đầu, đảm bảo bạn đã cài đặt:

| Tool | Version | Purpose |
|------|---------|---------|
| **Node.js** | >= 18.0 | Frontend runtime |
| **Python** | >= 3.11 | Backend runtime |
| **PostgreSQL** | >= 15 | Database |
| **Docker** | Latest | Containerization (optional) |
| **Git** | Latest | Version control |

### Installation

#### Option 1: Docker Setup (Khuyến khích - Dễ nhất)

**Bước 1: Clone repository**
```bash
git clone <repository-url>
cd studyspace
```

**Bước 2: Start services**
```bash
# Start tất cả services (PostgreSQL, Backend, Frontend, pgAdmin)
docker-compose up -d

# Kiểm tra services đang chạy
docker-compose ps

# Xem logs nếu cần
docker-compose logs -f
```

**Bước 3: Truy cập ứng dụng**

Sau khi services khởi động (khoảng 1-2 phút), truy cập:

- 🌐 **Frontend**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:8000
- 📚 **API Documentation**: http://localhost:8000/docs
- 🗄️ **pgAdmin**: http://localhost:5050
  - Email: `admin@studyspace.com`
  - Password: `admin`

**Bước 4: Stop services (khi cần)**
```bash
# Stop tất cả services
docker-compose down

# Stop và xóa volumes (reset database)
docker-compose down -v
```

#### Option 2: Manual Setup (Cho development)

**Bước 1: Setup Database**

```bash
# Tạo database
createdb studyspace

# Hoặc sử dụng PostgreSQL client
psql -U postgres
CREATE DATABASE studyspace;
\q

# Import schema
psql -U postgres -d studyspace -f database_init.sql
```

**Bước 2: Setup Backend**

```bash
cd backend

# Tạo virtual environment
python -m venv venv

# Activate virtual environment
# Windows PowerShell:
.\venv\Scripts\Activate.ps1
# Windows CMD:
.\venv\Scripts\activate.bat
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Tạo file .env từ template
cp .env.example .env

# Chỉnh sửa .env với thông tin database của bạn
# DATABASE_URL=postgresql://admin:password@localhost:5432/studyspace
# SECRET_KEY=your-secret-key-here

# Run database migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload --port 8000
```

**Bước 3: Setup Frontend**

```bash
cd frontend

# Install dependencies
npm install

# Tạo file .env.local từ template
cp .env.local.example .env.local

# Chỉnh sửa .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Start development server
npm run dev
```

### Usage Guide

#### 1. **Đăng ký / Đăng nhập**

- Truy cập http://localhost:3000
- Tạo tài khoản mới hoặc đăng nhập
- Sau khi đăng nhập, bạn sẽ vào Dashboard

#### 2. **Sử dụng Pomodoro Timer**

1. Vào trang **Pomodoro** từ menu
2. Chọn thời gian làm việc (mặc định 25 phút)
3. Click **Start** để bắt đầu
4. Timer sẽ tự động chuyển sang break sau khi hết giờ
5. Xem lịch sử sessions trong **History**

#### 3. **Quản lý Notes**

1. Vào trang **Notes**
2. Click **+ New Note** để tạo ghi chú mới
3. Thêm **tags** để phân loại (ví dụ: `#math`, `#physics`)
4. Chọn **Category** từ dropdown
5. Sử dụng **Quick Note** popup để ghi chú nhanh
6. Export notes ra `.txt` hoặc `.csv` khi cần

#### 4. **Tạo và làm Quiz**

1. Vào trang **Quiz**
2. Click **Create New Quiz Set**
3. Thêm câu hỏi với các options
4. Lưu quiz set
5. Click **Start Quiz** để làm bài
6. Xem kết quả và lịch sử trong **Quiz History**

#### 5. **Học với Flashcards**

1. Vào trang **Flashcards**
2. Tạo **Deck** mới hoặc chọn deck có sẵn
3. Thêm flashcards (Question/Answer)
4. Click **Study** để bắt đầu ôn tập
5. Đánh giá độ khó để hệ thống lên lịch ôn lại

#### 6. **Sử dụng AI Assistant**

1. Vào trang **AI Chat**
2. Nhập câu hỏi hoặc yêu cầu giải thích
3. AI sẽ trả lời và đưa ra gợi ý
4. Lưu conversation để xem lại sau

#### 7. **Theo dõi Progress**

1. Vào **Dashboard** để xem tổng quan
2. Xem biểu đồ thời gian học theo ngày/tuần/tháng
3. Kiểm tra **Achievements** đã đạt được
4. Xem **Analytics** chi tiết

### Troubleshooting

#### Backend không start được

```bash
# Kiểm tra port 8000 có bị chiếm
# Windows:
netstat -ano | findstr :8000
# Mac/Linux:
lsof -i :8000

# Kiểm tra database connection
psql -U admin -d studyspace -h localhost -p 5432

# Xóa cache và reinstall
find . -type d -name "__pycache__" -exec rm -r {} +
pip install -r requirements.txt --force-reinstall
```

#### Frontend không start được

```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install

# Clear Next.js cache
rm -rf .next

# Kiểm tra port 3000
netstat -ano | findstr :3000  # Windows
lsof -i :3000                 # Mac/Linux
```

#### Database connection error

```bash
# Kiểm tra PostgreSQL đang chạy
pg_isready

# Restart PostgreSQL
# Windows:
net stop postgresql-x64-15
net start postgresql-x64-15
# Mac:
brew services restart postgresql
# Linux:
sudo service postgresql restart
```

### Development Commands

```bash
# Backend
cd backend
uvicorn app.main:app --reload          # Development server
pytest                                 # Run tests
pytest --cov=app                      # Tests with coverage
alembic revision --autogenerate       # Create migration
alembic upgrade head                   # Apply migrations

# Frontend
cd frontend
npm run dev                            # Development server
npm run build                          # Production build
npm run start                          # Production server
npm test                               # Run tests
npm run lint                           # Lint code
npm run type-check                     # TypeScript check
```

---

## 📁 Cấu trúc dự án

```
studyspace/
├── frontend/              # Next.js application
│   ├── src/
│   │   ├── app/          # App router pages
│   │   ├── features/     # Feature modules (modular architecture)
│   │   │   ├── pomodoro/
│   │   │   ├── notes/
│   │   │   ├── quiz/
│   │   │   └── ...
│   │   ├── shared/       # Shared components & utilities
│   │   └── store/        # Global state
│   └── ...
│
├── backend/               # FastAPI application
│   ├── app/
│   │   ├── api/          # API routes (versioned)
│   │   ├── models/       # Database models
│   │   ├── schemas/      # Pydantic schemas
│   │   ├── services/     # Business logic
│   │   └── core/         # Config & security
│   └── ...
│
├── database/              # Database scripts & migrations
├── docs/                  # Documentation
├── docker-compose.yml
└── README.md
```

Xem chi tiết trong [project_structure.md](./project_structure.md)

---

## 📚 Documentation

- **[Setup Guide](./SETUP_GUIDE.md)** - Hướng dẫn setup chi tiết cho developers
- **[Project Structure](./project_structure.md)** - Cấu trúc dự án và quy ước
- **[Database Schema](./database_schema.puml)** - Schema database (PlantUML)
- **[API Documentation](http://localhost:8000/docs)** - Swagger UI (sau khi chạy backend)

---

## 👥 Đóng góp

### Workflow

1. **Clone & Create Branch**
```bash
git checkout develop
git checkout -b feature/your-feature-name
```

2. **Code theo feature module**
- Mỗi feature độc lập trong `features/[feature-name]/`
- Không can thiệp vào code của features khác
- Sử dụng shared components khi cần

3. **Testing**
```bash
# Backend
pytest

# Frontend
npm test
```

4. **Commit & Push**
```bash
git add .
git commit -m "feat(feature-name): description"
git push origin feature/your-feature-name
```

5. **Create Pull Request**
- Target: `develop` branch
- Request review từ ít nhất 1 member

### Commit Convention

```
feat(scope): add new feature
fix(scope): fix bug
docs(scope): update documentation
style(scope): formatting changes
refactor(scope): code refactoring
test(scope): add tests
chore(scope): maintenance tasks
```

**Scopes**: `pomodoro`, `notes`, `quiz`, `flashcards`, `ai-chat`, `profile`, `auth`, etc.

---

## 🎯 Roadmap

### Phase 1: Core Features (Current)
- [x] Database schema design
- [x] Project structure setup
- [ ] Authentication system
- [ ] Pomodoro timer
- [ ] Basic notes & tasks

### Phase 2: Interactive Learning
- [ ] Quiz system
- [ ] Flashcard system
- [ ] Progress tracking

### Phase 3: AI Integration
- [ ] AI chatbot integration
- [ ] Smart suggestions
- [ ] Content recommendations

### Phase 4: Advanced Features
- [ ] Mobile app (React Native)
- [ ] Collaborative features
- [ ] Advanced analytics

---

## 🐛 Bug Reports & Feature Requests

Tạo [Issue](../../issues) với template phù hợp:
- 🐛 Bug Report
- ✨ Feature Request
- 📝 Documentation Update

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Icons: [Lucide Icons](https://lucide.dev/)
- UI Inspiration: [Dribbble](https://dribbble.com/)
- Learning Resources: [FastAPI Docs](https://fastapi.tiangolo.com/), [Next.js Docs](https://nextjs.org/docs)

---

## 👥 Team Members & Assigned Roles

### Leadership Team

| Role | Name | Responsibilities | Contact |
|------|------|-----------------|---------|
| **Project Lead** | [Tên] | Quản lý dự án, điều phối team, quyết định chiến lược | [Email] |
| **Tech Lead** | [Tên] | Kiến trúc hệ thống, code review, technical decisions | [Email] |

### Backend Team

| Name | Assigned Features | Responsibilities | Status |
|------|------------------|-----------------|--------|
| **[Tên Dev 1]** | Authentication & User Management | - JWT authentication<br>- User CRUD operations<br>- User settings API | 🟡 In Progress |
| **[Tên Dev 2]** | Pomodoro Timer & Daily Goals | - Pomodoro sessions API<br>- Goals tracking<br>- Progress calculation | ⚪ Not Started |
| **[Tên Dev 3]** | Notes & Tasks System | - Notes CRUD with tags<br>- Task management<br>- Category system | ⚪ Not Started |
| **[Tên Dev 4]** | Quiz & Flashcards | - Quiz creation & attempts<br>- Flashcard system<br>- Spaced repetition algorithm | ⚪ Not Started |
| **[Tên Dev 5]** | AI Chat & Analytics | - AI integration (LLM API)<br>- Chat conversations<br>- Analytics & statistics | ⚪ Not Started |

**Backend Team Lead**: [Tên] - [Email]

### Frontend Team

| Name | Assigned Features | Responsibilities | Status |
|------|------------------|-----------------|--------|
| **[Tên Dev A]** | Shared Components & Layout | - UI component library<br>- Layout & navigation<br>- Theme system (dark/light) | 🟡 In Progress |
| **[Tên Dev B]** | Pomodoro & Music Features | - Pomodoro timer UI<br>- Music player<br>- Quote display | ⚪ Not Started |
| **[Tên Dev C]** | Notes & Tasks UI | - Notes editor<br>- Tag management<br>- Task list & kanban | ⚪ Not Started |
| **[Tên Dev D]** | Quiz & Flashcards UI | - Quiz interface<br>- Flashcard study mode<br>- Progress charts | ⚪ Not Started |
| **[Tên Dev E]** | AI Chat & Dashboard | - Chat interface<br>- Analytics dashboard<br>- Achievement badges | ⚪ Not Started |

**Frontend Team Lead**: [Tên] - [Email]

### Design & UX Team

| Name | Role | Responsibilities | Status |
|------|------|-----------------|--------|
| **[Tên Designer]** | UI/UX Designer | - Wireframes & mockups<br>- Design system<br>- User testing | 🟡 In Progress |

### Database & DevOps

| Name | Role | Responsibilities | Status |
|------|------|-----------------|--------|
| **[Tên DBA]** | Database Administrator | - Schema optimization<br>- Performance tuning<br>- Backup strategy | ✅ Completed |
| **[Tên DevOps]** | DevOps Engineer | - CI/CD pipeline<br>- Docker setup<br>- Deployment | ✅ Completed |

### Team Communication

- **Slack/Discord**: [Link to workspace]
- **GitHub Team**: [Link to team]
- **Weekly Meeting**: [Day] [Time]
- **Sprint Duration**: 2 weeks

### How to Contact Team Members

1. **General Questions**: Post in team Slack/Discord channel
2. **Feature-specific**: Tag assigned developer in issue/PR
3. **Urgent Issues**: Contact Project Lead or Tech Lead
4. **Code Review**: Request review from feature owner + 1 other member

### Contribution Guidelines

Mỗi team member được assign features cụ thể:

1. **Work on your assigned features** - Focus vào features được phân công
2. **Code in feature branches** - Follow branch naming convention
3. **Request review** - Từ feature owner hoặc team lead
4. **Update documentation** - Khi thêm tính năng mới
5. **Write tests** - Unit tests cho code của bạn

**Status Legend:**
- ✅ Completed
- 🟡 In Progress
- ⚪ Not Started
- 🔴 Blocked

---

## 📞 Contact

- **Email**: contact@studyspace.com
- **Discord**: [Link]
- **Documentation**: [Link]

---

<div align="center">

**Made with ❤️ by StudySpace Team**

⭐ Star us on GitHub — it motivates us a lot!

</div>

