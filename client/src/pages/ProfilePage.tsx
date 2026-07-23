import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '@clerk/clerk-react'
import { useAuth } from '../hooks/useAuth'
import { useTasks } from '../hooks/useTasks'
import { api } from '../lib/api'
import { ProfileSkeleton } from '../components/ui/PageSkeleton'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Mail, ClipboardList, CheckCircle2, Lock, Eye, EyeOff, LogOut } from 'lucide-react'

export function ProfilePage() {
  const { profile, signOut, refreshProfile } = useAuth()
  const { user } = useUser()
  const { tasks, loading: tasksLoading } = useTasks()
  const navigate = useNavigate()

  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(profile?.name || '')
  const [saving, setSaving] = useState(false)
  const [pwOpen, setPwOpen] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [showCur, _setShowCur] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (tasksLoading || !profile) return <ProfileSkeleton />

  const myTasks = tasks.filter((t) => t.created_by === profile.id)
  const completed = myTasks.filter((t) => t.status === 'done').length

  const handleSaveName = async () => {
    if (!name.trim()) return
    setSaving(true)
    setError('')
    try {
      await api.updateUser({ name: name.trim() })
      refreshProfile?.()
      setEditing(false)
    } catch (err: any) {
      setError(err.message || 'Failed to update')
    }
    setSaving(false)
  }

  const handleChangePassword = async () => {
    if (!currentPw || !newPw) return
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await (user as any)?.update({ password: newPw })
      setSuccess('Password updated!')
      setCurrentPw('')
      setNewPw('')
      setPwOpen(false)
    } catch (err: any) {
      setError(err.errors?.[0]?.longMessage || err.message || 'Failed to update password')
    }
    setSaving(false)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4 lg:space-y-6">
      {/* Profile Card */}
      <div className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-800 lg:p-6">
        <div className="flex items-center gap-4">
          {profile.avatar_url ? <img src={profile.avatar_url} alt="" className="h-14 w-14 rounded-full lg:h-16 lg:w-16" />
            : <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary text-xl font-medium text-white lg:h-16 lg:w-16 lg:text-2xl">{profile.name?.charAt(0) || 'U'}</div>}
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="flex items-center gap-2">
                <Input id="edit-name" value={name} onChange={(e) => setName(e.target.value)} className="!w-48" />
                <Button size="sm" onClick={handleSaveName} loading={saving}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <>
                <h1 className="text-lg font-bold text-gray-900 dark:text-white lg:text-xl">{profile.name || 'User'}</h1>
                <div className="flex items-center gap-2 mt-0.5 text-sm text-gray-500"><Mail className="h-4 w-4 flex-shrink-0" /><span className="truncate">{profile.email}</span></div>
                <div className="flex items-center gap-3 mt-1">
                  <span className="inline-block rounded-full bg-primary-light px-2.5 py-0.5 text-xs font-medium capitalize text-primary dark:bg-primary/20 dark:text-primary-light">{profile.role}</span>
                  <button onClick={() => { setName(profile.name || ''); setEditing(true) }} className="text-xs text-primary hover:underline">Edit name</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:gap-4">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-primary-light p-2 dark:bg-primary/20 lg:p-3"><ClipboardList className="h-5 w-5 text-primary" /></div><div><p className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">{myTasks.length}</p><p className="text-xs text-gray-500 lg:text-sm">Total Tasks</p></div></div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
          <div className="flex items-center gap-3"><div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900/30 lg:p-3"><CheckCircle2 className="h-5 w-5 text-emerald-600" /></div><div><p className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">{completed}</p><p className="text-xs text-gray-500 lg:text-sm">Completed</p></div></div>
        </div>
      </div>

      {/* Change Password */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <button onClick={() => setPwOpen(!pwOpen)} className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
          <Lock className="h-5 w-5 text-gray-500" />
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-900 dark:text-white">Password</p>
            <p className="text-xs text-gray-500">Set or change your password</p>
          </div>
        </button>
        {pwOpen && (
          <div className="border-t border-gray-200 px-5 py-4 space-y-3 dark:border-gray-700">
            <input type={showCur ? 'text' : 'password'} value={currentPw} onChange={(e) => setCurrentPw(e.target.value)}
              placeholder="Current password" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
            <div className="relative">
              <input type={showNew ? 'text' : 'password'} value={newPw} onChange={(e) => setNewPw(e.target.value)}
                placeholder="New password" className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10 text-sm focus:border-primary focus:outline-none dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100" />
              <button type="button" onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            {success && <p className="text-sm text-emerald-600">{success}</p>}
            <Button size="sm" onClick={handleChangePassword} loading={saving} disabled={!currentPw || !newPw}>Update Password</Button>
          </div>
        )}
      </div>

      {/* Sign Out */}
      <button onClick={() => { signOut(); navigate('/login') }}
        className="flex w-full items-center gap-3 rounded-xl border border-gray-200 bg-white px-5 py-4 text-left transition-colors hover:bg-red-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:bg-red-900/20">
        <LogOut className="h-5 w-5 text-red-500" />
        <div>
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Sign Out</p>
          <p className="text-xs text-gray-500">Log out of your account</p>
        </div>
      </button>

      {/* Recent Tasks */}
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 lg:px-6 lg:py-4"><h2 className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">My Recent Tasks</h2></div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {myTasks.slice(0, 5).map((task) => (
            <div key={task.id} className="px-4 py-3 lg:px-6 lg:py-3">                <p className="text-sm font-medium text-gray-900 dark:text-white">{task.description || task.title}</p><p className="text-xs text-gray-500">Created {formatDate(task.created_at)}</p></div>
          ))}
          {myTasks.length === 0 && <p className="px-4 py-8 text-center text-sm text-gray-400 lg:px-6">No tasks created yet</p>}
        </div>
      </div>
    </div>
  )
}

function formatDate(d: string) {
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(d))
}
