'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { 
  ArrowLeft, Plus, Search, SortAsc, SortDesc, 
  Trash2, CheckSquare, Square, X, FolderPlus, Tag
} from 'lucide-react'
import { TaskList } from '../components/TaskList'
import { TaskForm } from '../components/TaskForm'
import { ConfirmModal } from '../components/ConfirmModal'
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

  // Delete confirmation modal states
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean
    type: 'single' | 'bulk'
    taskId?: string
    taskTitle?: string
  }>({ isOpen: false, type: 'single' })
  const [deleting, setDeleting] = useState(false)

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
      showToast('Đã tạo nhiệm vụ thành công!', 'success')
    } catch (err) {
      showToast('Không thể tạo nhiệm vụ', 'error')
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
      showToast('Đã cập nhật nhiệm vụ thành công!', 'success')
    } catch (err) {
      showToast('Không thể cập nhật nhiệm vụ', 'error')
    }
  }

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id)
      refetch()
      refetchStats()
    } catch (err) {
      showToast('Không thể chuyển trạng thái nhiệm vụ', 'error')
    }
  }

  const handleDeleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id)
    setDeleteConfirm({
      isOpen: true,
      type: 'single',
      taskId: id,
      taskTitle: task?.title || 'nhiệm vụ này',
    })
  }

  const confirmDeleteTask = async () => {
    if (!deleteConfirm.taskId) return

    setDeleting(true)
    try {
      await deleteTask(deleteConfirm.taskId)
      refetch()
      refetchStats()
      showToast('Đã xóa nhiệm vụ', 'success')
      setDeleteConfirm({ isOpen: false, type: 'single' })
    } catch (err) {
      showToast('Không thể xóa nhiệm vụ', 'error')
    } finally {
      setDeleting(false)
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

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return
    setDeleteConfirm({
      isOpen: true,
      type: 'bulk',
    })
  }

  const confirmBulkDelete = async () => {
    setDeleting(true)
    try {
      await bulkDelete(selectedIds)
      setSelectedIds([])
      setSelectionMode(false)
      refetch()
      refetchStats()
      showToast(`Đã xóa ${selectedIds.length} nhiệm vụ`, 'success')
      setDeleteConfirm({ isOpen: false, type: 'single' })
    } catch (err) {
      showToast('Không thể xóa nhiệm vụ', 'error')
    } finally {
      setDeleting(false)
    }
  }

  const handleBulkComplete = async () => {
    if (selectedIds.length === 0) return

    try {
      await bulkComplete(selectedIds)
      setSelectedIds([])
      refetch()
      refetchStats()
      showToast(`Đã hoàn thành ${selectedIds.length} nhiệm vụ`, 'success')
    } catch (err) {
      showToast('Không thể hoàn thành nhiệm vụ', 'error')
    }
  }

  const handleBulkUncomplete = async () => {
    if (selectedIds.length === 0) return

    try {
      await bulkUncomplete(selectedIds)
      setSelectedIds([])
      refetch()
      refetchStats()
      showToast(`Đã hủy hoàn thành ${selectedIds.length} nhiệm vụ`, 'success')
    } catch (err) {
      showToast('Không thể hủy hoàn thành nhiệm vụ', 'error')
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
      showToast('Đã tạo danh mục!', 'success')
    } catch (err) {
      showToast('Không thể tạo danh mục', 'error')
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
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 px-3 py-2 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="text-sm">Back</span>
            </button>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
              Tasks
            </h1>
          </div>

          <div className="flex items-center gap-2">
            {/* Selection Mode Toggle */}
            <button
              onClick={() => {
                setSelectionMode(!selectionMode)
                setSelectedIds([])
              }}
              className={`p-2.5 rounded-xl transition-all duration-200 ${
                selectionMode 
                  ? 'bg-white/20 text-white' 
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
              title="Select multiple"
            >
              {selectionMode ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-white/10 transition-all duration-200">
            <div className="text-3xl font-bold text-white">{displayStats.total}</div>
            <div className="text-sm text-white/50 mt-1">Total Tasks</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-green-500/10 hover:border-green-500/20 transition-all duration-200">
            <div className="text-3xl font-bold text-green-400">{displayStats.completed}</div>
            <div className="text-sm text-white/50 mt-1">Completed</div>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 hover:bg-yellow-500/10 hover:border-yellow-500/20 transition-all duration-200">
            <div className="text-3xl font-bold text-yellow-400">{displayStats.pending}</div>
            <div className="text-sm text-white/50 mt-1">Pending</div>
          </div>
        </div>

        {/* Bulk Actions Bar */}
        {selectionMode && selectedIds.length > 0 && (
          <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 flex items-center justify-between animate-scale-in">
            <div className="flex items-center gap-3">
              <button 
                onClick={handleSelectAll}
                className="text-white/60 hover:text-white transition-colors"
              >
                {selectedIds.length === tasks.length ? (
                  <CheckSquare className="w-5 h-5" />
                ) : (
                  <Square className="w-5 h-5" />
                )}
              </button>
              <span className="text-white/80 font-medium">
                {selectedIds.length} task{selectedIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleBulkComplete}
                className="flex items-center gap-1.5 px-3 py-2 text-green-400 hover:bg-green-500/10 rounded-xl transition-all"
              >
                <CheckSquare className="w-4 h-4" />
                <span className="text-sm">Complete</span>
              </button>
              <button
                onClick={handleBulkUncomplete}
                className="flex items-center gap-1.5 px-3 py-2 text-yellow-400 hover:bg-yellow-500/10 rounded-xl transition-all"
              >
                <Square className="w-4 h-4" />
                <span className="text-sm">Uncomplete</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="flex items-center gap-1.5 px-3 py-2 text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
              >
                <Trash2 className="w-4 h-4" />
                <span className="text-sm">Delete</span>
              </button>
              <button
                onClick={() => {
                  setSelectedIds([])
                  setSelectionMode(false)
                }}
                className="p-2 text-white/40 hover:text-white hover:bg-white/5 rounded-xl transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Filters & Sort */}
        <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                <input
                  type="text"
                  placeholder="Tìm kiếm nhiệm vụ..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all"
                />
              </div>
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as FilterStatus)}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            >
              <option value="all" className="bg-gray-900">Tất cả trạng thái</option>
              <option value="pending" className="bg-gray-900">Đang chờ</option>
              <option value="completed" className="bg-gray-900">Hoàn thành</option>
            </select>

            {/* Priority Filter */}
            <select
              value={filterPriority}
              onChange={(e) => setFilterPriority(e.target.value as TaskPriority | 'all')}
              className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
            >
              <option value="all" className="bg-gray-900">Tất cả độ ưu tiên</option>
              <option value="high" className="bg-gray-900">Cao</option>
              <option value="medium" className="bg-gray-900">Trung bình</option>
              <option value="low" className="bg-gray-900">Thấp</option>
            </select>

            {/* Category Filter */}
            <div className="flex items-center gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              >
                <option value="all" className="bg-gray-900">Tất cả danh mục</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-gray-900">{cat.name}</option>
                ))}
              </select>
              <button
                onClick={() => setShowCategoryForm(true)}
                className="p-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                title="Thêm danh mục"
              >
                <FolderPlus className="w-4 h-4" />
              </button>
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2 ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortField)}
                className="px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
              >
                <option value="created_at" className="bg-gray-900">Ngày tạo</option>
                <option value="due_date" className="bg-gray-900">Hạn chót</option>
                <option value="priority" className="bg-gray-900">Độ ưu tiên</option>
                <option value="title" className="bg-gray-900">Tiêu đề</option>
              </select>
              <button
                onClick={toggleSortOrder}
                className="p-2.5 text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition-all duration-200"
                title={sortOrder === 'asc' ? 'Tăng dần' : 'Giảm dần'}
              >
                {sortOrder === 'asc' ? (
                  <SortAsc className="w-4 h-4" />
                ) : (
                  <SortDesc className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Category Form Modal */}
        {showCategoryForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-6 w-full max-w-md border border-white/20 shadow-2xl animate-scale-in">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Tag className="w-5 h-5 text-white/70" />
                  Danh mục mới
                </h3>
                <button 
                  onClick={() => setShowCategoryForm(false)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleCreateCategory} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Tên
                  </label>
                  <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-white/20 focus:bg-white/10 transition-all"
                    placeholder="Tên danh mục..."
                    required
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-white/70 mb-2">
                    Màu sắc
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {categoryColors.map((color) => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewCategoryColor(color)}
                        className={`w-8 h-8 rounded-xl transition-all duration-200 ${newCategoryColor === color ? 'scale-110 ring-2 ring-white ring-offset-2 ring-offset-transparent' : 'hover:scale-105'}`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex justify-end gap-3 pt-3 border-t border-white/10">
                  <button
                    type="button"
                    onClick={() => setShowCategoryForm(false)}
                    className="px-5 py-2.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl font-medium transition-all"
                  >
                    Hủy
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2.5 bg-white/20 hover:bg-white/30 text-white rounded-xl font-medium transition-all"
                  >
                    Tạo
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Task Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div 
              className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <TaskForm
                task={editingTask}
                categories={categories}
                onSubmit={editingTask ? handleUpdateTask : handleCreateTask}
                onCancel={() => {
                  setShowForm(false)
                  setEditingTask(null)
                }}
                onCreateCategory={createCategory}
                loading={mutating}
              />
            </div>
          </div>
        )}

        {/* New Task Button */}
        <button
          onClick={() => {
            setEditingTask(null)
            setShowForm(true)
          }}
          disabled={mutating}
          className="w-full mb-4 py-4 flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 border-dashed hover:border-white/20 rounded-2xl text-white/60 hover:text-white transition-all duration-200 group disabled:opacity-50"
        >
          <Plus className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-medium">Add New Task</span>
        </button>

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

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        title={deleteConfirm.type === 'bulk' ? 'Delete Tasks' : 'Delete Task'}
        message={
          deleteConfirm.type === 'bulk'
            ? `Are you sure you want to delete ${selectedIds.length} selected task${selectedIds.length > 1 ? 's' : ''}? This action cannot be undone.`
            : `Are you sure you want to delete "${deleteConfirm.taskTitle}"? This action cannot be undone.`
        }
        confirmText="Delete"
        cancelText="Cancel"
        variant="danger"
        onConfirm={deleteConfirm.type === 'bulk' ? confirmBulkDelete : confirmDeleteTask}
        onCancel={() => setDeleteConfirm({ isOpen: false, type: 'single' })}
        loading={deleting}
      />
    </div>
  )
}
