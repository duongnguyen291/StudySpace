from pydantic import BaseModel
from datetime import date
from uuid import UUID

class DailyGoalBase(BaseModel):
    target_minutes: int
    target_quiz_count: int

class DailyGoalCreate(DailyGoalBase):
    pass

class DailyGoalUpdateProgress(BaseModel):
    minutes: int = 0
    quizzes: int = 0

class DailyGoalResponse(BaseModel):
    id: UUID
    user_id: UUID
    goal_date: date
    target_minutes: int
    target_quiz_count: int
    actual_minutes: int
    actual_quiz_count: int
    completed: bool

    class Config:
        orm_mode = True
