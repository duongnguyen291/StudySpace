import quotesData from '../data/quotes.json'
import type { Quote, CreateQuoteInput } from '../types/quote.types'

const LOCAL_KEY = 'user_quotes_v1'

function loadUserQuotes(): Quote[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(LOCAL_KEY)
    if (!raw) return []
    return JSON.parse(raw)
  } catch {
    return []
  }
}

function saveUserQuotes(quotes: Quote[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(LOCAL_KEY, JSON.stringify(quotes))
}

// Quote of the Day: ổn định theo ngày dựa trên hash YYYY-MM-DD
export function getDailyQuote(date: Date = new Date()): Quote {
  const userQuotes = loadUserQuotes()
  const all = [...quotesData, ...userQuotes]
  const key = date.toISOString().slice(0, 10)
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  const index = hash % all.length
  return all[index]
}

// Thêm quote (lưu tạm localStorage, có thể thay bằng API sau)
export function addQuote(input: CreateQuoteInput): Quote {
  const quote: Quote = {
    id: 'u_' + Date.now().toString(36),
    text: input.text.trim(),
    author: input.author?.trim() || 'Anonymous',
    createdByUser: true,
    createdAt: new Date().toISOString(),
  }
  const current = loadUserQuotes()
  current.push(quote)
  saveUserQuotes(current)
  return quote
}

// Liệt kê tất cả quote (mặc định + người dùng)
export function listQuotes(): Quote[] {
  return [...quotesData, ...loadUserQuotes()]
}