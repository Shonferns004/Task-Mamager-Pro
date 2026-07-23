import { useState, useMemo, useEffect } from 'react'
import { useTasks } from '../hooks/useTasks'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { TaskListSkeleton } from '../components/ui/PageSkeleton'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Link } from 'react-router-dom'
import { Plus, Search, ChevronRight, Printer, Download, Check } from 'lucide-react'
import { cn, formatDate, isOverdue } from '../lib/utils'
import { STATUS_LABELS, PRIORITY_LABELS } from '../lib/constants'
import type { TaskStatus, TaskPriority, User } from '../types'

const statusOptions = [
  { value: 'pending', label: 'Pending' },
  { value: 'partially_done', label: 'Partially Done' },
  { value: 'done', label: 'Done' },
]

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
  { value: 'critical', label: 'Critical' },
]

export function TaskListPage() {
  const { tasks, loading, refetch } = useTasks()
  const { isAdmin } = useAuth()
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<TaskStatus | ''>('')
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | ''>('')
  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newStatus, setNewStatus] = useState<TaskStatus>('pending')
  const [newPriority, setNewPriority] = useState<TaskPriority>('medium')
  const [users, setUsers] = useState<User[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])
  const [stats, setStats] = useState({ total: 0, completed: 0, inProgress: 0, overdue: 0 })

  useEffect(() => { api.getUsers().then(({ users: data }) => setUsers(data as User[])).catch(() => {}) }, [])
  useEffect(() => {
    if (!isAdmin) return
    const completed = tasks.filter((t) => t.status === 'done').length
    const inProgress = tasks.filter((t) => t.status === 'partially_done').length
    const overdue = tasks.filter((t) => !t.completed_at && isOverdue(t.due_date)).length
    setStats({ total: tasks.length, completed, inProgress, overdue })
  }, [tasks, isAdmin])

  const filtered = useMemo(() => tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false
    if (statusFilter && t.status !== statusFilter) return false
    if (priorityFilter && t.priority !== priorityFilter) return false
    return true
  }), [tasks, search, statusFilter, priorityFilter])

  const openCreate = () => { setNewTitle(''); setNewDesc(''); setNewStatus('pending'); setNewPriority('medium'); setSelectedAssignees([]); setShowCreate(true) }
  const handleCreate = async (e: React.FormEvent) => { e.preventDefault(); if (!newTitle.trim()) return; setSaving(true); await api.createTask({ title: newTitle.trim(), description: newDesc.trim(), status: newStatus, priority: newPriority, assignee_ids: selectedAssignees }); setSaving(false); setShowCreate(false); refetch() }
  const toggleAssignee = (userId: string) => setSelectedAssignees((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId])
  const handleExport = () => {
    const source = isAdmin ? tasks : filtered
    const csv = [['Title', 'Status', 'Priority', 'Owner', 'Due Date', 'Created'].join(','), ...source.map((t) => [t.title, t.status, t.priority, (t as any).created_by_user?.name || '', t.due_date || '', t.created_at].join(','))].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'ucs-tasks.csv'; a.click(); URL.revokeObjectURL(url)
  }

  if (loading) return <TaskListSkeleton />

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Tasks</h1>
        <div className="flex items-center gap-2">
          {isAdmin && (
            <><Button variant="secondary" size="sm" onClick={handleExport} className="hidden sm:inline-flex"><Download className="h-4 w-4" /> Export</Button>
              <Button size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /></Button>
              <Button size="sm" onClick={openCreate}><Plus className="h-4 w-4" /> <span className="hidden sm:inline">New</span></Button></>
          )}
          {!isAdmin && (
            <Link to="/tasks/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors lg:px-4"><Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Task</span></Link>
          )}
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task" className="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="m-title" label="Title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="Enter task title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe the task..." rows={2}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select id="m-status" label="Status" value={newStatus} onChange={(e) => setNewStatus(e.target.value as TaskStatus)} options={statusOptions} />
            <Select id="m-priority" label="Priority" value={newPriority} onChange={(e) => setNewPriority(e.target.value as TaskPriority)} options={priorityOptions} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignees</label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200 dark:border-gray-600 dark:divide-gray-700">
              {users.map((user) => (
                <label key={user.id} className={cn('flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors', selectedAssignees.includes(user.id) ? 'bg-primary-light/50' : 'hover:bg-gray-50 dark:hover:bg-gray-750')}>
                  <div className={cn('flex h-5 w-5 items-center justify-center rounded border-2 transition-colors', selectedAssignees.includes(user.id) ? 'border-primary bg-primary text-white' : 'border-gray-300')}>
                    {selectedAssignees.includes(user.id) && <Check className="h-3 w-3" />}
                  </div>
                  <input type="checkbox" checked={selectedAssignees.includes(user.id)} onChange={() => toggleAssignee(user.id)} className="sr-only" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">{user.name?.charAt(0) || 'U'}</div>
                  <span className="text-sm text-gray-900 dark:text-white">{user.name || user.email}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button type="submit" loading={saving}>Create Task</Button>
          </div>
        </form>
      </Modal>

      {isAdmin && (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
          {[{ label: 'Total Tasks', value: stats.total }, { label: 'Completed', value: stats.completed }, { label: 'In Progress', value: stats.inProgress }, { label: 'Overdue', value: stats.overdue }].map(({ label, value }) => (
            <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
              <p className="text-xs text-gray-500 lg:text-sm">{label}</p>
              <p className="mt-1 text-2xl font-bold text-gray-900 lg:text-3xl">{value}</p>
            </div>
          ))}
        </div>
      )}

      {isAdmin && tasks.length > 0 && (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 lg:mb-4">Tasks by Status</h3>
            <div className="space-y-2 lg:space-y-3">
              {(['pending', 'partially_done', 'done'] as TaskStatus[]).map((s) => {
                const count = tasks.filter((t) => t.status === s).length; const pct = Math.round((count / tasks.length) * 100)
                return (<div key={s}><div className="flex items-center justify-between text-sm"><span className="text-gray-700">{STATUS_LABELS[s]}</span><span className="font-medium text-gray-900">{count}</span></div><div className="mt-1 h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div></div>)
              })}
            </div>
          </div>
          <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-6">
            <h3 className="mb-3 text-sm font-semibold text-gray-900 lg:mb-4">Tasks by Priority</h3>
            <div className="space-y-2 lg:space-y-3">
              {(['low', 'medium', 'high', 'critical'] as TaskPriority[]).map((p) => {
                const count = tasks.filter((t) => t.priority === p).length; const pct = Math.round((count / tasks.length) * 100)
                return (<div key={p}><div className="flex items-center justify-between text-sm"><span className="capitalize text-gray-700">{PRIORITY_LABELS[p]}</span><span className="font-medium text-gray-900">{count}</span></div><div className="mt-1 h-2 rounded-full bg-gray-200"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div></div>)
              })}
            </div>
          </div>
        </div>
      )}

      {!isAdmin && (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input type="text" placeholder="Search tasks..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800" />
          </div>
          <div className="flex gap-2">
            <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TaskStatus | '')}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"><option value="">Status</option>{Object.entries(STATUS_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
            <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value as TaskPriority | '')}
              className="flex-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-gray-600 dark:bg-gray-800"><option value="">Priority</option>{Object.entries(PRIORITY_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}</select>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        {isAdmin && <div className="border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4"><h2 className="text-sm font-semibold text-gray-900 lg:text-base">All Tasks ({tasks.length})</h2></div>}
        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Task</th>
                {isAdmin && <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Owner</th>}
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {(isAdmin ? tasks : filtered).map((task) => (
                <tr key={task.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{task.description || task.title}</td>
                  {isAdmin && <td className="px-6 py-4 text-sm text-gray-500">{(task as any).created_by_user?.name || 'Unknown'}</td>}
                  <td className="px-6 py-4"><Badge variant={task.status === 'done' ? 'success' : task.status === 'partially_done' ? 'info' : 'default'}>{STATUS_LABELS[task.status]}</Badge></td>
                  <td className="px-6 py-4"><Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'default'}>{PRIORITY_LABELS[task.priority]}</Badge></td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.due_date && <span className={isOverdue(task.due_date) ? 'text-red-500' : ''}>{formatDate(task.due_date)}</span>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700 sm:hidden">
          {(isAdmin ? tasks : filtered).map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">{task.description || task.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant={task.status === 'done' ? 'success' : task.status === 'partially_done' ? 'info' : 'default'}>{STATUS_LABELS[task.status]}</Badge>
                  <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'default'}>{PRIORITY_LABELS[task.priority]}</Badge>
                  {isAdmin && <span className="text-xs text-gray-400">{(task as any).created_by_user?.name || 'Unknown'}</span>}
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </Link>
          ))}
        </div>
      </div>
      <style>{`@media print { body { background: white; } .print\\:hidden { display: none !important; } }`}</style>
    </div>
  )
}
