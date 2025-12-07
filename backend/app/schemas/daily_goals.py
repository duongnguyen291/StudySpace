from pydantic import BaseModel
from datetime import date

class DailyGoalUpdateRequest(BaseModel):
    target_minutes: int
    target_quiz_count: int


class DailyGoalResponse(BaseModel):
    id: int
    user_id: str
    goal_date: date
    target_minutes: int
    target_quiz_count: int
    actual_minutes: int
    actual_quiz_count: int
    completed: bool

    class Config:
        from_attributes = True
