'use client'

import React from 'react'
import { ChatLayout } from '@/features/ai-chat'
import { useChat } from '@/features/ai-chat'

export default function AIChatPage() {
  const { conversations, currentConversation, isSending, error, stepByStepMode, sendMessage, selectConversation, deleteConversation, createNewConversation, toggleStepByStepMode } =
    useChat()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 md:ml-0">
      <div className="px-4 py-6">
        <ChatLayout
          conversations={conversations}
          currentConversationId={currentConversation?.id}
          messages={currentConversation?.messages ?? []}
          isSending={isSending}
          error={error}
          stepByStepMode={stepByStepMode}
          onSelectConversation={selectConversation}
          onDeleteConversation={deleteConversation}
          onSendMessage={sendMessage}
          onToggleStepByStepMode={toggleStepByStepMode}
          onCreateNewConversation={createNewConversation}
        />
      </div>
    </main>
  )
}


