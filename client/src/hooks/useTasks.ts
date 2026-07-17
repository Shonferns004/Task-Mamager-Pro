import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import type { Task } from '../types'

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    setLoading(true)
    try {
      const { tasks: data } = await api.getTasks()
      setTasks(data as unknown as Task[])
    } catch {
      setTasks([])
    }
    setLoading(false)
  }, [])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  return { tasks, loading, refetch: fetchTasks }
}

export function useTask(id: string | undefined) {
  const [task, setTask] = useState<Task | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    api.getTask(id)
      .then(({ task: data }) => setTask(data as unknown as Task))
      .catch(() => setTask(null))
      .finally(() => setLoading(false))
  }, [id])

  return { task, loading }
}
