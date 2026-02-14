# Aminomarket

Full-stack e-commerce: **Vite + React + Tailwind** frontend + **Node.js/Express** backend.

## Deploy to Vercel

1. **Push to GitHub** and import the repo in [Vercel](https://vercel.com).

2. **Add environment variables** in Vercel project settings:
   - `DATABASE_URL` – PostgreSQL connection string (use [Neon](https://neon.tech) free tier or Vercel Postgres)
   - `JWT_SECRET` – random string for auth
   - `FRONTEND_URL` – `https://aminomarket.shop` (or your Vercel URL)
   - `STRIPE_SECRET_KEY` – (optional) for Stripe checkout

3. **Deploy** – Vercel will build the frontend and deploy the API as serverless functions.

4. **Seed the database** (first time):
   ```bash
   DATABASE_URL="your-postgres-url" npx prisma db push --schema=server/prisma/schema.prisma
   DATABASE_URL="your-postgres-url" node server/prisma/seed.js
   ```

## Local development

### 1. Database

Use PostgreSQL (Neon free tier, Docker, or local). Create `server/.env`:

```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
JWT_SECRET=dev-secret
FRONTEND_URL=http://localhost:5173
```

### 2. Backend

```bash
cd server
npm install
npx prisma db push
npm run db:seed
npm run dev
```

### 3. Frontend

```bash
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend.

## Stack

**Frontend:** Vite, React 18, React Router, Tailwind CSS, Zustand  
**Backend:** Express, Prisma (PostgreSQL), JWT auth, Stripe (optional)

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend |
| `npm run server` | Start backend |
| `npm run build` | Build for production (Vercel) |
