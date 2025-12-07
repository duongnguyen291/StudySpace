'use client'

import { CheckCircle2, Circle, Target } from 'lucide-react'
import type { Task } from '../types/task.types'

interface PomodoroTaskItemProps {
  task: Task
  isFocused?: boolean
  onToggle: (id: string) => void
  onFocus: (task: Task) => void
}

export function PomodoroTaskItem({ 
  task, 
  isFocused = false,
  onToggle, 
  onFocus 
}: PomodoroTaskItemProps) {
  const priorityColors = {
    low: 'bg-green-400',
    medium: 'bg-yellow-400',
    high: 'bg-red-400',
  }

  return (
    <div 
      className={`
        group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer
        transition-all duration-200
        ${isFocused 
          ? 'bg-white/20 border border-white/30' 
          : 'hover:bg-white/10 border border-transparent'
        }
        ${task.completed ? 'opacity-50' : ''}
      `}
      onClick={() => !task.completed && onFocus(task)}
    >
      {/* Checkbox */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          onToggle(task.id)
        }}
        className="flex-shrink-0 text-white/70 hover:text-white transition-colors"
      >
        {task.completed ? (
          <CheckCircle2 className="w-5 h-5 text-green-400" />
        ) : (
          <Circle className="w-5 h-5 hover:text-green-400" />
        )}
      </button>

      {/* Task Title */}
      <span 
        className={`
          flex-1 text-sm text-white truncate
          ${task.completed ? 'line-through text-white/50' : ''}
        `}
      >
        {task.title}
      </span>

      {/* Focus Indicator */}
      {isFocused && !task.completed && (
        <Target className="w-4 h-4 text-blue-400 flex-shrink-0" />
      )}

      {/* Priority Dot */}
      <div 
        className={`w-2 h-2 rounded-full flex-shrink-0 ${priorityColors[task.priority]}`}
        title={`Priority: ${task.priority}`}
      />
    </div>
  )
}

