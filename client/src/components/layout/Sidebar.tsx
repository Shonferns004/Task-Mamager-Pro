import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, Columns3, Users, ClipboardList, Table2 } from 'lucide-react'

export function Sidebar() {
  const { isAdmin } = useAuth()

  return (
    <aside className="flex h-full w-64 flex-col border-r border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
      <div className="flex items-center gap-3 border-b border-gray-200 px-6 py-5 dark:border-gray-700">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
          <ClipboardList className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">UCS Tasks</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">Task Manager</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-light'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')
          }
        >
          <LayoutDashboard className="h-5 w-5" /> Dashboard
        </NavLink>

        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-light'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')
          }
        >
          <Columns3 className="h-5 w-5" /> Tasks
        </NavLink>

        {isAdmin && (
          <NavLink
            to="/tasks/list"
            className={({ isActive }) =>
              cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-light'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')
            }
          >
            <Table2 className="h-5 w-5" /> All Tasks
          </NavLink>
        )}

        <NavLink
          to="/team"
          className={({ isActive }) =>
            cn('flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
              isActive ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-light'
                : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800')
          }
        >
          <Users className="h-5 w-5" /> Team
        </NavLink>
      </nav>
    </aside>
  )
}
