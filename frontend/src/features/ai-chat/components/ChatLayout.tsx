import React from 'react'
import type { ChatConversationSummary, ChatMessage } from '../types/chat.types'

interface ChatLayoutProps {
  conversations: ChatConversationSummary[]
  currentConversationId?: string
  messages: ChatMessage[]
  isSending: boolean
  error?: string | null
  stepByStepMode?: boolean
  onSelectConversation: (id: string) => void
  onDeleteConversation: (id: string) => void
  onSendMessage: (content: string) => void
  onToggleStepByStepMode?: (enabled: boolean) => void
  onCreateNewConversation?: () => void
}

export function ChatLayout({
  conversations,
  currentConversationId,
  messages,
  isSending,
  error,
  stepByStepMode = false,
  onSelectConversation,
  onDeleteConversation,
  onSendMessage,
  onToggleStepByStepMode,
  onCreateNewConversation
}: ChatLayoutProps) {
  const [input, setInput] = React.useState('')

  const handleKeyDown = (e: any) => {
    if (e?.key === 'Enter' && !e.shiftKey) {
      e.preventDefault?.()
      if (!input.trim()) return
      onSendMessage(input)
      setInput('')
    }
  }

  // Parse step-by-step content
  const parseSteps = (content: string): string[] => {
    // Match lines starting with -, •, *, or numbered (1., 2., etc.)
    const stepPattern = /^[-•*]\s+(.+)$|^\d+\.\s+(.+)$/gm
    const matches = content.matchAll(stepPattern)
    const steps: string[] = []
    
    for (const match of matches) {
      const step = match[1] || match[2]
      if (step) steps.push(step.trim())
    }
    
    // If no steps found but content has multiple lines, split by newlines
    if (steps.length === 0 && content.includes('\n')) {
      return content.split('\n').filter(line => line.trim().length > 0)
    }
    
    return steps.length > 0 ? steps : [content]
  }

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  const handleSubmit = (e: any) => {
    e.preventDefault()
    if (!input.trim()) return
    onSendMessage(input)
    setInput('')
  }

  return (
    <div className="flex h-[calc(100vh-120px)] rounded-2xl border border-slate-800/80 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 shadow-2xl overflow-hidden">
      {/* Sidebar conversations */}
      <aside className="w-72 border-r border-slate-800/70 bg-slate-950/70 backdrop-blur-sm flex flex-col">
        <div className="px-4 py-4 border-b border-slate-800/70 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-slate-500 font-semibold">💬 Cuộc hội thoại</p>
            <p className="text-sm text-slate-300">Quản lý và tiếp tục chat</p>
          </div>
          <div className="h-8 w-px bg-slate-800/70" />
        </div>
        <div className="px-4 py-3 border-b border-slate-800/70">
          <button
            onClick={() => {
              if (onCreateNewConversation) onCreateNewConversation()
            }}
            className="w-full px-3 py-2 text-sm font-semibold text-slate-100 bg-blue-600 hover:bg-blue-500 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <span>📝</span>
            <span>Cuộc hội thoại mới</span>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <p className="p-4 text-sm text-slate-500">Chưa có cuộc hội thoại nào.</p>
          ) : (
            <ul className="py-2">
              {conversations.map((conv: ChatConversationSummary) => (
                <li
                  key={conv.id}
                  className={`px-4 py-3 text-sm cursor-pointer flex items-center justify-between group transition-colors ${
                    currentConversationId === conv.id
                      ? 'bg-slate-800/80 border-l-2 border-blue-500'
                      : 'hover:bg-slate-800/50'
                  }`}
                  onClick={() => onSelectConversation(conv.id)}
                >
                  <div className="min-w-0">
                    <span className="block truncate text-slate-100 font-medium">{conv.title || 'Cuộc hội thoại'}</span>
                  </div>
                  <button
                    className="ml-2 text-xs text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e: any) => {
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
      <section className="flex-1 flex flex-col bg-slate-950/60 backdrop-blur">
        <header className="px-6 py-4 border-b border-slate-800/70 flex items-center justify-between bg-slate-950/70">
          <div className="space-y-1">
            <h2 className="font-semibold text-lg text-slate-50 flex items-center gap-2">
              <span>🤖</span>
              <span>AI Learning Assistant</span>
            </h2>
            <p className="text-sm text-slate-400">Hỏi bài, giải thích, gợi ý học tập...</p>
          </div>
          {currentConversationId && onToggleStepByStepMode && (
            <button
              onClick={() => onToggleStepByStepMode(!stepByStepMode)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors flex items-center gap-2 border ${
                stepByStepMode
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/70 text-slate-200 border-slate-700 hover:bg-slate-700'
              }`}
              title="Bật/tắt chế độ giải thích từng bước"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              <span>Step-by-step</span>
            </button>
          )}
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950">
          {error && (
            <div className="text-xs text-red-300 bg-red-950/50 border border-red-900 rounded-md px-3 py-2 inline-block">
              {error}
            </div>
          )}

          {messages.length === 0 && !error && (
            <div className="text-center text-sm text-slate-400 mt-14 flex flex-col items-center gap-3">
              <div className="text-3xl">✨</div>
              <div className="max-w-xl leading-relaxed">
                Bắt đầu bằng cách đặt câu hỏi cho AI về bài học, khái niệm, hoặc quiz của bạn. Hãy thử: <br />
                <span className="text-slate-300">“Giải thích định luật Ohm từng bước”</span>
              </div>
            </div>
          )}

          {messages.map((msg: ChatMessage) => {
            const isAssistant = msg.role === 'assistant'
            const shouldRenderSteps = isAssistant && stepByStepMode
            const steps = shouldRenderSteps ? parseSteps(msg.content) : null

            return (
              <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-3 text-base shadow-lg ${
                    msg.role === 'user'
                      ? 'bg-blue-600 text-white rounded-br-md shadow-blue-600/20'
                      : 'bg-slate-900/80 text-slate-50 rounded-bl-md border border-slate-800/80 shadow-black/30'
                  }`}
                >
                  {shouldRenderSteps && steps && steps.length > 1 ? (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-1">🧭 Giải thích từng bước</span>
                        <button
                          onClick={() => copyToClipboard(msg.content)}
                          className="text-xs text-slate-300 hover:text-slate-100 transition-colors flex items-center gap-1"
                          title="Copy toàn bộ"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-3.5 w-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          Copy tất cả
                        </button>
                      </div>
                      <ol className="space-y-2 list-none">
                        {steps.map((step, index) => (
                          <li
                            key={index}
                            className="flex items-start gap-3 group/step bg-slate-950/60 rounded-xl px-3 py-2 border border-slate-800/70"
                          >
                            <span className="flex-shrink-0 w-7 h-7 rounded-full bg-blue-600/20 text-blue-300 text-xs font-semibold flex items-center justify-center mt-0.5">
                              {index + 1}
                            </span>
                            <span className="flex-1 text-slate-100">{step}</span>
                            <button
                              onClick={() => copyToClipboard(step)}
                              className="flex-shrink-0 opacity-0 group-hover/step:opacity-100 transition-opacity text-slate-400 hover:text-slate-100"
                              title="Copy bước này"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-3.5 w-3.5"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-relaxed">{msg.content}</div>
                  )}
                </div>
              </div>
            )
          })}
        </div>

        {/* Composer */}
        <form
          onSubmit={(e: any) => handleSubmit(e)}
          className="border-t border-slate-800/70 bg-slate-950/80 px-6 py-4 flex items-end gap-3 shadow-inner shadow-black/30"
        >
          <textarea
            value={input}
            onChange={(e: any) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Nhập câu hỏi hoặc nội dung bạn muốn AI hỗ trợ..."
            className="flex-1 min-h-[56px] resize-none rounded-xl border border-slate-800 bg-slate-900/80 px-4 py-3 text-base leading-relaxed text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-transparent"
          />
          <button
            type="submit"
            disabled={isSending || !input.trim()}
            className="inline-flex items-center justify-center rounded-xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-600/30 hover:bg-blue-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
          >
            {isSending ? 'Đang gửi...' : 'Gửi'}
          </button>
        </form>
      </section>
    </div>
  )
}


