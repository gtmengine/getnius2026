create extension if not exists pgcrypto;

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create table if not exists public.scan_jobs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  query text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.raw_hits (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.scan_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  source text,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.enriched_rows (
  id uuid primary key default gen_random_uuid(),
  job_id uuid not null references public.scan_jobs(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists set_updated_at_scan_jobs on public.scan_jobs;
create trigger set_updated_at_scan_jobs
before update on public.scan_jobs
for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_raw_hits on public.raw_hits;
create trigger set_updated_at_raw_hits
before update on public.raw_hits
for each row execute function public.touch_updated_at();

drop trigger if exists set_updated_at_enriched_rows on public.enriched_rows;
create trigger set_updated_at_enriched_rows
before update on public.enriched_rows
for each row execute function public.touch_updated_at();

alter table public.scan_jobs enable row level security;
alter table public.raw_hits enable row level security;
alter table public.enriched_rows enable row level security;

drop policy if exists scan_jobs_select_own on public.scan_jobs;
create policy scan_jobs_select_own
on public.scan_jobs
for select
using (auth.uid() = user_id);

drop policy if exists scan_jobs_insert_own on public.scan_jobs;
create policy scan_jobs_insert_own
on public.scan_jobs
for insert
with check (auth.uid() = user_id);

drop policy if exists scan_jobs_update_own on public.scan_jobs;
create policy scan_jobs_update_own
on public.scan_jobs
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists scan_jobs_delete_own on public.scan_jobs;
create policy scan_jobs_delete_own
on public.scan_jobs
for delete
using (auth.uid() = user_id);

drop policy if exists raw_hits_select_own on public.raw_hits;
create policy raw_hits_select_own
on public.raw_hits
for select
using (auth.uid() = user_id);

drop policy if exists raw_hits_insert_own on public.raw_hits;
create policy raw_hits_insert_own
on public.raw_hits
for insert
with check (auth.uid() = user_id);

drop policy if exists raw_hits_update_own on public.raw_hits;
create policy raw_hits_update_own
on public.raw_hits
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists raw_hits_delete_own on public.raw_hits;
create policy raw_hits_delete_own
on public.raw_hits
for delete
using (auth.uid() = user_id);

drop policy if exists enriched_rows_select_own on public.enriched_rows;
create policy enriched_rows_select_own
on public.enriched_rows
for select
using (auth.uid() = user_id);

drop policy if exists enriched_rows_insert_own on public.enriched_rows;
create policy enriched_rows_insert_own
on public.enriched_rows
for insert
with check (auth.uid() = user_id);

drop policy if exists enriched_rows_update_own on public.enriched_rows;
create policy enriched_rows_update_own
on public.enriched_rows
for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

drop policy if exists enriched_rows_delete_own on public.enriched_rows;
create policy enriched_rows_delete_own
on public.enriched_rows
for delete
using (auth.uid() = user_id);
