import { useEffect, useState, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Skeleton } from '../components/ui/Skeleton'
import { Modal } from '../components/ui/Modal'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Printer, Download, ChevronRight, Plus, Check } from 'lucide-react'
import { cn, formatDate, isOverdue } from '../lib/utils'
import { STATUS_LABELS, PRIORITY_LABELS } from '../lib/constants'
import type { Task, AdminStats, TaskStatus, TaskPriority, User } from '../types'

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

export function AdminPage() {
  const { userId: supabaseUser } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)
  const printRef = useRef<HTMLDivElement>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('pending')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [users, setUsers] = useState<User[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  useEffect(() => {
    loadData()
    supabase.from('users').select('*').order('name').then(({ data }) => {
      if (data) setUsers(data as User[])
    })
  }, [])

  async function loadData() {
    const { data: taskData } = await supabase
      .from('tasks')
      .select('*, created_by_user:users!tasks_created_by_fkey(*)')
      .order('created_at', { ascending: false })

    if (taskData) {
      setTasks(taskData as unknown as Task[])
      const completed = taskData.filter((t: Task) => t.status === 'done').length
      const inProgress = taskData.filter((t: Task) => t.status === 'partially_done').length
      const overdue = taskData.filter((t: Task) => !t.completed_at && isOverdue(t.due_date)).length
      const byStatus = { pending: 0, partially_done: 0, done: 0 }
      const byPriority = { low: 0, medium: 0, high: 0, critical: 0 }
      taskData.forEach((t: Task) => { byStatus[t.status]++; byPriority[t.priority]++ })
      setStats({
        total_tasks: taskData.length,
        completed_tasks: completed,
        in_progress_tasks: inProgress,
        overdue_tasks: overdue,
        tasks_by_status: byStatus,
        tasks_by_priority: byPriority,
      })
    }
    setLoading(false)
  }

  const handlePrint = () => window.print()
  const handleExport = () => {
    const csv = [
      ['Title', 'Status', 'Priority', 'Owner', 'Due Date', 'Created'].join(','),
      ...tasks.map((t) =>
        [t.title, t.status, t.priority, t.created_by_user?.name || '', t.due_date || '', t.created_at].join(',')
      ),
    ].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'ucs-tasks-report.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const openCreate = () => {
    setTitle(''); setDescription(''); setStatus('pending'); setPriority('medium')
    setSelectedAssignees([]); setShowCreate(true)
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!supabaseUser || !title.trim()) return
    setSaving(true)

    const { data } = await supabase.from('tasks').insert({
      title: title.trim(),
      description: description.trim(),
      status, priority,
      created_by: supabaseUser,
    }).select().single()

    if (data && selectedAssignees.length) {
      await supabase.from('task_assignees').insert(
        selectedAssignees.map((userId) => ({ task_id: data.id, user_id: userId, assigned_by: supabaseUser }))
      )
    }

    setSaving(false); setShowCreate(false)
    loadData()
  }

  const toggleAssignee = (userId: string) => {
    setSelectedAssignees((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    )
  }

  if (loading) return <div className="mt-20 space-y-4"><Skeleton className="h-8 w-24 mx-auto" /><Skeleton className="h-10 w-48 mx-auto" /></div>

  return (
    <div ref={printRef} className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between print:hidden">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Admin</h1>
        <div className="flex items-center gap-2">
          <Button size="sm" onClick={openCreate}>
            <Plus className="h-4 w-4" /> <span className="hidden sm:inline">Create Task</span>
          </Button>
          <Button variant="secondary" size="sm" onClick={handleExport} className="hidden sm:inline-flex">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button size="sm" onClick={handlePrint}>
            <Printer className="h-4 w-4" /> Print
          </Button>
        </div>
      </div>

      <Modal open={showCreate} onClose={() => setShowCreate(false)} title="Create Task" className="max-w-lg">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input id="modal-title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" required />
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." rows={2}
              className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select id="modal-status" label="Status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} options={statusOptions} />
            <Select id="modal-priority" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} options={priorityOptions} />
          </div>
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignees</label>
            <div className="max-h-40 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200 dark:border-gray-600 dark:divide-gray-700">
              {users.map((user) => (
                <label key={user.id} className={cn(
                  'flex items-center gap-3 px-3 py-2 cursor-pointer transition-colors',
                  selectedAssignees.includes(user.id) ? 'bg-primary-light/50 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-750'
                )}>
                  <div className={cn(
                    'flex h-5 w-5 items-center justify-center rounded border-2 transition-colors',
                    selectedAssignees.includes(user.id) ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-500'
                  )}>
                    {selectedAssignees.includes(user.id) && <Check className="h-3 w-3" />}
                  </div>
                  <input type="checkbox" checked={selectedAssignees.includes(user.id)} onChange={() => toggleAssignee(user.id)} className="sr-only" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">
                    {user.name?.charAt(0) || 'U'}
                  </div>
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-4">
        {[
          { label: 'Total Tasks', value: stats?.total_tasks || 0 },
          { label: 'Completed', value: stats?.completed_tasks || 0 },
          { label: 'In Progress', value: stats?.in_progress_tasks || 0 },
          { label: 'Overdue', value: stats?.overdue_tasks || 0 },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-5">
            <p className="text-xs text-gray-500 dark:text-gray-400 lg:text-sm">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white lg:text-3xl">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white lg:mb-4 lg:text-base">Tasks by Status</h3>
          <div className="space-y-2 lg:space-y-3">
            {Object.entries(stats?.tasks_by_status || {}).map(([status, count]) => {
              const total = stats?.total_tasks || 1; const pct = Math.round((count / total) * 100)
              return (
                <div key={status}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-700 dark:text-gray-300">{STATUS_LABELS[status as keyof typeof STATUS_LABELS]}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
        <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-6">
          <h3 className="mb-3 text-sm font-semibold text-gray-900 dark:text-white lg:mb-4 lg:text-base">Tasks by Priority</h3>
          <div className="space-y-2 lg:space-y-3">
            {Object.entries(stats?.tasks_by_priority || {}).map(([priority, count]) => {
              const total = stats?.total_tasks || 1; const pct = Math.round((count / total) * 100)
              return (
                <div key={priority}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="capitalize text-gray-700 dark:text-gray-300">{PRIORITY_LABELS[priority as keyof typeof PRIORITY_LABELS]}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{count}</span>
                  </div>
                  <div className="mt-1 h-2 rounded-full bg-gray-200 dark:bg-gray-700">
                    <div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="border-b border-gray-200 px-4 py-3 dark:border-gray-700 lg:px-6 lg:py-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">All Tasks ({tasks.length})</h2>
        </div>

        <div className="hidden overflow-x-auto sm:block">
          <table className="w-full min-w-[600px]">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Title</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Priority</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase text-gray-500">Due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {tasks.map((task) => (
                <tr key={task.id} className="transition-colors hover:bg-gray-50 dark:hover:bg-gray-750">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{task.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{task.created_by_user?.name || 'Unknown'}</td>
                  <td className="px-6 py-4">
                    <Badge variant={task.status === 'done' ? 'success' : task.status === 'partially_done' ? 'info' : 'default'}>
                      {STATUS_LABELS[task.status]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'default'}>
                      {PRIORITY_LABELS[task.priority]}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {task.due_date && <span className={isOverdue(task.due_date) ? 'text-red-500' : ''}>{formatDate(task.due_date)}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="divide-y divide-gray-200 dark:divide-gray-700 sm:hidden">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 px-4 py-3">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate dark:text-white">{task.title}</p>
                <div className="mt-1 flex flex-wrap items-center gap-2">
                  <Badge variant={task.status === 'done' ? 'success' : task.status === 'partially_done' ? 'info' : 'default'}>
                    {STATUS_LABELS[task.status]}
                  </Badge>
                  <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'default'}>
                    {PRIORITY_LABELS[task.priority]}
                  </Badge>
                  <span className="text-xs text-gray-400">{task.created_by_user?.name || 'Unknown'}</span>
                </div>
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-400" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        @media print {
          body { background: white; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
