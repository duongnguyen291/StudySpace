"""
Main API Router
Registers all feature routers
"""
from fastapi import APIRouter

# Import feature routers
from app.api.v1 import auth, pomodoro, notes

api_router = APIRouter()

# Register routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(pomodoro.router, prefix="/pomodoro", tags=["Pomodoro"])
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])

# TODO: Uncomment when these modules are created
# from app.api.v1 import tasks, quiz, flashcards, chat, profile, analytics
# api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
# api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
# api_router.include_router(flashcards.router, prefix="/flashcards", tags=["Flashcards"])
# api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
# api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
# api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

