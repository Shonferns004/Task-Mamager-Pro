import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { useTasks } from '../hooks/useTasks'
import { Spinner } from '../components/ui/Spinner'
import { Badge } from '../components/ui/Badge'
import { Mail } from 'lucide-react'
import type { User } from '../types'

export function TeamPage() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const { tasks } = useTasks()

  useEffect(() => {
    api.getUsers().then(({ users: data }) => { setUsers(data as User[]); setLoading(false) }).catch(() => setLoading(false))
  }, [])

  if (loading) return <Spinner className="mt-20" />

  return (
    <div className="space-y-4 lg:space-y-6">
      <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Team</h1>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 lg:gap-4">
        {users.map((user) => {
          const taskCount = tasks.filter((t) => t.created_by === user.id || t.task_assignees?.some((a) => a.user_id === user.id)).length
          return (
            <div key={user.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
              <div className="flex items-center gap-3 lg:gap-4">
                {user.avatar_url ? <img src={user.avatar_url} alt="" className="h-10 w-10 rounded-full lg:h-12 lg:w-12" />
                  : <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-base font-medium text-white lg:h-12 lg:w-12 lg:text-lg">{user.name?.charAt(0) || 'U'}</div>}
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">{user.name || 'Unknown'}</h3>
                  <div className="flex items-center gap-1 mt-0.5">
                    <Mail className="h-3 w-3 flex-shrink-0 text-gray-400" />
                    <span className="text-xs text-gray-500 truncate dark:text-gray-400 lg:text-sm">{user.email}</span>
                  </div>
                </div>
                {user.role === 'admin' && <Badge variant="info">Admin</Badge>}
              </div>
              <div className="mt-3 text-sm text-gray-500 dark:text-gray-400 lg:mt-4">
                <strong className="text-gray-900 dark:text-white">{taskCount}</strong> tasks
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
