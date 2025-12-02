/**
 * Notes Feature Types
 */

import type { NoteTheme } from '../constants/note-themes'

export interface Note {
  id: string
  user_id: string
  category_id: string | null
  title: string
  content: string
  is_pinned: boolean
  is_quick_note: boolean
  source_context?: string | null
  theme?: NoteTheme
  created_at: string
  updated_at: string
  tags?: string[]
}

export interface NoteCreate {
  title?: string
  content: string
  category_id?: string
  tags?: string[]
  is_quick_note?: boolean
  source_context?: string
  theme?: NoteTheme
}

export interface NoteUpdate {
  title?: string
  content?: string
  category_id?: string
  is_pinned?: boolean
  tags?: string[]
  theme?: NoteTheme
}

