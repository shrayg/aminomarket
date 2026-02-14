# Aminomarket Placeholder Checklist

Fill in each item and mark when done. Use this as a reference when sending content or configuring the site.

---

## 1. Environment Variables (Vercel / `.env`)

- [ ] `DATABASE_URL` — PostgreSQL connection string (e.g. Neon, Vercel Postgres)
- [ ] `JWT_SECRET` — Random secret string for auth (generate with `openssl rand -hex 32`)
- [ ] `FRONTEND_URL` — Production URL, e.g. `https://aminomarket.shop`
- [ ] `STRIPE_SECRET_KEY` — From Stripe Dashboard → Developers → API keys
- [ ] `STRIPE_WEBHOOK_SECRET` — From Stripe Dashboard → Webhooks (when you add one)

---

## 2. Business / Contact Info

These appear in the Footer and Contact page.

- [ ] **Company name** — (currently: Aminomarket)
- [ ] **Street address** — (currently: 11323 Arcade Dr. STE 105, Little Rock, AR 72212)
- [ ] **Email** — (currently: aminomarketshop@gmail.com)
- [ ] **Phone** — (currently: +1 877 312 1560)
- [ ] **Hours** — (currently: Mon–Fri, 9am–5pm GMT-6)

---

## 3. Hero Carousel (`src/data/heroCarousel.ts`)

Images go in `public/hero/`. Update filenames and links to match.

- [ ] Slide 1 — image: `peptide-1.jpg`, button text: `Shop Research Peptides`, href: `/shop?category=research-peptides`
- [ ] Slide 2 — image: `peptide-2.jpg`, button text: `View Formulations`, href: `/shop?category=research-formulations`
- [ ] Slide 3 — image: `peptide-3.jpg`, button text: `Browse Accessories`, href: `/shop?category=accessories`

*(Add more slides in the array if needed.)*

---

## 4. Form Fields (for reference – users type these in)

Checkout: Email, Full Name, Address, City, State, ZIP  
Contact: Name, Email, Phone, Subject, Order Number, Message  
Newsletter: Email  
Login / Register: Email, Password (Name on register)  
Forgot password: Email  
Track order: Order number

*(No content to fill – these are labels/placeholders shown to visitors.)*

---

## 5. Page Content (currently PLACEHOLDER text)

- [ ] **Privacy Policy** (`/privacy`) — Data collection, usage, storage, cookies, user rights
- [ ] **Terms & Conditions** (`/terms`) — Research-use-only disclaimer, purchase agreement, liability
- [ ] **Return & Refund Policy** (`/returns`) — Full policy details
- [ ] **Shipping Policy** (`/shipping`) — Timelines, zones, international options
- [ ] **COA / Certificates** (`/coa`) — Batch lookup, product COA links, or PDF hosting
- [ ] **Affiliates** (`/affiliates`) — Commission structure, sign-up form, links

---

## 6. Backend / Integrations

- [ ] **Contact form** — Connect email service (Resend, SendGrid, etc.) in `server/routes/contact.js`
- [ ] **Password reset** — Add reset flow in `ForgotPassword.tsx` and backend
- [ ] **Order tracking** — Add tracking API in `TrackOrder.tsx` and backend
- [ ] **Stripe checkout** — Configure when you add Stripe keys; checkout route is already wired

---

## 7. Test / Seed Data

- [ ] **Test user** — Seed creates `test@example.com` / `password123`; remove or change for production

---

## Quick Copy (for sending)

```
Business Name: 
Address: 
Email: 
Phone: 
Hours: 

Stripe keys: (add when ready)
DATABASE_URL: 
JWT_SECRET: 
FRONTEND_URL: 
```
