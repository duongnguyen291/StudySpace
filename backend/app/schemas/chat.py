"""
Chat schemas for request/response payloads.
"""
from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import BaseModel, Field


class ChatMessageBase(BaseModel):
    role: str = Field(..., description="Message role: user, assistant, or system")
    content: str = Field(..., min_length=1, max_length=4000)


class ChatMessageCreate(ChatMessageBase):
    tokens_used: int = 0


class ChatMessageResponse(ChatMessageBase):
    id: UUID
    conversation_id: UUID
    tokens_used: int
    created_at: datetime

    model_config = {"from_attributes": True}


class ChatConversationBase(BaseModel):
    title: Optional[str] = Field(default="New Conversation", max_length=255)


class ChatConversationCreate(ChatConversationBase):
    pass


class ChatConversationSummary(ChatConversationBase):
    id: UUID
    created_at: datetime
    updated_at: datetime
    last_message_at: Optional[datetime]

    model_config = {"from_attributes": True}


class ChatConversationDetail(ChatConversationSummary):
    messages: List[ChatMessageResponse] = []


class ChatSendMessageRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=2000)
    conversation_id: Optional[UUID] = Field(
        default=None,
        description="Existing conversation to append to. Creates a new conversation when omitted.",
    )


class ChatSendMessageResponse(BaseModel):
    conversation_id: UUID
    user_message: ChatMessageResponse
    assistant_message: ChatMessageResponse


