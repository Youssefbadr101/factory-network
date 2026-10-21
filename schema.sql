-- Run this against your own Postgres/Supabase database to set up the table
-- this app reads and writes. Public read, service-role-only write.
create table if not exists public.factory_network_listings (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text,
  country text,
  categories text[] not null default '{}',
  moq text,
  capacity text,
  contact_name text,
  phone text,
  email text,
  website text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.factory_network_listings enable row level security;

drop policy if exists "factory_network_listings: public read" on public.factory_network_listings;
create policy "factory_network_listings: public read" on public.factory_network_listings
  for select to anon, authenticated using (true);

grant select on public.factory_network_listings to anon, authenticated;
grant all on public.factory_network_listings to service_role;

create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists factory_network_listings_set_updated_at on public.factory_network_listings;
create trigger factory_network_listings_set_updated_at
  before update on public.factory_network_listings
  for each row execute function public.set_updated_at();
