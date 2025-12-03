'use client'

import React, { useEffect, useState } from 'react'
import { getDailyQuote, addQuote } from '../services/quoteService'
import type { Quote } from '../types/quote.types'
import { useAuth } from '@/shared/hooks/useAuth'
import { RefreshCw, Plus, X } from 'lucide-react'

export function QuoteBanner() {
  const { user } = useAuth()
  const [quote, setQuote] = useState<Quote | null>(null)
  
  // State UI
  const [openForm, setOpenForm] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  // State Form
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Hàm lấy quote (có thể gọi lại để refresh)
  const refreshQuote = () => {
    // Vì hàm getDailyQuote hiện tại random mỗi lần gọi, ta chỉ cần gọi lại nó
    setQuote(getDailyQuote())
  }

  useEffect(() => {
    refreshQuote()
  }, [])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      addQuote({ text, author })
      refreshQuote() // Refresh để có cơ hội hiện câu vừa thêm
      setText('')
      setAuthor('')
      setOpenForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div 
      className="relative w-full max-w-3xl mx-auto flex flex-col items-center justify-center py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {quote ? (
        <div className="text-center transition-all duration-300">
          <p
            className="
              text-lg md:text-xl lg:text-2xl font-light italic leading-relaxed
              text-white/90 drop-shadow-md selection:bg-white/30
            "
            style={{ 
              fontFamily: "'Merriweather', 'Noto Serif', serif",
              textShadow: "0 2px 4px rgba(0,0,0,0.3)" 
            }}
          >
            "{quote.text}"
          </p>
          
          {/* Tác giả nhỏ gọn bên dưới */}
          <div className="mt-2 flex items-center justify-center gap-2 opacity-80">
             <span className="h-[1px] w-6 bg-white/50 inline-block"></span>
             <span className="text-xs md:text-sm font-medium tracking-widest text-white/80 uppercase">
               {quote.author || 'Khuyết danh'}
             </span>
             <span className="h-[1px] w-6 bg-white/50 inline-block"></span>
          </div>
        </div>
      ) : (
        <span className="text-sm text-white/50 animate-pulse">Loading inspiration...</span>
      )}

      {/* Các nút điều khiển - Chỉ hiện khi Hover */}
      <div 
        className={`
          mt-3 flex gap-3 transition-opacity duration-300
          ${isHovered || openForm ? 'opacity-100' : 'opacity-0'}
        `}
      >
        <button
          onClick={refreshQuote}
          className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          title="Đổi câu khác"
        >
          <RefreshCw size={14} />
        </button>

        {user && (
          <button
            onClick={() => setOpenForm(true)}
            className="p-1.5 rounded-full text-white/40 hover:text-white hover:bg-white/10 transition-colors"
            title="Thêm quote mới"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* Form thêm Quote - Modal nhỏ nổi lên */}
      {openForm && (
        <div className="absolute top-full mt-2 z-50 w-full max-w-md animate-in fade-in zoom-in duration-200">
          <form
            onSubmit={handleAdd}
            className="
              relative rounded-xl border border-white/10 
              bg-gray-900/90 backdrop-blur-xl p-5 shadow-2xl
            "
          >
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="absolute top-3 right-3 text-white/30 hover:text-white transition"
            >
              <X size={16} />
            </button>
            
            <h4 className="mb-4 text-xs font-bold tracking-widest text-white/60 uppercase text-center">
              Thêm nguồn cảm hứng
            </h4>
            
            <div className="space-y-3">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Nội dung câu nói..."
                className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition"
                rows={2}
                required
                autoFocus
              />
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Tác giả"
                className="w-full rounded-lg bg-black/40 border border-white/10 p-3 text-sm text-white placeholder-white/30 outline-none focus:border-white/30 transition"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded-lg bg-white/10 hover:bg-white/20 text-white font-medium py-2 text-xs transition-colors"
              >
                {submitting ? 'Đang lưu...' : 'Lưu Quote'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}