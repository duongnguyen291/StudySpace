"""
Main API Router
Registers all feature routers
"""

from fastapi import APIRouter


from app.api.v1 import (
    auth,
    pomodoro,
    achievements,
    test_achievements,
    tasks,
    categories,
    music,
    notes,
    progress,
    test_progress,
    analytics,
    chat
    chat,
    quiz,
    flashcards,
    profile
)


api_router = APIRouter()

# Register routers
api_router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
api_router.include_router(pomodoro.router, prefix="/pomodoro", tags=["Pomodoro"])
api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])
api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])

# TODO: Uncomment when these modules are created
# from app.api.v1 import tasks, quiz, flashcards, profile, analytics
api_router.include_router(progress.router, prefix="/progress", tags=["Progress Tracker"])
api_router.include_router(test_progress.router)
api_router.include_router(analytics.router)


# TODO: Uncomment when these modules are created
# from app.api.v1 import tasks, quiz, flashcards, chat, profile
# api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(music.router, prefix="/music", tags=["Music"])
# api_router.include_router(notes.router, prefix="/notes", tags=["Notes"])
api_router.include_router(achievements.router)
api_router.include_router(test_achievements.router)
api_router.include_router(profile.router)
api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
api_router.include_router(categories.router, prefix="/categories", tags=["Categories"])

# Quiz and Flashcards routes (added by feature/quiz branch)
api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
api_router.include_router(flashcards.router, prefix="/flashcards", tags=["Flashcards"])

# TODO: Uncomment when these modules are created
# from app.api.v1 import tasks, quiz, flashcards, chat, analytics
# api_router.include_router(tasks.router, prefix="/tasks", tags=["Tasks"])
# api_router.include_router(quiz.router, prefix="/quiz", tags=["Quiz"])
# api_router.include_router(flashcards.router, prefix="/flashcards", tags=["Flashcards"])
# api_router.include_router(chat.router, prefix="/chat", tags=["AI Chat"])
# api_router.include_router(analytics.router, prefix="/analytics", tags=["Analytics"])

# from app.api.v1 import quiz, flashcards, chat, profile, analytics
# api_router.include_router(profile.router, prefix="/profile", tags=["Profile"])
