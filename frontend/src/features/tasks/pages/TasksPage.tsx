'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Plus, Search, Filter, SortAsc, SortDesc, 
  Trash2, CheckSquare, Square, X, FolderPlus, Tag
} from 'lucide-react'
import { TaskList } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import { Button } from '@/shared/components/Button'
import { useToast } from '@/shared/components'
import { useTasks } from '../hooks/useTasks'
import { useTaskMutations } from '../hooks/useTaskMutations'
import { useCategories } from '../hooks/useCategories'
import type { Task, TaskCreate, TaskPriority, TaskFilter } from '../types/task.types'
import type { CategoryCreate } from '../types/category.types'

type SortField = 'created_at' | 'due_date' | 'priority' | 'title'
type FilterStatus = 'all' | 'pending' | 'completed'

export function TasksPage() {
  const router = useRouter()
  const { showToast } = useToast()
  
  // Form states
  const [showForm, setShowForm] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [showCategoryForm, setShowCategoryForm] = useState(false)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [newCategoryColor, setNewCategoryColor] = useState('#3B82F6')
  
  // Filter states
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('all')
  const [filterPriority, setFilterPriority] = useState<TaskPriority | 'all'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  
  // Sort states
  const [sortBy, setSortBy] = useState<SortField>('created_at')
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc')
  
  // Selection states (bulk actions)
  const [selectionMode, setSelectionMode] = useState(false)
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  // Build filters
  const filters: TaskFilter = useMemo(() => ({
    completed: filterStatus === 'all' ? undefined : filterStatus === 'completed',
    priority: filterPriority === 'all' ? undefined : filterPriority,
    category_id: filterCategory === 'all' ? undefined : filterCategory,
    search: debouncedSearch || undefined,
    page: 1,
    page_size: 100,
    sort_by: sortBy,
    sort_order: sortOrder,
  }), [filterStatus, filterPriority, filterCategory, debouncedSearch, sortBy, sortOrder])

  const { tasks, stats, loading, refetch, refetchStats } = useTasks(filters)
  const { 
    createTask, updateTask, toggleTask, deleteTask, 
    bulkDelete, bulkComplete, bulkUncomplete,
    loading: mutating 
  } = useTaskMutations()
  const { categories, createCategory, loading: categoriesLoading } = useCategories()

  // Handlers
  const handleCreateTask = async (data: TaskCreate) => {
    try {
      await createTask(data)
      setShowForm(false)
      refetch()
      refetchStats()
      showToast('Task created successfully!', 'success')
    } catch (err) {
      showToast('Failed to create task', 'error')
    }
  }

  const handleUpdateTask = async (data: TaskCreate) => {
    if (!editingTask) return

    try {
      await updateTask(editingTask.id, data)
      setEditingTask(null)
      setShowForm(false)
      refetch()
      refetchStats()
      showToast('Task updated successfully!', 'success')
    } catch (err) {
      showToast('Failed to update task', 'error')
    }
  }

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id)
      refetch()
      refetchStats()
    } catch (err) {
      showToast('Failed to toggle task', 'error')
    }
  }

  const handleDeleteTask = async (id: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return

    try {
      await deleteTask(id)
      refetch()
      refetchStats()
      showToast('Task deleted', 'success')
    } catch (err) {
      showToast('Failed to delete task', 'error')
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task)
    setShowForm(true)
  }

  const handleSelectTask = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) 
        ? prev.filter(i => i !== id)
        : [...prev, id]
    )
  }

  const handleSelectAll = () => {
    if (selectedIds.length === tasks.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(tasks.map(t => t.id))
    }
  }

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return
    if (!confirm(`Delete ${selectedIds.length} task(s)?`)) return

    try {
      await bulkDelete(selectedIds)
      setSelectedIds([])
      setSelectionMode(false)
      refetch()
      refetchStats()
      showToast(`Deleted ${selectedIds.length} task(s)`, 'success')
    } catch (err) {
      showToast('Failed to delete tasks', 'error')
    }
  }

  const handleBulkComplete = async () => {
    if (selectedIds.length === 0) return

    try {
      await bulkComplete(selectedIds)
      setSelectedIds([])
      refetch()
      refetchStats()
      showToast(`Completed ${selectedIds.length} task(s)`, 'success')
    } catch (err) {
      showToast('Failed to complete tasks', 'error')
    }
  }

  const handleBulkUncomplete = async () => {
    if (selectedIds.length === 0) return

    try {
      await bulkUncomplete(selectedIds)
      setSelectedIds([])
      refetch()
      refetchStats()
      showToast(`Uncompleted ${selectedIds.length} task(s)`, 'success')
    } catch (err) {
      showToast('Failed to uncomplete tasks', 'error')
    }
  }

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newCategoryName.trim()) return

    try {
      const data: CategoryCreate = {
        name: newCategoryName.trim(),
        color: newCategoryColor,
      }
      await createCategory(data)
      setNewCategoryName('')
      setShowCategoryForm(false)
      showToast('Category created!', 'success')
    } catch (err) {
      showToast('Failed to create category', 'error')
    }
  }

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')
  }

  const displayStats = stats || { total: 0, completed: 0, pending: 0 }

  const categoryColors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', 
    '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      {/* Background Pattern */}
      <div className="fixed inset-0 opacity-[0.03]">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, white 1px, transparent 0)`,
          backgroundSize: '32px 32px'
        }} />
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-5xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push('/')}
              className="text-gray-400 hover:text-gray-600"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Tasks
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Selection Mode Toggle */}
            <Button
              variant={selectionMode ? 'primary' : 'outline'}
              size="sm"
              onClick={() => {
                setSelectionMode(!selectionMode)
                setSelectedIds([])
              }}
            >
              {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                setEditingTask(null)
                setShowForm(true)
              }}
              disabled={mutating}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Task
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-gray-600/50 transition-colors">
            <div className="text-3xl font-bold text-white">{displayStats.total}</div>
            <div className="text-sm text-gray-400 mt-1">Total Tasks</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-green-500/30 transition-colors">
            <div className="text-3xl font-bold text-green-400">{displayStats.completed}</div>
            <div className="text-sm text-gray-400 mt-1">Completed</div>
          </div>
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 hover:border-yellow-500/30 transition-colors">
            <div className="text-3xl font-bold text-yellow-400">{displayStats.pending}</div>
            <div className="text-sm text-gray-400 mt-1">Pending</div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectionMode && selectedIds.length > 0 && (
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 mb-6 flex items-center justify-between animate-scale-in">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSelectAll}
                className="text-blue-400 hover:text-blue-300 transition-colors"
              >
                {selectedIds.length === tasks.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <span className="text-blue-300 font-medium">
                {selectedIds.length} task{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkComplete}
                className="text-green-400 border-green-500/30 hover:bg-green-500/10"
              >
                <CheckSquare className="w-4 h-4 mr-1" />
                Complete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkUncomplete}
                className="text-yellow-400 border-yellow-500/30 hover:bg-yellow-500/10"
              >
                <Square className="w-4 h-4 mr-1" />
                Uncomplete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleBulkDelete}
                className="text-red-400 border-red-500/30 hover:bg-red-500/10"
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedIds([])
                  setSelectionMode(false)
                }}
                className="text-gray-400"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        {/* Filters & Sort */}
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search tasks..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
              className="px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="high">🔴 High</option>
              <option value="medium">🟡 Medium</option>
              <option value="low">🟢 Low</option>
            </select>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="all">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowCategoryForm(true)}
                className="!p-2"
                title="Add Category"
              >
                <FolderPlus className="w-4 h-4" />
              </Button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              >
                <option value="created_at">Created Date</option>
                <option value="due_date">Due Date</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
              </select>
              <Button
                variant="outline"
                size="sm"
                onClick={toggleSortOrder}
                className="!p-2.5"
                title={sortOrder === 'asc' ? 'Ascending' : 'Descending'}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 rounded-xl p-6 w-full max-w-md border border-gray-700 animate-scale-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  New Category
                </h3>
                <button 
                  onClick={() => setShowCategoryForm(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCategory} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Category name..."
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Color
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-8 h-8 rounded-lg transition-transform ${newCategoryColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-gray-800' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowCategoryForm(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" variant="primary">
                    Create
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Form */}
        {showForm && (
          <div className="mb-6">
            <TaskForm
              task={editingTask}
              categories={categories}
              onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
              onCancel={() => {
                setShowForm(false)
                setEditingTask(null)
              }}
              loading={mutating}
            />
          </div>
        )}

        {/* Task List */}
        <TaskList
          tasks={tasks}
          categories={categories}
          loading={loading || categoriesLoading}
          selectedIds={selectedIds}
          selectionMode={selectionMode}
          onToggle={handleToggleTask}
          onDelete={handleDeleteTask}
          onEdit={handleEditTask}
          onSelect={handleSelectTask}
        />
      </div>
    </div>
  )
}
