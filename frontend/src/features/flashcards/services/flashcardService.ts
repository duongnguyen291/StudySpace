/**
 * Flashcard Service
 * API client for flashcard management
 */
import type {
  FlashcardDeck,
  FlashcardDeckCreate,
  FlashcardDeckUpdate,
  FlashcardDeckListResponse,
  FlashcardDeckFilter,
  Flashcard,
  FlashcardCreate,
  FlashcardUpdate,
  FlashcardListResponse,
  ReviewSessionStart,
  ReviewSessionResponse,
  ReviewResult,
} from '../types/flashcard.types'

import { API_ENDPOINTS } from '@/shared/constants'
import { apiClient } from '@/shared/utils/api'

class FlashcardService {
  /**
   * Build query params from FlashcardDeckFilter
   */
  private buildParams(filters?: FlashcardDeckFilter) {
    if (!filters) return undefined

    const params: Record<string, any> = {}

    if (filters.category_id) params.category_id = filters.category_id
    if (filters.search) params.search = filters.search
    if (filters.is_public !== undefined) params.is_public = filters.is_public
    if (filters.page) params.page = filters.page
    if (filters.page_size) params.page_size = filters.page_size
    if (filters.sort_by) params.sort_by = filters.sort_by
    if (filters.sort_order) params.sort_order = filters.sort_order

    return params
  }

  // ============================================
  // DECK OPERATIONS
  // ============================================

  async getDecks(filters?: FlashcardDeckFilter): Promise<FlashcardDeckListResponse | null> {
    try {
      const params = this.buildParams(filters)
      const response = await apiClient.get<FlashcardDeckListResponse>(
        API_ENDPOINTS.FLASHCARDS.DECKS,
        { params }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching flashcard decks:', error)
      throw error
    }
  }

  async getDeck(id: string): Promise<FlashcardDeck | null> {
    try {
      const response = await apiClient.get<FlashcardDeck>(
        API_ENDPOINTS.FLASHCARDS.DECK_BY_ID(id)
      )
      return response.data
    } catch (error) {
      console.error('Error fetching flashcard deck:', error)
      throw error
    }
  }

  async createDeck(data: FlashcardDeckCreate): Promise<FlashcardDeck | null> {
    try {
      const response = await apiClient.post<FlashcardDeck>(
        API_ENDPOINTS.FLASHCARDS.DECKS,
        data
      )
      return response.data
    } catch (error) {
      console.error('Error creating flashcard deck:', error)
      throw error
    }
  }

  async updateDeck(id: string, data: FlashcardDeckUpdate): Promise<FlashcardDeck | null> {
    try {
      const response = await apiClient.put<FlashcardDeck>(
        API_ENDPOINTS.FLASHCARDS.DECK_BY_ID(id),
        data
      )
      return response.data
    } catch (error) {
      console.error('Error updating flashcard deck:', error)
      throw error
    }
  }

  async deleteDeck(id: string): Promise<boolean> {
    try {
      await apiClient.delete(API_ENDPOINTS.FLASHCARDS.DECK_BY_ID(id))
      return true
    } catch (error) {
      console.error('Error deleting flashcard deck:', error)
      throw error
    }
  }

  // ============================================
  // FLASHCARD OPERATIONS
  // ============================================

  async getFlashcards(deckId: string): Promise<FlashcardListResponse | null> {
    try {
      const response = await apiClient.get<FlashcardListResponse>(
        API_ENDPOINTS.FLASHCARDS.DECK_FLASHCARDS(deckId)
      )
      return response.data
    } catch (error) {
      console.error('Error fetching flashcards:', error)
      throw error
    }
  }

  async getFlashcard(id: string, deckId: string): Promise<Flashcard | null> {
    try {
      const response = await apiClient.get<Flashcard>(
        API_ENDPOINTS.FLASHCARDS.FLASHCARD_BY_ID(id),
        { params: { deck_id: deckId } }
      )
      return response.data
    } catch (error) {
      console.error('Error fetching flashcard:', error)
      throw error
    }
  }

  async createFlashcard(deckId: string, data: FlashcardCreate): Promise<Flashcard | null> {
    try {
      const response = await apiClient.post<Flashcard>(
        API_ENDPOINTS.FLASHCARDS.DECK_FLASHCARDS(deckId),
        data
      )
      return response.data
    } catch (error) {
      console.error('Error creating flashcard:', error)
      throw error
    }
  }

  async bulkCreateFlashcards(deckId: string, data: FlashcardCreate[]): Promise<Flashcard[] | null> {
    try {
      const response = await apiClient.post<Flashcard[]>(
        API_ENDPOINTS.FLASHCARDS.DECK_FLASHCARDS_BULK(deckId),
        data
      )
      return response.data
    } catch (error) {
      console.error('Error bulk creating flashcards:', error)
      throw error
    }
  }

  async updateFlashcard(
    id: string,
    deckId: string,
    data: FlashcardUpdate
  ): Promise<Flashcard | null> {
    try {
      const response = await apiClient.put<Flashcard>(
        API_ENDPOINTS.FLASHCARDS.FLASHCARD_BY_ID(id),
        data,
        { params: { deck_id: deckId } }
      )
      return response.data
    } catch (error) {
      console.error('Error updating flashcard:', error)
      throw error
    }
  }

  async deleteFlashcard(id: string, deckId: string): Promise<boolean> {
    try {
      await apiClient.delete(
        API_ENDPOINTS.FLASHCARDS.FLASHCARD_BY_ID(id),
        { params: { deck_id: deckId } }
      )
      return true
    } catch (error) {
      console.error('Error deleting flashcard:', error)
      throw error
    }
  }

  // ============================================
  // REVIEW SESSION OPERATIONS
  // ============================================

  async startReviewSession(data: ReviewSessionStart): Promise<ReviewSessionResponse | null> {
    try {
      const response = await apiClient.post<ReviewSessionResponse>(
        API_ENDPOINTS.FLASHCARDS.REVIEW_START,
        data
      )
      return response.data
    } catch (error) {
      console.error('Error starting review session:', error)
      throw error
    }
  }

  async submitReviewResults(results: ReviewResult[]): Promise<any> {
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.FLASHCARDS.REVIEW_SUBMIT,
        results
      )
      return response.data
    } catch (error) {
      console.error('Error submitting review results:', error)
      throw error
    }
  }
}

export const flashcardService = new FlashcardService()

