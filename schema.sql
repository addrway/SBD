create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text,
  email text,
  plan text not null default 'trial',
  trial_ends timestamptz not null default (now() + interval '24 hours'),
  created_at timestamptz not null default now()
);

create table if not exists public.finance (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  type text not null check (type in ('revenue', 'expense')),
  description text not null,
  amount numeric(12,2) not null default 0,
  category text,
  date date not null default current_date,
  created_at timestamptz not null default now()
);

create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  status text not null default 'active',
  priority text not null default 'medium',
  progress integer not null default 0 check (progress between 0 and 100),
  due_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.logistics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  shipment_id text not null,
  destination text not null,
  status text not null default 'pending',
  cost numeric(12,2) not null default 0,
  ship_date date,
  created_at timestamptz not null default now()
);

create table if not exists public.inventory (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  stock integer not null default 0,
  min_level integer not null default 0,
  unit_value numeric(12,2) not null default 0,
  created_at timestamptz not null default now()
);

create table if not exists public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  email text,
  total_spend numeric(12,2) not null default 0,
  status text not null default 'active',
  joined_date date not null default current_date,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.finance enable row level security;
alter table public.projects enable row level security;
alter table public.logistics enable row level security;
alter table public.inventory enable row level security;
alter table public.customers enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);

create policy "Users can view own finance" on public.finance for select using (auth.uid() = user_id);
create policy "Users can insert own finance" on public.finance for insert with check (auth.uid() = user_id);
create policy "Users can update own finance" on public.finance for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own finance" on public.finance for delete using (auth.uid() = user_id);

create policy "Users can view own projects" on public.projects for select using (auth.uid() = user_id);
create policy "Users can insert own projects" on public.projects for insert with check (auth.uid() = user_id);
create policy "Users can update own projects" on public.projects for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own projects" on public.projects for delete using (auth.uid() = user_id);

create policy "Users can view own logistics" on public.logistics for select using (auth.uid() = user_id);
create policy "Users can insert own logistics" on public.logistics for insert with check (auth.uid() = user_id);
create policy "Users can update own logistics" on public.logistics for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own logistics" on public.logistics for delete using (auth.uid() = user_id);

create policy "Users can view own inventory" on public.inventory for select using (auth.uid() = user_id);
create policy "Users can insert own inventory" on public.inventory for insert with check (auth.uid() = user_id);
create policy "Users can update own inventory" on public.inventory for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own inventory" on public.inventory for delete using (auth.uid() = user_id);

create policy "Users can view own customers" on public.customers for select using (auth.uid() = user_id);
create policy "Users can insert own customers" on public.customers for insert with check (auth.uid() = user_id);
create policy "Users can update own customers" on public.customers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users can delete own customers" on public.customers for delete using (auth.uid() = user_id);

create index if not exists finance_user_date_idx on public.finance(user_id, date desc);
create index if not exists projects_user_idx on public.projects(user_id);
create index if not exists logistics_user_idx on public.logistics(user_id);
create index if not exists inventory_user_idx on public.inventory(user_id);
create index if not exists customers_user_idx on public.customers(user_id);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, email, plan, trial_ends)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''), new.email, 'trial', now() + interval '24 hours');
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();
