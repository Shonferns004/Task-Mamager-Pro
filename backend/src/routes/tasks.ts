import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

const router = Router()

router.get('/', async (req: Request, res: Response) => {
  const isAdmin = req.userRole === 'admin'
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*, task_assignees(*, users!task_assignees_user_id_fkey(*)), created_by_user:users!tasks_created_by_fkey(*)')
    .order('created_at', { ascending: false })

  if (error) return res.status(500).json({ error: error.message })

  if (!isAdmin) {
    const filtered = data.filter((t) =>
      t.created_by === req.userId ||
      t.task_assignees?.some((a: any) => a.user_id === req.userId)
    )
    return res.json({ tasks: filtered })
  }

  res.json({ tasks: data })
})

router.get('/:id', async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('tasks')
    .select('*, task_assignees(*, users!task_assignees_user_id_fkey(*)), created_by_user:users!tasks_created_by_fkey(*)')
    .eq('id', req.params.id)
    .single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ task: data })
})

router.post('/', async (req: Request, res: Response) => {
  const { title, description, status, priority, due_date, assignee_ids } = req.body
  if (!description?.trim() && !title?.trim()) return res.status(400).json({ error: 'Description is required' })

  const { data: task, error } = await supabaseAdmin.from('tasks').insert({
    title: title?.trim() || null,
    description: description?.trim() || title?.trim() || '',
    status: status || 'pending',
    priority: priority || 'medium',
    due_date: due_date || null,
    created_by: req.userId,
  }).select().single()

  if (error) return res.status(500).json({ error: error.message })

  if (assignee_ids?.length) {
    const { error: ae } = await supabaseAdmin.from('task_assignees').insert(
      assignee_ids.map((uid: string) => ({ task_id: task.id, user_id: uid, assigned_by: req.userId }))
    )
    if (ae) return res.status(500).json({ error: ae.message })
  }

  res.status(201).json({ task })
})

router.put('/:id', async (req: Request, res: Response) => {
  const { title, description, status, priority, due_date, assignee_ids } = req.body
  const isAdmin = req.userRole === 'admin'

  const { data: existing } = await supabaseAdmin.from('tasks').select('created_by').eq('id', req.params.id).single()
  if (!existing) return res.status(404).json({ error: 'Task not found' })
  if (existing.created_by !== req.userId && !isAdmin) return res.status(403).json({ error: 'Not authorized' })

  const { data: task, error } = await supabaseAdmin.from('tasks').update({
    title: title?.trim(), description: description?.trim(), status, priority, due_date: due_date || null,
  }).eq('id', req.params.id).select().single()

  if (error) return res.status(500).json({ error: error.message })

  if (assignee_ids !== undefined) {
    await supabaseAdmin.from('task_assignees').delete().eq('task_id', req.params.id)
    if (assignee_ids.length) {
      await supabaseAdmin.from('task_assignees').insert(
        assignee_ids.map((uid: string) => ({ task_id: req.params.id, user_id: uid, assigned_by: req.userId }))
      )
    }
  }

  res.json({ task })
})

router.delete('/:id', async (req: Request, res: Response) => {
  const isAdmin = req.userRole === 'admin'
  const { data: existing } = await supabaseAdmin.from('tasks').select('created_by').eq('id', req.params.id).single()
  if (!existing) return res.status(404).json({ error: 'Task not found' })
  if (existing.created_by !== req.userId && !isAdmin) return res.status(403).json({ error: 'Not authorized' })

  const { error } = await supabaseAdmin.from('tasks').delete().eq('id', req.params.id)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
