import { useState } from 'react'
import { useTasks } from '../hooks/useTasks'
import { supabase } from '../lib/supabase'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import { cn } from '../lib/utils'
import { STATUS_LABELS, PRIORITY_LABELS, PRIORITY_COLORS } from '../lib/constants'
import type { TaskStatus } from '../types'

const columns: TaskStatus[] = ['todo', 'in_progress', 'in_review', 'done']

export function BoardPage() {
  const { tasks, loading, refetch } = useTasks()
  const [dragging, setDragging] = useState<string | null>(null)

  const getColumnTasks = (status: TaskStatus) =>
    tasks.filter((t) => t.status === status)

  const handleDrop = async (taskId: string, newStatus: TaskStatus) => {
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    refetch()
  }

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Board</h1>
        <Link
          to="/tasks/new"
          className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors lg:px-4"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Task</span>
        </Link>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 lg:gap-4">
        {columns.map((status) => (
          <div
            key={status}
            className="flex min-w-[260px] flex-1 flex-col rounded-xl bg-gray-100 dark:bg-gray-800/50 lg:min-w-[280px]"
            onDragOver={(e) => { e.preventDefault(); setDragging(status) }}
            onDragLeave={() => setDragging(null)}
            onDrop={(e) => {
              e.preventDefault()
              const taskId = e.dataTransfer.getData('taskId')
              if (taskId) handleDrop(taskId, status)
              setDragging(null)
            }}
          >
            <div className="flex items-center justify-between px-3 py-2 lg:px-4 lg:py-3">
              <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 lg:text-base">{STATUS_LABELS[status]}</h3>
              <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                {getColumnTasks(status).length}
              </span>
            </div>

            <div className={cn('flex flex-col gap-2 px-2 pb-3 lg:gap-3 lg:px-3', dragging === status && 'bg-primary/5 rounded-lg')}>
              {getColumnTasks(status).map((task) => (
                <Link
                  key={task.id}
                  to={`/tasks/${task.id}`}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                  className="rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-shadow hover:shadow-md dark:border-gray-700 dark:bg-gray-800 lg:p-4"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <Badge variant={
                      task.priority === 'critical' ? 'danger' :
                      task.priority === 'high' ? 'warning' :
                      task.priority === 'medium' ? 'info' : 'default'
                    }>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
                  {task.due_date && (
                    <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      Due: {new Date(task.due_date).toLocaleDateString()}
                    </p>
                  )}
                  {task.task_assignees && task.task_assignees.length > 0 && (
                    <div className="mt-2 flex items-center gap-1 lg:mt-3">
                      {task.task_assignees.slice(0, 3).map((a) => (
                        <div key={a.user_id} className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white lg:h-6 lg:w-6">
                          {a.users?.name?.charAt(0) || '?'}
                        </div>
                      ))}
                      {task.task_assignees.length > 3 && (
                        <span className="text-xs text-gray-400">+{task.task_assignees.length - 3}</span>
                      )}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
