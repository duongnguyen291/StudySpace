'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { X, Zap } from 'lucide-react'
import { Button } from '@/shared/components/Button'
import { useQuickNote } from '../hooks/useQuickNote'
import { useQuickNoteController } from '../hooks/useQuickNoteController'
import { showToast } from '@/shared/utils/toast'

export const QuickNotePopup = () => {
  const router = useRouter()
  const { isOpen, close } = useQuickNoteController()
  const {
    title,
    setTitle,
    content,
    setContent,
    tags,
    setTags,
    isSaving,
    save,
  } = useQuickNote()

  // Close on ESC
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        close()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [close])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-end sm:items-center sm:justify-center bg-black/60 backdrop-blur-sm">
      <div 
        className="w-full sm:w-[420px] backdrop-blur-xl rounded-t-2xl sm:rounded-2xl border-4 shadow-2xl p-4 sm:p-5 m-0 sm:m-4"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, rgba(30, 41, 59, 0.5) 100%)',
          borderColor: 'rgba(255, 255, 255, 0.25)',
          color: '#ffffff',
          boxShadow: '0 20px 60px 0 rgba(0, 0, 0, 0.5), 0 8px 32px 0 rgba(0, 0, 0, 0.3), inset 0 1px 0 0 rgba(255, 255, 255, 0.15)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
        }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold">Quick Note</h2>
          </div>
          <button
            onClick={close}
            className="rounded-full p-1 backdrop-blur-sm transition-colors"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
            }}
            aria-label="Close quick note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            className="w-full rounded-md px-3 py-2 text-sm outline-none border-2 min-h-[40px] backdrop-blur-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            }}
            placeholder="Tiêu đề (không bắt buộc)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
          />
          <textarea
            className="w-full rounded-md px-3 py-2 text-sm outline-none border-2 min-h-[100px] backdrop-blur-sm resize-y"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            }}
            placeholder="Ghi nhanh điều bạn đang nghĩ..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
          />

          <input
            className="w-full rounded-md px-3 py-2 text-xs outline-none border-2 min-h-[36px] backdrop-blur-sm"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              borderColor: 'rgba(255, 255, 255, 0.2)',
              color: '#ffffff',
            }}
            placeholder="Tag (phân tách bằng dấu phẩy, ví dụ: toán,mạng,BA)"
            value={tags.join(',')}
            onChange={(e) =>
              setTags(
                e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter(Boolean),
              )
            }
            onFocus={(e) => {
              e.target.style.borderColor = 'rgba(59, 130, 246, 0.5)'
            }}
            onBlur={(e) => {
              e.target.style.borderColor = 'rgba(255, 255, 255, 0.2)'
            }}
          />

          <div className="flex justify-end items-center pt-2">
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={close}
              >
                Cancel
              </Button>
              <Button
                size="sm"
                isLoading={isSaving}
                onClick={async () => {
                  const note = await save({ keepOpen: false })
                  if (note) {
                    showToast('Quick note saved', '/notes?filter=quick')
                    close()
                  }
                }}
              >
                Save
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  close()
                  router.push('/notes')
                }}
              >
                All
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
