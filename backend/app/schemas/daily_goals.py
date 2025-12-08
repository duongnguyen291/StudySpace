from pydantic import BaseModel, UUID4
from datetime import date


class DailyGoalBase(BaseModel):
    target_minutes: int
    target_quiz_count: int


class DailyGoalCreateRequest(DailyGoalBase):
    pass


class DailyGoalUpdateRequest(DailyGoalBase):
    pass


class DailyGoalResponse(BaseModel):
    id: UUID4 | None = None
    user_id: UUID4
    goal_date: date | None = None
    target_minutes: int
    target_quiz_count: int
    actual_minutes: int
    actual_quiz_count: int
    completed: bool = False

    class Config:
        from_attributes = True


class UpdateGoalModel(BaseModel):
    target_minutes: int
    target_quiz_count: int
    goal_date: date | None = None