create table if not exists public.invite_tokens (
  id uuid primary key default gen_random_uuid(),
  token text unique not null,
  type text not null check (type in ('manager_invite', 'agent_invite', 'seller_invite')),
  agency_id text not null,
  agency_slug text not null,
  team_member_id text null,
  property_id text null,
  seller_token text null,
  email text not null,
  status text not null default 'pending' check (status in ('pending', 'used', 'expired')),
  created_at timestamp with time zone not null default now(),
  used_at timestamp with time zone null,
  expires_at timestamp with time zone null
);

create index if not exists invite_tokens_token_idx
  on public.invite_tokens (token);

create index if not exists invite_tokens_pending_email_idx
  on public.invite_tokens (email, agency_id, type, status);

alter table public.invite_tokens enable row level security;

-- Recommended for the pilot server functions:
-- set SUPABASE_SERVICE_ROLE_KEY in the server environment so these rows stay
-- writable only from the server. If you use only the anon key, add stricter
-- policies adapted to your authentication model before production.
