import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

const router = Router()

router.get('/:taskId', async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('comments')
    .select('*, users(*)')
    .eq('task_id', req.params.taskId)
    .order('created_at', { ascending: true })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ comments: data })
})

router.post('/:taskId', async (req: Request, res: Response) => {
  const { content } = req.body
  if (!content?.trim()) return res.status(400).json({ error: 'Content is required' })

  const { data, error } = await supabaseAdmin.from('comments').insert({
    task_id: req.params.taskId,
    user_id: req.userId,
    content: content.trim(),
  }).select('*, users(*)').single()

  if (error) return res.status(500).json({ error: error.message })
  res.status(201).json({ comment: data })
})

router.delete('/:taskId/:commentId', async (req: Request, res: Response) => {
  const isAdmin = req.userRole === 'admin'
  const { data: existing } = await supabaseAdmin.from('comments').select('user_id').eq('id', req.params.commentId).single()
  if (!existing) return res.status(404).json({ error: 'Comment not found' })
  if (existing.user_id !== req.userId && !isAdmin) return res.status(403).json({ error: 'Not authorized' })

  const { error } = await supabaseAdmin.from('comments').delete().eq('id', req.params.commentId)
  if (error) return res.status(500).json({ error: error.message })
  res.json({ success: true })
})

export default router
