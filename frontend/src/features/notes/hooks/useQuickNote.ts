'use client'

import { useEffect, useState, useCallback } from 'react'
import { noteService } from '../services/noteService'
import type { Note } from '../types/note.types'

const DRAFT_KEY = 'quick_note_draft_v2'

interface QuickNoteDraft {
  title: string
  content: string
  tags: string[]
  categoryId: string | null
}

export const useQuickNote = () => {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [categoryId, setCategoryId] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  // Load draft from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const raw = window.localStorage.getItem(DRAFT_KEY)
    if (!raw) return
    try {
      const draft: QuickNoteDraft = JSON.parse(raw)
      setTitle(draft.title)
      setContent(draft.content)
      setTags(draft.tags || [])
      setCategoryId(draft.categoryId || null)
    } catch {
      // ignore corrupted draft
    }
  }, [])

  // Autosave draft with debounce
  useEffect(() => {
    if (typeof window === 'undefined') return

    const handler = window.setTimeout(() => {
      if (!title && !content && tags.length === 0 && !categoryId) {
        window.localStorage.removeItem(DRAFT_KEY)
        return
      }
      const draft: QuickNoteDraft = { title, content, tags, categoryId }
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify(draft))
    }, 700)

    return () => window.clearTimeout(handler)
  }, [title, content, tags, categoryId])

  const clearDraft = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(DRAFT_KEY)
    }
    setTitle('')
    setContent('')
    setTags([])
    setCategoryId(null)
  }, [])

  const save = async (options?: { keepOpen?: boolean }): Promise<Note | null> => {
    if (!content.trim()) return null
    setIsSaving(true)
    try {
      const note = await noteService.create({
        title: title.trim() || content.slice(0, 50),
        content: content.trim(),
        tags,
        category_id: categoryId,
        is_quick_note: true,
        // Optional: lưu context để phân tích sau
        // source_context: typeof window !== 'undefined' ? window.location.pathname : undefined,
      })

      if (options?.keepOpen) {
        setTitle('')
        setContent('')
        setTags([])
        setCategoryId(null)
      } else {
        clearDraft()
      }

      return note
    } finally {
      setIsSaving(false)
    }
  }

  return {
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    categoryId,
    setCategoryId,
    isSaving,
    save,
    clearDraft,
  }
}
