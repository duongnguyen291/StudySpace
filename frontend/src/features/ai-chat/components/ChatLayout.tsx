import React from 'react'
import type { ChatConversationSummary, ChatMessage } from '../types/chat.types'

interface ChatLayoutProps {
  conversations: ChatConversationSummary[]
  currentConversationId?: string
  messages: ChatMessage[]
  isSending: boolean
  error?: string | null
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onSendMessage: (content: string) => void
  onCreateNewConversation?: () => void
}

export const ChatLayout: React.FC<ChatLayoutProps> = ({
  conversations,
  currentConversationId,
  messages,
  isSending,
  error,
  onSelectConversation,
  onDeleteConversation,
  onSendMessage,
  onCreateNewConversation
}) => {
  const [input, setInput] = React.useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return
    onSendMessage(input)
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-120px)] bg-slate-900 text-slate-100 rounded-xl border border-slate-800 overflow-hidden">
      {/* Sidebar conversations */}
      <aside className="w-64 border-r border-slate-800 bg-slate-950/60 flex flex-col">
        <div className="px-4 py-3 border-b border-slate-800 font-semibold text-sm uppercase tracking-wide text-slate-400">
          Cuộc hội thoại
        </div>
        <div className="px-3 py-2 border-b border-slate-800">
          <button
            onClick={() => {
              // Gọi callback để tạo conversation mới
              if (onCreateNewConversation) {
                onCreateNewConversation()
              }
            }}
            className="w-full px-3 py-2 text-sm font-medium text-slate-200 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            <span>+</span>
            <span>Cuộc hội thoại mới</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Chưa có cuộc hội thoại nào.</p>
          ) : (
            <ul className="py-2">
              {conversations.map((conv) => (
                <li
                  key={conv.id}
                  className={`px-3 py-2 text-sm cursor-pointer flex items-center justify-between group ${
                    currentConversationId === conv.id ? 'bg-slate-800/80' : 'hover:bg-slate-800/40'
                  }`}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <span className="truncate text-slate-200">{conv.title || 'Cuộc hội thoại'}</span>
                  <button
                    className="ml-2 text-xs text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                      e.stopPropagation()
                      onDeleteConversation(conv.id)
                    }}
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>

      {/* Main chat */}
      <section className="flex-1 flex flex-col">
        <header className="px-4 py-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div>
            <h2 className="font-semibold text-slate-100 text-sm">AI Learning Assistant</h2>
            <p className="text-xs text-slate-500">Hỏi bài, giải thích, gợi ý học tập...</p>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950">
          {error && (
            <div className="text-xs text-red-400 bg-red-950/40 border border-red-900 rounded-md px-3 py-2 inline-block">
              {error}
            </div>
          )}

          {messages.length === 0 && !error && (
            <div className="text-center text-sm text-slate-500 mt-10">
              Bắt đầu bằng cách đặt câu hỏi cho AI về bài học, khái niệm, hoặc quiz của bạn.
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-br-sm'
                    : 'bg-slate-800/90 text-slate-50 rounded-bl-sm border border-slate-700/80'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.content}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Composer */}
        <form
          onSubmit={handleSubmit}
          className="border-t border-slate-800 bg-slate-950/80 px-4 py-3 flex items-end gap-2"
        >
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={1}
            placeholder="Nhập câu hỏi hoặc nội dung bạn muốn AI hỗ trợ..."
            className="flex-1 resize-none rounded-lg border border-slate-700 bg-slate-900/80 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-3 py-2 text-xs font-medium text-white shadow-sm hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {isSending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </form>
      </section>
    </div>
  )
}


