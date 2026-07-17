import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../config/supabase'

const router = Router()

router.get('/', async (_req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin.from('users').select('*').order('name')
  if (error) return res.status(500).json({ error: error.message })
  res.json({ users: data })
})

router.get('/me', async (req: Request, res: Response) => {
  const { data, error } = await supabaseAdmin.from('users').select('*').eq('id', req.userId).single()
  if (error) return res.status(500).json({ error: error.message })
  res.json({ user: data })
})

export default router
