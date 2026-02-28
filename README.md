# Cattle Manager (mobile-first)

Production: https://cattle-mgr.vercel.app

## What it does
A simple phone-friendly app for a farmer managing ~50 head of cattle.

- Feeding management: quick daily entries
- Health & vaccinations: per-animal logs + next-due dates (alerts on Dashboard)
- Weight & growth: per-animal weight chart + simple sale readiness estimate
- Sales: record sales, auto-marks animal sold + adds finance income entry
- Tasks: daily/weekly tasks with checkboxes
- Finance: costs/income entries + profit trend chart

## Setup (Supabase)

### 1) Create Supabase project
- Create a new project in Supabase.

### 2) Create tables + RLS
- In Supabase → SQL Editor, run: `supabase/schema.sql`

### 3) Enable Auth
- Supabase → Authentication → Providers → enable Email.
- Magic link is fine.

### 4) Add env vars in Vercel
In Vercel → Project → Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Redeploy after setting them.

## Farmer instructions (daily use)

1) Open the app: https://cattle-mgr.vercel.app
2) Tap **Log in** and enter your email.
3) From **Dashboard**:
   - Tap **+ Feeding** to log today’s feed
   - Tap **Cattle** → **+ Add** to add an animal
4) For each animal:
   - Add **weights** over time to get the growth chart + readiness estimate
   - Log **vaccinations/treatments** and set **Next due** for alerts
5) Use **Tasks** for daily/weekly checklists
6) Use **Sales** to record sales (it will mark the animal sold)
7) Use **Finance** to track feed/vet/fuel costs and sale income

## Notes
- Reminders/notifications: the app highlights due items on the Dashboard (true push notifications can be added later).
