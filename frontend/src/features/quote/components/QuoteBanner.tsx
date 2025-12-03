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

  const refreshQuote = () => {
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
      refreshQuote()
      setText('')
      setAuthor('')
      setOpenForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div 
      className="relative w-full max-w-2xl mx-auto flex flex-col items-center justify-center py-2"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {quote ? (
        <div className="text-center transition-all duration-500 ease-in-out">
          {/* NỘI DUNG QUOTE */}
          <p
            className="
              text-base md:text-lg          /* Giảm size: Mobile dùng base, PC dùng lg */
              font-light italic leading-relaxed
              text-white/95                 /* Màu trắng sáng hơn chút để tương phản */
              tracking-wide                 /* Giãn chữ nhẹ cho thoáng */
            "
            style={{ 
              fontFamily: "'Merriweather', 'Noto Serif', serif",
              // Hiệu ứng đổ bóng mềm (Glow effect) thay vì bóng đen cứng
              textShadow: "0 2px 10px rgba(0,0,0,0.6)" 
            }}
          >
            "{quote.text}"
          </p>
          
          {/* Tác giả - Nhỏ và mờ hơn */}
          <div className="mt-2 flex items-center justify-center gap-2 opacity-70 hover:opacity-100 transition-opacity">
             <span className="text-xs font-medium tracking-widest text-white shadow-sm uppercase">
               — {quote.author || 'Khuyết danh'}
             </span>
          </div>
        </div>
      ) : (
        <span className="text-xs text-white/50 animate-pulse">...</span>
      )}

      {/* NÚT ĐIỀU KHIỂN - GIỮ NGUYÊN LOGIC CŨ */}
      <div 
        className={`
          mt-2 flex gap-3 transition-all duration-300 transform
          ${isHovered || openForm ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
        `}
      >
        <button
          onClick={refreshQuote}
          className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
          title="Đổi câu khác"
        >
          <RefreshCw size={14} />
        </button>

        {user && (
          <button
            onClick={() => setOpenForm(true)}
            className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
            title="Thêm quote mới"
          >
            <Plus size={16} />
          </button>
        )}
      </div>

      {/* FORM MODAL */}
      {openForm && (
        <div className="absolute top-full mt-2 z-50 w-full max-w-md animate-in fade-in zoom-in duration-200">
          <form
            onSubmit={handleAdd}
            className="
              relative rounded-xl border border-white/10 
              bg-gray-900/80 backdrop-blur-xl p-4 shadow-2xl
            "
          >
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="absolute top-2 right-2 text-white/30 hover:text-white transition"
            >
              <X size={14} />
            </button>
            
            <h4 className="mb-3 text-[10px] font-bold tracking-widest text-white/50 uppercase text-center">
              Thêm Quote Mới
            </h4>
            
            <div className="space-y-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Nội dung..."
                className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition resize-none"
                rows={2}
                required
                autoFocus
              />
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Tác giả"
                className="w-full rounded bg-white/5 border border-white/10 p-2 text-sm text-white placeholder-white/20 outline-none focus:border-white/30 transition"
              />
              <button
                type="submit"
                disabled={submitting}
                className="w-full rounded bg-white/10 hover:bg-white/20 text-white font-medium py-1.5 text-xs transition-colors mt-1"
              >
                {submitting ? '...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  )
}