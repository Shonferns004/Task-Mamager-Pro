import { useAuth } from '../../hooks/useAuth'
import { useContext } from 'react'
import { ThemeContext } from '../../contexts/ThemeContext'
import { Sun, Moon, ClipboardList } from 'lucide-react'

export function Header() {
  const { profile } = useAuth()
  const { dark, toggle } = useContext(ThemeContext)

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-200 bg-white px-4 dark:border-gray-700 dark:bg-gray-900 lg:h-16 lg:px-6">
      <div className="flex items-center gap-3 lg:hidden">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-white">
          <ClipboardList className="h-4 w-4" />
        </div>
        <span className="text-sm font-bold text-gray-900 dark:text-white">UCS Tasks</span>
      </div>
      <div className="hidden lg:block" />
      <div className="flex items-center gap-3">
        <button
          onClick={toggle}
          className="rounded-lg p-2 text-gray-500 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800"
        >
          {dark ? <Sun className="h-4 w-4 lg:h-5 lg:w-5" /> : <Moon className="h-4 w-4 lg:h-5 lg:w-5" />}
        </button>
        {profile && (
          <div className="flex items-center gap-2 lg:gap-3">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{profile.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{profile.role}</p>
            </div>
            {profile.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="h-8 w-8 rounded-full lg:h-9 lg:w-9" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-medium text-white lg:h-9 lg:w-9 lg:text-sm">
                {profile.name?.charAt(0) || 'U'}
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  )
}
