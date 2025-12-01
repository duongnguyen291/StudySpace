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
    <div className="fixed inset-0 z-40 flex items-end justify-end sm:items-center sm:justify-center bg-black/30">
      <div className="bg-gray-900 text-white w-full sm:w-[420px] rounded-t-2xl sm:rounded-2xl shadow-xl border border-gray-700 p-4 sm:p-5 m-0 sm:m-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            <h2 className="text-sm font-semibold">Quick Note</h2>
          </div>
          <button
            onClick={close}
            className="rounded-full p-1 hover:bg-gray-800"
            aria-label="Close quick note"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <input
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm outline-none border border-gray-700 focus:border-blue-500"
            placeholder="Tiêu đề (không bắt buộc)"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-sm outline-none border border-gray-700 focus:border-blue-500 min-h-[100px]"
            placeholder="Ghi nhanh điều bạn đang nghĩ..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />

          <input
            className="w-full bg-gray-800 rounded-md px-3 py-2 text-xs outline-none border border-gray-700 focus:border-blue-500"
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
          />

          <div className="flex justify-between items-center pt-2">
            <p className="text-[11px] text-gray-400">
              Tip: nhấn <span className="font-mono">Ctrl+Shift+N</span> để mở nhanh
            </p>
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
