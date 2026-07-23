import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { api } from '../lib/api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { TaskFormSkeleton } from '../components/ui/PageSkeleton'
import { cn } from '../lib/utils'
import { Check } from 'lucide-react'
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

export function TaskFormPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { isAdmin } = useAuth()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(isEdit)
  const [saving, setSaving] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<TaskStatus>('pending')
  const [priority, setPriority] = useState<TaskPriority>('medium')
  const [users, setUsers] = useState<User[]>([])
  const [selectedAssignees, setSelectedAssignees] = useState<string[]>([])

  useEffect(() => { if (isAdmin) api.getUsers().then(({ users: data }) => setUsers(data as User[])).catch(() => {}) }, [isAdmin])
  useEffect(() => {
    if (!id) return
    api.getTask(id).then(({ task: data }) => {
      const t = data as any
      setTitle(t.title); setDescription(t.description || ''); setStatus(t.status); setPriority(t.priority)
      if (isAdmin) setSelectedAssignees(t.task_assignees?.map((a: any) => a.user_id) || [])
      setLoading(false)
    })
  }, [id, isAdmin])

  const toggleAssignee = (userId: string) => setSelectedAssignees((prev) => prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); if (!title.trim()) return; setSaving(true)
    const payload: any = { title: title.trim(), description: description.trim(), status, priority }
    if (isAdmin) payload.assignee_ids = selectedAssignees
    if (isEdit) { await api.updateTask(id!, payload); navigate(`/tasks/${id}`) }
    else { const { task } = await api.createTask(payload); navigate(`/tasks/${task.id}`) }
  }

  if (loading) return <TaskFormSkeleton />

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="mb-4 text-xl font-bold text-gray-900 dark:text-white lg:mb-6 lg:text-2xl">{isEdit ? 'Edit Task' : 'Create Task'}</h1>
      <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:space-y-6 lg:p-6">
        <Input id="title" label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Enter task title" required />
        <div className="space-y-1">
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
          <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Describe the task..." rows={3}
            className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 lg:rows-4" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Select id="status" label="Status" value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} options={statusOptions} />
          <Select id="priority" label="Priority" value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} options={priorityOptions} />
        </div>
        {isAdmin && (
          <div className="space-y-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Assignees</label>
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-200 divide-y divide-gray-200 dark:border-gray-600 dark:divide-gray-700">
              {users.map((user) => (
                <label key={user.id} className={cn('flex items-center gap-3 px-3 py-2.5 cursor-pointer transition-colors', selectedAssignees.includes(user.id) ? 'bg-primary-light/50 dark:bg-primary/10' : 'hover:bg-gray-50 dark:hover:bg-gray-750')}>
                  <div className={cn('flex h-5 w-5 items-center justify-center rounded border-2 transition-colors', selectedAssignees.includes(user.id) ? 'border-primary bg-primary text-white' : 'border-gray-300 dark:border-gray-500')}>
                    {selectedAssignees.includes(user.id) && <Check className="h-3 w-3" />}
                  </div>
                  <input type="checkbox" checked={selectedAssignees.includes(user.id)} onChange={() => toggleAssignee(user.id)} className="sr-only" />
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">{user.name?.charAt(0) || 'U'}</div>
                  <div className="min-w-0 flex-1"><p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || 'Unknown'}</p><p className="text-xs text-gray-500 truncate">{user.email}</p></div>
                </label>
              ))}
            </div>
          </div>
        )}
        <div className="flex flex-col gap-3 pt-2 sm:flex-row">
          <Button type="submit" loading={saving} className="w-full sm:w-auto">{isEdit ? 'Update Task' : 'Create Task'}</Button>
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="w-full sm:w-auto">Cancel</Button>
        </div>
      </form>
    </div>
  )
}
