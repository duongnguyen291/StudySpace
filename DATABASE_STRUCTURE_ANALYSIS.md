# 📊 PHÂN TÍCH CẤU TRÚC DATABASE - STUDYSPACE PROJECT

## 🎯 TỔNG QUAN

Dự án **StudySpace** sử dụng kiến trúc **3-layer** với PostgreSQL làm database chính:
- **Frontend**: Next.js 14 (TypeScript)
- **Backend**: FastAPI (Python)
- **Database**: PostgreSQL 15

---

## 🗄️ CẤU TRÚC DATABASE

### 1. **Tổng quan Schema**

Database có **18 bảng** được chia thành 6 nhóm chức năng:

#### **Nhóm 1: User & Authentication (2 tables)**
- `users` - Thông tin người dùng
- `user_settings` - Cài đặt người dùng (theme, pomodoro, notifications)

#### **Nhóm 2: Learning Sessions (3 tables)**
- `study_sessions` - Phiên học tập (pomodoro, free study, quiz)
- `daily_goals` - Mục tiêu hàng ngày
- `user_achievements` - Huy hiệu người dùng đạt được
- `achievements` - Danh sách huy hiệu có sẵn

#### **Nhóm 3: Notes & Tasks (4 tables)**
- `categories` - Phân loại nội dung
- `notes` - Ghi chú
- `note_tags` - Tags cho notes
- `tasks` - Công việc/Todo

#### **Nhóm 4: Quiz & Flashcards (6 tables)**
- `quiz_sets` - Bộ câu hỏi
- `quiz_questions` - Câu hỏi trong quiz
- `quiz_attempts` - Lịch sử làm quiz
- `flashcard_decks` - Bộ thẻ học
- `flashcards` - Thẻ học
- `flashcard_progress` - Tiến độ học flashcard

#### **Nhóm 5: AI Chat (2 tables)**
- `chat_conversations` - Cuộc hội thoại
- `chat_messages` - Tin nhắn trong cuộc hội thoại

#### **Nhóm 6: Content (2 tables)**
- `quotes` - Câu nói truyền cảm hứng
- `music_playlists` - Playlist nhạc học tập

---

### 2. **Chi tiết các bảng quan trọng**

#### **📋 Bảng `users`**
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb
);
```

**Quan hệ:**
- 1 user → N study_sessions
- 1 user → 1 user_settings
- 1 user → N notes
- 1 user → N tasks
- 1 user → N quiz_sets
- 1 user → N flashcard_decks
- 1 user → N chat_conversations
- 1 user → N user_achievements

**Indexes:**
- `email` (unique index)

---

#### **📋 Bảng `notes`**
```sql
CREATE TABLE notes (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_quick_note BOOLEAN DEFAULT FALSE,  -- Thêm mới
    source_context TEXT,                  -- Thêm mới
    created_at TIMESTAMP,
    updated_at TIMESTAMP
);
```

**Quan hệ:**
- N notes → 1 user
- N notes → 1 category (optional)
- 1 note → N note_tags

**Indexes:**
- `idx_notes_user_id` trên `user_id`
- `idx_notes_category_id` trên `category_id`

**Lưu ý:** Bảng này có 2 trường mới so với schema gốc:
- `is_quick_note`: Đánh dấu note là quick note
- `source_context`: Context nguồn gốc (từ Pomodoro, Quiz, etc.)

---

#### **📋 Bảng `note_tags`**
```sql
CREATE TABLE note_tags (
    id UUID PRIMARY KEY,
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP
);
```

**Quan hệ:**
- N note_tags → 1 note

**Lưu ý:** Tags được lưu riêng trong bảng này, không phải JSONB trong notes.

---

#### **📋 Bảng `achievements` và `user_achievements`**
```sql
CREATE TABLE achievements (
    id UUID PRIMARY KEY,
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(300),
    active BOOLEAN DEFAULT TRUE
);

CREATE TABLE user_achievements (
    id UUID PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE
);
```

**Quan hệ:**
- N user_achievements → 1 user
- N user_achievements → 1 achievement

**Seed data:** Có 14 achievements mặc định (first_quiz, quiz_10, study_60, etc.)

---

### 3. **Foreign Keys & Constraints**

#### **Cascade Rules:**
- `ON DELETE CASCADE`: Khi xóa user → xóa tất cả dữ liệu liên quan
  - study_sessions, notes, tasks, quiz_sets, flashcard_decks, chat_conversations, user_achievements
  
- `ON DELETE SET NULL`: Khi xóa category → set category_id = NULL
  - notes.category_id
  - tasks.category_id

#### **Unique Constraints:**
- `users.email` - Email phải unique
- `user_settings.user_id` - Mỗi user chỉ có 1 settings
- `daily_goals(user_id, goal_date)` - Mỗi user chỉ có 1 goal mỗi ngày
- `flashcard_progress(user_id, flashcard_id)` - Mỗi user chỉ có 1 progress record cho mỗi flashcard

---

### 4. **Indexes cho Performance**

```sql
-- User-related indexes
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_start_time ON study_sessions(start_time);
CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, goal_date);

