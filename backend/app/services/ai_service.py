"""
AI Chat Service
Business logic for handling chat conversations and AI replies.
"""
from __future__ import annotations

from typing import List, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.repositories.chat_repo import ChatRepository
from app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationDetail,
    ChatConversationSummary,
    ChatMessageResponse,
    ChatSendMessageRequest,
    ChatSendMessageResponse,
)
from app.models.chat import ChatConversation


class AIChatService:
    """
    Service layer for AI chat.

    - Manages conversations and messages via ChatRepository
    - Calls AI model (currently a placeholder) to generate responses
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRepository(db)

    # Conversation operations
    def create_conversation(
        self,
        *,
        user_id: UUID,
        payload: ChatConversationCreate,
    ) -> ChatConversationSummary:
        conversation = self.repo.create_conversation(
            user_id=user_id,
            title=payload.title,
        )
        return ChatConversationSummary.model_validate(conversation)

    def list_conversations(self, *, user_id: UUID) -> List[ChatConversationSummary]:
        conversations = self.repo.list_conversations(user_id=user_id)
        return [ChatConversationSummary.model_validate(conv) for conv in conversations]

    def get_conversation(
        self,
        *,
        user_id: UUID,
        conversation_id: UUID,
    ) -> ChatConversationDetail:
        conversation = self._get_conversation_or_404(
            user_id=user_id,
            conversation_id=conversation_id,
        )
        return ChatConversationDetail(
            **ChatConversationSummary.model_validate(conversation).model_dump(),
            messages=[ChatMessageResponse.model_validate(msg) for msg in conversation.messages],
        )

    def delete_conversation(self, *, user_id: UUID, conversation_id: UUID) -> None:
        conversation = self._get_conversation_or_404(
            user_id=user_id,
            conversation_id=conversation_id,
        )
        self.repo.delete_conversation(conversation)

    # Messaging / AI operations
    def send_message(
        self,
        *,
        user_id: UUID,
        payload: ChatSendMessageRequest,
    ) -> ChatSendMessageResponse:
        conversation = self._resolve_conversation(
            user_id=user_id,
            conversation_id=payload.conversation_id,
        )

        # Save user message
        user_message = self.repo.add_message(
            conversation=conversation,
            role="user",
            content=payload.message,
        )

        # Generate AI reply (placeholder)
        ai_reply, tokens_used = self._generate_ai_reply(payload.message)

        # Save assistant message
        assistant_message = self.repo.add_message(
            conversation=conversation,
            role="assistant",
            content=ai_reply,
            tokens_used=tokens_used,
        )

        return ChatSendMessageResponse(
            conversation_id=conversation.id,
            user_message=ChatMessageResponse.model_validate(user_message),
            assistant_message=ChatMessageResponse.model_validate(assistant_message),
        )

    # Internal helpers
    def _resolve_conversation(
        self,
        *,
        user_id: UUID,
        conversation_id: UUID | None,
    ) -> ChatConversation:
        if conversation_id:
            return self._get_conversation_or_404(
                user_id=user_id,
                conversation_id=conversation_id,
            )
        return self.repo.create_conversation(user_id=user_id, title="New Conversation")

    def _get_conversation_or_404(
        self,
        *,
        user_id: UUID,
        conversation_id: UUID,
    ) -> ChatConversation:
        conversation = self.repo.get_conversation(
            conversation_id=conversation_id,
            user_id=user_id,
        )
        if not conversation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Conversation not found",
            )
        return conversation

    def _generate_ai_reply(self, message: str) -> Tuple[str, int]:
        """
        Placeholder AI response generator.

        TODO: Replace with real LLM integration (OpenAI, Gemini, etc.).
        """
        reply = (
            "AI Assistant: I received your message "
            f'"{message}". I will provide smarter answers once the AI integration is configured.'
        )
        tokens_used = max(len(reply) // 4, 1)
        return reply, tokens_used


