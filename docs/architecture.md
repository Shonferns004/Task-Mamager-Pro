# UCS Task Manager — System Architecture

## Overview

UCS Task Manager is a full-stack web application for managing tasks within the company. It uses **Supabase** as the BaaS (Backend-as-a-Service) for database, authentication, storage, and real-time features, with a **Node.js/Express** backend for admin-specific operations and a **React** frontend.

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18 + TypeScript + Vite | UI rendering |
| **Styling** | Tailwind CSS 3 | Utility-first styling |
| **Drag & Drop** | @dnd-kit | Kanban board |
| **Charts** | Recharts | Analytics |
| **Print/Export** | jsPDF | PDF reports |
| **Backend** | Node.js + Express + TypeScript | Admin APIs, reports, notifications |
| **Database** | Supabase PostgreSQL | All persistent data |
| **Auth** | Supabase Auth (Google OAuth) | User authentication |
| **Storage** | Supabase Storage | File attachments |
| **Realtime** | Supabase Realtime | Live comments & activity |
| **Hosting** | Vercel (client) / Render (backend) | Deployment |

---

## System Architecture Diagram

```mermaid
graph TB
    User([User Browser])
    Admin([Admin Browser])

    subgraph "Client Layer"
        React[React App\nVite + TypeScript + Tailwind]
        SupaClient[Supabase JS Client]
        AuthCtx[Auth Context\nGoogle OAuth]
        RealtimeSub[Realtime Subscriptions]
    end

    subgraph "Supabase Cloud"
        Auth[Supabase Auth\nGoogle Provider]
        DB[(PostgreSQL\nDatabase)]
        Storage[Supabase Storage\nAttachments]
        Realtime[Supabase Realtime\nWebSocket]
    end

    subgraph "Backend Layer (Express)"
        Express[Express Server\nTypeScript]
        AdminAPI[Admin Routes]
        ReportService[Report Service]
        NotificationSvc[Notification Service]
        SupaAdmin[Supabase Admin Client\nservice_role key]
    end

    User --> React
    Admin --> React

    React --> SupaClient
    SupaClient -->|RLS queries| DB
    SupaClient -->|Auth requests| Auth
    SupaClient -->|Upload/Download| Storage
    SupaClient -->|Subscribe| Realtime

    Express --> SupaAdmin
    SupaAdmin -->|Bypass RLS| DB
    Express -->|SendGrid / SMTP| Email([Email Notifications])

    AdminAPI --> Express
    AuthCtx --> SupaClient
```

---

## Data Flow

```mermaid
sequenceDiagram
    participant U as User
    participant R as React App
    participant SC as Supabase Client
    participant S as Supabase
    participant E as Express API
    participant A as Supabase Admin Client

    Note over U,A: Authentication Flow
    U->>R: Click "Sign in with Google"
    R->>SC: supabase.auth.signInWithOAuth({provider:'google'})
    SC->>S: OAuth redirect
    S->>U: Google consent screen
    U->>S: Grant access
    S->>R: Redirect with session
    R->>SC: supabase.auth.getSession()
    SC->>R: User session + JWT

    Note over U,A: Task CRUD (Regular User)
    U->>R: Create task
    R->>SC: supabase.from('tasks').insert({...})
    SC->>S: Insert with RLS check
    S->>SC: Inserted row
    R->>U: Show updated UI

    Note over U,A: Admin Operation
    U->>R: Admin views all tasks
    R->>E: GET /api/admin/tasks (JWT header)
    E->>A: supabaseAdmin.from('tasks').select('*')
    A->>E: All tasks
    E->>R: JSON response
    R->>U: Render admin table

    Note over U,A: Real-time Comments
    U->>R: Add comment
    R->>SC: supabase.from('comments').insert({...})
    R->>SC: channel.on('postgres_changes',...)
    SC->>R: Real-time update
    R->>U: New comment appears
```

---

## Folder Structure

```
ucs-task-manager/
├── client/                     # React frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── ui/             # Reusable UI primitives
│   │   │   ├── layout/         # Sidebar, Header, Layout
│   │   │   ├── tasks/          # Task-specific components
│   │   │   ├── comments/       # Comment components
│   │   │   ├── team/           # Team components
│   │   │   └── admin/          # Admin components
│   │   ├── pages/              # Route pages
│   │   ├── hooks/              # Custom React hooks
│   │   ├── lib/                # Utilities + Supabase client
│   │   ├── contexts/           # React contexts
│   │   └── types/             # TypeScript types
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   └── tailwind.config.ts
├── backend/
│   ├── supabase/
│   │   ├── migrations/         # SQL migration files
│   │   └── seed.sql            # Seed data
│   ├── src/
│   │   ├── routes/             # Express route handlers
│   │   ├── middleware/         # Auth & error middleware
│   │   ├── services/           # Business logic
│   │   ├── config/            # Supabase client, env
│   │   └── index.ts           # Entry point
│   ├── functions/              # Supabase Edge Functions
│   ├── package.json
│   └── tsconfig.json
└── docs/
    ├── architecture.md
    ├── requirements.md
    ├── database-schema.md
    ├── api-design.md
    ├── ui-ux.md
    ├── security.md
    └── deployment.md
```

---

## Key Design Decisions

1. **Supabase-first approach** — Most client operations talk directly to Supabase with RLS for security. Express backend is only used for admin endpoints that need to bypass RLS.

2. **Row Level Security (RLS)** — All tables have strict RLS policies. Regular users can only see tasks they created or are assigned to. Admins can see everything.

3. **Real-time by default** — Comments and activity logs use Supabase Realtime subscriptions for live updates.

4. **JWT-based auth** — The Express backend verifies Supabase JWTs to authorize requests. Admins are identified by their `role` field in the `users` table.

5. **Service role key** — The Express backend uses Supabase's `service_role` key (never exposed to the client) to bypass RLS for admin operations.
