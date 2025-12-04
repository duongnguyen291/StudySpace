'use client'

import { useState } from 'react'
import { X, Folder, Plus, Check } from 'lucide-react'
import type { Task, TaskCreate, TaskPriority } from '../types/task.types'
import type { Category, CategoryCreate } from '../types/category.types'

interface TaskFormProps {
  task?: Task | null
  categories: Category[]
  onSubmit: (data: TaskCreate) => void
  onCancel: () => void
  onCreateCategory?: (data: CategoryCreate) => Promise<Category | null>
  loading?: boolean
}

const CATEGORY_COLORS = [
  '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
  '#EC4899', '#06B6D4', '#84CC16'
]

const priorityOptions: { value: TaskPriority; label: string; color: string }[] = [
  { value: 'low', label: 'Low', color: 'bg-green-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'high', label: 'High', color: 'bg-red-500' },
]

export function TaskForm({ task, categories, onSubmit, onCancel, onCreateCategory, loading }: TaskFormProps) {
  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    priority: (task?.priority || 'medium') as TaskPriority,
    start_date: task?.start_date ? task.start_date.split('T')[0] : '',
    due_date: task?.due_date ? task.due_date.split('T')[0] : '',
    category_id: task?.category_id || '',
  })

  // Date validation
  const [dateError, setDateError] = useState('')
  const today = new Date().toISOString().split('T')[0]
  
  // Format date to dd/mm/yyyy for display
  const formatDateDisplay = (dateStr: string) => {
    if (!dateStr) return ''
    const [year, month, day] = dateStr.split('-')
    return `${day}/${month}/${year}`
  }

  // New category form state
  const [showNewCategory, setShowNewCategory] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState(CATEGORY_COLORS[0])
  const [creatingCategory, setCreatingCategory] = useState(false)

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim() || !onCreateCategory) return
    
    setCreatingCategory(true)
    try {
      const newCat = await onCreateCategory({
        name: newCategoryName.trim(),
        color: newCategoryColor,
      })
      if (newCat) {
        setFormData({ ...formData, category_id: newCat.id })
      }
      setNewCategoryName('')
      setShowNewCategory(false)
    } catch (err) {
      console.error('Failed to create category:', err)
    } finally {
      setCreatingCategory(false)
    }
  }

  const validateDates = (startDate: string, dueDate: string): string => {
    if (dueDate && dueDate < today) {
      return `Due date cannot be in the past (must be ${formatDateDisplay(today)} or later)`
    }
    if (startDate && dueDate && dueDate < startDate) {
      return `Due date must be after start date (${formatDateDisplay(startDate)})`
    }
    return ''
  }

  const handleDateChange = (field: 'start_date' | 'due_date', value: string) => {
    const newFormData = { ...formData, [field]: value }
    setFormData(newFormData)
    
    const error = validateDates(newFormData.start_date, newFormData.due_date)
    setDateError(error)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate dates before submit
    const error = validateDates(formData.start_date, formData.due_date)
    if (error) {
      setDateError(error)
      return
    }
    
    const data: TaskCreate = {
      title: formData.title.trim(),
      description: formData.description.trim() || undefined,
      priority: formData.priority,
      start_date: formData.start_date || undefined,
      due_date: formData.due_date || undefined,
      category_id: formData.category_id || undefined,
    }

    onSubmit(data)
  }

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 border border-white/20 shadow-2xl shadow-black/20">
      {/* Header with gradient accent */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          {/* <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
            <span className="text-white text-lg">{task ? '✏️' : '✨'}</span>
          </div> */}
          <div>
            <h3 className="text-xl font-bold text-white">
              {task ? 'Edit Task' : 'New Task'}
            </h3>
            <p className="text-xs text-white/50">
              {task ? 'Update your task details' : 'Create a new task to track'}
            </p>
          </div>
        </div>
        <button
          onClick={onCancel}
          className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-200"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Title <span className="text-rose-400">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 transition-all duration-200"
            placeholder="What needs to be done?"
            required
            maxLength={255}
            autoFocus
          />
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Description
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 focus:bg-white/10 resize-none transition-all duration-200"
            placeholder="Add more details..."
            rows={3}
          />
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            <Folder className="w-4 h-4 inline mr-1.5 opacity-70" />
            Category
          </label>
          <div className="flex gap-2">
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200 appearance-none cursor-pointer"
            >
              <option value="" className="bg-gray-900">No Category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id} className="bg-gray-900">
                  {category.name}
                </option>
              ))}
            </select>
            {onCreateCategory && (
              <button
                type="button"
                onClick={() => setShowNewCategory(!showNewCategory)}
                className={`px-3 py-3 rounded-xl transition-all duration-200 ${
                  showNewCategory 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                }`}
                title="Add new category"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>

          {/* New Category Mini Form */}
          {showNewCategory && (
            <div className="mt-3 p-3 bg-white/5 border border-white/10 rounded-xl space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Category name..."
                className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                autoFocus
              />
              <div className="flex items-center justify-between">
                <div className="flex gap-1.5">
                  {CATEGORY_COLORS.map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setNewCategoryColor(color)}
                      className={`w-6 h-6 rounded-lg transition-transform ${
                        newCategoryColor === color 
                          ? 'scale-110 ring-2 ring-white ring-offset-1 ring-offset-transparent' 
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={!newCategoryName.trim() || creatingCategory}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-all"
                >
                  {creatingCategory ? (
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <Check className="w-4 h-4" />
                  )}
                  Add
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Priority Selector */}
        <div>
          <label className="block text-sm font-medium text-white/70 mb-2">
            Priority
          </label>
          <div className="flex gap-2">
            {priorityOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                onClick={() => setFormData({ ...formData, priority: option.value })}
                className={`
                  flex-1 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200
                  ${formData.priority === option.value
                    ? `${option.color} text-white shadow-lg scale-[1.02]`
                    : 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10 hover:text-white'
                  }
                `}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        {/* Dates */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={formData.start_date}
                onChange={(e) => handleDateChange('start_date', e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all duration-200"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white/70 mb-2">
                Due Date
              </label>
              <input
                type="date"
                value={formData.due_date}
                onChange={(e) => handleDateChange('due_date', e.target.value)}
                className={`w-full px-4 py-3 bg-white/5 border rounded-xl text-white focus:outline-none focus:ring-2 transition-all duration-200 ${
                  dateError 
                    ? 'border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50' 
                    : 'border-white/10 focus:ring-blue-500/50 focus:border-blue-500/50'
                }`}
              />
            </div>
          </div>
          {/* Date Error Message */}
          {dateError && (
            <p className="text-red-400 text-sm flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1">
              <span className="w-1 h-1 bg-red-400 rounded-full"></span>
              {dateError}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="px-5 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-all duration-200 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !formData.title.trim()}
            className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Saving...
              </span>
            ) : task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  )
}
