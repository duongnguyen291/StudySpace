/**
 * AI Chat Feature Types
 */

export type ChatRole = 'user' | 'assistant' | 'system'

export interface ChatMessage {
  id: string
  conversation_id: string
  role: ChatRole
  content: string
  tokens_used: number
  created_at: string
}

export interface ChatConversationSummary {
  id: string
  title: string
  created_at: string
  updated_at: string
  last_message_at: string | null
}

export interface ChatConversationDetail extends ChatConversationSummary {
  messages: ChatMessage[]
}

export interface ChatSendMessageRequest {
  message: string
  conversation_id?: string
  step_by_step_mode?: boolean
}

export interface ChatSendMessageResponse {
  conversation_id: string
  user_message: ChatMessage
  assistant_message: ChatMessage
}


