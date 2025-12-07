"use client"

import { useEffect, useState } from 'react'
import { Button } from '@/shared/components/Button'
import { RichTextEditor } from './RichTextEditor'
import { ExportButton } from './ExportButton'
import { ThemeSelector } from './ThemeSelector'
import { NoteCategorySelector } from './NoteCategorySelector'
import { X, Save, Trash2 } from 'lucide-react'
import type { Note, NoteCreate, NoteUpdate } from '../types/note.types'
import type { NoteTheme } from '../constants/note-themes'
import { DEFAULT_THEME, NOTE_THEMES } from '../constants/note-themes'

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
  const [theme, setTheme] = useState<NoteTheme>(initial?.theme || DEFAULT_THEME)
  const [categoryId, setCategoryId] = useState<string | null>(initial?.category_id ?? null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setContent(initial?.content ?? '')
    setTagsInput((initial?.tags || []).join(','))
    setTheme(initial?.theme || DEFAULT_THEME)
    setCategoryId(initial?.category_id ?? null)
  }, [open, initial])

  if (!open) return null

  const parseTags = (raw: string) =>
    raw
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

  // Get theme styles for editor
  // Quick notes và standard theme dùng màu đen như ban đầu
  const isQuickNote = initial?.is_quick_note || false
  const isStandardTheme = theme === 'standard'
  const useDarkTheme = isQuickNote || isStandardTheme
  
  const currentTheme = useDarkTheme
    ? {
        bgColorHex: '#111827',
        borderColorHex: '#374151',
        textColorHex: '#ffffff',
      }
    : NOTE_THEMES[theme]

  const handleSave = async () => {
    const payload = {
      title: title?.trim() || undefined,
      content: content?.trim() || '',
      tags: parseTags(tagsInput),
      theme: theme,
      category_id: categoryId,
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
      <div 
        className="w-full max-w-4xl backdrop-blur-xl rounded-xl p-6 border-4 max-h-[90vh] overflow-y-auto shadow-2xl"
        style={{
          background: useDarkTheme
            ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(30, 41, 59, 0.5) 100%)'
            : `linear-gradient(135deg, ${currentTheme.bgColorHex}95 0%, ${currentTheme.bgColorHex}88 100%)`,
          borderColor: useDarkTheme
            ? 'rgba(255, 255, 255, 0.25)'
            : `${currentTheme.borderColorHex}dd`,
          color: currentTheme.textColorHex,
          boxShadow: useDarkTheme
            ? '0 20px 60px 0 rgba(0, 0, 0, 0.5), 0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)'
            : `0 20px 60px 0 ${currentTheme.borderColorHex}50, 0 8px 32px 0 ${currentTheme.borderColorHex}30, inset 0 1px 0 0 rgba(255, 255, 255, 0.2)`,
          backdropFilter: useDarkTheme
            ? 'blur(20px) saturate(180%)'
            : 'blur(12px) saturate(150%)',
          WebkitBackdropFilter: useDarkTheme
            ? 'blur(20px) saturate(180%)'
            : 'blur(12px) saturate(150%)',
        }}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-3xl font-bold" style={{ color: currentTheme.textColorHex }}>
              {initial ? 'Chỉnh sửa ghi chú' : 'Tạo ghi chú mới'}
            </h3>
            <p className="text-sm mt-1" style={{ color: `${currentTheme.textColorHex}cc` }}>
              {initial ? 'Cập nhật nội dung ghi chú của bạn' : 'Viết và định dạng ghi chú với đầy đủ tính năng'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-black/10 rounded-lg transition-colors"
            style={{ color: `${currentTheme.textColorHex}cc` }}
            aria-label="Đóng"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* Theme Selector & Category - Only show for regular notes */}
          {!initial?.is_quick_note && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.textColorHex }}>
                  Theme
                </label>
                <ThemeSelector
                  selectedTheme={theme}
                  onThemeChange={setTheme}
                  disabled={saving}
                  textColor={currentTheme.textColorHex}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.textColorHex }}>
                  Danh mục
                </label>
                <NoteCategorySelector
                  selectedCategoryId={categoryId}
                  onCategoryChange={setCategoryId}
                  disabled={saving}
                  textColor={currentTheme.textColorHex}
                />
              </div>
            </div>
          )}

          {/* Category for quick notes */}
          {initial?.is_quick_note && (
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.textColorHex }}>
                Danh mục
              </label>
              <NoteCategorySelector
                selectedCategoryId={categoryId}
                onCategoryChange={setCategoryId}
                disabled={saving}
                textColor={currentTheme.textColorHex}
              />
            </div>
          )}

          {/* Title Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.textColorHex }}>
              Tiêu đề (tùy chọn)
            </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
              placeholder="Nhập tiêu đề cho ghi chú..."
              className="w-full px-4 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-md border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: currentTheme.borderColorHex,
                color: currentTheme.textColorHex,
              }}
            />
          </div>

          {/* Content Editor */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.textColorHex }}>
              Nội dung
            </label>
            <div 
              className="min-h-[350px] backdrop-blur-lg rounded-lg border-4 overflow-hidden relative"
              style={{
                background: useDarkTheme
                  ? 'linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0%, rgba(30, 41, 59, 0.35) 100%)'
                  : `linear-gradient(135deg, ${currentTheme.bgColorHex}90 0%, ${currentTheme.bgColorHex}75 100%)`,
                borderColor: useDarkTheme
                  ? 'rgba(255, 255, 255, 0.2)'
                  : `${currentTheme.borderColorHex}dd`,
                boxShadow: useDarkTheme
                  ? 'inset 0 2px 8px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.1)'
                  : `inset 0 2px 8px 0 ${currentTheme.borderColorHex}30, inset 0 1px 0 0 rgba(255, 255, 255, 0.1)`,
                backdropFilter: useDarkTheme
                  ? 'blur(16px) saturate(180%)'
                  : 'blur(10px) saturate(150%)',
                WebkitBackdropFilter: useDarkTheme
                  ? 'blur(16px) saturate(180%)'
                  : 'blur(10px) saturate(150%)',
              }}
            >
              {/* Subtle gradient overlay - chỉ cho theme không phải standard/quick */}
              {!useDarkTheme && (
                <div 
                  className="absolute inset-0 pointer-events-none opacity-20"
                  style={{
                    background: `linear-gradient(135deg, ${currentTheme.borderColorHex}33 0%, transparent 100%)`,
                  }}
                />
              )}
              <RichTextEditor
            value={content}
                onChange={setContent}
                placeholder="Nhập nội dung ghi chú với đầy đủ định dạng..."
                themeColor={currentTheme.textColorHex}
          />
            </div>
          </div>

          {/* Tags Input */}
          <div>
            <label className="block text-sm font-medium mb-2" style={{ color: currentTheme.textColorHex }}>
              Tags (phân tách bằng dấu phẩy)
            </label>
          <input
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
              placeholder="ví dụ: toán, lập trình, học tập"
              className="w-full px-4 py-3 bg-white/10 dark:bg-black/20 backdrop-blur-md border rounded-lg focus:outline-none focus:ring-2 transition-all"
              style={{
                borderColor: currentTheme.borderColorHex,
                color: currentTheme.textColorHex,
              }}
          />
          </div>

          {/* Actions */}
          <div 
            className="flex justify-between items-center pt-4 border-t"
            style={{ borderColor: `${currentTheme.borderColorHex}4d` }}
          >
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
                  themeColor={currentTheme.textColorHex}
                  themeBorderColor={currentTheme.borderColorHex}
                  themeBgColor={currentTheme.bgColorHex}
                />
              )}
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
                className="font-medium transition-all"
                style={{
                  backgroundColor: `${currentTheme.bgColorHex}40`,
                  borderColor: currentTheme.borderColorHex,
                  color: currentTheme.textColorHex,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `${currentTheme.bgColorHex}60`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `${currentTheme.bgColorHex}40`
                }}
              >
                Hủy
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSave}
                isLoading={saving}
                className="font-semibold flex items-center gap-2 transition-all"
                style={{
                  backgroundColor: currentTheme.borderColorHex,
                  color: currentTheme.textColorHex,
                  borderColor: currentTheme.borderColorHex,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
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
