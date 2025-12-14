# Railway Database Schema Sync

Script để đồng bộ schema database trên Railway với schema local.

## Vấn đề

Database trên Railway có thể thiếu một số cột hoặc constraints so với schema mới nhất trong `database_init.sql`. Script này sẽ tự động cập nhật tất cả các thay đổi.

## Các thay đổi được xử lý

### 1. quiz_questions table
- ✅ Chuyển đổi `options` từ `json` → `jsonb`
- ✅ Thêm cột `correct_answer_index`
- ✅ Migrate dữ liệu từ `correct_answer` → `correct_answer_index`
- ✅ Xóa các cột cũ: `question_type`, `correct_answer`
- ✅ Thêm constraints: `check_correct_answer_index`, `check_options_length`

### 2. quiz_attempts table
- ✅ Thêm cột `created_at` nếu chưa có
- ✅ Tạo index cho `created_at`

### 3. notes table
- ✅ Thêm cột `is_quick_note`
- ✅ Thêm cột `source_context`
- ✅ Thêm cột `theme`

### 4. tasks table
- ✅ Thêm cột `start_date`
- ✅ Cập nhật default cho `priority`

### 5. Indexes
- ✅ Tạo các index cần thiết nếu chưa có

## Cách sử dụng

### Bước 1: Cài đặt dependencies

```bash
pip install psycopg2-binary
```

### Bước 2: Lấy Railway DATABASE_URL

1. Vào [Railway Dashboard](https://railway.app)
2. Chọn project của bạn
3. Chọn PostgreSQL service
4. Vào tab **Variables**
5. Copy giá trị của `DATABASE_URL` hoặc `POSTGRES_URL`

### Bước 3: Cập nhật script

Mở file `backend/migrations/sync_railway_schema.py` và paste DATABASE_URL vào dòng:

```python
DATABASE_URL = 'postgresql://user:password@host:port/dbname'
```

### Bước 4: Chạy script

**Windows:**
```powershell
python backend\migrations\sync_railway_schema.py
```

**Linux/Mac:**
```bash
python backend/migrations/sync_railway_schema.py
```

## Output

Script sẽ hiển thị:
- Kết nối database
- Từng bước migration
- Schema cuối cùng của các bảng quan trọng
- Thông báo thành công hoặc lỗi

## Lưu ý

- **Backup trước**: Luôn backup database trước khi chạy migration
- **Idempotent**: Script có thể chạy nhiều lần an toàn (kiểm tra trước khi thay đổi)
- **Không mất dữ liệu**: Script chỉ thêm cột và migrate dữ liệu, không xóa dữ liệu hiện có

## Troubleshooting

### Lỗi: "No module named 'psycopg2'"
```bash
pip install psycopg2-binary
```

### Lỗi: "connection refused"
- Kiểm tra lại DATABASE_URL
- Đảm bảo Railway database đang chạy
- Kiểm tra firewall/network settings

### Lỗi: "permission denied"
- Railway thường cấp đủ quyền cho user mặc định
- Nếu vẫn lỗi, kiểm tra lại credentials

### Lỗi khi migrate dữ liệu
- Script sẽ cố gắng migrate dữ liệu từ `correct_answer` sang `correct_answer_index`
- Nếu không tìm thấy match, sẽ set default = 0
- Bạn nên kiểm tra lại các câu hỏi có `correct_answer_index = 0` sau khi migration

## Kiểm tra sau migration

Sau khi chạy script, kiểm tra:

1. **quiz_questions**:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'quiz_questions';
   ```
   Nên thấy: `correct_answer_index` (integer NOT NULL), `options` (jsonb NOT NULL)

2. **quiz_attempts**:
   ```sql
   SELECT column_name, data_type, is_nullable
   FROM information_schema.columns
   WHERE table_name = 'quiz_attempts';
   ```
   Nên thấy: `created_at` (timestamp NOT NULL)

3. **Test ứng dụng**: Chạy lại ứng dụng và test các tính năng quiz

## Rollback (nếu cần)

Nếu cần rollback, bạn có thể:
- Restore từ backup
- Hoặc chạy các lệnh SQL ngược lại (không khuyến nghị)

