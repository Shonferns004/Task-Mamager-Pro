# UCS Task Manager — API Design

## Architecture

The application uses a **hybrid API approach**:

1. **Direct Supabase Queries** — Most CRUD operations from the frontend go directly to Supabase via the JS client. RLS policies enforce authorization.
2. **Express Backend APIs** — Admin-only operations and complex reports go through the Express server, which uses the Supabase service_role key to bypass RLS.

---

## Direct Supabase Queries (Client-Side)

These are performed via `@supabase/supabase-js` directly from the React app.

### Auth

| Operation | Method | Supabase Call |
|---|---|---|
| Sign in with Google | OAuth | `supabase.auth.signInWithOAuth({ provider: 'google' })` |
| Get session | — | `supabase.auth.getSession()` |
| Sign out | — | `supabase.auth.signOut()` |
| Listen auth changes | — | `supabase.auth.onAuthStateChange()` |

### Tasks

| Operation | Supabase Query |
|---|---|
| List tasks | `supabase.from('tasks').select('*, task_assignees(*)').order('created_at', { ascending: false })` |
| Get task | `supabase.from('tasks').select('*, task_assignees(*), comments(*), activity_logs(*)').eq('id', id).single()` |
| Create task | `supabase.from('tasks').insert({ title, description, priority, due_date })` |
| Update task | `supabase.from('tasks').update({ title, status, ... }).eq('id', id)` |
| Delete task | `supabase.from('tasks').delete().eq('id', id)` |

### Comments

| Operation | Supabase Query |
|---|---|
| List comments | `supabase.from('comments').select('*, users(*)').eq('task_id', id).order('created_at')` |
| Add comment | `supabase.from('comments').insert({ task_id, user_id, content })` |
| Realtime subscribe | `supabase.channel('comments').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'comments', filter: 'task_id=eq.'+id }, callback).subscribe()` |

### Activity Logs

| Operation | Supabase Query |
|---|---|
| List activity | `supabase.from('activity_logs').select('*, users(*)').eq('task_id', id).order('created_at', { ascending: false })` |

### Users

| Operation | Supabase Query |
|---|---|
| List users | `supabase.from('users').select('*').order('name')` |
| Get user | `supabase.from('users').select('*').eq('id', id).single()` |

---

## Express Backend APIs

Base URL: `http://localhost:3001/api`

### Authentication Middleware

All Express routes require a valid Supabase JWT in the `Authorization: Bearer <token>` header. The middleware verifies the token using `supabase.auth.getUser(token)` and attaches the user to `req.user`.

### Admin Routes

#### `GET /api/admin/tasks`
Returns all tasks across all users (admin only).

**Response:**
```json
{
  "tasks": [
    {
      "id": "uuid",
      "title": "string",
      "description": "string",
      "status": "todo|in_progress|in_review|done",
      "priority": "low|medium|high|critical",
      "created_by": { "id": "uuid", "name": "string", "email": "string" },
      "assignees": [{ "id": "uuid", "name": "string" }],
      "due_date": "date",
      "completed_at": "timestamp",
      "created_at": "timestamp"
    }
  ]
}
```

#### `GET /api/admin/stats`
Returns aggregated statistics.

**Response:**
```json
{
  "total_tasks": 42,
  "completed_tasks": 18,
  "in_progress_tasks": 12,
  "overdue_tasks": 5,
  "tasks_by_status": { "todo": 10, "in_progress": 12, "in_review": 5, "done": 15 },
  "tasks_by_priority": { "low": 5, "medium": 15, "high": 12, "critical": 10 },
  "recent_activity": [
    { "action": "task_created", "user_name": "John", "created_at": "..." }
  ]
}
```

#### `GET /api/admin/report/pdf`
Generates a PDF report of all tasks.

**Response:** `application/pdf` binary

#### `GET /api/admin/tasks/export`
Exports tasks as CSV.

**Query params:** `status`, `priority`, `from`, `to`

**Response:** `text/csv`

### User Routes

#### `GET /api/users/me`
Returns current user profile with task counts.

#### `PUT /api/users/me`
Updates user profile. Accepts `{ name }`.

### Notification Routes

#### `POST /api/notifications/test`
Triggers a test notification email (for debugging).

---

## Supabase Edge Functions

Located in `backend/functions/`

| Function | Trigger | Purpose |
|---|---|---|
| `on-task-assigned` | DB webhook on `task_assignees` INSERT | Email notification to assignee |
| `daily-reminders` | Scheduled (cron) | Email reminders for tasks due within 24h |
