import { NavLink } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { LayoutDashboard, ListTodo, Users } from 'lucide-react'

export function MobileTabBar() {
  const linkClass = ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-medium transition-colors',
      isActive ? 'text-primary' : 'text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300'
    )

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 flex items-center border-t border-gray-200 bg-white pb-safe dark:border-gray-700 dark:bg-gray-900 lg:hidden">
      <NavLink to="/dashboard" end className={linkClass}>
        {({ isActive }) => (
          <>
            <LayoutDashboard className={cn('h-5 w-5', isActive && 'fill-primary/10')} />
            <span>Dashboard</span>
          </>
        )}
      </NavLink>

      <div className="relative -mt-4 flex flex-1 justify-center">
        <NavLink
          to="/tasks"
          className={({ isActive }) =>
            cn(
              'flex flex-col items-center gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-white' : 'text-white'
            )
          }
        >
          {({ isActive }) => (
            <>
              <div className={cn(
                'flex h-14 w-14 items-center justify-center rounded-full transition-all -mt-1',
                isActive
                  ? 'bg-primary shadow-lg shadow-primary/40 scale-110'
                  : 'bg-primary shadow-md'
              )}>
                <ListTodo className="h-6 w-6 text-white" />
              </div>
              <span className={cn('mt-0.5', isActive ? 'text-primary font-semibold' : 'text-gray-400')}>Tasks</span>
            </>
          )}
        </NavLink>
      </div>

      <NavLink to="/team" className={linkClass}>
        {({ isActive }) => (
          <>
            <Users className={cn('h-5 w-5', isActive && 'fill-primary/10')} />
            <span>Team</span>
          </>
        )}
      </NavLink>
    </nav>
  )
}
