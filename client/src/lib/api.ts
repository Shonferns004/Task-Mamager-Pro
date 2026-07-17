const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api'

async function getToken(): Promise<string | null> {
  try {
    const { Clerk } = await import('@clerk/clerk-react')
    const clerk = (window as any).__clerk
    if (!clerk) return null
    return clerk.session?.getToken() || null
  } catch {
    return null
  }
}

async function headers(): Promise<Record<string, string>> {
  const token = await getToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

async function request<T>(method: string, path: string, body?: unknown): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers: await headers(),
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || 'Request failed')
  return data
}

export const api = {
  // Users
  syncUser: () => request<any>('POST', '/users/sync'),
  getUsers: () => request<{ users: any[] }>('GET', '/users'),
  getMe: () => request<{ user: any }>('GET', '/users/me'),

  // Tasks
  getTasks: () => request<{ tasks: any[] }>('GET', '/tasks'),
  getTask: (id: string) => request<{ task: any }>('GET', `/tasks/${id}`),
  createTask: (data: any) => request<{ task: any }>('POST', '/tasks', data),
  updateTask: (id: string, data: any) => request<{ task: any }>('PUT', `/tasks/${id}`, data),
  deleteTask: (id: string) => request<{ success: boolean }>('DELETE', `/tasks/${id}`),

  // Comments
  getComments: (taskId: string) => request<{ comments: any[] }>('GET', `/comments/${taskId}`),
  addComment: (taskId: string, content: string) =>
    request<{ comment: any }>('POST', `/comments/${taskId}`, { content }),
  deleteComment: (taskId: string, commentId: string) =>
    request<{ success: boolean }>('DELETE', `/comments/${taskId}/${commentId}`),

  // Activity
  getActivity: (taskId: string) => request<{ activity: any[] }>('GET', `/activity/${taskId}`),

  // Admin
  getAdminStats: () => request<{ total_tasks: number; completed_tasks: number; in_progress_tasks: number; overdue_tasks: number; tasks_by_status: any; tasks_by_priority: any }>('GET', '/admin/stats'),
}
