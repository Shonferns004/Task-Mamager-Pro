import { useParams, Link, useNavigate } from 'react-router-dom'
import { useTask } from '../hooks/useTasks'
import { useComments } from '../hooks/useComments'
import { api } from '../lib/api'
import { TaskDetailSkeleton } from '../components/ui/PageSkeleton'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useState, useEffect } from 'react'
import { ArrowLeft, Trash2, Send, MessageSquare, History } from 'lucide-react'
import { formatDateTime, getTimeAgo } from '../lib/utils'
import { STATUS_LABELS } from '../lib/constants'
import type { Task } from '../types'
import type { ActivityLog } from '../types'

export function TaskDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { task, loading } = useTask(id)
  const { comments, addComment } = useComments(id)
  const [commentText, setCommentText] = useState('')
  const [activity, setActivity] = useState<ActivityLog[]>([])

  useEffect(() => { if (!id) return; api.getActivity(id).then(({ activity: data }) => setActivity(data as ActivityLog[])).catch(() => {}) }, [id])

  const handleDelete = async () => { if (!confirm('Delete this task?')) return; await api.deleteTask(id!); navigate('/tasks') }
  const handleAddComment = async () => { if (!commentText.trim()) return; await addComment(commentText.trim()); setCommentText('') }

  if (loading) return <TaskDetailSkeleton />
  if (!task) return <p className="mt-20 text-center text-gray-500">Task not found</p>

  return (
    <div className="mx-auto max-w-4xl space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <Link to="/tasks" className="flex items-center gap-2 text-sm text-gray-500 hover:text-primary"><ArrowLeft className="h-4 w-4" /> <span className="hidden sm:inline">Back</span></Link>
        <div className="flex items-center gap-2">
          <Button variant="danger" size="sm" onClick={handleDelete}><Trash2 className="h-4 w-4" /> <span className="hidden sm:inline">Delete</span></Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800 lg:p-6">
        <div className="mb-3 flex flex-wrap items-center gap-2 lg:mb-4">
          <Badge variant={task.status === 'done' ? 'success' : task.status === 'partially_done' ? 'info' : 'default'}>{STATUS_LABELS[task.status]}</Badge>
        </div>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">{task.description || task.title}</h1>
        {(task as any).task_assignees?.length > 0 && (
          <div className="mt-4 lg:mt-6">
            <h3 className="mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">Assignees</h3>
            <div className="flex flex-wrap gap-2">
              {(task as any).task_assignees.map((a: any) => (
                <div key={a.user_id} className="flex items-center gap-2 rounded-full bg-gray-100 px-3 py-1 text-sm dark:bg-gray-700">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-medium text-white">{a.users?.name?.charAt(0) || '?'}</div>
                  <span className="text-xs lg:text-sm">{a.users?.name || 'Unknown'}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
          <MessageSquare className="h-4 w-4 text-gray-500 lg:h-5 lg:w-5" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">Comments</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {comments.map((comment) => (
            <div key={comment.id} className="px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-start gap-3">
                {comment.users?.avatar_url ? <img src={comment.users.avatar_url} alt="" className="h-7 w-7 rounded-full lg:h-8 lg:w-8" />
                  : <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-medium text-white lg:h-8 lg:w-8">{comment.users?.name?.charAt(0) || '?'}</div>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-gray-900 dark:text-white">{comment.users?.name || 'Unknown'}</span>
                    <span className="text-xs text-gray-400">{getTimeAgo(comment.created_at)}</span>
                  </div>
                  <p className="mt-1 text-sm text-gray-700 dark:text-gray-300 break-words">{comment.content}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
          <input type="text" value={commentText} onChange={(e) => setCommentText(e.target.value)} placeholder="Write a comment..."
            className="flex-1 rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-100"
            onKeyDown={(e) => e.key === 'Enter' && handleAddComment()} />
          <Button size="sm" onClick={handleAddComment} disabled={!commentText.trim()}><Send className="h-4 w-4" /></Button>
        </div>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800">
        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 lg:px-6 lg:py-4">
          <History className="h-4 w-4 text-gray-500 lg:h-5 lg:w-5" />
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white lg:text-base">Activity</h2>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {activity.map((log) => (
            <div key={log.id} className="px-4 py-2 lg:px-6 lg:py-3">
              <div className="flex items-start gap-3">
                {log.users?.avatar_url ? <img src={log.users.avatar_url} alt="" className="h-6 w-6 rounded-full lg:h-7 lg:w-7" />
                  : <div className="flex h-6 w-6 items-center justify-center rounded-full bg-gray-200 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400 lg:h-7 lg:w-7">{log.users?.name?.charAt(0) || '?'}</div>}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    <strong>{log.users?.name || 'Unknown'}</strong>{' '}
                    {log.action === 'task_created' && 'created this task'}
                    {log.action === 'status_changed' && `changed status from ${log.details?.from} to ${log.details?.to}`}
                    {log.action === 'priority_changed' && `changed priority from ${log.details?.from} to ${log.details?.to}`}
                    {log.action === 'title_changed' && `renamed task to "${log.details?.to}"`}
                    {log.action === 'task_completed' && 'completed this task'}
                    {log.action === 'user_assigned' && 'assigned a team member'}
                  </p>
                  <p className="text-xs text-gray-400">{getTimeAgo(log.created_at)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
