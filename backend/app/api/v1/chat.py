"""
AI Chat API endpoints.
"""
from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_database, get_current_user
from app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationDetail,
    ChatConversationSummary,
    ChatSendMessageRequest,
    ChatSendMessageResponse,
)
from app.services.ai_service import AIChatService

router = APIRouter()


def get_service(db: Session) -> AIChatService:
    """Helper to create AIChatService."""
    return AIChatService(db)


@router.get(
    "/conversations",
    response_model=List[ChatConversationSummary],
)
async def list_conversations(
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    """List all chat conversations for the current user."""
    service = get_service(db)
    return service.list_conversations(user_id=UUID(current_user_id))


@router.post(
    "/conversations",
    response_model=ChatConversationSummary,
    status_code=status.HTTP_201_CREATED,
)
async def create_conversation(
    payload: ChatConversationCreate,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    """Create a new chat conversation."""
    service = get_service(db)
    return service.create_conversation(
        user_id=UUID(current_user_id),
        payload=payload,
    )


@router.get(
    "/conversations/{conversation_id}",
    response_model=ChatConversationDetail,
)
async def get_conversation(
    conversation_id: UUID,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    """Get a single conversation with all of its messages."""
    service = get_service(db)
    return service.get_conversation(
        user_id=UUID(current_user_id),
        conversation_id=conversation_id,
    )


@router.delete(
    "/conversations/{conversation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
async def delete_conversation(
    conversation_id: UUID,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    """Delete a conversation and all messages in it."""
    service = get_service(db)
    service.delete_conversation(
        user_id=UUID(current_user_id),
        conversation_id=conversation_id,
    )


@router.post(
    "/messages",
    response_model=ChatSendMessageResponse,
    status_code=status.HTTP_201_CREATED,
)
async def send_message(
    payload: ChatSendMessageRequest,
    current_user_id: str = Depends(get_current_user),
    db: Session = Depends(get_database),
):
    """
    Send a message to the AI assistant.

    - Nếu có `conversation_id` → gắn vào cuộc hội thoại đó
    - Nếu không có → tự tạo conversation mới
    """
    service = get_service(db)
    return service.send_message(
        user_id=UUID(current_user_id),
        payload=payload,
    )


