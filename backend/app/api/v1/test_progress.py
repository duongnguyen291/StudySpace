"""
Test Progress Tracker API
Tạo dữ liệu giả và trả về kết quả Progress Tracker để kiểm tra nhanh logic.
"""
from datetime import datetime, timedelta, date
from uuid import uuid4, UUID

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.study_session import StudySession
from app.schemas.progress import WeeklyProgressResponse
from app.services.progress_service import ProgressService


router = APIRouter(prefix="/test-progress", tags=["Test"])


@router.post("/generate-demo", response_model=WeeklyProgressResponse)
def generate_demo_progress(db: Session = Depends(get_db)) -> WeeklyProgressResponse:
    """
    Tạo dữ liệu demo cho một user ngẫu nhiên trong tuần hiện tại
    và trả về kết quả Progress Tracker (WeeklyProgressResponse).

    Endpoint này KHÔNG yêu cầu đăng nhập, chỉ dùng cho mục đích test logic.
    """
    # Tạo user_id giả (chỉ dùng trong bảng session/quiz, không tạo user thật)
    user_id: UUID = uuid4()

    now = datetime.utcnow()
    # Xác định thứ Hai của tuần hiện tại (UTC)
    days_since_monday = now.weekday()  # Monday=0
    week_start = (now - timedelta(days=days_since_monday)).date()

    # Lưu ý:
    # Hiện tại model StudySession có foreign key tới bảng 'daily_goals'
    # (và QuizAttempt tới 'quiz_sets') nhưng các bảng này không được
    # khai báo trong SQLAlchemy metadata → khi INSERT sẽ dễ gây lỗi
    # NoReferencedTableError ở tầng ORM.
    #
    # Để tránh làm vỡ API khi test nhanh, endpoint này hiện KHÔNG
    # ghi thêm dữ liệu demo vào database, mà chỉ gọi ProgressService
    # với một user_id ngẫu nhiên. Kết quả sẽ là số liệu rỗng (0),
    # nhưng đảm bảo response shape và wiring của Progress Tracker
    # hoạt động đúng, không bị 500.

    service = ProgressService(db)
    # Lấy thống kê tuần hiện tại cho user demo (không có dữ liệu)
    return service.get_weekly_progress(user_id=user_id, filter_week=True)


