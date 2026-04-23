# CA Compliance Shield

> Compliance Risk Mitigation Platform for Indian CA Firms.
> Timestamped, court-admissible proof of every client communication.

## What This Is

Not a "due date reminder." A **Compliance Control Layer** that:
- Sends personalized 1-to-1 email + WhatsApp reminders (never CC'd)
- Logs every send/delivery/open in an **immutable audit trail**
- Generates a **Liability Report PDF** — court-admissible proof when clients blame you for penalties
- Gives clients a **magic link portal** to upload documents (no login needed)
- Shows a **Risk Heatmap** dashboard (Red/Yellow/Green) sorted by deadline proximity

## Tech Stack

| Layer | Tool |
|---|---|
| Frontend + Backend | Next.js 15 (App Router, Server Actions) |
| Database + Auth | Supabase (PostgreSQL + magic link auth) |
| Email | Resend (free: 3,000/mo) |
| WhatsApp | Cleomitra / Interakt (add after first paying customer) |
| Hosting | Vercel (free tier) |
| Styling | Tailwind CSS v4 |

**Total MVP cost: Rs.1,050/month. Profitable with 1 paying customer at Rs.1,499/mo.**

## How to Run

### Step 1: Supabase Setup
1. Create a project at [supabase.com](https://supabase.com)
2. Go to SQL Editor → paste and run `supabase/schema.sql`
3. Copy your Project URL and anon key

### Step 2: Resend Setup
1. Sign up at [resend.com](https://resend.com)
2. Create an API key

### Step 3: Environment Variables
```bash
cp .env.local .env.local
# Fill in:
# NEXT_PUBLIC_SUPABASE_URL=
# NEXT_PUBLIC_SUPABASE_ANON_KEY=
# SUPABASE_SERVICE_ROLE_KEY=
# RESEND_API_KEY=
```

### Step 4: Install & Run
```bash
npm install
npm run dev
# → http://localhost:3000
```

## Key Screens

| Route | What it does |
|---|---|
| `/dashboard` | Risk Heatmap — all clients Red/Yellow/Green |
| `/dashboard/clients` | Client list |
| `/dashboard/clients/new` | Add client with compliance types |
| `/dashboard/clients/[id]` | Client detail + audit trail |
| `/dashboard/clients/[id]/remind` | Send personalized reminder (logged) |
| `/dashboard/tasks` | All tasks sorted by deadline proximity |
| `/dashboard/reports` | Liability Reports list |
| `/dashboard/reports/[id]` | Full audit timeline + PDF download |
| `/portal/[token]` | Client magic link portal (no login) |

## The Liability Report

The single most important feature. At the end of every compliance cycle, generate a PDF showing:
- Every reminder sent (timestamp + message ID)
- Delivery and open status
- When documents were uploaded
- When the return was filed
- Clear conclusion: was the delay caused by client inaction?

Use it to defend against ICAI complaints, client disputes, and penalty claims.

## Pricing Tiers

| Tier | Price | Clients |
|---|---|---|
| Starter | Free | 5 |
| Growth | Rs.999/mo | 25 |
| Professional | Rs.2,499/mo | 75 |
| Enterprise | Rs.4,999/mo | Unlimited |
