/**
 * Notes Service
 * API calls for Notes feature
 */
import { apiClient } from '@/shared/utils/api'
import type { Note, NoteCreate, NoteUpdate } from '../types/note.types'

const BASE_URL = '/notes'

export const noteService = {
  async create(data: NoteCreate): Promise<Note> {
    const response = await apiClient.post(BASE_URL, data)
    return response.data
  },

  async getAll(): Promise<Note[]> {
    const response = await apiClient.get(BASE_URL)
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

