"""
AI Chat Service
Business logic for handling chat conversations and AI replies.
"""
from __future__ import annotations

from typing import List, Tuple
from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import extract, func
from datetime import date, timedelta

from app.repositories.chat_repo import ChatRepository
from app.repositories.study_session_repo import StudySessionRepository
from app.schemas.chat import (
    ChatConversationCreate,
    ChatConversationDetail,
    ChatConversationSummary,
    ChatMessageResponse,
    ChatSendMessageRequest,
    ChatSendMessageResponse,
)
from app.models.chat import ChatConversation
from app.models.study_session import StudySession


class AIChatService:
    """
    Service layer for AI chat.

    - Manages conversations and messages via ChatRepository
    - Calls AI model (currently a placeholder) to generate responses
    """

    def __init__(self, db: Session):
        self.db = db
        self.repo = ChatRepository(db)
        self.study_session_repo = StudySessionRepository(db)

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

        # If conversation has default title, update it using first user message
        if not conversation.title or conversation.title.lower().startswith("new conversation"):
            cleaned_title = payload.message.strip().splitlines()[0][:60]
            if cleaned_title:
                self.repo.update_conversation(conversation, title=cleaned_title)

        # Check predefined responses first
        predefined_reply = self._get_predefined_reply(payload.message)
        if predefined_reply:
            ai_reply = predefined_reply
            tokens_used = len(ai_reply) // 4
        else:
            # Load conversation history để AI có context
            conversation_history = self.repo.get_messages(conversation.id)

            # Load study data context nếu message liên quan đến phân tích học tập
            study_context = self._get_study_context(user_id, payload.message)

            # Generate AI reply với conversation history, study context và step-by-step mode
            ai_reply, tokens_used = self._generate_ai_reply(
                message=payload.message,
                conversation_history=conversation_history,
                study_context=study_context,
                step_by_step_mode=payload.step_by_step_mode
            )

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

    def _get_study_context(self, user_id: UUID, message: str) -> dict | None:
        """
        Lấy dữ liệu học tập của user nếu message liên quan đến phân tích học tập.
        """
        # Kiểm tra nếu message có từ khóa liên quan đến phân tích học tập
        analysis_keywords = [
            'phân tích', 'thói quen', 'học tập', 'dữ liệu', 'nhận xét',
            'lời khuyên', 'giờ học', 'tuần', 'cải thiện', 'mục tiêu',
            'đánh giá', 'thống kê', 'xu hướng', 'hiệu quả'
        ]
        
        message_lower = message.lower()
        is_analysis_request = any(keyword in message_lower for keyword in analysis_keywords)
        
        if not is_analysis_request:
            return None
        
        try:
            today = date.today()
            week_ago = today - timedelta(days=7)
            month_ago = today - timedelta(days=30)
            
            # Lấy thống kê 7 ngày qua
            week_sessions = self.study_session_repo.get_by_date_range(
                user_id=user_id,
                start_date=week_ago,
                end_date=today
            )
            
            # Lấy thống kê 30 ngày qua
            month_sessions = self.study_session_repo.get_by_date_range(
                user_id=user_id,
                start_date=month_ago,
                end_date=today
            )
            
            # Tính tổng thời gian
            week_minutes = sum(s.duration_minutes or 0 for s in week_sessions if s.completed)
            month_minutes = sum(s.duration_minutes or 0 for s in month_sessions if s.completed)
            
            # Thống kê theo loại session
            week_stats = {}
            for session in week_sessions:
                if session.completed and session.duration_minutes:
                    session_type = session.session_type or 'unknown'
                    week_stats[session_type] = week_stats.get(session_type, 0) + session.duration_minutes
            
            # Thống kê theo giờ trong ngày (7 ngày qua)
            hour_stats = (
                self.db.query(
                    extract('hour', StudySession.start_time).label('hour'),
                    func.sum(StudySession.duration_minutes).label('total_minutes')
                )
                .filter(
                    StudySession.user_id == user_id,
                    StudySession.completed == True,
                    StudySession.start_time >= week_ago,
                    StudySession.start_time <= today
                )
                .group_by(extract('hour', StudySession.start_time))
                .order_by(extract('hour', StudySession.start_time))
                .all()
            )
            
            # Tìm giờ học tốt nhất
            best_hour = None
            max_minutes = 0
            for stat in hour_stats:
                if stat.total_minutes and stat.total_minutes > max_minutes:
                    max_minutes = stat.total_minutes
                    best_hour = int(stat.hour)
            
            # Thống kê theo ngày trong tuần
            daily_stats = self.study_session_repo.get_daily_stats(
                user_id=user_id,
                start_date=week_ago,
                end_date=today
            )
            
            return {
                'week_minutes': week_minutes,
                'month_minutes': month_minutes,
                'week_sessions_count': len([s for s in week_sessions if s.completed]),
                'session_type_stats': week_stats,
                'best_hour': best_hour,
                'daily_stats': [
                    {
                        'date': str(stat['date']),
                        'minutes': stat['total_minutes'],
                        'sessions': stat['session_count']
                    }
                    for stat in daily_stats
                ]
            }
        except Exception as e:
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Error getting study context: {str(e)}")
            return None

    def _generate_ai_reply(
        self, 
        message: str, 
        conversation_history: list = None,
        study_context: dict | None = None,
        step_by_step_mode: bool = False
    ) -> Tuple[str, int]:
        """
        Generate AI reply using Google Gemini API.
        Falls back to stub response if API key is not configured.
        """
        from app.core.config import settings
        
        # Nếu chưa có API key, trả về stub response
        if not settings.GEMINI_API_KEY:
            reply = (
                "AI Assistant: I received your message "
                f'"{message}". I will provide smarter answers once the AI integration is configured. '
                "Please set GEMINI_API_KEY in your .env file."
            )
            tokens_used = max(len(reply) // 4, 1)
            return reply, tokens_used
        
        try:
            import google.generativeai as genai
            
            # Cấu hình Gemini API
            genai.configure(api_key=settings.GEMINI_API_KEY)
            
            system_instruction = (
                "Bạn là một AI Learning Assistant thông minh, giúp học sinh và sinh viên học tập hiệu quả. "
                "Bạn có thể giải thích khái niệm, trả lời câu hỏi, gợi ý phương pháp học tập, "
                "và hỗ trợ tạo quiz/flashcards. Hãy trả lời bằng tiếng Việt, ngắn gọn và dễ hiểu. "
                "Không dùng các ký hiệu như **,-,#,..."
            )
            
            # Thêm study context vào system instruction nếu có
            if study_context:
                context_text = "\n\nDỮ LIỆU HỌC TẬP CỦA NGƯỜI DÙNG:\n"
                context_text += f"- Tuần qua: {study_context['week_minutes']} phút ({study_context['week_sessions_count']} phiên học)\n"
                context_text += f"- Tháng qua: {study_context['month_minutes']} phút\n"
                
                if study_context.get('session_type_stats'):
                    context_text += "- Phân bố theo loại:\n"
                    for session_type, minutes in study_context['session_type_stats'].items():
                        type_name = {
                            'pomodoro': 'Pomodoro',
                            'free_study': 'Tự học',
                            'quiz': 'Quiz'
                        }.get(session_type, session_type)
                        context_text += f"  + {type_name}: {minutes} phút\n"
                
                if study_context.get('best_hour') is not None:
                    context_text += f"- Giờ học hiệu quả nhất: {study_context['best_hour']}:00\n"
                
                if study_context.get('daily_stats'):
                    context_text += "- Thống kê theo ngày (7 ngày qua):\n"
                    for day_stat in study_context['daily_stats'][-7:]:
                        context_text += f"  + {day_stat['date']}: {day_stat['minutes']} phút ({day_stat['sessions']} phiên)\n"
                
                context_text += (
                    "\nHãy sử dụng dữ liệu này để đưa ra phân tích, nhận xét và lời khuyên cụ thể, "
                    "cá nhân hóa cho người dùng. So sánh với các tuần/tháng trước nếu có thể, "
                    "và đưa ra gợi ý cải thiện dựa trên xu hướng học tập."
                )
                
                system_instruction += context_text
            
            # Nếu step-by-step mode được bật, thêm hướng dẫn đặc biệt
            if step_by_step_mode:
                system_instruction += (
                    "\n\nQUAN TRỌNG: Khi trả lời, bạn PHẢI trình bày theo từng bước rõ ràng. "
                    "Mỗi bước một dòng, bắt đầu bằng dấu gạch đầu dòng '-' hoặc số thứ tự (1., 2., 3., ...). "
                    "Ví dụ:\n- Bước 1: Mô tả bước đầu tiên\n- Bước 2: Mô tả bước thứ hai\n- Bước 3: Mô tả bước tiếp theo"
                )
            
            # Chọn model Gemini 1.5 Pro (hoặc thay bằng gemini-2.0-flash-exp nếu bạn có quyền truy cập)
            model = genai.GenerativeModel('gemini-2.0-flash-exp')
            
            # Chuẩn bị conversation history
            chat_history = []
            
            # Thêm conversation history (nếu có)
            if conversation_history:
                for msg in conversation_history[-10:]:  # Chỉ lấy 10 messages gần nhất
                    if msg.role == "user":
                        chat_history.append({"role": "user", "parts": [msg.content]})
                    elif msg.role == "assistant":
                        chat_history.append({"role": "model", "parts": [msg.content]})
            
            # Tạo chat session với history
            chat = model.start_chat(history=chat_history)
            
            # Gửi message (kèm system instruction)
            prompt = f"{system_instruction}\n\nNgười dùng: {message}"
            response = chat.send_message(
                prompt,
                generation_config=genai.types.GenerationConfig(
                    temperature=0.7,
                    max_output_tokens=1000,
                )
            )
            
            # Xử lý response để ghép tất cả phần text
            reply_parts = []
            if getattr(response, "text", None):
                reply_parts.append(response.text)
            elif getattr(response, "candidates", None):
                for candidate in response.candidates:
                    content = getattr(candidate, "content", None)
                    if not content:
                        continue
                    for part in getattr(content, "parts", []):
                        part_text = getattr(part, "text", None)
                        if part_text:
                            reply_parts.append(part_text)
            reply = "\n".join(reply_parts).strip() or "Xin lỗi, tôi chưa có câu trả lời phù hợp."
            
            # Gemini không trả về token count trực tiếp, ước tính
            tokens_used = max(len(reply) // 4, 1)
            
            return reply, tokens_used
            
        except Exception as e:
            # Nếu có lỗi, trả về stub response với thông báo lỗi
            import logging
            logger = logging.getLogger(__name__)
            logger.error(f"Gemini API error: {str(e)}")
            
            reply = (
                f"Xin lỗi, tôi gặp lỗi khi xử lý câu hỏi của bạn. "
                f"Lỗi: {str(e)}. Vui lòng thử lại sau."
            )
            tokens_used = max(len(reply) // 4, 1)
            return reply, tokens_used

    def _get_predefined_reply(self, message: str) -> str | None:
        """Return predefined reply for specific prompts."""
        normalized = message.strip().lower()
        if normalized in {"bạn là ai", "ban la ai", "who are you"}:
            return "Tôi là StudySpace Artificial Intelligence Learning Assistant, giúp bạn học tập hiệu quả hơn."
        return None


