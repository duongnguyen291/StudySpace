export interface Quote {
  id: string
  text: string
  author?: string
  createdByUser?: boolean
  createdAt?: string
}

export interface CreateQuoteInput {
  text: string
  author?: string
}