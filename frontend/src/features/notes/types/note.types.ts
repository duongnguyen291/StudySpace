/**
 * Notes Feature Types
 */

import type { NoteTheme } from '../constants/note-themes'

// ============================================
// NOTE CATEGORY TYPES
// ============================================

export interface NoteCategory {
  id: string
  user_id: string
  name: string
  color: string
  icon: string
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface NoteCategoryCreate {
  name: string
  color?: string
  icon?: string
}

export interface NoteCategoryUpdate {
  name?: string
  color?: string
  icon?: string
}

// ============================================
// NOTE TYPES
// ============================================

export interface Note {
  id: string
  user_id: string
  category_id: string | null
  category?: NoteCategory | null
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
  category_id?: string | null
  tags?: string[]
  is_quick_note?: boolean
  source_context?: string
  theme?: NoteTheme
}

export interface NoteUpdate {
  title?: string
  content?: string
  category_id?: string | null
  is_pinned?: boolean
  tags?: string[]
  theme?: NoteTheme
}

