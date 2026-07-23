import { useEffect, useState, useRef } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { DashboardSkeleton } from '../components/ui/PageSkeleton'
import { Badge } from '../components/ui/Badge'
import { Link } from 'react-router-dom'
import { ListTodo, CheckCircle2, Clock, AlertTriangle, LogOut, User } from 'lucide-react'
import { formatDate, isOverdue } from '../lib/utils'
import { STATUS_LABELS } from '../lib/constants'

export function DashboardPage() {
  const { profile, signOut } = useAuth()
  const { tasks, loading } = useTasks()
  const navigate = useNavigate()
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, overdue: 0 })
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  useEffect(() => {
    if (!tasks.length) return
    const completed = tasks.filter((t) => t.status === 'done').length
    const inProgress = tasks.filter((t) => t.status === 'partially_done').length
    const overdue = tasks.filter((t) => !t.completed_at && isOverdue(t.due_date)).length
    setStats({ total: tasks.length, completed, inProgress, overdue })
  }, [tasks])

  if (loading) return <DashboardSkeleton />

  const recentTasks = tasks.slice(0, 5)

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Dashboard</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 lg:text-base">Welcome back, {profile?.name}</p>
        </div>
        <div className="relative lg:hidden" ref={menuRef}>
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-10 w-10 rounded-full ring-2 ring-primary/20" />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-sm font-medium text-white ring-2 ring-primary/20">
                {profile?.name?.charAt(0) || 'U'}
              </div>
            )}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-full mt-2 w-40 rounded-xl border border-gray-200 bg-white py-1 shadow-lg dark:border-gray-700 dark:bg-gray-800">
              <button onClick={() => { setMenuOpen(false); navigate('/profile') }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700">
                <User className="h-4 w-4" /> Profile
              </button>
              <hr className="my-1 border-gray-200 dark:border-gray-700" />
              <button onClick={() => { setMenuOpen(false); signOut() }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                <LogOut className="h-4 w-4" /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { label: 'Total', value: stats.total, icon: ListTodo, color: 'text-primary', bg: 'bg-primary-light dark:bg-primary/20' },
          { label: 'Completed', value: stats.completed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100 dark:bg-emerald-900/30' },
          { label: 'In Progress', value: stats.inProgress, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100 dark:bg-amber-900/30' },
          { label: 'Overdue', value: stats.overdue, icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100 dark:bg-red-900/30' },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 lg:text-sm">{label}</p>
                <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">{value}</p>
              </div>
              <div className={`rounded-lg p-2 lg:p-3 ${bg}`}><Icon className={`h-5 w-5 lg:h-6 lg:w-6 ${color}`} /></div>
            </div>
          </div>
        ))}
      </div>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700 lg:px-6 lg:py-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">Recent Tasks</h2>
          <Link to="/tasks" className="text-xs text-primary hover:underline lg:text-sm">View All</Link>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {recentTasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-gray-50 dark:hover:bg-gray-750 lg:px-6 lg:py-3">
              <div className="flex items-center gap-2 lg:gap-3">
                <span className="text-sm font-medium text-gray-900 dark:text-white">{task.description || task.title}</span>
              </div>
              <div className="hidden items-center gap-3 text-sm text-gray-500 sm:flex">
                <span>{STATUS_LABELS[task.status]}</span>
                {task.due_date && <span>{isOverdue(task.due_date) ? '🔴' : '📅'} {formatDate(task.due_date)}</span>}
              </div>
            </Link>
          ))}
          {recentTasks.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-400 lg:px-6">No tasks yet. Create your first task!</p>}
        </div>
      </div>
    </div>
  )
}
