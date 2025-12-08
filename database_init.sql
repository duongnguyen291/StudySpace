-- ============================================
-- STUDYSPACE DATABASE INITIALIZATION SCRIPT
-- PostgreSQL Database Schema
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- TABLE: users
-- ============================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    username VARCHAR(100) NOT NULL,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP,
    is_active BOOLEAN DEFAULT TRUE,
    preferences JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- TABLE: user_settings
-- ============================================
CREATE TABLE user_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    theme_mode VARCHAR(10) DEFAULT 'light',
    pomodoro_work_duration INTEGER DEFAULT 25,
    pomodoro_break_duration INTEGER DEFAULT 5,
    pomodoro_long_break_duration INTEGER DEFAULT 15,
    default_music_playlist VARCHAR(50),
    notification_enabled BOOLEAN DEFAULT TRUE,
    language VARCHAR(10) DEFAULT 'vi',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- ============================================
-- TABLE: study_sessions
-- ============================================
CREATE TABLE study_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    session_type VARCHAR(20) NOT NULL, -- 'pomodoro', 'free_study', 'quiz'
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    duration_minutes INTEGER,
    goal_id UUID,
    notes TEXT,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: daily_goals
-- ============================================
CREATE TABLE daily_goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    goal_date DATE NOT NULL,
    target_minutes INTEGER DEFAULT 0,
    target_quiz_count INTEGER DEFAULT 0,
    actual_minutes INTEGER DEFAULT 0,
    actual_quiz_count INTEGER DEFAULT 0,
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, goal_date)
);

-- ============================================
-- TABLE: user_achievements
-- ============================================
CREATE TABLE achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    url VARCHAR(300),
    active BOOLEAN DEFAULT TRUE
);

-- TABLE: user_achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    achievement_id UUID NOT NULL REFERENCES achievements(id) ON DELETE CASCADE
);

-- ============================================
-- TABLE: categories
-- ============================================
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'folder',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: note_categories (separate from task categories)
-- ============================================
CREATE TABLE note_categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) DEFAULT '#3B82F6',
    icon VARCHAR(50) DEFAULT 'folder',
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: notes
-- ============================================
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES note_categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_quick_note BOOLEAN DEFAULT FALSE,
    source_context TEXT,
    theme VARCHAR(50) DEFAULT 'standard',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: note_tags
-- ============================================
CREATE TABLE note_tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    note_id UUID NOT NULL REFERENCES notes(id) ON DELETE CASCADE,
    tag_name VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: tasks
-- ============================================
CREATE TABLE tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    priority VARCHAR(10) DEFAULT 'medium', -- 'low', 'medium', 'high'
    start_date DATE,
    due_date DATE,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: quiz_sets
-- ============================================
CREATE TABLE quiz_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: quiz_questions
-- ============================================
CREATE TABLE quiz_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quiz_set_id UUID NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) DEFAULT 'multiple_choice', -- 'multiple_choice', 'true_false', 'short_answer'
    options JSONB, -- For multiple choice: ["Option A", "Option B", "Option C", "Option D"]
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: quiz_attempts
-- ============================================
CREATE TABLE quiz_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    quiz_set_id UUID NOT NULL REFERENCES quiz_sets(id) ON DELETE CASCADE,
    score DECIMAL(5,2),
    total_questions INTEGER NOT NULL,
    correct_answers INTEGER DEFAULT 0,
    time_spent_seconds INTEGER,
    answers JSONB,                             -- Store user's answers
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: flashcard_decks
-- ============================================
CREATE TABLE flashcard_decks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: flashcards
-- ============================================
CREATE TABLE flashcards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    deck_id UUID NOT NULL REFERENCES flashcard_decks(id) ON DELETE CASCADE,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    hint TEXT,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: flashcard_progress
-- ============================================
CREATE TABLE flashcard_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    flashcard_id UUID NOT NULL REFERENCES flashcards(id) ON DELETE CASCADE,
    confidence_level INTEGER DEFAULT 0, -- 0-5 scale
    last_reviewed TIMESTAMP,
    next_review TIMESTAMP,
    review_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, flashcard_id)
);

