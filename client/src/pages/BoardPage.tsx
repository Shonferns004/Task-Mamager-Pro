import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, useDraggable, useDroppable,
} from '@dnd-kit/core'
import { useTasks } from '../hooks/useTasks'
import { api } from '../lib/api'
import { BoardSkeleton } from '../components/ui/PageSkeleton'
import { Badge } from '../components/ui/Badge'
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { formatDate, isOverdue } from '../lib/utils'
import { STATUS_LABELS, PRIORITY_LABELS } from '../lib/constants'
import type { Task, TaskStatus } from '../types'

const columns: { id: TaskStatus; icon: typeof Circle; color: string }[] = [
  { id: 'pending', icon: Circle, color: 'text-gray-500' },
  { id: 'partially_done', icon: Clock, color: 'text-blue-500' },
  { id: 'done', icon: CheckCircle2, color: 'text-emerald-500' },
]

const priorityBorder: Record<string, string> = {
  critical: 'border-l-red-500', high: 'border-l-amber-500', medium: 'border-l-blue-500', low: 'border-l-gray-300 dark:border-l-gray-600',
}

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 } : undefined
  return (
    <Link ref={setNodeRef} to={`/tasks/${task.id}`} {...listeners} {...attributes} style={style}
      className={`block rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md border-l-4 ${priorityBorder[task.priority]} dark:border-gray-700 dark:bg-gray-800 ${isDragging ? 'opacity-30' : ''}`}>
      <div className="mb-2 flex items-center gap-2">
        <Badge variant={task.priority === 'critical' ? 'danger' : task.priority === 'high' ? 'warning' : task.priority === 'medium' ? 'info' : 'default'}>{PRIORITY_LABELS[task.priority]}</Badge>
      </div>
      <h4 className="text-sm font-medium text-gray-900 dark:text-white">{task.title}</h4>
      {task.due_date && <p className={`mt-2 text-xs ${isOverdue(task.due_date) ? 'text-red-500 font-medium' : 'text-gray-500 dark:text-gray-400'}`}>{isOverdue(task.due_date) ? '🔴 ' : '📅 '}{formatDate(task.due_date)}</p>}
      {task.task_assignees && task.task_assignees.length > 0 && (
        <div className="mt-2 flex items-center gap-1">
          {task.task_assignees.slice(0, 3).map((a) => (
            <div key={a.user_id} className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-white">{a.users?.name?.charAt(0) || '?'}</div>
          ))}
          {task.task_assignees.length > 3 && <span className="text-xs text-gray-400">+{task.task_assignees.length - 3}</span>}
        </div>
      )}
    </Link>
  )
}

function DroppableColumn({ status, children, count }: { status: TaskStatus; children: React.ReactNode; count: number }) {
  const { isOver, setNodeRef } = useDroppable({ id: status })
  const col = columns.find((c) => c.id === status)!
  return (
    <div ref={setNodeRef}
      className={`flex w-full flex-col rounded-xl transition-colors lg:flex-1 ${isOver ? 'bg-primary/10 ring-2 ring-primary/30' : 'bg-gray-50/80 dark:bg-gray-800/40'}`}>
      <div className="flex items-center justify-between border-b border-gray-200/60 px-4 py-3 dark:border-gray-700/40">
        <div className="flex items-center gap-2">
          <col.icon className={`h-4 w-4 ${col.color}`} />
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{STATUS_LABELS[status]}</h3>
        </div>
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-gray-200 px-1.5 text-[11px] font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-400">{count}</span>
      </div>
      <div className={`flex flex-col gap-2 p-3 min-h-[200px] ${isOver ? 'bg-primary/5 rounded-b-xl' : ''}`}>
        {children}
        {count === 0 && <div className="flex flex-1 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 p-6 dark:border-gray-700"><p className="text-xs text-gray-400">No tasks</p></div>}
      </div>
    </div>
  )
}

export function BoardPage() {
  const { tasks, loading, refetch } = useTasks()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))
  const getColumnTasks = useCallback((status: TaskStatus) => tasks.filter((t) => t.status === status), [tasks])

  const handleDragStart = (event: DragStartEvent) => {
    const task = tasks.find((t) => t.id === event.active.id)
    if (task) setActiveTask(task)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over || active.id === over.id) return
    const newStatus = over.id as TaskStatus
    const task = tasks.find((t) => t.id === active.id)
    if (!task || task.status === newStatus || !columns.find((c) => c.id === newStatus)) return
    await api.updateTask(active.id as string, { status: newStatus })
    refetch()
  }

  if (loading) return <BoardSkeleton />

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Board</h1>
        <Link to="/tasks/new" className="inline-flex items-center gap-2 rounded-lg bg-primary px-3 py-2 text-sm font-medium text-white hover:bg-primary-dark transition-colors lg:px-4">
          <Plus className="h-4 w-4" /> <span className="hidden sm:inline">New Task</span>
        </Link>
      </div>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:gap-4">
          {columns.map((col) => (
            <DroppableColumn key={col.id} status={col.id} count={getColumnTasks(col.id).length}>
              {getColumnTasks(col.id).map((task) => <DraggableTask key={task.id} task={task} />)}
            </DroppableColumn>
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className={`rounded-lg border border-gray-200 bg-white p-3 shadow-xl border-l-4 ${priorityBorder[activeTask.priority]} dark:border-gray-700 dark:bg-gray-800`}>
              <div className="mb-2"><Badge variant={activeTask.priority === 'critical' ? 'danger' : activeTask.priority === 'high' ? 'warning' : activeTask.priority === 'medium' ? 'info' : 'default'}>{PRIORITY_LABELS[activeTask.priority]}</Badge></div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
