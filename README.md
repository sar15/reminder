# DeadlineShield

Compliance management platform for Indian CA firms. Automated reminders, zero-login client document uploads, and court-admissible audit trails.

## Stack

- **Framework** — Next.js 15 (App Router)
- **Database / Auth** — Supabase (Postgres + RLS)
- **Email** — Resend
- **PDF** — @react-pdf/renderer
- **Validation** — Zod
- **Styling** — Tailwind CSS + inline styles

## Features

- Excel/CSV bulk client import with auto task generation
- Daily cron (3 AM IST) fires T-7, T-3, T-1 email reminders automatically
- Magic link portal — clients upload documents without login
- Task status machine: `pending → waiting_docs → docs_received → filed`
- Immutable audit trail + one-click PDF liability report
- Full multi-tenant isolation via Supabase RLS

## Local Setup

```bash
npm install
```

Copy the environment template and fill in your values:

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service role key (server only) |
| `RESEND_API_KEY` | ✅ | Resend API key for email |
| `CRON_SECRET` | ✅ | Secret for protecting the cron endpoint |
| `NEXT_PUBLIC_APP_URL` | ✅ | Your deployed app URL |

## Database

Run migrations in order from `supabase/migrations/`. Schema is in `supabase/schema.sql`.

## Deployment

Deploys to Vercel. The `vercel.json` includes the cron schedule (`0 3 * * *` — 3 AM UTC / 8:30 AM IST... adjusted for IST offset in code).

Set all environment variables in Vercel dashboard before deploying.

## Demo

Visit `/dashboard/demo` for a no-auth demo with mock data.  
Client portal demos: `/portal/demo-sharma`, `/portal/demo-patel`
