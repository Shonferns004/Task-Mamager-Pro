import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

const router = Router()

router.get('/:taskId', async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin
    .from('activity_logs')
    .select('*, users(*)')
    .eq('task_id', req.params.taskId)
    .order('created_at', { ascending: false })
  if (error) return res.status(500).json({ error: error.message })
  res.json({ activity: data })
})

export default router
