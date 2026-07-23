export interface User {
  id: string
  email: string
  name: string | null
  avatar_url: string | null
  role: 'user' | 'admin'
  onboarded: boolean
  created_at: string
}

export type TaskStatus = 'pending' | 'partially_done' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical'

export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  created_by: string
  due_date: string | null
  completed_at: string | null
  created_at: string
  updated_at: string
  task_assignees?: TaskAssignee[]
  created_by_user?: User
}

export interface TaskAssignee {
  task_id: string
  user_id: string
  assigned_by: string
  users?: User
}

export interface Comment {
  id: string
  task_id: string
  user_id: string
  content: string
  created_at: string
  users?: User
}

export interface ActivityLog {
  id: string
  task_id: string
  user_id: string
  action: string
  details: Record<string, unknown>
  created_at: string
  users?: User
}

export interface Attachment {
  id: string
  task_id: string
  uploaded_by: string
  file_path: string
  file_name: string
  file_size: number
  content_type: string
  created_at: string
}

export interface AdminStats {
  total_tasks: number
  completed_tasks: number
  in_progress_tasks: number
  overdue_tasks: number
  tasks_by_status: Record<TaskStatus, number>
  tasks_by_priority: Record<TaskPriority, number>
}
