import { TasksPage } from '@/features/tasks'
import { ToastProvider } from '@/shared/components'

export default function Tasks() {
  return (
    <ToastProvider>
      <TasksPage />
    </ToastProvider>
  )
}