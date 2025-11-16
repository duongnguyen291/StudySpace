"""
AI Chat API endpoints
"""
from fastapi import APIRouter

router = APIRouter()


@router.post("/conversations")
async def create_conversation():
    """Create a new chat conversation"""
    return {"message": "Create conversation endpoint - to be implemented"}


@router.post("/messages")
async def send_message():
    """Send a message to AI"""
    return {"message": "Send message endpoint - to be implemented"}

