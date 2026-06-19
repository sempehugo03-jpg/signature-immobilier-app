create extension if not exists pgcrypto;

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  slug text unique not null,
  name text not null,
  city text,
  phone text,
  email text,
  status text,
  created_at timestamptz default now()
);

create table if not exists public.properties (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  agency_slug text not null,
  title text not null,
  slug text,
  price numeric,
  surface numeric,
  rooms numeric,
  description text,
  is_published boolean default false,
  seller_token text,
  created_at timestamptz default now()
);

create table if not exists public.sellers (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid references public.agencies(id) on delete cascade,
  property_id uuid references public.properties(id) on delete cascade,
  seller_token text unique not null,
  first_name text,
  last_name text,
  email text not null,
  phone text,
  status text default 'invited',
  created_at timestamptz default now()
);

create table if not exists public.access_invitations (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  agency_id uuid references public.agencies(id) on delete cascade,
  agency_slug text not null,
  email text not null,
  first_name text,
  last_name text,
  phone text,
  role text not null check (role in ('manager', 'agent', 'seller')),
  property_id uuid references public.properties(id) on delete cascade,
  seller_token text,
  status text default 'pending',
  destination text not null,
  created_at timestamptz default now(),
  accepted_at timestamptz
);

create table if not exists public.user_accesses (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  role text not null,
  agency_id uuid references public.agencies(id) on delete cascade,
  agency_slug text,
  property_id uuid references public.properties(id) on delete cascade,
  seller_token text,
  destination text not null,
  password_marker text,
  is_active boolean default true,
  created_at timestamptz default now()
);

alter table public.user_accesses add column if not exists destination text;
alter table public.user_accesses add column if not exists password_marker text;
alter table public.user_accesses add column if not exists property_id text;
alter table public.user_accesses add column if not exists seller_token text;
alter table public.user_accesses add column if not exists is_active boolean default true;

create index if not exists agencies_slug_idx on public.agencies(slug);
create index if not exists properties_agency_id_idx on public.properties(agency_id);
create index if not exists properties_agency_slug_idx on public.properties(agency_slug);
create index if not exists sellers_seller_token_idx on public.sellers(seller_token);
create index if not exists sellers_email_idx on public.sellers(email);
create index if not exists access_invitations_token_idx on public.access_invitations(token);
create index if not exists access_invitations_email_idx on public.access_invitations(email);
create index if not exists access_invitations_agency_id_idx on public.access_invitations(agency_id);
create index if not exists user_accesses_email_idx on public.user_accesses(email);
create index if not exists user_accesses_role_idx on public.user_accesses(role);

alter table public.agencies enable row level security;
alter table public.properties enable row level security;
alter table public.sellers enable row level security;
alter table public.access_invitations enable row level security;
alter table public.user_accesses enable row level security;

drop policy if exists "v2 pilot agencies read" on public.agencies;
create policy "v2 pilot agencies read" on public.agencies for select using (true);
drop policy if exists "v2 pilot agencies write" on public.agencies;
create policy "v2 pilot agencies write" on public.agencies for all using (true) with check (true);

drop policy if exists "v2 pilot properties read" on public.properties;
create policy "v2 pilot properties read" on public.properties for select using (true);
drop policy if exists "v2 pilot properties write" on public.properties;
create policy "v2 pilot properties write" on public.properties for all using (true) with check (true);

drop policy if exists "v2 pilot sellers read" on public.sellers;
create policy "v2 pilot sellers read" on public.sellers for select using (true);
drop policy if exists "v2 pilot sellers write" on public.sellers;
create policy "v2 pilot sellers write" on public.sellers for all using (true) with check (true);

drop policy if exists "v2 pilot access invitations read" on public.access_invitations;
create policy "v2 pilot access invitations read" on public.access_invitations for select using (true);
drop policy if exists "v2 pilot access invitations write" on public.access_invitations;
create policy "v2 pilot access invitations write" on public.access_invitations for all using (true) with check (true);

drop policy if exists "v2 pilot user accesses read" on public.user_accesses;
create policy "v2 pilot user accesses read" on public.user_accesses for select using (true);
drop policy if exists "v2 pilot user accesses write" on public.user_accesses;
create policy "v2 pilot user accesses write" on public.user_accesses for all using (true) with check (true);
