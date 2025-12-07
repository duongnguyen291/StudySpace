/**
 * AI Chat Service
 * API calls for AI Chat feature
 */
import { apiClient } from '@/shared/utils/api'
import type {
  ChatConversationSummary,
  ChatConversationDetail,
  ChatSendMessageRequest,
  ChatSendMessageResponse
} from '../types/chat.types'

const BASE_URL = '/chat'

export const aiChatService = {
  async listConversations(): Promise<ChatConversationSummary[]> {
    const response = await apiClient.get(`${BASE_URL}/conversations`)
    return response.data
  },

  async getConversation(conversationId: string): Promise<ChatConversationDetail> {
    const response = await apiClient.get(`${BASE_URL}/conversations/${conversationId}`)
    return response.data
  },

  async createConversation(title?: string): Promise<ChatConversationSummary> {
    const response = await apiClient.post(`${BASE_URL}/conversations`, { title })
    return response.data
  },

  async deleteConversation(conversationId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/conversations/${conversationId}`)
  },

  async sendMessage(payload: ChatSendMessageRequest): Promise<ChatSendMessageResponse> {
    const response = await apiClient.post(`${BASE_URL}/messages`, payload)
    return response.data
  }
}


