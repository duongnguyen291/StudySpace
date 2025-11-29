/**
 * useChat
 * Hook quản lý state hội thoại AI Chat
 */
import { useCallback, useEffect, useState } from 'react'
import { aiChatService } from '../services/aiChatService'
import type {
  ChatConversationDetail,
  ChatConversationSummary,
  ChatMessage
} from '../types/chat.types'

interface UseChatOptions {
  initialConversationId?: string
}

export function useChat(options: UseChatOptions = {}) {
  const { initialConversationId } = options

  const [conversations, setConversations] = useState<ChatConversationSummary[]>([])
  const [currentConversation, setCurrentConversation] = useState<ChatConversationDetail | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSending, setIsSending] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadConversations = useCallback(async () => {
    try {
      setError(null)
      const data = await aiChatService.listConversations()
      setConversations(data)
    } catch (err) {
      console.error(err)
      setError('Không tải được danh sách cuộc hội thoại')
    }
  }, [])

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await aiChatService.getConversation(conversationId)
      setCurrentConversation(data)
    } catch (err) {
      console.error(err)
      setError('Không tải được cuộc hội thoại')
    } finally {
      setIsLoading(false)
    }
  }, [])

  const ensureConversation = useCallback(
    async (): Promise<string> => {
      if (currentConversation) return currentConversation.id

      // Nếu chưa có conversation nào, tạo mới
      const created = await aiChatService.createConversation()
      setConversations((prev) => [created, ...prev])
      const detail: ChatConversationDetail = { ...created, messages: [] }
      setCurrentConversation(detail)
      return created.id
    },
    [currentConversation]
  )

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim()) return

      setIsSending(true)
      setError(null)

      try {
        const conversationId = currentConversation?.id ?? (await ensureConversation())

        // Optimistic UI: thêm message user tạm thời
        const optimisticUser: ChatMessage = {
          id: `temp-user-${Date.now()}`,
          conversation_id: conversationId,
          role: 'user',
          content,
          tokens_used: 0,
          created_at: new Date().toISOString()
        }

        setCurrentConversation((prev) =>
          prev
            ? { ...prev, messages: [...prev.messages, optimisticUser] }
            : { ...(prev as any), messages: [optimisticUser] }
        )

        const res = await aiChatService.sendMessage({
          message: content,
          conversation_id: currentConversation?.id
        })

        setCurrentConversation((prev) => {
          if (!prev || prev.id !== res.conversation_id) {
            // Nếu server tạo conversation mới
            const merged: ChatConversationDetail = {
              id: res.conversation_id,
              title: prev?.title ?? 'New Conversation',
              created_at: optimisticUser.created_at,
              updated_at: new Date().toISOString(),
              last_message_at: new Date().toISOString(),
              messages: [res.user_message, res.assistant_message]
            }
            return merged
          }

          return {
            ...prev,
            messages: [...prev.messages.filter((m) => !m.id.startsWith('temp-user-')), res.user_message, res.assistant_message],
            updated_at: new Date().toISOString(),
            last_message_at: res.assistant_message.created_at
          }
        })

        // Cập nhật danh sách conversations (đưa lên đầu)
        setConversations((prev) => {
          const without = prev.filter((c) => c.id !== res.conversation_id)
          const updated: ChatConversationSummary = {
            id: res.conversation_id,
            title: currentConversation?.title ?? 'New Conversation',
            created_at: optimisticUser.created_at,
            updated_at: new Date().toISOString(),
            last_message_at: res.assistant_message.created_at
          }
          return [updated, ...without]
        })
      } catch (err) {
        console.error(err)
        setError('Gửi tin nhắn thất bại')
      } finally {
        setIsSending(false)
      }
    },
    [currentConversation, ensureConversation]
  )

  const selectConversation = useCallback(
    async (conversationId: string) => {
      await loadConversation(conversationId)
    },
    [loadConversation]
  )

  const deleteConversation = useCallback(
    async (conversationId: string) => {
      try {
        await aiChatService.deleteConversation(conversationId)
        setConversations((prev) => prev.filter((c) => c.id !== conversationId))
        if (currentConversation?.id === conversationId) {
          setCurrentConversation(null)
        }
      } catch (err) {
        console.error(err)
        setError('Xóa cuộc hội thoại thất bại')
      }
    },
    [currentConversation]
  )

  useEffect(() => {
    loadConversations()
  }, [loadConversations])

  useEffect(() => {
    if (initialConversationId) {
      loadConversation(initialConversationId)
    }
  }, [initialConversationId, loadConversation])

  return {
    conversations,
    currentConversation,
    isLoading,
    isSending,
    error,
    sendMessage,
    selectConversation,
    deleteConversation,
    reloadConversations: loadConversations
  }
}


