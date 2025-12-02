'use client'

import React, { useEffect, useState } from 'react'
import { getDailyQuote, addQuote } from '../services/quoteService'
import type { Quote } from '../types/quote.types'
import { useAuth } from '@/shared/hooks/useAuth'

export function QuoteBanner() {
  const { user } = useAuth()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [openForm, setOpenForm] = useState(false)
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setQuote(getDailyQuote())
  }, [])

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return
    setSubmitting(true)
    try {
      addQuote({ text, author })
      setQuote(getDailyQuote())
      setText('')
      setAuthor('')
      setOpenForm(false)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative w-full max-w-2xl">
      <div
        className="
          relative rounded-2xl
          bg-white/10 backdrop-blur-md border border-white/20 shadow-lg
          px-6 py-3 text-center
        "
      >
        {quote ? (
          <div>
            <p
              className="
                mb-1 text-sm md:text-base leading-snug tracking-wide
                text-white drop-shadow
              "
              style={{ fontFamily: "'Noto Serif', serif" }}
            >
              "{quote.text}"
            </p>
            {quote.author && (
              <p className="text-xs text-white/70">— {quote.author}</p>
            )}
          </div>
        ) : (
          <span className="text-xs text-white/70">Đang tải...</span>
        )}

        {user && (
          <button
            type="button"
            onClick={() => setOpenForm(o => !o)}
            className="absolute right-2 top-2 rounded-md bg-white/15 px-2 py-1 text-xs text-white hover:bg-white/25 transition"
          >
            {openForm ? '✕' : '+'}
          </button>
        )}

        {openForm && (
          <form
            onSubmit={handleAdd}
            className="
              absolute left-1/2 top-full z-50 mt-2 w-[340px] -translate-x-1/2
              rounded-xl border border-white/25 bg-black/80 p-4 backdrop-blur
            "
          >
            <h4 className="mb-2 text-xs font-semibold tracking-wider text-white/80 uppercase">
              Thêm Quote
            </h4>
            <div className="mb-2">
              <textarea
                value={text}
                onChange={e => setText(e.target.value)}
                placeholder="Nội dung truyền cảm hứng..."
                className="w-full rounded-md bg-white/10 p-2 text-xs text-white outline-none focus:ring focus:ring-blue-400/40"
                rows={3}
                required
              />
            </div>
            <div className="mb-3">
              <input
                value={author}
                onChange={e => setAuthor(e.target.value)}
                placeholder="Tác giả (tuỳ chọn)"
                className="w-full rounded-md bg-white/10 p-2 text-xs text-white outline-none focus:ring focus:ring-blue-400/40"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpenForm(false)}
                className="rounded bg-white/10 px-3 py-1 text-xs text-white hover:bg-white/20"
              >
                Huỷ
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="rounded bg-blue-500 px-4 py-1 text-xs font-medium text-white hover:bg-blue-600 disabled:opacity-50"
              >
                {submitting ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}