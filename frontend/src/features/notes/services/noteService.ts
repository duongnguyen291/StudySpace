/**
 * Notes Service
 * API calls for Notes feature
 */
import { apiClient } from '@/shared/utils/api'
import type { 
  Note, NoteCreate, NoteUpdate,
  NoteCategory, NoteCategoryCreate, NoteCategoryUpdate 
} from '../types/note.types'

const BASE_URL = '/notes'

// ============================================
// NOTE CATEGORY SERVICE
// ============================================

export const noteCategoryService = {
  async getAll(): Promise<NoteCategory[]> {
    const response = await apiClient.get(`${BASE_URL}/categories`)
    return response.data
  },

  async getById(categoryId: string): Promise<NoteCategory> {
    const response = await apiClient.get(`${BASE_URL}/categories/${categoryId}`)
    return response.data
  },

  async create(data: NoteCategoryCreate): Promise<NoteCategory> {
    const response = await apiClient.post(`${BASE_URL}/categories`, data)
    return response.data
  },

  async update(categoryId: string, data: NoteCategoryUpdate): Promise<NoteCategory> {
    const response = await apiClient.put(`${BASE_URL}/categories/${categoryId}`, data)
    return response.data
  },

  async delete(categoryId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/categories/${categoryId}`)
  },
}

// ============================================
// NOTE SERVICE
// ============================================

export const noteService = {
  async create(data: NoteCreate): Promise<Note> {
    const response = await apiClient.post(BASE_URL, data)
    return response.data
  },

  async getAll(params?: { is_quick_note?: boolean; category_id?: string }): Promise<Note[]> {
    const response = await apiClient.get(BASE_URL, { params })
    return response.data
  },

  async getById(noteId: string): Promise<Note> {
    const response = await apiClient.get(`${BASE_URL}/${noteId}`)
    return response.data
  },

  async update(noteId: string, data: NoteUpdate): Promise<Note> {
    const response = await apiClient.put(`${BASE_URL}/${noteId}`, data)
    return response.data
  },

  async delete(noteId: string): Promise<void> {
    await apiClient.delete(`${BASE_URL}/${noteId}`)
  },

  async addTag(noteId: string, tagName: string): Promise<Note> {
    const response = await apiClient.post(`${BASE_URL}/${noteId}/tags`, { tag_name: tagName })
    return response.data
  }
}

