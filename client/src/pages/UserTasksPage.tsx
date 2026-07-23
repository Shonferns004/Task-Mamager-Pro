import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../lib/api'
import { useTasks } from '../hooks/useTasks'
import { UserTasksSkeleton } from '../components/ui/PageSkeleton'
import { Badge } from '../components/ui/Badge'
import { ArrowLeft, Circle, Clock, CheckCircle2, Calendar, Mail } from 'lucide-react'
import { formatDate, isOverdue } from '../lib/utils'
import { STATUS_LABELS, PRIORITY_LABELS } from '../lib/constants'
import type { User, TaskStatus } from '../types'

const statusIcons: Record<TaskStatus, typeof Circle> = {
  pending: Circle, partially_done: Clock, done: CheckCircle2,
}

export function UserTasksPage() {
  const { userId } = useParams<{ userId: string }>()
  const { tasks, loading: tasksLoading } = useTasks()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!userId) return
    api.getUsers().then(({ users: data }) => {
      const found = data.find((u: any) => u.id === userId)
      setUser(found || null)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [userId])

  if (loading || tasksLoading) return <UserTasksSkeleton />
  if (!user) return <p className="mt-20 text-center text-gray-500">User not found</p>

  const userTasks = tasks.filter(
    (t) => t.created_by === userId || t.task_assignees?.some((a) => a.user_id === userId)
  )
  const statusOrder: TaskStatus[] = ['pending', 'partially_done', 'done']

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/team" className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-primary">
        <ArrowLeft className="h-4 w-4" /> Back to Team
      </Link>

      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-4">
          {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-14 w-14 rounded-full" />
            : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-medium text-white">{user.name?.charAt(0) || 'U'}</div>}
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">{user.name || 'Unknown'}</h1>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500"><Mail className="h-4 w-4" />{user.email}</div>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
              <span><strong className="text-gray-900 dark:text-white">{userTasks.length}</strong> total tasks</span>
              <span><strong className="text-emerald-600">{userTasks.filter((t) => t.status === 'done').length}</strong> completed</span>
              <span><strong className="text-amber-600">{userTasks.filter((t) => t.status === 'partially_done').length}</strong> active</span>
            </div>
          </div>
        </div>
      </div>

      {statusOrder.map((status) => {
        const statusTasks = userTasks.filter((t) => t.status === status)
        if (!statusTasks.length) return null
        const Icon = statusIcons[status]
        return (
          <div key={status} className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
            <div className="flex items-center gap-2 border-b border-gray-200 px-5 py-3 dark:border-gray-700">
              <Icon className="h-4 w-4 text-gray-500" />
              <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{STATUS_LABELS[status]}</h2>
              <span className="text-xs text-gray-400">({statusTasks.length})</span>
            </div>
            <div className="divide-y divide-gray-100 dark:divide-gray-700">
              {statusTasks.map((task) => (
                <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center justify-between px-5 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
                    {task.due_date && <p className={`mt-0.5 flex items-center gap-1 text-xs ${isOverdue(task.due_date) && status !== 'done' ? 'text-red-500' : 'text-gray-400'}`}>
                      <Calendar className="h-3 w-3" />{formatDate(task.due_date)}
                    </p>}
                  </div>
                  <Badge variant={
                    task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' :
                    task.priority === 'medium' ? 'info' : 'default'
                  }>{PRIORITY_LABELS[task.priority]}</Badge>
                </Link>
              ))}
            </div>
          </div>
        )
      })}

      {userTasks.length === 0 && (
        <p className="py-12 text-center text-sm text-gray-400">No tasks found for this user</p>
      )}
    </div>
  )
}
