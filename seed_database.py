"""
Seed Data Script for StudySpace PostgreSQL Database
Automatically populates music playlists, achievements, and quotes
"""

import os
import sys
import psycopg2
from psycopg2 import sql
import uuid

# Get DATABASE_URL from environment
DATABASE_URL = "postgresql://postgres:QXpQlAAnQUDdJPpAQFNJIVLSkNRiJySj@hopper.proxy.rlwy.net:53957/railway"

if not DATABASE_URL:
    print("❌ ERROR: DATABASE_URL not found in environment variables")
    print("\nPlease set it using:")
    print("  Windows: set DATABASE_URL=postgresql://...")
    print("  Linux/Mac: export DATABASE_URL=postgresql://...")
    print("\nYou can get DATABASE_URL from Railway Dashboard → PostgreSQL → Connect tab")
    sys.exit(1)

def seed_database():
    """Seed the database with initial data"""
    
    try:
        # Connect to database
        print(f"🔌 Connecting to database...")
        conn = psycopg2.connect(DATABASE_URL)
        cur = conn.cursor()
        
        print("✅ Connected successfully!")
        
        # Enable UUID extension
        print("\n🔧 Enabling UUID extension...")
        cur.execute('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"')
        conn.commit()
        print("✅ UUID extension enabled!")
        
        # Seed music playlists
        print("\n🎵 Seeding music playlists...")
        music_data = [
            ('Lofi Hip Hop Radio', 'Nhạc lofi chill để học bài và thư giãn', 'lofi', 'https://www.youtube.com/watch?v=jfKfPfyJRdk', 0, True),
            ('Lofi Chill Vibes', 'Lofi beats nhẹ nhàng cho buổi học đêm', 'lofi', 'https://www.youtube.com/watch?v=lTRiuFIWV54', 0, True),
            ('Coffee Shop Lofi', 'Không khí quán cà phê với nhạc lofi', 'lofi', 'https://www.youtube.com/watch?v=h2zkV-l_TbY', 0, True),
            ('Piano Relaxing Music', 'Nhạc piano thư giãn giúp tập trung', 'piano', 'https://www.youtube.com/watch?v=77ZozI0rw7w', 0, True),
            ('Classical Piano', 'Nhạc piano cổ điển - Chopin, Debussy', 'piano', 'https://www.youtube.com/watch?v=9E6b3swbnWg', 0, True),
            ('Study Piano', 'Piano nhẹ nhàng cho giờ học', 'piano', 'https://www.youtube.com/watch?v=lCOF9LN_Zxs', 0, True),
            ('Rain on Window', 'Tiếng mưa rơi trên cửa kính', 'rain', 'https://www.youtube.com/watch?v=mPZkdNFkNps', 0, True),
            ('Thunderstorm Sounds', 'Tiếng mưa bão và sấm sét', 'rain', 'https://www.youtube.com/watch?v=nMfPqeZjc2c', 0, True),
            ('Rain in Forest', 'Tiếng mưa trong rừng', 'rain', 'https://www.youtube.com/watch?v=q76bMs-NwRk', 0, True),
            ('Forest Birds', 'Tiếng chim hót trong rừng', 'nature', 'https://www.youtube.com/watch?v=xNN7iTA57jM', 0, True),
            ('River Stream', 'Tiếng suối chảy róc rách', 'nature', 'https://www.youtube.com/watch?v=IvjMgVS6kng', 0, True),
            ('Deep Focus Music', 'Nhạc ambient giúp tập trung sâu', 'ambient', 'https://www.youtube.com/watch?v=ceqgwo7U28Y', 0, True),
            ('Space Ambient', 'Âm thanh vũ trụ thư giãn', 'ambient', 'https://www.youtube.com/watch?v=tNkZsRW7h2c', 0, True),
        ]
        
        for music in music_data:
            cur.execute("""
                INSERT INTO music_playlists (id, name, description, playlist_type, audio_url, duration_minutes, is_active, created_at)
                VALUES (uuid_generate_v4(), %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
                ON CONFLICT DO NOTHING
            """, music)
        
        conn.commit()
        print(f"✅ Inserted {len(music_data)} music playlists")
        
        # Seed achievements
        print("\n🏆 Seeding achievements...")
        achievement_data = [
            ('first_quiz', 'Bài Quiz Đầu Tiên', 'Hoàn thành bài quiz đầu tiên', '/icons/achievements/first_quiz.png', True),
            ('quiz_10', '10 Quizzes', 'Hoàn thành 10 bài quiz', '/icons/achievements/quiz_10.png', True),
            ('quiz_50', '50 Quizzes', 'Hoàn thành 50 bài quiz', '/icons/achievements/quiz_50.png', True),
            ('quiz_100', '100 Quizzes', 'Hoàn thành 100 bài quiz', '/icons/achievements/quiz_100.png', True),
            ('perfect_score', 'Hoàn Hảo', 'Đạt điểm tuyệt đối trong một quiz', '/icons/achievements/perfect_score.png', True),
            ('study_60', '60 Phút Tập Trung', 'Tích lũy 60 phút học', '/icons/achievements/study_60.png', True),
            ('study_300', '5 Giờ Tập Trung', 'Tích lũy 300 phút học', '/icons/achievements/study_300.png', True),
            ('study_1000', '1000 Phút Tập Trung', 'Tích lũy 1000 phút học', '/icons/achievements/study_1000.png', True),
            ('study_2000', '2000 Phút Tập Trung', 'Tích lũy 2000 phút học', '/icons/achievements/study_2000.png', True),
            ('pomodoro_10', '10 Pomodoro', 'Hoàn thành 10 phiên Pomodoro', '/icons/achievements/pomodoro_10.png', True),
            ('pomodoro_50', '50 Pomodoro', 'Hoàn thành 50 phiên Pomodoro', '/icons/achievements/pomodoro_50.png', True),
            ('flash_10', '10 Flashcards', 'Review 10 thẻ flashcard', '/icons/achievements/flash_10.png', True),
            ('flash_50', '50 Flashcards', 'Review 50 thẻ flashcard', '/icons/achievements/flash_50.png', True),
            ('flash_100', '100 Flashcards', 'Review 100 thẻ flashcard', '/icons/achievements/flash_100.png', True),
        ]
        
        for achievement in achievement_data:
            cur.execute("""
                INSERT INTO achievements (id, code, name, description, url, active)
                VALUES (uuid_generate_v4(), %s, %s, %s, %s, %s)
                ON CONFLICT (code) DO NOTHING
            """, achievement)
        
        conn.commit()
        print(f"✅ Inserted {len(achievement_data)} achievements")
        
        # Seed quotes
        print("\n💬 Seeding quotes...")
        quote_data = [
            ('Thành công không phải là chìa khóa của hạnh phúc. Hạnh phúc là chìa khóa của thành công.', 'Albert Schweitzer', 'motivation', 'vi', True),
            ('Học hỏi là một kho báu sẽ theo chủ nhân của nó đến bất cứ đâu.', 'Tục ngữ Trung Quốc', 'learning', 'vi', True),
            ('Giáo dục là vũ khí mạnh mẽ nhất mà bạn có thể sử dụng để thay đổi thế giới.', 'Nelson Mandela', 'education', 'vi', True),
            ('Sự kiên trì là bí quyết của tất cả các chiến thắng.', 'Napoleon Hill', 'motivation', 'vi', True),
            ('Đừng xem đồng hồ, hãy làm những gì nó làm. Cứ tiếp tục đi.', 'Sam Levenson', 'productivity', 'vi', True),
        ]
        
        for quote in quote_data:
            cur.execute("""
                INSERT INTO quotes (id, quote_text, author, category, language, is_active)
                VALUES (uuid_generate_v4(), %s, %s, %s, %s, %s)
                ON CONFLICT DO NOTHING
            """, quote)
        
        conn.commit()
        print(f"✅ Inserted {len(quote_data)} quotes")
        
        # Verify counts
        print("\n📊 Verifying data...")
        cur.execute("SELECT COUNT(*) FROM music_playlists")
        music_count = cur.fetchone()[0]
        print(f"   Music playlists: {music_count}")
        
        cur.execute("SELECT COUNT(*) FROM achievements")
        achievement_count = cur.fetchone()[0]
        print(f"   Achievements: {achievement_count}")
        
        cur.execute("SELECT COUNT(*) FROM quotes")
        quote_count = cur.fetchone()[0]
        print(f"   Quotes: {quote_count}")
        
        # Close connection
        cur.close()
        conn.close()
        
        print("\n🎉 Seed completed successfully!")
        
    except psycopg2.Error as e:
        print(f"\n❌ Database error: {e}")
        sys.exit(1)
    except Exception as e:
        print(f"\n❌ Unexpected error: {e}")
        sys.exit(1)

if __name__ == "__main__":
    print("=" * 50)
    print("  StudySpace Database Seeder")
    print("=" * 50)
    seed_database()
