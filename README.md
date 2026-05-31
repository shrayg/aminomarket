# Aminomarket

Full-stack e-commerce: **Vite + React + Tailwind** frontend + **Node.js/Express** backend.

## Deploy to Vercel

1. **Push to GitHub** and import the repo in [Vercel](https://vercel.com).

2. **Add environment variables** in Vercel project settings:
   - `DATABASE_URL` – PostgreSQL connection string (use [Neon](https://neon.tech) free tier or Vercel Postgres)
   - `JWT_SECRET` – random string for auth
   - `FRONTEND_URL` – `https://aminomarket.shop` (or your Vercel URL)
   - `STRIPE_SECRET_KEY` – server-side Stripe key for Checkout Sessions
   - `STRIPE_WEBHOOK_SECRET` – signing secret for `https://aminomarket.shop/api/stripe/webhook`

3. **Deploy** – Vercel will build the frontend and deploy the API as serverless functions.

4. **Seed the database** (first time):
   ```bash
   DATABASE_URL="your-postgres-url" npx prisma db push --schema=server/prisma/schema.prisma
   DATABASE_URL="your-postgres-url" node server/prisma/seed.js
   ```

## Local development

### 1. Database

Use PostgreSQL (Neon free tier, Docker, or local). Add the variables to the root `.env`:

```
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
JWT_SECRET=dev-secret
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
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
| `npm run stripe:sync -- --apply --confirm-stripe-approval` | Create or update the Stripe Product and Price catalog from `catalog/products.json` |
| `npm run stripe:webhook -- --apply --confirm-stripe-approval` | Register the production Stripe webhook and save its signing secret locally |
