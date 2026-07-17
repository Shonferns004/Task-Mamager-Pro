import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import { LayoutDashboard, Columns3, ListTodo, Users, LogOut, ClipboardList } from 'lucide-react'
const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/board', icon: Columns3, label: 'Board' },
  { to: '/tasks', icon: ListTodo, label: 'Tasks' },
  { to: '/team', icon: Users, label: 'Team' },
]

export function Sidebar() {
  const { signOut } = useAuth()

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
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary-light text-primary dark:bg-primary/20 dark:text-primary-light'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800'
              )
            }
          >
            <item.icon className="h-5 w-5" />
            {item.label}
          </NavLink>
        ))}

      </nav>

      <div className="border-t border-gray-200 p-3 dark:border-gray-700">
        <button
          onClick={() => signOut()}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
