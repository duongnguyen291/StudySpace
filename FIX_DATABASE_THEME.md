# 🔧 Hướng dẫn sửa lỗi "Không tải được danh sách ghi chú"

## Vấn đề
Lỗi xảy ra vì database chưa có cột `theme` trong bảng `notes`.

## Giải pháp

### Cách 1: Chạy Migration Script (Khuyến nghị)

Nếu bạn đang dùng database đã tồn tại, chạy migration script:

```bash
# Nếu dùng Docker
docker exec -i studyspace-postgres psql -U admin -d studyspace < database_migration_add_theme.sql

# Hoặc nếu dùng PostgreSQL trực tiếp
psql -U admin -d studyspace -f database_migration_add_theme.sql
```

### Cách 2: Chạy SQL trực tiếp

Kết nối vào database và chạy:

```sql
ALTER TABLE notes 
ADD COLUMN IF NOT EXISTS theme VARCHAR(50) DEFAULT 'standard' NOT NULL;

UPDATE notes 
SET theme = 'standard' 
WHERE theme IS NULL;
```

### Cách 3: Recreate Database (Nếu không có dữ liệu quan trọng)

Nếu database mới hoặc không có dữ liệu quan trọng:

```bash
# Xóa và tạo lại database
docker-compose down -v
docker-compose up -d
```

File `database_init.sql` đã được cập nhật với cột `theme`, nên database mới sẽ tự động có cột này.

## Kiểm tra

Sau khi chạy migration, kiểm tra:

```sql
-- Kiểm tra cột theme đã tồn tại
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'notes' AND column_name = 'theme';

-- Kiểm tra dữ liệu
SELECT id, title, theme FROM notes LIMIT 5;
```

## Các lỗi đã sửa

1. ✅ Sửa duplicate imports trong `note.types.ts`
2. ✅ Thêm parameter `theme` vào `NoteRepository.create()`
3. ✅ Thêm `theme` vào `NoteService.create_note()`

Sau khi chạy migration, reload lại trang và thử lại!

