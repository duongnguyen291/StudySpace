'use client'

import { useState } from 'react'
import { X, Folder } from 'lucide-react'
import type { Task, TaskCreate, TaskPriority } from '../types/task.types'
import type { Category } from '../types/category.types'
import { Button } from '@/shared/components/Button'

interface TaskFormProps {
  task?: Task | null
  categories: Category[]
  onSubmit: (data: TaskCreate) => void
  onCancel: () => void
  loading?: boolean
}

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

export function TaskForm({ task, categories, onSubmit, onCancel, loading }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: (task?.priority || 'medium') as TaskPriority,
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    category_id: task?.category_id || '',
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    const data: TaskCreate = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      due_date: formData.due_date || undefined,
      category_id: formData.category_id || undefined,
    }

    onSubmit(data)
  }

  return (
    <div className="bg-gray-800/95 backdrop-blur-sm rounded-xl p-6 border border-gray-700/50 shadow-xl animate-scale-in">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-semibold text-white">
          {task ? 'Edit Task' : 'New Task'}
        </h3>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-gray-700/50 rounded"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Title <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            placeholder="Enter task title..."
            required
            maxLength={255}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all"
            placeholder="Add details..."
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            <Folder className="w-4 h-4 inline mr-1" />
            Category
          </label>
          <select
            value={formData.category_id}
            onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          >
            <option value="">No Category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: option.value })}
                className={`
                  flex-1 py-2.5 px-4 rounded-lg border-2 font-medium text-sm transition-all
                  ${formData.priority === option.value
                    ? `${option.color} border-transparent text-white shadow-lg`
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Due Date */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Due Date
          </label>
          <input
            type="date"
            value={formData.due_date}
            onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
            className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-3">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            disabled={loading || !formData.title.trim()}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : task ? 'Update Task' : 'Create Task'}
          </Button>
        </div>
      </form>
    </div>
  )
}
