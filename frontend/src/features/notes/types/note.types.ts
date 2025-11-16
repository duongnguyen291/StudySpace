/**
 * Notes Feature Types
 */

export interface Note {
  id: string
  user_id: string
  category_id: string | null
  title: string
  content: string
  is_pinned: boolean
  created_at: string
  updated_at: string
  tags?: string[]
}

export interface NoteCreate {
  title: string
  content?: string
  category_id?: string
  tags?: string[]
}

export interface NoteUpdate {
  title?: string
  content?: string
  category_id?: string
  is_pinned?: boolean
  tags?: string[]
}

