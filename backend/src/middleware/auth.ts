import { type Request, type Response, type NextFunction } from 'express'
import { verifyToken } from '@clerk/backend'
import { supabaseAdmin } from '../config/supabase'
import { env } from '../config/env'

declare global {
  namespace Express {
    interface Request {
      userId?: string
      userEmail?: string
      userRole?: string
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  const token = authHeader.replace('Bearer ', '')

  try {
    const { sub } = await verifyToken(token, { secretKey: env.clerkSecretKey })
    req.userId = sub

    const { data: profile } = await supabaseAdmin
      .from('users')
      .select('role, email')
      .eq('id', sub)
      .single()

    req.userRole = profile?.role || 'user'
    req.userEmail = profile?.email || ''
    next()
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }
}

export function adminOnly(req: Request, res: Response, next: NextFunction) {
  if (req.userRole !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' })
  }
  next()
}
