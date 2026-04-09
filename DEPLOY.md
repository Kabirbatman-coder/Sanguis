# Deploy

## Backend on Render

- Backend root directory: `backend`
- Build command: `pip install -r requirements.txt`
- Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
- Health check path: `/health`
- Manual env vars:
  - `CORS_ORIGINS=https://your-vercel-project.vercel.app`

## Frontend on Vercel

- Frontend root directory: `frontend`
- Build command: `npm run build`
- Output directory: `dist`
- Manual env vars:
  - `VITE_API_BASE_URL=https://your-render-service.onrender.com`

## Local dev

- Backend from `backend`: `python -m uvicorn app.main:app --reload`
- Frontend from `frontend`: `npm run dev`
- Local frontend falls back to `http://127.0.0.1:8000` automatically when `VITE_API_BASE_URL` is not set.
