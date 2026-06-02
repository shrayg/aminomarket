# Aminomarket

Full-stack e-commerce: **Vite + React + Tailwind** frontend and **Node.js/Express** backend.

## Deploy To Vercel

1. Push to GitHub and import the repo in [Vercel](https://vercel.com).

2. Add environment variables in Vercel project settings:
   - `ADMIN_JWT_SECRET` - random signing secret for admin session JWTs
   - `ADMIN_CODE_SECRET` - HMAC key used to derive the rotating admin access code
   - `CRON_SECRET` - shared secret used by Supabase `pg_cron` to authenticate
     to `/api/admin/code/notify` (must match the value stored in Supabase
     Vault as `amp_admin_cron_secret` - see step 3 below)
   - `DISCORD_ADMIN_WEBHOOK_URL` - private Discord webhook that receives the rotating admin code
   - `SUPABASE_URL` - Supabase project URL
   - `SUPABASE_ANON_KEY` - Supabase publishable legacy anon key
   - `SUPABASE_SERVICE_ROLE_KEY` - Supabase server-only service-role key
   - `JWT_SECRET` - random string for customer auth
   - `FRONTEND_URL` - `https://aminomarket.shop`
   - `STRIPE_SECRET_KEY` - server-side Stripe key for Checkout Sessions
   - `STRIPE_WEBHOOK_SECRET` - signing secret for `https://aminomarket.shop/api/stripe/webhook`
   - `DISCORD_SIGNUPS_WEBHOOK_URL` - restricted operations channel for account signups
   - `DISCORD_PAYMENTS_WEBHOOK_URL` - restricted operations channel for payment events
   - `DISCORD_FULFILLMENT_WEBHOOK_URL` - restricted operations channel for paid orders
   - `DISCORD_MANUFACTURE_WEBHOOK_URL` - manufacture-totals notification channel

3. Link and apply the tracked Supabase migrations once:

   ```bash
   npx supabase login
   npx supabase link --project-ref your-project-ref
   npm run db:push
   ```

   Then in the Supabase SQL editor, store the cron secret + base URL in Vault
   (one-time, secrets are not in git):

   ```sql
   select vault.create_secret(
     '<your CRON_SECRET value, must match Vercel env>',
     'amp_admin_cron_secret',
     'Bearer token used by pg_cron to call /api/admin/code/notify'
   );

   select vault.create_secret(
     'https://aminomarket.shop',
     'amp_admin_base_url',
     'Origin used by pg_cron when calling the admin notify endpoint'
   );
   ```

   `pg_cron` will then POST to `/api/admin/code/notify` every hour on the
   hour, which derives the current rotating admin code (HMAC of
   `ADMIN_CODE_SECRET` x current UTC hour bucket) and publishes it to
   `DISCORD_ADMIN_WEBHOOK_URL`. Vercel cron is no longer used for this -
   the Hobby plan caps Vercel crons at once per day.

4. Deploy. Vercel builds the frontend and deploys the Express API as serverless functions.

## Local Development

Add the variables to the root `.env`:

```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
JWT_SECRET=dev-secret
ADMIN_JWT_SECRET=dev-admin-secret
ADMIN_CODE_SECRET=dev-admin-code-hmac-key
CRON_SECRET=dev-cron-secret
FRONTEND_URL=http://localhost:5173
STRIPE_SECRET_KEY=sk_...
STRIPE_WEBHOOK_SECRET=whsec_...
DISCORD_ADMIN_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_SIGNUPS_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_PAYMENTS_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_FULFILLMENT_WEBHOOK_URL=https://discord.com/api/webhooks/...
DISCORD_MANUFACTURE_WEBHOOK_URL=https://discord.com/api/webhooks/...
```

Keep `SUPABASE_SERVICE_ROLE_KEY` on the server only. Never expose it through a `VITE_` variable.

Start the backend:

```bash
cd server
npm install
npm run dev
```

Start the frontend in another terminal:

```bash
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` to the backend.

The internal dashboard is available at http://localhost:5173/admin. There is no static
admin password &mdash; login is gated by a rotating hourly access code derived from
`ADMIN_CODE_SECRET` (HMAC of the current UTC hour bucket). The code is published to
`DISCORD_ADMIN_WEBHOOK_URL` every hour by Supabase `pg_cron`, which POSTs to
`/api/admin/code/notify` with the `CRON_SECRET` Bearer token (configuration lives in
`supabase/migrations/20260601230000_admin_code_hourly_broadcast.sql`). Issued admin
JWTs expire when the current code rotates, so the dashboard auto-logs out at the
boundary.

## Stack

**Frontend:** Vite, React 18, React Router, Tailwind CSS, Zustand  
**Backend:** Express, Supabase PostgreSQL, JWT auth, Stripe

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start frontend |
| `npm run server` | Start backend |
| `npm run build` | Build for production |
| `npm run db:push` | Apply tracked SQL migrations to the linked Supabase project |
| `npm run vercel-build` | Create the Vercel production bundle |
| `npm run stripe:sync -- --apply --confirm-stripe-approval` | Create or update the Stripe Product and Price catalog from `catalog/products.json` |
| `npm run stripe:webhook -- --apply --confirm-stripe-approval` | Register the production Stripe webhook and save its signing secret locally |
