from uuid import UUID
from pydantic import BaseModel


class AchievementBase(BaseModel):
    code: str
    name: str
    description: str | None = None
    url: str | None = None
    active: bool


class AchievementResponse(AchievementBase):
    id: UUID
    earned: bool = False

    class Config:
        from_attributes = True
