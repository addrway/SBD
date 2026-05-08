# SBD Pro

SBD Pro is a Simple Business Dashboard for small businesses, logistics teams, managers, and consultants. Core message: **Enter your data. See your business clearly.**

## Stack

- React 18 with Create React App
- Supabase Auth and Postgres
- Vercel hosting and serverless API routes
- Anthropic Claude API for AI Auto-Formulate and the SBD AI Agent
- Figtree body font and Playfair Display headings

## Environment

Copy `.env.example` to `.env` locally and configure:

```bash
REACT_APP_SUPABASE_URL=https://cfzlglnnqyetjtbtixlx.supabase.co
REACT_APP_SUPABASE_KEY=your-supabase-anon-key
ANTHROPIC_API_KEY=your-server-side-anthropic-key
```

`REACT_APP_SUPABASE_KEY` is the public Supabase anon key. `ANTHROPIC_API_KEY` must only be set in the server/Vercel environment.

## Database

Run `schema.sql` in the Supabase SQL editor. It creates:

- `profiles`
- `finance`
- `projects`
- `logistics`
- `inventory`
- `customers`

Every data table has RLS enabled and policies requiring `auth.uid()` to match the row owner. The `handle_new_user()` trigger creates a profile with `plan='trial'` and `trial_ends=now()+24 hours` when a user signs up.

## Local Development

```bash
npm install
npm start
```

## Build

```bash
npm run build
```

## Vercel Deployment

1. Import `https://github.com/addrway/SBD` into Vercel.
2. Add `REACT_APP_SUPABASE_URL`, `REACT_APP_SUPABASE_KEY`, and `ANTHROPIC_API_KEY`.
3. Deploy with the default Create React App build command: `npm run build`.

## Product

- Product: SBD Pro
- Price: $29.99/month
- Trial: 24 hours free, no credit card required
- Input methods: manual forms and AI Auto-Formulate
- Modules: Finance, Projects, Logistics, Inventory, Customers, Reports

## AI Agent System Prompt

> You are the SBD AI Agent — a built-in intelligent assistant inside SBD (Simple Business Dashboard), a $29.99/month subscription platform. SBD has 6 modules: Finance, Projects, Logistics, Inventory, Customers, Reports. Users enter data manually or via AI Auto-Formulate. Be sharp, concise, and data-driven. Under 120 words unless asked for more.
