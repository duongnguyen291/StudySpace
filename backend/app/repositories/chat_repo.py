"""
Repository for chat conversations and messages.
"""
from datetime import datetime
from typing import List, Optional
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.chat import ChatConversation, ChatMessage


class ChatRepository:
    """Data access layer for chat conversations/messages."""

    def __init__(self, db: Session):
        self.db = db

    # Conversation operations
    def create_conversation(self, *, user_id: UUID, title: Optional[str]) -> ChatConversation:
        conversation = ChatConversation(
            user_id=user_id,
            title=title or "New Conversation",
            last_message_at=datetime.utcnow(),
        )
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def get_conversation(self, *, conversation_id: UUID, user_id: UUID) -> Optional[ChatConversation]:
        return (
            self.db.query(ChatConversation)
            .filter(ChatConversation.id == conversation_id, ChatConversation.user_id == user_id)
            .first()
        )

    def list_conversations(self, *, user_id: UUID, limit: int = 50) -> List[ChatConversation]:
        return (
            self.db.query(ChatConversation)
            .filter(ChatConversation.user_id == user_id)
            .order_by(ChatConversation.updated_at.desc())
            .limit(limit)
            .all()
        )

    def delete_conversation(self, conversation: ChatConversation) -> None:
        self.db.delete(conversation)
        self.db.commit()

    # Message operations
    def add_message(
        self,
        *,
        conversation: ChatConversation,
        role: str,
        content: str,
        tokens_used: int = 0,
    ) -> ChatMessage:
        message = ChatMessage(
            conversation_id=conversation.id,
            role=role,
            content=content,
            tokens_used=tokens_used,
            created_at=datetime.utcnow(),
        )
        conversation.last_message_at = message.created_at
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        self.db.refresh(conversation)
        return message