-- Notes & Tasks indexes
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_category_id ON notes(category_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);

-- Quiz & Flashcards indexes
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_flashcard_progress_user_id ON flashcard_progress(user_id);

-- Chat indexes
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);
```

---

### 5. **Triggers**

**Auto-update `updated_at`:**
```sql
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON daily_goals
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
```

---

## 🏗️ KIẾN TRÚC BACKEND (Database Layer)

### 1. **Cấu trúc thư mục**

```
backend/app/
├── core/
│   ├── database.py          # SQLAlchemy engine, session, Base
│   ├── config.py            # Settings (DATABASE_URL, etc.)
│   └── security.py          # Password hashing, JWT
│
├── models/                  # SQLAlchemy ORM Models
│   ├── user.py
│   ├── user_settings.py
│   ├── user_achievement.py
│   ├── achievement.py
│   └── note.py
│
├── schemas/                 # Pydantic schemas (validation)
│   ├── user.py
│   └── notes.py
│
├── repositories/            # Data Access Layer (DAL)
│   ├── base.py              # BaseRepository với CRUD cơ bản
│   ├── user_repo.py
│   ├── note_repo.py
│   └── achievement_repo.py
│
├── services/                # Business Logic Layer
│   ├── user_service.py
│   ├── note_service.py
│   └── achivements_service.py
│
└── api/v1/                  # API Endpoints
    ├── router.py            # Main router
    ├── auth.py
    ├── notes.py
    └── achievements.py
```

---

### 2. **Database Connection (database.py)**

```python
# SQLAlchemy Engine
engine = create_engine(
    settings.DATABASE_URL,
    pool_pre_ping=True,      # Kiểm tra connection trước khi dùng
    pool_size=10,            # Số connection trong pool
    max_overflow=20,         # Số connection tối đa khi cần
)

# Session Factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base class cho models
Base = declarative_base()

# Dependency cho FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

**Connection String:**
```
postgresql://admin:studyspace2024@localhost:5432/studyspace
```

---

### 3. **Models (SQLAlchemy ORM)**

#### **Pattern chung:**
```python
from sqlalchemy import Column, String, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from app.core.database import Base

class ModelName(Base):
    __tablename__ = "table_name"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    # ... các columns khác
    
    # Relationships
    related_items = relationship("RelatedModel", back_populates="model")
```

#### **Ví dụ: User Model**
```python
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    # ...
    
    # Relationships
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    achievements = relationship("UserAchievement", back_populates="user", cascade="all, delete-orphan")
```

#### **Ví dụ: Note Model**
```python
class Note(Base):
    __tablename__ = "notes"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    category_id = Column(UUID(as_uuid=True), nullable=True)  # No FK constraint
    title = Column(String(255), nullable=False)
    content = Column(Text, nullable=True)
    is_pinned = Column(Boolean, default=False, nullable=False)
    is_quick_note = Column(Boolean, default=False, nullable=False)
    source_context = Column(Text, nullable=True)
    # ...
    
    tags = relationship("NoteTag", back_populates="note", cascade="all, delete-orphan")
```

**Lưu ý:** `category_id` không có ForeignKey constraint trong model (có thể do categories table chưa được implement).

---

### 4. **Repositories (Data Access Layer)**

#### **BaseRepository Pattern:**
```python
class BaseRepository(Generic[ModelType]):
    def __init__(self, model: Type[ModelType], db: Session):
        self.model = model
        self.db = db
    
    def get(self, id: str) -> Optional[ModelType]:
        return self.db.query(self.model).filter(self.model.id == id).first()
    
    def get_all(self, skip: int = 0, limit: int = 100) -> List[ModelType]:
        return self.db.query(self.model).offset(skip).limit(limit).all()
    
    def create(self, obj_in: dict) -> ModelType:
        db_obj = self.model(**obj_in)
        self.db.add(db_obj)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def update(self, db_obj: ModelType, obj_in: dict) -> ModelType:
        for key, value in obj_in.items():
            setattr(db_obj, key, value)
        self.db.commit()
        self.db.refresh(db_obj)
        return db_obj
    
    def delete(self, id: str) -> bool:
        obj = self.get(id)
        if obj:
            self.db.delete(obj)
            self.db.commit()
            return True
        return False
```

