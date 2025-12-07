'use client'

import { useState, useEffect, useRef } from 'react'
import { X, ListTodo, ExternalLink, Loader2, ChevronUp } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { PomodoroTaskItem } from './PomodoroTaskItem'
import { QuickTaskForm } from './QuickTaskForm'
import { useTasks } from '../hooks/useTasks'
import { useTaskMutations } from '../hooks/useTaskMutations'
import type { Task, TaskPriority } from '../types/task.types'

interface TaskWidgetProps {
  onFocusChange?: (task: Task | null) => void
}

export function TaskWidget({ onFocusChange }: TaskWidgetProps) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)
  const [focusedTask, setFocusedTask] = useState<Task | null>(null)
  const popupRef = useRef<HTMLDivElement>(null)
  
  // Fetch tasks
  const { tasks, loading, refetch, refetchStats } = useTasks({
    page_size: 50,
    sort_by: 'created_at',
    sort_order: 'desc',
  })
  
  const { createTask, toggleTask, loading: mutating } = useTaskMutations()

  // Notify parent when focused task changes
  useEffect(() => {
    onFocusChange?.(focusedTask)
  }, [focusedTask, onFocusChange])

  // Close on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popupRef.current && !popupRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Close on Escape
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      return () => document.removeEventListener('keydown', handleEscape)
    }
  }, [isOpen])

  const handleCreateTask = async (title: string, priority: TaskPriority) => {
    try {
      await createTask({ title, priority })
      refetch()
      refetchStats()
    } catch (err) {
      console.error('Failed to create task:', err)
    }
  }

  const handleToggleTask = async (id: string) => {
    try {
      await toggleTask(id)
      if (focusedTask?.id === id) {
        setFocusedTask(null)
      }
      refetch()
      refetchStats()
    } catch (err) {
      console.error('Failed to toggle task:', err)
    }
  }

  const handleFocusTask = (task: Task) => {
    setFocusedTask(task)
    setIsOpen(false)
  }

  // Sort: pending first
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })

  const completedCount = tasks.filter(t => t.completed).length

  return (
    <>
      {/* Floating Button - Fixed position, vertically centered */}
      <button
        onClick={() => setIsOpen(v => !v)}
        className={`
          fixed left-6 top-1/2 -translate-y-1/2 z-40
          p-3.5 rounded-2xl
          backdrop-blur-md border shadow-lg
          transition-all duration-300 ease-out
          ${isOpen 
            ? 'bg-white/25 border-white/40 text-white scale-95' 
            : 'bg-white/15 border-white/25 text-white/80 hover:bg-white/20 hover:text-white hover:scale-105'
          }
        `}
        title="Tasks"
      >
        <ListTodo className="w-5 h-5" />
        {/* Badge for pending tasks */}
        {tasks.filter(t => !t.completed).length > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {tasks.filter(t => !t.completed).length}
          </span>
        )}
      </button>

      {/* Popup Panel - Vertically centered */}
      {isOpen && (
        <div 
          ref={popupRef}
          className="
            fixed left-16 top-1/2 -translate-y-1/2 z-50
            w-80 max-h-[65vh]
            bg-black/40 backdrop-blur-xl
            border border-white/20 rounded-2xl
            shadow-2xl overflow-hidden
            flex flex-col
            animate-in fade-in slide-in-from-left-4 duration-300
          "
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <ListTodo className="w-4 h-4 text-white/70" />
              <span className="text-sm font-medium text-white">Tasks</span>
              {loading && <Loader2 className="w-3 h-3 text-white/50 animate-spin" />}
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Add */}
          <div className="border-b border-white/10">
            <QuickTaskForm onSubmit={handleCreateTask} loading={mutating} />
          </div>

          {/* Focused Task Display */}
          {focusedTask && (
            <div className="px-3 py-2 bg-blue-500/20 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className="text-xs text-blue-300">Đang focus:</span>
                <span className="text-sm text-white truncate flex-1">{focusedTask.title}</span>
                <button
                  onClick={() => setFocusedTask(null)}
                  className="p-0.5 text-white/50 hover:text-white transition-colors"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            </div>
          )}

          {/* Task List */}
          <div className="flex-1 overflow-y-auto p-2 space-y-0.5">
            {loading && tasks.length === 0 ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-white/40 text-sm">Chưa có task</p>
              </div>
            ) : (
              sortedTasks.map((task) => (
                <PomodoroTaskItem
                  key={task.id}
                  task={task}
                  isFocused={focusedTask?.id === task.id}
                  onToggle={handleToggleTask}
                  onFocus={handleFocusTask}
                />
              ))
            )}
          </div>

          {/* Footer */}
          <div className="px-4 py-2.5 border-t border-white/10 flex items-center justify-between bg-black/20">
            <span className="text-xs text-white/50">
              <span className="text-green-400">{completedCount}</span>/{tasks.length} xong
            </span>
            <button
              onClick={() => router.push('/tasks')}
              className="flex items-center gap-1 text-xs text-white/60 hover:text-white transition-colors"
            >
              Xem tất cả
              <ExternalLink className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}

