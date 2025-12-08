'use client'

import { useState } from 'react'
import { Plus, Loader2 } from 'lucide-react'
import type { TaskPriority } from '../types/task.types'
import type { Category } from '../types/category.types'

interface QuickTaskFormProps {
  onSubmit: (title: string, priority: TaskPriority, categoryId?: string) => Promise<void>
  categories?: Category[]
  loading?: boolean
}

export function QuickTaskForm({ onSubmit, categories = [], loading = false }: QuickTaskFormProps) {
  const [title, setTitle] = useState('')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | undefined>(undefined)
  const [isExpanded, setIsExpanded] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || loading) return

    await onSubmit(title.trim(), priority, selectedCategoryId)
    setTitle('')
    setPriority('medium')
    setSelectedCategoryId(undefined)
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

      {/* Priority & Category selector - shows when expanded */}
      {isExpanded && title && (
        <div className="mt-2 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
          {/* Priority */}
          <div className="flex items-center gap-2">
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

          {/* Category selector */}
          {categories.length > 0 && (
            <div className="flex gap-1 flex-wrap">
                {categories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategoryId(
                      selectedCategoryId === cat.id ? undefined : cat.id
                    )}
                    className={`
                      px-2 py-1 rounded text-xs transition-all flex items-center gap-1
                      ${selectedCategoryId === cat.id 
                        ? 'bg-white/25 ring-1 ring-white/40' 
                        : 'bg-white/10 hover:bg-white/20'
                      }
                    `}
                    style={{
                      borderLeft: `3px solid ${cat.color}`,
                    }}
                  >
                    {cat.icon && cat.icon !== 'folder' && (
                      <span>{cat.icon}</span>
                    )}
                    <span className="text-white/90">{cat.name}</span>
                  </button>
                ))}
            </div>
          )}
        </div>
      )}
    </form>
  )
}

