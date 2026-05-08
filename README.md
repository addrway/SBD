# SBD Pro

SBD Pro is a Simple Business Dashboards SaaS MVP for small businesses, logistics teams, managers, and consultants.

Core message: **Enter your data. See your business clearly.**

## Tech Stack

- React with Create React App
- Chart.js and react-chartjs-2
- PapaParse for CSV uploads
- Supabase Auth and Postgres
- Vercel hosting
- Figtree body font and Playfair Display headings

## Environment Variables

Add these in Vercel and in local `.env`:

```env
REACT_APP_SUPABASE_URL=https://cfzlglnnqyetjtbtixlx.supabase.co
REACT_APP_SUPABASE_KEY=sb_publishable_ihmJz3DWT4_wcGxKNYr9qg_RE-MC0fq
ANTHROPIC_API_KEY=your-server-side-anthropic-key
```

Never use a Supabase service role key in the frontend. The Anthropic key is only for server-side API routes.

## Local Development

```bash
npm install
npm run build
npm start
```

## Vercel Settings

- Application Preset: Create React App
- Root Directory: `./`
- Build Command: `npm run build`
- Output Directory: `build`

The repo includes `vercel.json` with these settings.

## Supabase Setup

Run `supabase-schema.sql` or `schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `tasks`
- `uploads`
- `invoices`
- `receipts`
- `inventory`
- `customers`
- `time_entries`
- `transactions`
- `contractors`
- `reports`

All user-owned tables have Row Level Security enabled and policies requiring `auth.uid()` ownership.

## Authentication Flow

- Unauthenticated users see marketing, pricing, login, and signup screens.
- Signup creates a Supabase Auth user.
- The database trigger creates a `profiles` row with role `customer`, plan `trial`, and a 24-hour trial timestamp.
- Authenticated users can access the protected dashboard.
- Logout clears the stored session.

## Admin Setup

Create this test user in Supabase Auth:

- Email: `addrway@outlook.com`
- Password: use the temporary test password provided separately

Do not store that password in code. Change it after testing.

After signup, run:

```sql
update profiles
set role = 'admin'
where email = 'addrway@outlook.com';
```

## What Works Now

- Premium marketing site
- Login/signup/logout
- Protected app shell
- Dashboard KPI cards and charts
- Fully functional Projects module
- Create, edit, and delete tasks
- Task phase, status, and priority fields
- Supabase-backed task storage
- CSV upload with drag-and-drop
- CSV preview and task import
- KPI and chart refresh after import
- Finance dashboard architecture
- Reports, invoices, receipts, payroll, contractors, inventory, time tracking, and settings scaffolds
- Admin-only Command Center gate

## Later Backend Work

These are intentionally placeholders until secure backend routes are added:

- Stripe Checkout and Billing Portal
- Plaid, bank, PayPal, QuickBooks, Gusto, ADP integrations
- PDF parsing with PDF.js
- Excel parsing with SheetJS
- OCR and AI receipt categorization
- Admin-wide analytics across all users
- External AI agent calls from protected backend routes
