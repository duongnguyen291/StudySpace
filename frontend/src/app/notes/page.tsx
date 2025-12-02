'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { noteService } from '@/features/notes/services/noteService'
import type { Note } from '@/features/notes/types/note.types'
import { Button } from '@/shared/components/Button'
import { useAuth } from '@/shared/hooks/useAuth'
import NoteEditor from '@/features/notes/components/NoteEditor'
import { sanitizeHtml, stripHtml } from '@/features/notes/utils/sanitizeHtml'

export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const { isAuthenticated } = useAuth()

  useEffect(() => {
    if (!isAuthenticated) return

    const load = async () => {
      try {
        setLoading(true)
        setError(null)
        const isQuick = filter === 'quick' ? true : undefined
        const data = await noteService.getAll(
          isQuick !== undefined ? { is_quick_note: isQuick } : undefined,
        )
        setNotes(data)
      } catch (err) {
        console.error(err)
        setError('Không tải được danh sách ghi chú')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [filter, isAuthenticated])

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        <p className="mb-4">Bạn cần đăng nhập để xem ghi chú.</p>
        <Button onClick={() => router.push('/login')}>Đăng nhập</Button>
      </div>
    )
  }

  const activeTab = filter === 'quick' ? 'quick' : 'all'

  return (
    <div className="min-h-screen bg-gray-950 text-white px-4 py-6">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold">Ghi chú</h1>
          <Button
            variant="outline"
            size="sm"
            onClick={() => router.push('/')}
            className="border-white/20 text-white hover:bg-white/10"
          >
            Home
          </Button>
        </div>

        {/* Tabs: All / Quick Notes */}
        <div className="flex gap-2 mb-4 border-b border-gray-800 pb-2">
          <button
            type="button"
            onClick={() => router.push('/notes')}
            className={`px-3 py-1.5 rounded-full text-sm ${
              activeTab === 'all'
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={() => router.push('/notes?filter=quick')}
            className={`px-3 py-1.5 rounded-full text-sm flex items-center gap-1 ${
              activeTab === 'quick'
                ? 'bg-white text-gray-900'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
            }`}
          >
            <span>⚡</span>
            <span>Quick Notes</span>
          </button>
        </div>

        {loading && <p className="text-gray-300">Đang tải ghi chú...</p>}
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}

        {!loading && notes.length === 0 && !error && (
          <p className="text-gray-400 text-sm">
            Chưa có ghi chú nào.
          </p>
        )}

        <div className="flex items-center justify-between mb-3">
          <div />
          <div className="flex gap-2">
            <Button size="sm" onClick={() => { setEditingNote(null); setEditorOpen(true) }}>
              + New Note
            </Button>
            <Button variant="outline" size="sm" onClick={() => router.push('/notes?filter=quick')}>
              Quick Notes
            </Button>
          </div>
        </div>

        <div className="space-y-3 mt-3">
          {notes.map((note) => (
            <div
              key={note.id}
              className="bg-gray-900 border border-gray-800 rounded-lg p-3 flex flex-col gap-1 cursor-pointer"
              onClick={() => { setEditingNote(note); setEditorOpen(true) }}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {note.is_quick_note && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30">
                      ⚡ Quick
                    </span>
                  )}
                  <h2 className="text-sm font-semibold truncate max-w-xs">
                    {note.title || '(Không tiêu đề)'}
                  </h2>
                </div>
                <span className="text-[10px] text-gray-500">
                  {new Date(note.created_at).toLocaleString('vi-VN')}
                </span>
              </div>
              {note.tags && note.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {note.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-[10px] px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              {note.content && (
                <div
                  className="text-xs text-gray-300 mt-1 line-clamp-3 prose prose-invert prose-sm max-w-none [&>*]:line-clamp-2 [&>*]:overflow-hidden"
                  dangerouslySetInnerHTML={{
                    __html: sanitizeHtml(note.content),
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* Note Editor modal */}
        <NoteEditor
          open={editorOpen}
          initial={editingNote}
          onClose={() => setEditorOpen(false)}
          onSubmit={async (payload) => {
            try {
              if (editingNote) {
                await noteService.update(editingNote.id, payload as any)
              } else {
                await noteService.create({ ...(payload as any), is_quick_note: false })
              }
              // reload
              setLoading(true)
              const data = await noteService.getAll()
              setNotes(data)
            } catch (err) {
              console.error(err)
              setError('Lưu ghi chú thất bại')
            } finally {
              setLoading(false)
            }
          }}
          onDelete={async () => {
            if (!editingNote) return
            try {
              await noteService.delete(editingNote.id)
              const data = await noteService.getAll()
              setNotes(data)
            } catch (err) {
              console.error(err)
              setError('Xóa ghi chú thất bại')
            }
          }}
        />
      </div>
    </div>
  )
}
