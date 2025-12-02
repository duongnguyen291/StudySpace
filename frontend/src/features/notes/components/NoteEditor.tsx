"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/Button'
import { RichTextEditor } from './RichTextEditor'
import { ExportButton } from './ExportButton'
import { X, Save, Trash2 } from 'lucide-react'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl bg-gray-900/95 backdrop-blur-md text-white rounded-xl p-6 border border-white/20 max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-2xl font-bold text-white">{initial ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú mới'}</h3>
            <p className="text-sm text-white/70 mt-1">
              {initial ? 'Cập nhật nội dung ghi chú của bạn' : 'Viết và định dạng ghi chú với đầy đủ tính năng'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Tiêu đề (tùy chọn)
            </label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề cho ghi chú..."
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Nội dung
            </label>
            <div className="min-h-[350px] bg-white/5 backdrop-blur-sm rounded-lg border border-white/10 overflow-hidden">
              <RichTextEditor
                value={content}
                onChange={setContent}
                placeholder="Nhập nội dung ghi chú với đầy đủ định dạng..."
              />
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium text-white/90 mb-2">
              Tags (phân tách bằng dấu phẩy)
            </label>
            <input
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ví dụ: toán, lập trình, học tập"
              className="w-full px-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30 transition-all"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="flex gap-2">
              {onDelete && (
                <Button
                  variant="danger"
                  size="sm"
                  onClick={handleDelete}
                  isLoading={deleting}
                  className="flex items-center gap-2 bg-red-500/20 border-red-500/30 text-red-300 hover:bg-red-500/30"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Xóa</span>
                </Button>
              )}
              {initial && (
                <ExportButton
                  note={{
                    title: title || initial.title || 'Untitled Note',
                    content: content || initial.content || '',
                    tags: parseTags(tagsInput).length > 0 ? parseTags(tagsInput) : initial.tags,
                    createdAt: initial.created_at,
                  }}
                  variant="outline"
                  size="sm"
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={saving}
                className="bg-white text-gray-900 hover:bg-white/90 font-semibold flex items-center gap-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Đang lưu...' : 'Lưu ghi chú'}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default NoteEditor