-- ============================================
-- TABLE: chat_conversations
-- ============================================
CREATE TABLE chat_conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) DEFAULT 'New Conversation',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_message_at TIMESTAMP
);

-- ============================================
-- TABLE: chat_messages
-- ============================================
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL, -- 'user', 'assistant', 'system'
    content TEXT NOT NULL,
    tokens_used INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: quotes
-- ============================================
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    quote_text TEXT NOT NULL,
    author VARCHAR(100),
    category VARCHAR(50) DEFAULT 'motivation',
    language VARCHAR(10) DEFAULT 'vi',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- TABLE: music_playlists
-- ============================================
CREATE TABLE music_playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    playlist_type VARCHAR(50), -- 'lofi', 'piano', 'rain', 'nature'
    audio_url VARCHAR(500),
    thumbnail_url VARCHAR(500),
    duration_minutes INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- INDEXES for Performance
-- ============================================
CREATE INDEX idx_study_sessions_user_id ON study_sessions(user_id);
CREATE INDEX idx_study_sessions_start_time ON study_sessions(start_time);
CREATE INDEX idx_daily_goals_user_date ON daily_goals(user_id, goal_date);
CREATE INDEX idx_note_categories_user_id ON note_categories(user_id);
CREATE INDEX idx_notes_user_id ON notes(user_id);
CREATE INDEX idx_notes_category_id ON notes(category_id);
CREATE INDEX idx_tasks_user_id ON tasks(user_id);
CREATE INDEX idx_tasks_start_date ON tasks(start_date);
CREATE INDEX idx_tasks_due_date ON tasks(due_date);
CREATE INDEX idx_quiz_attempts_user_id ON quiz_attempts(user_id);
CREATE INDEX idx_flashcard_progress_user_id ON flashcard_progress(user_id);
CREATE INDEX idx_chat_messages_conversation_id ON chat_messages(conversation_id);

-- ============================================
-- ADD FOREIGN KEY for study_sessions.goal_id
-- ============================================
ALTER TABLE study_sessions 
ADD CONSTRAINT fk_study_sessions_goal_id 
FOREIGN KEY (goal_id) REFERENCES daily_goals(id) ON DELETE SET NULL;

-- ============================================
-- TRIGGERS for updated_at
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at BEFORE UPDATE ON user_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_daily_goals_updated_at BEFORE UPDATE ON daily_goals
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_note_categories_updated_at BEFORE UPDATE ON note_categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notes_updated_at BEFORE UPDATE ON notes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- SEED DATA: Quotes
-- ============================================
INSERT INTO quotes (quote_text, author, category, language) VALUES
('Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc là chìa khóa của thành công.', 'Albert Schweitzer', 'motivation', 'vi'),
('Học hỏi là một kho báu sẽ theo chủ nhân của nó đến bất cứ đâu.', 'Tục ngữ Trung Quốc', 'learning', 'vi'),
('Giáo dục là vũ khí mạnh mẽ nhất mà bạn có thể sử dụng để thay đổi thế giới.', 'Nelson Mandela', 'education', 'vi'),
('Sự kiên trì là bí quyết của tất cả các chiến thắng.', 'Napoleon Hill', 'motivation', 'vi'),
('Đừng xem đồng hồ, hãy làm những gì nó làm. Cứ tiếp tục đi.', 'Sam Levenson', 'productivity', 'vi');

-- ============================================
-- SEED DATA: Music Playlists
-- ============================================
INSERT INTO music_playlists (name, description, playlist_type, audio_url, duration_minutes, is_active) VALUES
('Lofi Hip Hop Radio', 'Nhạc lofi chill để học bài và thư giãn', 'lofi', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 0, TRUE),
('Lofi Chill Vibes', 'Lofi beats nhẹ nhàng cho buổi học đêm', 'lofi', 'https://www.youtube.com/watch?v=lTRiuFIWV54', 0, TRUE),
('Coffee Shop Lofi', 'Không khí quán cà phê với nhạc lofi', 'lofi', 'https://www.youtube.com/watch?v=h2zkV-l_TbY', 0, TRUE),
('Piano Relaxing Music', 'Nhạc piano thư giãn giúp tập trung', 'piano', 'https://www.youtube.com/watch?v=77ZozI0rw7w', 0, TRUE),
('Classical Piano', 'Nhạc piano cổ điển - Chopin, Debussy', 'piano', 'https://www.youtube.com/watch?v=9E6b3swbnWg', 0, TRUE),
('Study Piano', 'Piano nhẹ nhàng cho giờ học', 'piano', 'https://www.youtube.com/watch?v=lCOF9LN_Zxs', 0, TRUE),
('Rain on Window', 'Tiếng mưa rơi trên cửa kính', 'rain', 'https://www.youtube.com/watch?v=mPZkdNFkNps', 0, TRUE),
('Thunderstorm Sounds', 'Tiếng mưa bão và sấm sét', 'rain', 'https://www.youtube.com/watch?v=nMfPqeZjc2c', 0, TRUE),
('Rain in Forest', 'Tiếng mưa trong rừng', 'rain', 'https://www.youtube.com/watch?v=q76bMs-NwRk', 0, TRUE),
('Forest Birds', 'Tiếng chim hót trong rừng', 'nature', 'https://www.youtube.com/watch?v=xNN7iTA57jM', 0, TRUE),
('River Stream', 'Tiếng suối chảy róc rách', 'nature', 'https://www.youtube.com/watch?v=IvjMgVS6kng', 0, TRUE),
('Deep Focus Music', 'Nhạc ambient giúp tập trung sâu', 'ambient', 'https://www.youtube.com/watch?v=ceqgwo7U28Y', 0, TRUE),
('Space Ambient', 'Âm thanh vũ trụ thư giãn', 'ambient', 'https://www.youtube.com/watch?v=tNkZsRW7h2c', 0, TRUE);

-- ============================================
-- SEED DATA: Achievements
-- ============================================

INSERT INTO achievements (code, name, description, url, active) VALUES
('first_quiz', 'Bài Quiz Đầu Tiên', 'Hoàn thành bài quiz đầu tiên', '/icons/achievements/first_quiz.png', TRUE),
('quiz_10', '10 Quizzes', 'Hoàn thành 10 bài quiz', '/icons/achievements/quiz_10.png', TRUE),
('quiz_50', '50 Quizzes', 'Hoàn thành 50 bài quiz', '/icons/achievements/quiz_50.png', TRUE),
('quiz_100', '100 Quizzes', 'Hoàn thành 100 bài quiz', '/icons/achievements/quiz_100.png', TRUE),
('perfect_score', 'Hoàn Hảo', 'Đạt điểm tuyệt đối trong một quiz', '/icons/achievements/perfect_score.png', TRUE),
('study_60', '60 Phút Tập Trung', 'Tích lũy 60 phút học', '/icons/achievements/study_60.png', TRUE),
('study_300', '5 Giờ Tập Trung', 'Tích lũy 300 phút học', '/icons/achievements/study_300.png', TRUE),
('study_1000', '1000 Phút Tập Trung', 'Tích lũy 1000 phút học', '/icons/achievements/study_1000.png', TRUE),
('study_2000', '2000 Phút Tập Trung', 'Tích lũy 2000 phút học', '/icons/achievements/study_2000.png', TRUE),
('pomodoro_10', '10 Pomodoro', 'Hoàn thành 10 phiên Pomodoro', '/icons/achievements/pomodoro_10.png', TRUE),
('pomodoro_50', '50 Pomodoro', 'Hoàn thành 50 phiên Pomodoro', '/icons/achievements/pomodoro_50.png', TRUE),
('flash_10', '10 Flashcards', 'Review 10 thẻ flashcard', '/icons/achievements/flash_10.png', TRUE),
('flash_50', '50 Flashcards', 'Review 50 thẻ flashcard', '/icons/achievements/flash_50.png', TRUE),
('flash_100', '100 Flashcards', 'Review 100 thẻ flashcard', '/icons/achievements/flash_100.png', TRUE);


COMMENT ON DATABASE studyspace IS 'StudySpace - Personal Learning Platform Database';

