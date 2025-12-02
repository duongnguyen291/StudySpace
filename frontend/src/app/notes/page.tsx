'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { BookOpen, Zap, Plus, Home, Loader2, ArrowRight, LogOut } from 'lucide-react'
import { noteService } from '@/features/notes/services/noteService'
import type { Note } from '@/features/notes/types/note.types'
import { Button } from '@/shared/components/Button'
import { useAuth } from '@/shared/hooks/useAuth'
import NoteEditor from '@/features/notes/components/NoteEditor'
import { ExportButton } from '@/features/notes/components/ExportButton'
import { stripHtml } from '@/features/notes/utils/sanitizeHtml'

export default function NotesPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const filter = searchParams.get('filter')
  const [notes, setNotes] = useState<Note[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editingNote, setEditingNote] = useState<Note | null>(null)
  const { isAuthenticated, user, logout } = useAuth()

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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white px-4">
        <div className="text-center space-y-4">
          <BookOpen className="w-16 h-16 mx-auto text-gray-400" />
          <h2 className="text-2xl font-bold">Bạn chưa đăng nhập</h2>
          <p className="text-gray-400 max-w-md">
            Vui lòng đăng nhập để xem và quản lý ghi chú của bạn
          </p>
          <Button
            variant="primary"
            onClick={() => router.push('/login')}
            className="mt-4 bg-white text-gray-900 hover:bg-white/90"
          >
            Đăng nhập ngay
          </Button>
        </div>
      </div>
    )
  }

  const activeTab = filter === 'quick' ? 'quick' : 'all'

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}
        ></div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* HEADER */}
        <header className="w-full px-6 py-4 flex justify-between items-center bg-black/25 backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-white">StudySpace</h1>
            <span className="text-sm text-white/70">/ Ghi chú</span>
          </div>
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center gap-2"
            >
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
            {user && (
              <div className="flex items-center gap-2">
                {user.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    alt={user.username || 'User'}
                    className="w-8 h-8 rounded-full object-cover border border-white/30"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-semibold">
                    {user.username?.[0]?.toUpperCase() || 'U'}
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                  className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </div>
            )}
          </div>
        </header>

        {/* MAIN */}
        <main className="flex-1 px-6 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Page Header */}
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-3xl font-bold mb-2 text-white">Ghi chú</h2>
                <p className="text-sm text-white/70">
                  Quản lý và tổ chức kiến thức của bạn
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setEditingNote(null)
                  setEditorOpen(true)
                }}
                className="bg-white text-gray-900 hover:bg-white/90 flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo ghi chú mới</span>
              </Button>
            </div>

            {/* Tabs: All / Quick Notes */}
            <div className="flex gap-2 mb-6">
              <button
                type="button"
                onClick={() => router.push('/notes')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'all'
                    ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                <span>Tất cả</span>
              </button>
              <button
                type="button"
                onClick={() => router.push('/notes?filter=quick')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
                  activeTab === 'quick'
                    ? 'bg-white/10 backdrop-blur-md border border-white/20 text-white shadow-lg'
                    : 'bg-white/5 backdrop-blur-sm border border-white/10 text-white/70 hover:bg-white/10 hover:border-white/20'
                }`}
              >
                <Zap className="w-4 h-4" />
                <span>Quick Notes</span>
              </button>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-900/20 border border-red-800/50 rounded-lg text-sm text-red-400">
                {error}
              </div>
            )}

            {/* Loading State */}
            {loading && notes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="w-8 h-8 animate-spin text-white/70 mb-4" />
                <p className="text-white/70">Đang tải ghi chú...</p>
              </div>
            )}

            {/* Empty State */}
            {!loading && notes.length === 0 && !error && (
              <div className="flex flex-col items-center justify-center py-20 bg-white/5 backdrop-blur-sm rounded-xl border border-white/10">
                <BookOpen className="w-16 h-16 text-white/50 mb-4" />
                <h3 className="text-xl font-semibold mb-2 text-white">Chưa có ghi chú nào</h3>
                <p className="text-white/70 text-sm mb-6 text-center max-w-md">
                  {activeTab === 'quick'
                    ? 'Bắt đầu tạo quick note để ghi lại những ý tưởng nhanh chóng'
                    : 'Bắt đầu tạo ghi chú đầu tiên của bạn để tổ chức kiến thức'}
                </p>
                <Button
                  variant="primary"
                  onClick={() => {
                    setEditingNote(null)
                    setEditorOpen(true)
                  }}
                  className="bg-white text-gray-900 hover:bg-white/90 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Tạo ghi chú mới
                </Button>
              </div>
            )}

            {/* Notes Grid */}
            {!loading && notes.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {notes.map((note) => (
                  <div
                    key={note.id}
                    className="group bg-white/5 backdrop-blur-sm rounded-xl border border-white/10 p-5 flex flex-col gap-3 cursor-pointer hover:bg-white/10 hover:border-white/20 hover:shadow-lg transition-all relative"
                    onClick={() => {
                      setEditingNote(note)
                      setEditorOpen(true)
                    }}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          {note.is_quick_note && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-300 border border-yellow-400/30 text-xs font-medium">
                              <Zap className="w-3 h-3" />
                              Quick
                            </span>
                          )}
                        </div>
                        <h2 className="text-base font-semibold text-white mb-1 line-clamp-2">
                          {note.title || '(Không tiêu đề)'}
                        </h2>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation()
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity relative z-10"
                      >
                        <ExportButton
                          note={{
                            title: note.title || 'Untitled Note',
                            content: note.content || '',
                            tags: note.tags,
                            createdAt: note.created_at,
                          }}
                          variant="ghost"
                          size="sm"
                        />
                      </div>
                    </div>

                    {/* Tags */}
                    {note.tags && note.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {note.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-300 border border-blue-500/30 text-xs font-medium"
                          >
                            #{tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Content Preview */}
                    {note.content && (
                      <p className="text-sm text-white/70 line-clamp-1">
                        {stripHtml(note.content).trim() || 'Không có nội dung'}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="flex items-center justify-between pt-2 border-t border-white/10">
                      <span className="text-xs text-white/50">
                        {new Date(note.created_at).toLocaleDateString('vi-VN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </span>
                      <span className="text-xs text-white/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                        Click để chỉnh sửa
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

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
                  const isQuick = filter === 'quick' ? true : undefined
                  const data = await noteService.getAll(
                    isQuick !== undefined ? { is_quick_note: isQuick } : undefined,
                  )
                  setNotes(data)
                  setError(null)
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
                  const isQuick = filter === 'quick' ? true : undefined
                  const data = await noteService.getAll(
                    isQuick !== undefined ? { is_quick_note: isQuick } : undefined,
                  )
                  setNotes(data)
                  setError(null)
                } catch (err) {
                  console.error(err)
                  setError('Xóa ghi chú thất bại')
                }
              }}
            />
          </div>
        </main>
      </div>
    </div>
  )
}
