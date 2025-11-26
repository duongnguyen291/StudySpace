'use client'

import React from 'react'
import { ChatLayout } from '@/features/ai-chat'
import { useChat } from '@/features/ai-chat'

export default function AIChatPage() {
  const { conversations, currentConversation, isSending, error, sendMessage, selectConversation, deleteConversation } =
    useChat()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-6">
      <div className="max-w-6xl mx-auto space-y-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-50">AI Learning Assistant</h1>
          <p className="text-sm text-slate-400 mt-1">
            Hỏi bài, giải thích khái niệm, tạo quiz/flashcards… Tất cả trong một không gian học tập.
          </p>
        </div>

        <ChatLayout
          conversations={conversations}
          currentConversationId={currentConversation?.id}
          messages={currentConversation?.messages ?? []}
          isSending={isSending}
          error={error}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onSendMessage={sendMessage}
        />
      </div>
    </main>
  )
}


