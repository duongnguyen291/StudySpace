"""
Database Models
"""
from app.core.database import Base
from app.models.user import User
from app.models.user_settings import UserSettings
from app.models.chat import ChatConversation, ChatMessage
from app.models.study_session import StudySession
from app.models.quiz_attempt import QuizAttempt
from app.models.music import MusicPlaylist
from app.models.user_achievement import UserAchievement
from app.models.achievement import Achievement
from app.models.note import Note, NoteTag
from app.models.category import Category
from app.models.task import Task
from app.models.quiz import QuizSet, QuizQuestion

__all__ = [
    "Base",
    "User",
    "UserSettings",
    "ChatConversation",
    "ChatMessage",
    "MusicPlaylist",
    "UserAchievement",
    "Achievement",
    "Note",
    "NoteTag",
    "Category",
    "Task",
    "StudySession",
    "QuizAttempt",
    "QuizSet",
    "QuizQuestion",
]
