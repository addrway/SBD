create extension if not exists "pgcrypto";

create table if not exists public.profiles (id uuid primary key references auth.users(id) on delete cascade, email text, full_name text, role text default 'customer' check (role in ('admin','customer')), plan text default 'trial', trial_ends timestamptz default (now() + interval '24 hours'), created_at timestamptz default now());
create table if not exists public.tasks (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, task_name text not null, phase text default 'Planning', status text default 'Todo', priority text default 'Medium', created_at timestamptz default now());
create table if not exists public.uploads (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, file_name text, file_type text, row_count integer default 0, status text default 'processed', created_at timestamptz default now());
create table if not exists public.invoices (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, customer_id uuid, invoice_number text, status text default 'draft', amount numeric(12,2) default 0, due_date date, created_at timestamptz default now());
create table if not exists public.receipts (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, transaction_id uuid, file_name text, category text, amount numeric(12,2) default 0, receipt_date date default current_date, created_at timestamptz default now());
create table if not exists public.inventory (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, stock integer default 0, min_level integer default 0, unit_value numeric(12,2) default 0, created_at timestamptz default now());
create table if not exists public.customers (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, email text, total_spend numeric(12,2) default 0, status text default 'active', joined_date date default current_date, created_at timestamptz default now());
create table if not exists public.time_entries (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, project_name text, entry_date date default current_date, hours numeric(8,2) default 0, billable boolean default true, notes text, created_at timestamptz default now());
create table if not exists public.transactions (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, type text default 'expense' check (type in ('income','expense')), description text not null, amount numeric(12,2) default 0, category text, date date default current_date, created_at timestamptz default now());
create table if not exists public.contractors (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, email text, payment_rate numeric(12,2) default 0, status text default 'active', tax_status text default '1099 placeholder', created_at timestamptz default now());
create table if not exists public.reports (id uuid primary key default gen_random_uuid(), user_id uuid not null references auth.users(id) on delete cascade, name text not null, report_type text, date_from date, date_to date, created_at timestamptz default now());

alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.uploads enable row level security;
alter table public.invoices enable row level security;
alter table public.receipts enable row level security;
alter table public.inventory enable row level security;
alter table public.customers enable row level security;
alter table public.time_entries enable row level security;
alter table public.transactions enable row level security;
alter table public.contractors enable row level security;
alter table public.reports enable row level security;

create policy "profiles own select" on public.profiles for select using (auth.uid() = id);
create policy "profiles own update" on public.profiles for update using (auth.uid() = id) with check (auth.uid() = id);
create policy "tasks own select" on public.tasks for select using (auth.uid() = user_id);
create policy "tasks own insert" on public.tasks for insert with check (auth.uid() = user_id);
create policy "tasks own update" on public.tasks for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "tasks own delete" on public.tasks for delete using (auth.uid() = user_id);
create policy "uploads own select" on public.uploads for select using (auth.uid() = user_id);
create policy "uploads own insert" on public.uploads for insert with check (auth.uid() = user_id);
create policy "uploads own update" on public.uploads for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "uploads own delete" on public.uploads for delete using (auth.uid() = user_id);
create policy "invoices own select" on public.invoices for select using (auth.uid() = user_id);
create policy "invoices own insert" on public.invoices for insert with check (auth.uid() = user_id);
create policy "invoices own update" on public.invoices for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "invoices own delete" on public.invoices for delete using (auth.uid() = user_id);
create policy "receipts own select" on public.receipts for select using (auth.uid() = user_id);
create policy "receipts own insert" on public.receipts for insert with check (auth.uid() = user_id);
create policy "receipts own update" on public.receipts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "receipts own delete" on public.receipts for delete using (auth.uid() = user_id);
create policy "inventory own select" on public.inventory for select using (auth.uid() = user_id);
create policy "inventory own insert" on public.inventory for insert with check (auth.uid() = user_id);
create policy "inventory own update" on public.inventory for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "inventory own delete" on public.inventory for delete using (auth.uid() = user_id);
create policy "customers own select" on public.customers for select using (auth.uid() = user_id);
create policy "customers own insert" on public.customers for insert with check (auth.uid() = user_id);
create policy "customers own update" on public.customers for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "customers own delete" on public.customers for delete using (auth.uid() = user_id);
create policy "time entries own select" on public.time_entries for select using (auth.uid() = user_id);
create policy "time entries own insert" on public.time_entries for insert with check (auth.uid() = user_id);
create policy "time entries own update" on public.time_entries for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "time entries own delete" on public.time_entries for delete using (auth.uid() = user_id);
create policy "transactions own select" on public.transactions for select using (auth.uid() = user_id);
create policy "transactions own insert" on public.transactions for insert with check (auth.uid() = user_id);
create policy "transactions own update" on public.transactions for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "transactions own delete" on public.transactions for delete using (auth.uid() = user_id);
create policy "contractors own select" on public.contractors for select using (auth.uid() = user_id);
create policy "contractors own insert" on public.contractors for insert with check (auth.uid() = user_id);
create policy "contractors own update" on public.contractors for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "contractors own delete" on public.contractors for delete using (auth.uid() = user_id);
create policy "reports own select" on public.reports for select using (auth.uid() = user_id);
create policy "reports own insert" on public.reports for insert with check (auth.uid() = user_id);
create policy "reports own update" on public.reports for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "reports own delete" on public.reports for delete using (auth.uid() = user_id);

create or replace function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, full_name, role, plan, trial_ends)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''), 'customer', 'trial', now() + interval '24 hours')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users for each row execute procedure public.handle_new_user();

-- Safe admin setup:
-- After creating addrway@outlook.com in Supabase Auth, run:
-- update profiles set role = 'admin' where email = 'addrway@outlook.com';
