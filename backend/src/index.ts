import express from 'express'
import cors from 'cors'
import rateLimit from 'express-rate-limit'
import { env } from './config/env'
import { authenticate, adminOnly } from './middleware/auth'
import { errorHandler } from './middleware/errorHandler'
import adminRoutes from './routes/admin'
import taskRoutes from './routes/tasks'
import commentRoutes from './routes/comments'
import activityRoutes from './routes/activity'
import userRoutes from './routes/users'
import { verifyToken } from '@clerk/backend'
import { clerkClient } from './config/clerk'
import { supabaseAdmin } from './config/supabase'

const app = express()

app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json())

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api', limiter)

app.post('/api/users/sync', async (req, res) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) return res.status(401).json({ error: 'No token' })
  try {
    const { sub } = await verifyToken(authHeader.replace('Bearer ', ''), { secretKey: env.clerkSecretKey })
    const clerkUser = await clerkClient.users.getUser(sub)
    const { data: existing } = await supabaseAdmin.from('users').select('*').eq('id', sub).single()
    if (existing) return res.json({ user: existing })
    const { data: newUser, error } = await supabaseAdmin.from('users').insert({
      id: sub,
      email: clerkUser.emailAddresses[0]?.emailAddress || '',
      name: clerkUser.firstName ? `${clerkUser.firstName} ${clerkUser.lastName || ''}`.trim() : clerkUser.username || null,
      avatar_url: clerkUser.imageUrl || null,
    }).select().single()
    if (error) return res.status(500).json({ error: error.message })
    res.status(201).json({ user: newUser })
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
})

app.use('/api/users', authenticate, userRoutes)
app.use('/api/tasks', authenticate, taskRoutes)
app.use('/api/comments', authenticate, commentRoutes)
app.use('/api/activity', authenticate, activityRoutes)
app.use('/api/admin', authenticate, adminOnly, adminRoutes)

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.use(errorHandler)

app.listen(env.port, () => {
  console.log(`Server running on http://localhost:${env.port}`)
  console.log(`Environment: ${env.nodeEnv}`)
})
