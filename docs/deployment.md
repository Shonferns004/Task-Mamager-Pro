# UCS Task Manager — Deployment

## Prerequisites

- Supabase account (free tier)
- Google Cloud Console project with OAuth 2.0 credentials
- Vercel account (for frontend)
- Render / Railway account (for backend)
- Domain name (optional)

---

## 1. Supabase Setup

### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and anon key from **Settings → API**

### Step 2: Configure Google Auth

1. Go to **Authentication → Providers**
2. Enable **Google**
3. Get OAuth credentials from [Google Cloud Console](https://console.cloud.google.com)
   - Authorized redirect URI: `https://<project>.supabase.co/auth/v1/callback`

### Step 3: Run Migrations

Run the SQL from `backend/supabase/migrations/001_schema.sql` in the Supabase SQL Editor.

### Step 4: Create Storage Bucket

1. Go to **Storage**
2. Create bucket: `task-attachments`
3. Set as **private**

### Step 5: Set Admin User

After the first admin signs in via Google, run:
```sql
UPDATE users SET role = 'admin' WHERE email = 'admin@ucs.com';
```

---

## 2. Environment Variables

### Client (`client/.env`)

```env
VITE_SUPABASE_URL=https://<project>.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
VITE_API_URL=http://localhost:3001/api
```

### Backend (`backend/.env`)

```env
PORT=3001
SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
SUPABASE_ANON_KEY=<your-anon-key>
CLIENT_URL=http://localhost:5173
NODE_ENV=development
```

---

## 3. Local Development

```bash
# Terminal 1 — Backend
cd backend
npm install
npm run dev

# Terminal 2 — Client
cd client
npm install
npm run dev
```

---

## 4. Production Deployment

### Frontend — Vercel

1. Push code to GitHub
2. Go to [vercel.com](https://vercel.com) and import repository
3. Set root directory to `client/`
4. Add environment variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_URL` → your backend URL
5. Deploy

### Backend — Render

1. Go to [render.com](https://render.com) and create a **Web Service**
2. Connect GitHub repository
3. Set root directory to `backend/`
4. Build command: `npm run build`
5. Start command: `npm start`
6. Add all environment variables
7. Deploy

---

## 5. CI/CD (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy

on:
  push:
    branches: [main]

jobs:
  deploy-client:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./client

  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Render
        uses: johnbeynon/render-deploy-action@v0.0.8
        with:
          service-id: ${{ secrets.RENDER_SERVICE_ID }}
          api-key: ${{ secrets.RENDER_API_KEY }}
```

---

## 6. Domain Setup

1. Add custom domain in Vercel project settings
2. Add CNAME record to DNS provider
3. Update Supabase Auth redirect URLs to use production domain
4. Update Google OAuth authorized redirect URIs

---

## 7. Monitoring & Maintenance

| Task | Frequency | Tool |
|---|---|---|
| Database backups | Daily | Supabase automatic backups |
| Error monitoring | Real-time | Sentry (optional) |
| Performance monitoring | Real-time | Vercel Analytics |
| Logs | On-demand | Render logs |
