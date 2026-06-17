create table if not exists public.user_accesses (
id uuid primary key default gen_random_uuid(),
email text not null,
role text not null check (role in ('admin', 'manager', 'agent', 'seller')),
agency_id text,
agency_slug text,
team_member_id text,
property_id text,
seller_token text,
is_active boolean not null default true,
created_at timestamptz not null default now(),
updated_at timestamptz not null default now()
);

create index if not exists user_accesses_email_idx on public.user_accesses(email);
create index if not exists user_accesses_agency_id_idx on public.user_accesses(agency_id);
create index if not exists user_accesses_role_idx on public.user_accesses(role);

alter table public.user_accesses enable row level security;
