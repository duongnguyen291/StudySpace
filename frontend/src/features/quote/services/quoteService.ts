import quotesData from '../data/quotes.json'
import type { Quote } from '../types/quote.types'

const STORAGE_KEY = 'user_quotes_v1'

export function getDailyQuote(): Quote {
  const userQuotes = getUserQuotes()
  const allQuotes = [...quotesData, ...userQuotes]
  
  if (allQuotes.length === 0) {
    return { id: 'default', text: 'Hãy bắt đầu hành trình học tập của bạn!', author: 'StudySpace' }
  }

  // Random quote mỗi lần gọi hàm (mỗi reload)
  const randomIndex = Math.floor(Math.random() * allQuotes.length)
  return allQuotes[randomIndex]
}

export function addQuote(quote: Omit<Quote, 'id'>): void {
  const userQuotes = getUserQuotes()
  const newQuote: Quote = {
    id: `user_${Date.now()}`,
    text: quote.text,
    author: quote.author || 'Anonymous'
  }
  userQuotes.push(newQuote)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(userQuotes))
}

function getUserQuotes(): Quote[] {
  if (typeof window === 'undefined') return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch {
    return []
  }
}