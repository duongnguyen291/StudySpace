"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/Button'
import type { Note, NoteCreate, NoteUpdate } from '../types/note.types'

interface Props {
  initial?: Note | null
  open: boolean
  onClose: () => void
  onSubmit: (data: NoteCreate | NoteUpdate) => Promise<void>
  onDelete?: () => Promise<void>
}

export const NoteEditor = ({ initial = null, open, onClose, onSubmit, onDelete }: Props) => {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [content, setContent] = useState(initial?.content ?? '')
  const [tagsInput, setTagsInput] = useState((initial?.tags || []).join(','))
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setContent(initial?.content ?? '')
    setTagsInput((initial?.tags || []).join(','))
  }, [open, initial])

  if (!open) return null

  const parseTags = (raw: string) =>
    raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

  const handleSave = async () => {
    const payload = {
      title: title?.trim() || undefined,
      content: content?.trim() || '',
      tags: parseTags(tagsInput),
    }

    setSaving(true)
    try {
      await onSubmit(payload)
      onClose()
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!onDelete) return
    if (!confirm('Bạn có chắc muốn xóa ghi chú này?')) return
    setDeleting(true)
    try {
      await onDelete()
      onClose()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-2xl bg-gray-900 text-white rounded-lg p-5 border border-gray-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold">{initial ? 'Edit Note' : 'New Note'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">✕</button>
        </div>

        <div className="space-y-3">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Tiêu đề (tùy chọn)"
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm outline-none border border-gray-700"
          />

          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Nội dung ghi chú"
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm outline-none border border-gray-700 min-h-[140px]"
          />

          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            placeholder="Tags (phân tách bằng dấu phẩy)"
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm outline-none border border-gray-700"
          />

          <div className="flex justify-between items-center">
            <div className="flex gap-2">
              {onDelete && (
                <Button variant="danger" size="sm" onClick={handleDelete} isLoading={deleting}>
                  Delete
                </Button>
              )}
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} isLoading={saving}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteEditor
