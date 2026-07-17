import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

const router = Router()

router.get('/tasks', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*, created_by_user:users!tasks_created_by_fkey(*)')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })
  res.json({ tasks: data })
})

router.get('/stats', async (_req: Request, res: Response) => {
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*')

  if (!tasks) return res.json({ stats: null })

  const completed = tasks.filter((t) => t.status === 'done').length
  const inProgress = tasks.filter((t) => t.status === 'in_progress' || t.status === 'in_review').length
  const overdue = tasks.filter((t) => {
    if (!t.due_date || t.completed_at) return false
    return new Date(t.due_date) < new Date()
  }).length

  const byStatus = { todo: 0, in_progress: 0, in_review: 0, done: 0 }
  const byPriority = { low: 0, medium: 0, high: 0, critical: 0 }

  tasks.forEach((t: { status: keyof typeof byStatus; priority: keyof typeof byPriority }) => {
    byStatus[t.status]++
    byPriority[t.priority]++
  })

  res.json({
    total_tasks: tasks.length,
    completed_tasks: completed,
    in_progress_tasks: inProgress,
    overdue_tasks: overdue,
    tasks_by_status: byStatus,
    tasks_by_priority: byPriority,
  })
})

router.get('/users', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('*, tasks(count), task_assignees(count)')
    .order('name')

  if (error) return res.status(500).json({ error: error.message })
  res.json({ users: data })
})

export default router
