# UCS Task Manager — Requirements

## 1. Project Overview

A web-based task management system for **UCS (Company Name)** that enables teams to create, assign, track, and complete tasks collaboratively. The system includes an admin role with full visibility and reporting capabilities.

---

## 2. User Roles

| Role | Description |
|---|---|
| **User** | Can create tasks, view assigned tasks, comment, upload attachments |
| **Admin** | Full access — views all tasks across all users, generates reports, manages team |

---

## 3. Functional Requirements

### 3.1 Authentication
| ID | Requirement | Priority |
|---|---|---|
| F1 | Users must sign in with their Google account | High |
| F2 | New users are auto-created in the users table on first login | High |
| F3 | Session persists across page refreshes (Supabase handles JWT) | High |
| F4 | Logout clears the session and redirects to login | High |

### 3.2 Task Management
| ID | Requirement | Priority |
|---|---|---|
| F5 | Users can create tasks with title, description, priority, due date | High |
| F6 | Users can edit any field of a task they created | High |
| F7 | Users can delete tasks they created | High |
| F8 | Tasks have a status: To Do, In Progress, In Review, Done | High |
| F9 | Tasks have a priority: Low, Medium, High, Critical | High |
| F10 | Tasks can be assigned to one or more team members | High |
| F11 | Tasks show who created them and when | Medium |

### 3.3 Task Views
| ID | Requirement | Priority |
|---|---|---|
| F12 | **Kanban Board** — Drag-and-drop columns by status | High |
| F13 | **List View** — Sortable table with filters | High |
| F14 | **Task Detail** — Full view with comments, activity log, attachments | High |
| F15 | **Dashboard** — Stats overview (total, completed, overdue) | Medium |

### 3.4 Comments & Collaboration
| ID | Requirement | Priority |
|---|---|---|
| F16 | Users can comment on any task they can see | High |
| F17 | Comments appear in real-time via WebSocket | High |
| F18 | Comments show author name, avatar, and timestamp | High |

### 3.5 Activity Log
| ID | Requirement | Priority |
|---|---|---|
| F19 | All task changes (create, status change, assign, etc.) are logged | High |
| F20 | Activity log is visible on the task detail page | Medium |
| F21 | Activity logs are immutable (insert-only) | High |

### 3.6 File Attachments
| ID | Requirement | Priority |
|---|---|---|
| F22 | Users can upload files to tasks (max 10MB) | Medium |
| F23 | Uploaded files show filename, size, upload date | Medium |
| F24 | Users can download/view attached files | Medium |

### 3.7 Admin Features
| ID | Requirement | Priority |
|---|---|---|
| F25 | Admin sees all tasks across all users | High |
| F26 | Admin dashboard shows aggregated statistics | High |
| F27 | Admin can print task reports (PDF or print view) | High |
| F28 | Admin can filter and export task data (CSV) | Medium |

### 3.8 Team Management
| ID | Requirement | Priority |
|---|---|---|
| F29 | Team page shows all company members | Medium |
| F30 | Users can see who's assigned to which tasks | Medium |

---

## 4. Non-Functional Requirements

| ID | Requirement | Priority |
|---|---|---|
| NF1 | **Performance** — Pages load in under 2 seconds | High |
| NF2 | **Responsive** — Works on desktop, tablet, and mobile | High |
| NF3 | **Security** — Users can only access their own data (RLS) | High |
| NF4 | **Dark Mode** — Toggle between light and dark themes | Medium |
| NF5 | **Accessibility** — Keyboard navigation, ARIA labels | Medium |

---

## 5. User Stories

```
As a team member, I want to sign in with Google so I don't need another password.
As a team member, I want to create tasks with a due date so nothing slips.
As a team member, I want to see my tasks on a Kanban board so I can track progress.
As a team member, I want to comment on tasks so we can discuss work in context.
As a team member, I want to see activity logs so I know what changed and who changed it.
As a manager, I want to see all tasks across the team so I can track overall progress.
As a manager, I want to print reports so I can share updates in meetings.
```

---

## 6. MVP Scope

The MVP focuses on **Team Collaboration** and includes:

1. Google OAuth login
2. Task CRUD with assignment
3. Kanban board view
4. Real-time comments
5. Activity log
6. Admin dashboard with print
