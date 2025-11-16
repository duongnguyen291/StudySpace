# 🏗️ STUDYSPACE - PROJECT STRUCTURE

## 📁 Cấu trúc thư mục tổng quan

```
studyspace/
├── frontend/                    # Next.js Application
│   ├── src/
│   │   ├── app/                # App Router (Next.js 13+)
│   │   │   ├── (auth)/         # Authentication routes
│   │   │   ├── (dashboard)/    # Main app routes
│   │   │   ├── layout.tsx
│   │   │   └── page.tsx
│   │   │
│   │   ├── features/           # 🎯 FEATURE-BASED MODULES (CORE)
│   │   │   ├── pomodoro/       # Feature 1.1 - Pomodoro Timer
│   │   │   │   ├── components/
│   │   │   │   ├── hooks/
│   │   │   │   ├── services/
│   │   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── goals/          # Feature 1.2 - Daily Goals
│   │   │   ├── quotes/         # Feature 1.3 - Quote of the Day
│   │   │   ├── music/          # Feature 1.4 - Music Playlist
│   │   │   ├── progress/       # Feature 1.5 - Progress Tracker
│   │   │   │
│   │   │   ├── notes/          # Feature 2 - Notes & Tasks
│   │   │   │   ├── components/
│   │   │   │   │   ├── NoteEditor/
│   │   │   │   │   ├── NoteList/
│   │   │   │   │   └── TagManager/
│   │   │   │   ├── hooks/
│   │   │   │   │   ├── useNotes.ts
│   │   │   │   │   └── useTags.ts
│   │   │   │   ├── services/
│   │   │   │   │   └── noteService.ts
│   │   │   │   ├── types/
│   │   │   │   │   └── note.types.ts
│   │   │   │   └── index.ts
│   │   │   │
│   │   │   ├── tasks/          # Feature 2 - Task Management
│   │   │   ├── quiz/           # Feature 3 - Quiz System
│   │   │   ├── flashcards/     # Feature 3 - Flashcard System
│   │   │   ├── ai-chat/        # Feature 4 - AI Assistant
│   │   │   ├── profile/        # Feature 5 - User Profile
│   │   │   ├── achievements/   # Feature 5 - Achievements
│   │   │   └── analytics/      # Feature 5 - Analytics
│   │   │
│   │   ├── shared/             # Shared resources
│   │   │   ├── components/     # Common UI components
│   │   │   │   ├── Button/
│   │   │   │   ├── Modal/
│   │   │   │   ├── Input/
│   │   │   │   └── Layout/
│   │   │   ├── hooks/          # Common hooks
│   │   │   │   ├── useAuth.ts
│   │   │   │   └── useTheme.ts
│   │   │   ├── utils/          # Utility functions
│   │   │   │   ├── api.ts
│   │   │   │   ├── format.ts
│   │   │   │   └── validation.ts
│   │   │   ├── types/          # Global types
│   │   │   └── constants/      # Global constants
│   │   │
│   │   ├── store/              # State Management (Zustand/Redux)
│   │   │   ├── slices/
│   │   │   └── index.ts
│   │   │
│   │   └── styles/             # Global styles
│   │       └── globals.css
│   │
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   ├── tailwind.config.js
│   └── next.config.js
│
├── backend/                     # FastAPI Application
│   ├── app/
│   │   ├── main.py             # FastAPI entry point
│   │   │
│   │   ├── api/                # API Routes (Version 1)
│   │   │   ├── v1/
│   │   │   │   ├── __init__.py
│   │   │   │   ├── router.py   # Main router
│   │   │   │   │
│   │   │   │   ├── auth.py     # Authentication endpoints
│   │   │   │   ├── pomodoro.py # Pomodoro endpoints
│   │   │   │   ├── goals.py    # Goals endpoints
│   │   │   │   ├── notes.py    # Notes endpoints
│   │   │   │   ├── tasks.py    # Tasks endpoints
│   │   │   │   ├── quiz.py     # Quiz endpoints
│   │   │   │   ├── flashcards.py
│   │   │   │   ├── chat.py     # AI Chat endpoints
│   │   │   │   ├── profile.py  # User profile endpoints
│   │   │   │   └── analytics.py
│   │   │   │
│   │   │   └── deps.py         # Common dependencies
│   │   │
│   │   ├── core/               # Core configuration
│   │   │   ├── config.py       # Settings & environment
│   │   │   ├── security.py     # Auth & JWT
│   │   │   └── database.py     # Database connection
│   │   │
│   │   ├── models/             # SQLAlchemy Models
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── study_session.py
│   │   │   ├── note.py
│   │   │   ├── task.py
│   │   │   ├── quiz.py
│   │   │   ├── flashcard.py
│   │   │   └── chat.py
│   │   │
│   │   ├── schemas/            # Pydantic Schemas
│   │   │   ├── __init__.py
│   │   │   ├── user.py
│   │   │   ├── note.py
│   │   │   ├── task.py
│   │   │   ├── quiz.py
│   │   │   └── ...
│   │   │
│   │   ├── services/           # 🎯 BUSINESS LOGIC (FEATURE MODULES)
│   │   │   ├── pomodoro_service.py
│   │   │   ├── goal_service.py
│   │   │   ├── note_service.py
│   │   │   ├── task_service.py
│   │   │   ├── quiz_service.py
│   │   │   ├── flashcard_service.py
│   │   │   ├── ai_service.py
│   │   │   └── analytics_service.py
│   │   │
│   │   ├── repositories/       # Database operations
│   │   │   ├── base.py
│   │   │   ├── user_repo.py
│   │   │   ├── note_repo.py
│   │   │   └── ...
│   │   │
│   │   └── utils/              # Utilities
│   │       ├── email.py
│   │       ├── logger.py
│   │       └── validators.py
│   │
│   ├── tests/                  # Test suites per feature
│   │   ├── test_auth.py
│   │   ├── test_notes.py
│   │   ├── test_quiz.py
│   │   └── ...
│   │
│   ├── alembic/                # Database migrations
│   │   ├── versions/
│   │   └── env.py
│   │
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── .env.example
│
├── database/
│   ├── migrations/             # SQL migration scripts
│   ├── seeds/                  # Initial data
│   │   ├── quotes.json
│   │   └── music_playlists.json
│   └── schema.sql
│
├── docs/                       # Documentation
│   ├── api/                    # API documentation
│   ├── database/
│   │   └── database_schema.puml
│   ├── features/               # Feature specifications
│   └── setup/                  # Setup guides
│
├── .github/
│   └── workflows/
│       ├── frontend-ci.yml
│       └── backend-ci.yml
│
├── docker-compose.yml
├── .gitignore
└── README.md
```

