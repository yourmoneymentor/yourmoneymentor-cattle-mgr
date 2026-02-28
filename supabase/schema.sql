-- Cattle Manager schema (Supabase Postgres)
-- Run in Supabase SQL editor.

-- Extensions
create extension if not exists pgcrypto;

-- Cattle profile
create table if not exists public.cattle (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  tag text not null,          -- ear tag / name
  breed text,
  sex text,
  dob date,
  purchase_date date,
  purchase_price numeric,
  status text not null default 'active', -- active|sold|deceased
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists cattle_user_id_idx on public.cattle(user_id);
create unique index if not exists cattle_user_tag_idx on public.cattle(user_id, tag);

-- Feeding logs
create table if not exists public.feedings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  fed_on date not null default current_date,
  fed_at time,
  feed_type text not null,
  amount numeric,
  unit text default 'kg',
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists feedings_user_fed_on_idx on public.feedings(user_id, fed_on);

-- Health events (vaccinations/treatments)
create table if not exists public.health_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  cattle_id uuid references public.cattle(id) on delete cascade,
  event_date date not null default current_date,
  event_type text not null, -- vaccination|treatment|check
  title text not null,
  product text,
  dose text,
  administered_by text,
  notes text,
  next_due_date date,
  created_at timestamptz not null default now()
);

create index if not exists health_user_next_due_idx on public.health_events(user_id, next_due_date);
create index if not exists health_cattle_id_idx on public.health_events(cattle_id);

-- Weight logs
create table if not exists public.weights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  cattle_id uuid references public.cattle(id) on delete cascade,
  weighed_on date not null default current_date,
  weight_kg numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists weights_cattle_weighed_on_idx on public.weights(cattle_id, weighed_on);

-- Tasks
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  title text not null,
  frequency text not null default 'daily', -- daily|weekly|oneoff
  due_on date,
  completed boolean not null default false,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists tasks_user_due_idx on public.tasks(user_id, due_on);

-- Sales
create table if not exists public.sales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  cattle_id uuid references public.cattle(id) on delete set null,
  sold_on date not null,
  buyer text,
  sale_price numeric not null,
  weight_kg numeric,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists sales_user_sold_on_idx on public.sales(user_id, sold_on);

-- Purchases (incoming cattle)
create table if not exists public.purchases (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  purchased_on date not null,
  seller text,
  count int not null default 1,
  total_price numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

-- Finance transactions
create table if not exists public.finance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  trans_date date not null default current_date,
  kind text not null,  -- cost|income
  category text not null, -- feed|vet|fuel|sale|other
  amount numeric not null,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists finance_user_date_idx on public.finance(user_id, trans_date);

-- RLS
alter table public.cattle enable row level security;
alter table public.feedings enable row level security;
alter table public.health_events enable row level security;
alter table public.weights enable row level security;
alter table public.tasks enable row level security;
alter table public.sales enable row level security;
alter table public.purchases enable row level security;
alter table public.finance enable row level security;

-- Policies (authenticated users only)
-- Note: Supabase exposes auth.uid() in SQL.

create policy "cattle: own rows" on public.cattle
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "feedings: own rows" on public.feedings
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "health_events: own rows" on public.health_events
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "weights: own rows" on public.weights
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "tasks: own rows" on public.tasks
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "sales: own rows" on public.sales
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "purchases: own rows" on public.purchases
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

create policy "finance: own rows" on public.finance
for all to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());
