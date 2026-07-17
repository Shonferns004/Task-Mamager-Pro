import { Router, type Request, type Response } from 'express'
import { supabaseAdmin } from '../config/supabase'
import { jsPDF } from 'jspdf'

const router = Router()

router.get('/pdf', async (_req: Request, res: Response) => {
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*, created_by_user:users!tasks_created_by_fkey(*)')
    .order('created_at', { ascending: false })

  const doc = new jsPDF({ orientation: 'landscape' })

  doc.setFontSize(18)
  doc.text('UCS Task Manager - Report', 14, 20)
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 14, 28)

  const headers = [['Title', 'Status', 'Priority', 'Owner', 'Due Date']]
  const rows = (tasks || []).map((t: any) => [
    t.title,
    t.status,
    t.priority,
    t.created_by_user?.name || 'Unknown',
    t.due_date || '-',
  ])

  const tableData = [...headers, ...rows]

  let y = 36
  tableData.forEach((row) => {
    let x = 14
    doc.setFontSize(8)
    row.forEach((cell: string) => {
      doc.text(String(cell).substring(0, 30), x, y)
      x += 50
    })
    y += 6
  })

  res.setHeader('Content-Type', 'application/pdf')
  res.setHeader('Content-Disposition', 'attachment; filename=ucs-task-report.pdf')
  res.send(Buffer.from(doc.output('arraybuffer')))
})

router.get('/csv', async (_req: Request, res: Response) => {
  const { data: tasks } = await supabaseAdmin
    .from('tasks')
    .select('*, created_by_user:users!tasks_created_by_fkey(*)')
    .order('created_at', { ascending: false })

  const csv = [
    ['Title', 'Status', 'Priority', 'Owner', 'Due Date', 'Created At'].join(','),
    ...(tasks || []).map((t: any) =>
      [t.title, t.status, t.priority, t.created_by_user?.name || '', t.due_date || '', t.created_at].join(',')
    ),
  ].join('\n')

  res.setHeader('Content-Type', 'text/csv')
  res.setHeader('Content-Disposition', 'attachment; filename=ucs-tasks.csv')
  res.send(csv)
})

export default router
