# Deployment Guide - Production Release

---

## 1. Supabase Setup
1. Create a project at [supabase.com](https://supabase.com).
2. Run SQL Migration:
   - Navigate to SQL Editor in Supabase.
   - Paste contents of `backend/supabase/migrations/202610300001_initial_schema.sql` and run.
3. Retrieve Project URL, Anon Key, and Service Role Key from Project Settings > API.

---

## 2. Backend Deployment on Render
1. Create a new **Web Service** on Render connected to your Git repository.
2. Root Directory: `backend`
3. Environment: `Node`
4. Build Command: `npm install && npm run build`
5. Start Command: `npm start`
6. Environment Variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `FRONTEND_URL=https://your-frontend.vercel.app`
   - `SUPABASE_URL=https://your-project.supabase.co`
   - `SUPABASE_ANON_KEY=...`
   - `SUPABASE_SERVICE_ROLE_KEY=...`
   - `GEMINI_API_KEY=...`
   - `GEMINI_MODEL=gemini-2.0-flash`
   - `GEMINI_EMBEDDING_MODEL=text-embedding-004`
   - `TAVILY_API_KEY=...`
   - `OPENALEX_EMAIL=your-email@domain.com`

---

## 3. Frontend Deployment on Vercel
1. Import repository on [vercel.com](https://vercel.com).
2. Root Directory: `frontend`
3. Framework Preset: `Vite`
4. Build Command: `npm run build`
5. Output Directory: `dist`
6. Environment Variables:
   - `VITE_API_BASE_URL=https://your-backend.onrender.com/api/v1`
   - `VITE_SUPABASE_URL=https://your-project.supabase.co`
   - `VITE_SUPABASE_ANON_KEY=...`

