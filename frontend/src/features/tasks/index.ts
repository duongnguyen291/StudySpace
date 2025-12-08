/**
 * Tasks Feature Module
 * Public API exports
 */

// Pages
export { TasksPage } from './pages/TasksPage'

// Components
export { TaskList } from './components/TaskList'
export { TaskItem } from './components/TaskItem'
export { TaskForm } from './components/TaskForm'
export { PomodoroTaskItem } from './components/PomodoroTaskItem'
export { QuickTaskForm } from './components/QuickTaskForm'
export { TaskWidget } from './components/TaskWidget'

// Hooks
export { useTasks } from './hooks/useTasks'
export { useTaskMutations } from './hooks/useTaskMutations'
export { useCategories } from './hooks/useCategories'

// Services
export { taskService } from './services/taskService'
export { categoryService } from './services/categoryService'

// Task Types
export type {
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  TaskFilter,
  TaskStats,
  TaskPriority,
  BulkActionResponse,
} from './types/task.types'

// Category Types
export type {
  Category,
  CategoryCreate,
  CategoryUpdate,
  CategoryListResponse,
} from './types/category.types'