#### **Ví dụ: UserRepository**
```python
class UserRepository(BaseRepository[User]):
    def __init__(self, db: Session):
        super().__init__(User, db)
    
    def get_by_email(self, email: str) -> Optional[User]:
        return self.db.query(User).filter(User.email == email).first()
    
    def get_by_username(self, username: str) -> Optional[User]:
        return self.db.query(User).filter(User.username == username).first()
    
    def create_user(self, email: str, username: str, password_hash: str) -> User:
        user = User(email=email, username=username, password_hash=password_hash, ...)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
```

#### **Ví dụ: NoteRepository (Custom implementation)**
```python
class NoteRepository:
    def __init__(self, db: Session) -> None:
        self.db = db
    
    def create(self, *, user_id: UUID, title: str, content: str, tags: list[str], ...) -> Note:
        note = Note(user_id=user_id, title=title, content=content, ...)
        self.db.add(note)
        self.db.flush()  # Để có note.id
        
        # Tạo tags
        if tags:
            for name in tags:
                self.db.add(NoteTag(note_id=note.id, tag_name=name))
        
        self.db.commit()
        self.db.refresh(note)
        return note
    
    def get_all_for_user(self, user_id: UUID, is_quick_note: bool | None = None) -> List[Note]:
        query = self.db.query(Note).filter(Note.user_id == user_id)
        if is_quick_note is not None:
            query = query.filter(Note.is_quick_note == is_quick_note)
        return query.order_by(Note.created_at.desc()).all()
```

**Lưu ý:** NoteRepository không kế thừa BaseRepository, tự implement các methods.

---

### 5. **Services (Business Logic Layer)**

#### **Pattern:**
```python
class ServiceName:
    def __init__(self, db: Session):
        self.repo = RepositoryName(db)
    
    def business_method(self, ...):
        # Validation
        # Business logic
        # Call repository
        # Return response
```

#### **Ví dụ: NoteService**
```python
class NoteService:
    def __init__(self, db: Session) -> None:
        self.repo = NoteRepository(db)
    
    def _to_response(self, note: Note) -> NoteResponse:
        """Convert ORM Note to Pydantic NoteResponse"""
        return NoteResponse(
            id=note.id,
            user_id=note.user_id,
            title=note.title,
            content=note.content,
            tags=[t.tag_name for t in note.tags],  # Convert relationships
            ...
        )
    
    def create_note(self, user_id: UUID, data: NoteCreate) -> NoteResponse:
        # Auto-generate title nếu thiếu
        if not data.title and data.content:
            title = data.content[:50]
        
        note = self.repo.create(
            user_id=user_id,
            title=title or "Untitled",
            content=data.content,
            tags=data.tags or [],
            ...
        )
        return self._to_response(note)
    
    def get_notes(self, user_id: UUID, is_quick_note: bool | None = None) -> List[NoteResponse]:
        notes = self.repo.get_all_for_user(user_id, is_quick_note=is_quick_note)
        return [self._to_response(n) for n in notes]
```

---

### 6. **API Endpoints (FastAPI)**

#### **Pattern:**
```python
router = APIRouter()

@router.post("/", response_model=NoteResponse)
async def create_note(
    payload: NoteCreate,
    current_user_id: UUID = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    service = NoteService(db)
    return service.create_note(current_user_id, payload)
```

**Dependencies:**
- `get_database()`: Lấy database session
- `get_current_user()`: Lấy user_id từ JWT token

---

## 🔄 DATA FLOW

### **Request Flow:**
```
Client Request
    ↓
API Endpoint (api/v1/notes.py)
    ↓
Service Layer (services/note_service.py)
    ↓
Repository Layer (repositories/note_repo.py)
    ↓
SQLAlchemy ORM (models/note.py)
    ↓
PostgreSQL Database
```

### **Response Flow:**
```
PostgreSQL Database
    ↓
SQLAlchemy ORM (models/note.py) → Note object
    ↓
Repository Layer → Note object
    ↓
Service Layer → NoteResponse (Pydantic)
    ↓
API Endpoint → JSON Response
    ↓
Client
```

---

## 🚨 CÁC VẤN ĐỀ CẦN LƯU Ý KHI SỬA DATABASE

### 1. **Migration Strategy**

**Hiện tại:**
- Có file `database_init.sql` để khởi tạo schema
- Có `alembic.ini` nhưng chưa có migrations
- Backend sử dụng `Base.metadata.create_all(bind=engine)` trong `main.py`

**Vấn đề:**
- Không có version control cho database changes
- Khó rollback khi có lỗi
- Không track được lịch sử thay đổi

**Giải pháp:**
```bash
# Tạo migration đầu tiên
alembic revision --autogenerate -m "Initial migration"

# Apply migrations
alembic upgrade head

# Rollback
alembic downgrade -1
```

---

### 2. **Foreign Key Constraints**

