create table if not exists public.invite_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  type text not null check (type in ('manager_invite', 'agent_invite', 'seller_invite')),
  agency_id text not null,
  agency_slug text not null,
  team_member_id text,
  property_id text,
  seller_token text,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'used', 'expired', 'revoked')),
  created_at timestamptz not null default now(),
  used_at timestamptz,
  expires_at timestamptz
);

create index if not exists invite_tokens_token_idx on public.invite_tokens(token);
create index if not exists invite_tokens_email_idx on public.invite_tokens(email);
create index if not exists invite_tokens_agency_id_idx on public.invite_tokens(agency_id);

alter table public.invite_tokens enable row level security;