---

## 🎯 FEATURE MODULE TEMPLATE

Mỗi feature module tuân theo cấu trúc chuẩn:

### Frontend Feature Module Structure:
```
features/[feature-name]/
├── components/           # UI components
│   ├── [FeatureName].tsx
│   ├── [FeatureName]List.tsx
│   └── [FeatureName]Form.tsx
├── hooks/               # Custom hooks
│   ├── use[FeatureName].ts
│   └── use[FeatureName]Form.ts
├── services/            # API calls
│   └── [featureName]Service.ts
├── types/               # TypeScript types
│   └── [featureName].types.ts
├── constants/           # Feature-specific constants
│   └── [featureName].constants.ts
├── utils/               # Feature-specific utilities
│   └── [featureName].utils.ts
└── index.ts             # Public API exports
```

### Backend Feature Module Structure:
```
api/v1/[feature].py      # API endpoints
models/[feature].py      # Database models
schemas/[feature].py     # Request/Response schemas
services/[feature]_service.py  # Business logic
repositories/[feature]_repo.py # Data access
tests/test_[feature].py  # Unit tests
```

---

## 🔧 FEATURE ISOLATION PRINCIPLES

### 1. **API Versioning**
- Tất cả endpoints bắt đầu với `/api/v1/`
- Mỗi feature có router riêng: `/api/v1/notes`, `/api/v1/quiz`

### 2. **Database Isolation**
- Mỗi feature có bảng riêng
- Sử dụng foreign keys để liên kết
- Migrations theo feature: `alembic revision -m "add_notes_table"`

### 3. **State Management**
- Mỗi feature có slice/store riêng
- Không share state trực tiếp giữa các features
- Sử dụng events hoặc global state khi cần

### 4. **Component Isolation**
- Feature components nằm trong thư mục feature
- Shared components nằm trong `shared/components`
- Không import trực tiếp giữa các features

### 5. **Testing Isolation**
- Mỗi feature có test suite riêng
- Mock dependencies từ features khác
- Integration tests cho interactions giữa features