**Vấn đề:**
- `notes.category_id` không có ForeignKey constraint trong model
- Có thể dẫn đến data inconsistency

**Giải pháp:**
- Thêm ForeignKey constraint khi có Category model
- Hoặc validate trong Service layer

---

### 3. **Indexes**

**Hiện tại:**
- Có indexes cơ bản trong `database_init.sql`
- Nhưng có thể thiếu indexes cho các query thường dùng

**Cần thêm indexes cho:**
- `note_tags.tag_name` (nếu search by tag)
- `notes.title` (nếu search by title)
- `notes.created_at` (nếu sort thường xuyên)

---

### 4. **Transaction Management**

**Hiện tại:**
- Mỗi repository method tự commit
- Không có transaction wrapping cho multiple operations

**Vấn đề:**
- Nếu có lỗi giữa chừng, data có thể inconsistent

**Giải pháp:**
```python
# Trong service
def create_note_with_tags(self, ...):
    try:
        note = self.repo.create(...)
        # Nếu có lỗi ở đây, note đã được commit
        self.repo.add_tags(note.id, tags)
    except Exception:
        self.db.rollback()
        raise
```

---

### 5. **Soft Delete**

**Hiện tại:**
- Xóa hard delete (DELETE FROM table)
- Không thể recover data

**Cân nhắc:**
- Thêm `deleted_at` column
- Filter deleted records trong queries

---

## 📝 CHECKLIST KHI SỬA DATABASE

### **Trước khi sửa:**
- [ ] Backup database hiện tại
- [ ] Review các foreign keys và relationships
- [ ] Kiểm tra indexes có đủ không
- [ ] Xem xét impact lên các API endpoints

### **Khi sửa:**
- [ ] Tạo migration script (Alembic)
- [ ] Test migration trên dev database
- [ ] Update models trong `app/models/`
- [ ] Update repositories nếu cần
- [ ] Update services nếu business logic thay đổi
- [ ] Update schemas nếu response format thay đổi
- [ ] Update API endpoints nếu cần

### **Sau khi sửa:**
- [ ] Test tất cả API endpoints liên quan
- [ ] Kiểm tra performance (query time)
- [ ] Verify data integrity
- [ ] Update documentation

---

## 🔧 DOCKER SETUP

### **Database Connection trong Docker:**

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: studyspace2024
      POSTGRES_DB: studyspace
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./database_init.sql:/docker-entrypoint-initdb.d/init.sql
```

**Connection từ Backend:**
```python
# Trong Docker
DATABASE_URL = "postgresql://admin:studyspace2024@postgres:5432/studyspace"

# Local development
DATABASE_URL = "postgresql://admin:studyspace2024@localhost:5432/studyspace"
```

---

## 📊 QUAN HỆ GIỮA CÁC BẢNG (ERD Summary)

```
users (1) ──────── (N) study_sessions
users (1) ──────── (1) user_settings
users (1) ──────── (N) notes
users (1) ──────── (N) tasks
users (1) ──────── (N) quiz_sets
users (1) ──────── (N) flashcard_decks
users (1) ──────── (N) chat_conversations
users (1) ──────── (N) user_achievements

categories (1) ─── (N) notes
categories (1) ─── (N) tasks
categories (1) ─── (N) quiz_sets

notes (1) ──────── (N) note_tags

quiz_sets (1) ──── (N) quiz_questions
quiz_sets (1) ──── (N) quiz_attempts

flashcard_decks (1) ──── (N) flashcards
flashcards (1) ──── (N) flashcard_progress

chat_conversations (1) ──── (N) chat_messages

achievements (1) ──── (N) user_achievements
```

---

## 🎯 KẾT LUẬN

### **Điểm mạnh:**
- ✅ Schema rõ ràng, có indexes cơ bản
- ✅ Sử dụng UUID cho primary keys (tốt cho distributed systems)
- ✅ Có cascade rules hợp lý
- ✅ Có triggers cho auto-update timestamps
- ✅ Kiến trúc 3-layer rõ ràng (API → Service → Repository → Model)

### **Cần cải thiện:**
- ⚠️ Chưa có Alembic migrations (chỉ có init script)
- ⚠️ Một số foreign keys chưa được enforce trong models
- ⚠️ Chưa có soft delete
- ⚠️ Transaction management có thể tốt hơn
- ⚠️ Có thể thiếu một số indexes cho performance

### **Khuyến nghị:**
1. **Setup Alembic migrations** ngay để track database changes
2. **Thêm foreign key constraints** đầy đủ trong models
3. **Review và thêm indexes** cho các query thường dùng
4. **Implement transaction wrapping** cho complex operations
5. **Cân nhắc soft delete** cho các bảng quan trọng

---

*Tài liệu này được tạo để hỗ trợ việc sửa đổi database trong tương lai.*

