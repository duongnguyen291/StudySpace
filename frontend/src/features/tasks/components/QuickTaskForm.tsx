'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import type { TaskPriority } from '../types/task.types'

interface QuickTaskFormProps {
  onSubmit: (title: string, priority: TaskPriority) => Promise<void>
  loading?: boolean
}

export function QuickTaskForm({ onSubmit, loading = false }: QuickTaskFormProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || loading) return

    await onSubmit(title.trim(), priority)
    setTitle('')
    setPriority('medium')
    setIsExpanded(false)
  }

  const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
    { value: 'low', label: '🟢', color: 'hover:bg-green-500/20 data-[selected=true]:bg-green-500/30' },
    { value: 'medium', label: '🟡', color: 'hover:bg-yellow-500/20 data-[selected=true]:bg-yellow-500/30' },
    { value: 'high', label: '🔴', color: 'hover:bg-red-500/20 data-[selected=true]:bg-red-500/30' },
  ]

  return (
    <form onSubmit={handleSubmit} className="p-3">
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onFocus={() => setIsExpanded(true)}
          placeholder="+ Thêm task mới..."
          className="flex-1 px-3 py-2 bg-white/10 border border-white/20 rounded-lg 
                     text-white text-sm placeholder-white/50
                     focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-white/30
                     transition-all"
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={!title.trim() || loading}
          className="p-2 bg-white/20 hover:bg-white/30 disabled:opacity-50 disabled:cursor-not-allowed
                     rounded-lg text-white transition-colors"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Plus className="w-5 h-5" />
          )}
        </button>
      </div>

      {/* Priority selector - shows when expanded */}
      {isExpanded && title && (
        <div className="mt-2 flex items-center gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
          <span className="text-xs text-white/60">Priority:</span>
          <div className="flex gap-1">
            {priorityOptions.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setPriority(opt.value)}
                data-selected={priority === opt.value}
                className={`px-2 py-1 rounded text-sm transition-colors ${opt.color}`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </form>
  )
}

