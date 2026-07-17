import { useEffect, useState, useCallback } from 'react'
import { api } from '../lib/api'
import type { Comment } from '../types'

export function useComments(taskId: string | undefined) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  const fetchComments = useCallback(async () => {
    if (!taskId) return
    setLoading(true)
    try {
      const { comments: data } = await api.getComments(taskId)
      setComments(data as unknown as Comment[])
    } catch {
      setComments([])
    }
    setLoading(false)
  }, [taskId])

  useEffect(() => {
    fetchComments()
  }, [fetchComments])

  async function addComment(content: string) {
    if (!taskId) return
    await api.addComment(taskId, content)
    fetchComments()
  }

  return { comments, loading, addComment, refetch: fetchComments }
}
