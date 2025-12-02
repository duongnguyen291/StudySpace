'use client'

import { format, isPast, isToday, isTomorrow } from 'date-fns'
import { CheckCircle2, Circle, Trash2, Edit2, Calendar, AlertCircle, Tag, Square, CheckSquare } from 'lucide-react'
import type { Task } from '../types/task.types'
import type { Category } from '../types/category.types'
import { Button } from '@/shared/components/Button'

interface TaskItemProps {
  task: Task
  category?: Category
  selected?: boolean
  selectionMode?: boolean
  onToggle: (id: string) => void
  onDelete: (id: string) => void
  onEdit: (task: Task) => void
  onSelect?: (id: string) => void
}

export function TaskItem({ 
  task, 
  category,
  selected = false,
  selectionMode = false,
  onToggle, 
  onDelete, 
  onEdit,
  onSelect 
}: TaskItemProps) {
  const priorityConfig = {
    low: { color: 'text-green-400', bg: 'bg-green-500/10', label: 'Low' },
    medium: { color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Medium' },
    high: { color: 'text-red-400', bg: 'bg-red-500/10', label: 'High' },
  }

  const priority = priorityConfig[task.priority]

  const getDueDateStatus = () => {
    if (!task.due_date) return null
    const dueDate = new Date(task.due_date)
    
    if (task.completed) return { label: 'Completed', color: 'text-green-400 bg-green-500/10' }
    if (isPast(dueDate) && !isToday(dueDate)) return { label: 'Overdue', color: 'text-red-400 bg-red-500/10' }
    if (isToday(dueDate)) return { label: 'Today', color: 'text-orange-400 bg-orange-500/10' }
    if (isTomorrow(dueDate)) return { label: 'Tomorrow', color: 'text-yellow-400 bg-yellow-500/10' }
    return null
  }

  const dueDateStatus = getDueDateStatus()

  return (
    <div 
      className={`
        group bg-gray-800/50 backdrop-blur-sm rounded-xl p-4 border transition-all duration-200
        ${selected ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700/50 hover:border-gray-600/50'}
        ${task.completed ? 'opacity-60' : ''}
        animate-fade-in
      `}
    >
      <div className="flex items-start gap-3">
        {/* Selection / Complete Checkbox */}
        {selectionMode ? (
          <button
            onClick={() => onSelect?.(task.id)}
            className="mt-1 flex-shrink-0 text-gray-400 hover:text-blue-400 transition-colors"
          >
            {selected ? (
              <CheckSquare className="w-5 h-5 text-blue-400" />
            ) : (
              <Square className="w-5 h-5" />
            )}
          </button>
        ) : (
          <button
            onClick={() => onToggle(task.id)}
            className="mt-1 flex-shrink-0 text-gray-400 hover:text-white transition-colors group/check"
          >
            {task.completed ? (
              <CheckCircle2 className="w-5 h-5 text-green-400" />
            ) : (
              <Circle className="w-5 h-5 group-hover/check:text-green-400" />
            )}
          </button>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className={`text-base font-medium leading-tight ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
              {task.title}
            </h3>
            
            {/* Actions - visible on hover */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(task)}
                className="!p-1.5 text-gray-400 hover:text-white hover:bg-gray-700/50"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(task.id)}
                className="!p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
          
          {task.description && (
            <p className="text-sm text-gray-400 mt-1 line-clamp-2">
              {task.description}
            </p>
          )}

          {/* Meta Info */}
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            {/* Priority */}
            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md ${priority.color} ${priority.bg}`}>
              <AlertCircle className="w-3 h-3" />
              {priority.label}
            </span>

            {/* Category */}
            {category && (
              <span 
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md"
                style={{ 
                  color: category.color, 
                  backgroundColor: `${category.color}15`
                }}
              >
                <Tag className="w-3 h-3" />
                {category.name}
              </span>
            )}

            {/* Due Date */}
            {task.due_date && (
              <span className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-md ${dueDateStatus?.color || 'text-gray-400 bg-gray-500/10'}`}>
                <Calendar className="w-3 h-3" />
                {dueDateStatus?.label || format(new Date(task.due_date), 'MMM dd')}
                {!dueDateStatus && ` - ${format(new Date(task.due_date), 'MMM dd, yyyy')}`}
              </span>
            )}

            {/* Completed At */}
            {task.completed && task.completed_at && (
              <span className="text-xs text-green-400/70">
                ✓ {format(new Date(task.completed_at), 'MMM dd')}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
