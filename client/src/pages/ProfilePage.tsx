import { useContext } from 'react'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { ThemeContext } from '../contexts/ThemeContext'
import { Mail, ClipboardList, CheckCircle2, LogOut, Sun, Moon } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { formatDate } from '../lib/utils'

export function ProfilePage() {
  const { profile, signOut } = useAuth()
  const { tasks } = useTasks()
  const { dark, toggle } = useContext(ThemeContext)

  if (!profile) return null

  const myTasks = tasks.filter((t) => t.created_by === profile.id)
  const completed = myTasks.filter((t) => t.status === 'done').length

  return (
    <div className="mx-auto max-w-2xl space-y-4 lg:space-y-6">
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 lg:p-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full lg:h-16 lg:w-16" />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-medium text-white lg:h-16 lg:w-16 lg:text-2xl">
              {profile.name?.charAt(0) || 'U'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-lg font-bold text-gray-900 dark:text-white lg:text-xl">{profile.name || 'User'}</h1>
            <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500">
              <Mail className="h-4 w-4 flex-shrink-0" />
              <span className="truncate">{profile.email}</span>
            </div>
            <span className="mt-1 inline-block rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium capitalize text-primary dark:bg-primary/20 dark:text-primary-light">
              {profile.role}
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-primary-light p-2 dark:bg-primary/20 lg:p-3">
              <ClipboardList className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">{myTasks.length}</p>
              <p className="text-xs text-gray-500 lg:text-sm">Total Tasks</p>
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
          <div className="flex items-center gap-3">
            <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30 lg:p-3">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">{completed}</p>
              <p className="text-xs text-gray-500 lg:text-sm">Completed</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <button
          onClick={toggle}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-gray-700 lg:p-5"
        >
          <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900/30 lg:p-3">
            {dark ? <Sun className="h-5 w-5 text-amber-600" /> : <Moon className="h-5 w-5 text-amber-600" />}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p>
            <p className="text-xs text-gray-500">{dark ? 'Light Mode' : 'Dark Mode'}</p>
          </div>
        </button>

        <button
          onClick={signOut}
          className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 transition-colors hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-red-900/20 lg:p-5"
        >
          <div className="rounded-lg bg-red-100 p-2 dark:bg-red-900/30 lg:p-3">
            <LogOut className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Sign Out</p>
            <p className="text-xs text-gray-500">Log out of your account</p>
          </div>
        </button>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 lg:px-6 lg:py-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">My Recent Tasks</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {myTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="px-4 py-3 lg:px-6 lg:py-3">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</p>
              <p className="text-xs text-gray-500">Created {formatDate(task.created_at)}</p>
            </div>
          ))}
          {myTasks.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-gray-400 lg:px-6">No tasks created yet</p>
          )}
        </div>
      </div>
    </div>
  )
}