---

## 👥 PHÂN CÔNG THEO FEATURE

| Developer | Feature Module | Frontend Path | Backend Path |
|-----------|---------------|---------------|--------------|
| Dev 1 | Pomodoro Timer | `features/pomodoro/` | `api/v1/pomodoro.py` |
| Dev 2 | Notes & Tags | `features/notes/` | `api/v1/notes.py` |
| Dev 3 | Quiz System | `features/quiz/` | `api/v1/quiz.py` |
| Dev 4 | Flashcards | `features/flashcards/` | `api/v1/flashcards.py` |
| Dev 5 | AI Chat | `features/ai-chat/` | `api/v1/chat.py` |

---

## 🚀 WORKFLOW GUIDELINES

### Branching Strategy:
```
main
├── develop
│   ├── feature/pomodoro-timer
│   ├── feature/notes-system
│   ├── feature/quiz-module
│   └── feature/ai-chat
```

### Branch Naming Convention:

**Format**: `<type>/<scope>/<short-description>`

**Types:**
- `feature/` - Tính năng mới
- `fix/` - Sửa bug
- `hotfix/` - Sửa bug khẩn cấp trên production
- `refactor/` - Refactor code
- `docs/` - Cập nhật documentation
- `test/` - Thêm hoặc sửa tests
- `chore/` - Maintenance tasks

**Scopes (theo feature module):**
- `pomodoro` - Pomodoro Timer
- `notes` - Notes System
- `tasks` - Task Management
- `quiz` - Quiz System
- `flashcards` - Flashcards
- `ai-chat` - AI Chat
- `profile` - User Profile
- `auth` - Authentication
- `analytics` - Analytics
- `shared` - Shared components/utilities

**Examples:**
```bash
# Feature branches
feature/pomodoro/timer-component
feature/notes/tag-management
feature/quiz/question-shuffle
feature/ai-chat/gemini-integration

# Fix branches
fix/pomodoro/timer-reset-bug
fix/notes/tag-deletion-error
fix/quiz/score-calculation

# Hotfix branches
hotfix/auth/login-crash
hotfix/database/connection-timeout

# Refactor branches
refactor/notes/service-layer
refactor/shared/api-client

# Documentation branches
docs/api/pomodoro-endpoints
docs/setup/docker-guide

# Test branches
test/pomodoro/unit-tests
test/quiz/integration-tests
```

**Rules:**
1. Sử dụng lowercase và dấu gạch ngang `-`
2. Tránh sử dụng gạch dưới `_`
3. Ngắn gọn nhưng mô tả rõ ràng (max 50 ký tự)
4. Không sử dụng ký tự đặc biệt (ngoại trừ `/` và `-`)
5. Branch name phải thể hiện rõ mục đích

**Bad Examples:**
```bash
❌ Feature_Pomodoro         # Sử dụng underscore và uppercase
❌ fix-bug                  # Không rõ scope
❌ mywork                   # Không có type và scope
❌ feature/add-new-feature-for-pomodoro-timer-with-pause-and-resume  # Quá dài
```

**Good Examples:**
```bash
✅ feature/pomodoro/pause-resume
✅ fix/notes/tag-display
✅ refactor/quiz/service-layer
✅ docs/api/endpoints
```

### Commit Convention:
```
feat(pomodoro): add timer component
fix(notes): fix tag deletion bug
docs(quiz): update API documentation
test(flashcards): add unit tests for deck creation
```

### Pull Request Checklist:
- [ ] Code chỉ ảnh hưởng đến feature module của mình
- [ ] Tests pass cho feature module
- [ ] API documentation được cập nhật
- [ ] Database migrations (nếu có) được tạo
- [ ] Code review từ ít nhất 1 member khác

---

## 🔌 INTEGRATION POINTS

### Shared Dependencies:
1. **Authentication**: Tất cả features dùng `useAuth()` hook
2. **Theme**: Tất cả features dùng `useTheme()` hook
3. **API Client**: Tất cả features dùng `apiClient` từ `shared/utils/api.ts`
4. **User Context**: Shared user data qua Context API

### Feature Communication:
```typescript
// ❌ BAD: Direct import between features
import { Note } from '@/features/notes/types/note.types'

// ✅ GOOD: Use shared types or events
import { Note } from '@/shared/types'
// OR use event bus for feature communication
```

