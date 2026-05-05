create table if not exists public.futsal_records (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  date_time text not null,
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.futsal_drafts (
  user_id uuid primary key references auth.users (id) on delete cascade,
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_futsal_records_updated_at on public.futsal_records;
create trigger set_futsal_records_updated_at
before update on public.futsal_records
for each row execute function public.set_updated_at();

drop trigger if exists set_futsal_drafts_updated_at on public.futsal_drafts;
create trigger set_futsal_drafts_updated_at
before update on public.futsal_drafts
for each row execute function public.set_updated_at();

alter table public.futsal_records enable row level security;
alter table public.futsal_drafts enable row level security;

drop policy if exists "Users can view their own futsal records" on public.futsal_records;
create policy "Users can view their own futsal records"
on public.futsal_records
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own futsal records" on public.futsal_records;
create policy "Users can create their own futsal records"
on public.futsal_records
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own futsal records" on public.futsal_records;
create policy "Users can update their own futsal records"
on public.futsal_records
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own futsal records" on public.futsal_records;
create policy "Users can delete their own futsal records"
on public.futsal_records
for delete
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can view their own futsal draft" on public.futsal_drafts;
create policy "Users can view their own futsal draft"
on public.futsal_drafts
for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "Users can create their own futsal draft" on public.futsal_drafts;
create policy "Users can create their own futsal draft"
on public.futsal_drafts
for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own futsal draft" on public.futsal_drafts;
create policy "Users can update their own futsal draft"
on public.futsal_drafts
for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "Users can delete their own futsal draft" on public.futsal_drafts;
create policy "Users can delete their own futsal draft"
on public.futsal_drafts
for delete
to authenticated
using ((select auth.uid()) = user_id);
