import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  type DragStartEvent, type DragEndEvent, useDraggable, useDroppable,
} from '@dnd-kit/core'
import { useTasks } from '../hooks/useTasks'
import { api } from '../lib/api'
import { BoardSkeleton } from '../components/ui/PageSkeleton'
import { Button } from '../components/ui/Button'
import { Plus, Circle, Clock, CheckCircle2 } from 'lucide-react'
import { STATUS_LABELS } from '../lib/constants'
import type { Task, TaskStatus } from '../types'

const columns: { id: TaskStatus; icon: typeof Circle; color: string }[] = [
  { id: 'pending', icon: Circle, color: 'text-gray-500' },
  { id: 'partially_done', icon: Clock, color: 'text-blue-500' },
  { id: 'done', icon: CheckCircle2, color: 'text-emerald-500' },
]

function DraggableTask({ task }: { task: Task }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task.id })
  const style = transform ? { transform: `translate(${transform.x}px, ${transform.y}px)`, zIndex: 50 } : undefined
  return (
    <Link ref={setNodeRef} to={`/tasks/${task.id}`} {...listeners} {...attributes} style={style}
      className={`block rounded-lg border border-gray-200 bg-white p-3 shadow-sm transition-all hover:shadow-md dark:border-gray-700 dark:bg-gray-800 ${isDragging ? 'opacity-30' : ''}`}>
      <p className="text-sm font-medium text-gray-900 dark:text-white">{task.description || task.title}</p>
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

export function TasksPage() {
  const { tasks, loading, refetch } = useTasks()
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [addingTo, setAddingTo] = useState<TaskStatus | null>(null)
  const [newDesc, setNewDesc] = useState('')
  const [saving, setSaving] = useState(false)
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

  const startAdd = (status: TaskStatus) => {
    setAddingTo(status)
    setNewDesc('')
  }

  const handleAdd = async (status: TaskStatus) => {
    if (!newDesc.trim()) return
    setSaving(true)
    await api.createTask({ description: newDesc.trim(), status })
    setSaving(false)
    setAddingTo(null)
    setNewDesc('')
    refetch()
  }

  if (loading) return <BoardSkeleton />

  return (
    <div className="space-y-4 lg:space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white lg:text-2xl">Tasks</h1>
      </div>
      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-4 pb-4 lg:flex-row lg:gap-4">
          {columns.map((col) => (
            <div key={col.id} className="flex w-full flex-col lg:flex-1">
              <DroppableColumn status={col.id} count={getColumnTasks(col.id).length}>
                {getColumnTasks(col.id).map((task) => <DraggableTask key={task.id} task={task} />)}
              </DroppableColumn>
              {addingTo === col.id ? (
                <div className="mt-2 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800">
                  <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} placeholder="Describe the task..." rows={2} autoFocus
                    className="w-full resize-none rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100" />
                  <div className="mt-2 flex items-center gap-2">
                    <Button size="sm" onClick={() => handleAdd(col.id)} loading={saving} disabled={!newDesc.trim()}>Add</Button>
                    <Button size="sm" variant="secondary" onClick={() => setAddingTo(null)}>Cancel</Button>
                  </div>
                </div>
              ) : (
                <button onClick={() => startAdd(col.id)}
                  className="mt-2 flex items-center justify-center gap-1.5 rounded-xl border-2 border-dashed border-gray-200 py-2.5 text-sm text-gray-400 transition-colors hover:border-primary/50 hover:text-primary dark:border-gray-700 dark:hover:border-primary/50">
                  <Plus className="h-4 w-4" /> Add Task
                </button>
              )}
            </div>
          ))}
        </div>
        <DragOverlay>
          {activeTask && (
            <div className="rounded-lg border border-gray-200 bg-white p-3 shadow-xl dark:border-gray-700 dark:bg-gray-800">
              <p className="text-sm font-medium text-gray-900 dark:text-white">{activeTask.description || activeTask.title}</p>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
