'use client'

import { TaskItem } from './TaskItem'
import type { Task } from '../types/task.types'
import type { Category } from '../types/category.types'
import { CheckCircle2, ListTodo } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
  categories: Category[]
  loading: boolean
  selectedIds: string[]
  selectionMode: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onSelect: (id: string) => void
}

// Loading Skeleton
function TaskSkeleton() {
  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border border-gray-700/50 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-5 h-5 bg-gray-700 rounded-full mt-1" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-700 rounded w-3/4" />
          <div className="h-4 bg-gray-700/50 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-6 w-16 bg-gray-700/50 rounded" />
            <div className="h-6 w-20 bg-gray-700/50 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}

// Empty State Component
function EmptyState({ hasFilters }: { hasFilters: boolean }) {
  return (
    <div className="text-center py-16 animate-fade-in">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-800/50 mb-6">
        {hasFilters ? (
          <ListTodo className="w-10 h-10 text-gray-500" />
        ) : (
          <CheckCircle2 className="w-10 h-10 text-gray-500" />
        )}
      </div>
      <h3 className="text-xl font-semibold text-gray-300 mb-2">
        {hasFilters ? 'No matching tasks' : 'No tasks yet'}
      </h3>
      <p className="text-gray-500 max-w-sm mx-auto">
        {hasFilters 
          ? 'Try adjusting your filters or search query'
          : 'Create your first task to get started on your productivity journey!'
        }
      </p>
    </div>
  )
}

export function TaskList({ 
  tasks, 
  categories,
  loading, 
  selectedIds,
  selectionMode,
  onToggle, 
  onDelete, 
  onEdit,
  onSelect 
}: TaskListProps) {
  // Create a map for quick category lookup
  const categoryMap = new Map(categories.map(cat => [cat.id, cat]))

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <TaskSkeleton key={i} />
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return <EmptyState hasFilters={false} />
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.id}
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <TaskItem
            task={task}
            category={task.category_id ? categoryMap.get(task.category_id) : undefined}
            selected={selectedIds.includes(task.id)}
            selectionMode={selectionMode}
            onToggle={onToggle}
            onDelete={onDelete}
            onEdit={onEdit}
            onSelect={onSelect}
          />
        </div>
      ))}
    </div>
  )
}
