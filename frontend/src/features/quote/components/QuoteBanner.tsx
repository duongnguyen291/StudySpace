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
    <div className="relative flex w-full items-center justify-center bg-gradient-to-r from-indigo-600 via-blue-600 to-sky-600 px-4 py-2 text-sm text-white">
      {quote ? (
        <div className="max-w-3xl text-center">
          <span className="italic">&ldquo;{quote.text}&rdquo;</span>
          {quote.author && <span className="ml-2 opacity-80">— {quote.author}</span>}
        </div>
      ) : (
        <span>Loading quote...</span>
      )}

      {user && (
        <button
          type="button"
          onClick={() => setOpenForm((o) => !o)}
          className="absolute right-3 rounded bg-white/20 px-2 py-1 text-xs hover:bg-white/30"
        >
          {openForm ? 'Đóng' : 'Thêm'}
        </button>
      )}

      {openForm && (
        <form
          onSubmit={handleAdd}
          className="absolute top-full z-20 mt-2 w-full max-w-md rounded-md border border-white/30 bg-black/70 p-4 text-white backdrop-blur"
        >
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wide text-white/80">
            Thêm Quote
          </h4>
          <div className="mb-2">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Nội dung truyền cảm hứng..."
              className="w-full rounded bg-white/10 p-2 text-xs outline-none"
              rows={3}
              required
            />
          </div>
          <div className="mb-3">
            <input
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Tác giả (tuỳ chọn)"
              className="w-full rounded bg-white/10 p-2 text-xs outline-none"
            />
          </div>
          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={() => setOpenForm(false)}
              className="rounded bg-white/10 px-3 py-1 text-xs hover:bg-white/20"
            >
              Huỷ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded bg-blue-500 px-3 py-1 text-xs font-medium hover:bg-blue-600 disabled:opacity-50"
            >
              {submitting ? 'Đang lưu...' : 'Lưu'}
            </button>
          </div>
        </form>
      )}
    </div>
  )
}