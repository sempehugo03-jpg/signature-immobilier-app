create extension if not exists pgcrypto;

create table if not exists public.seller_spaces (
  id uuid primary key default gen_random_uuid(),
  property_id text not null,
  property_title text not null,
  seller_first_name text not null,
  seller_last_name text not null,
  seller_email text not null,
  seller_phone text,
  activation_token text unique,
  status text not null default 'pending'
    check (status in ('pending', 'activated')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz,
  unique (property_id, seller_email)
);

alter table public.seller_spaces enable row level security;

drop policy if exists "agents manage seller spaces" on public.seller_spaces;
create policy "agents manage seller spaces"
on public.seller_spaces
for all
to authenticated
using (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('owner', 'agency_admin', 'agent')
  )
)
with check (
  exists (
    select 1
    from public.profiles
    where profiles.id = auth.uid()
      and profiles.role in ('owner', 'agency_admin', 'agent')
  )
);

drop policy if exists "seller reads own space" on public.seller_spaces;
create policy "seller reads own space"
on public.seller_spaces
for select
to authenticated
using (user_id = auth.uid());

create or replace function public.get_seller_space_by_token(p_token text)
returns table (
  id uuid,
  property_id text,
  property_title text,
  seller_first_name text,
  seller_last_name text,
  seller_email text,
  seller_phone text,
  activation_token text,
  status text,
  user_id uuid,
  created_at timestamptz,
  activated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select
    s.id,
    s.property_id,
    s.property_title,
    s.seller_first_name,
    s.seller_last_name,
    s.seller_email,
    s.seller_phone,
    s.activation_token,
    s.status,
    s.user_id,
    s.created_at,
    s.activated_at
  from public.seller_spaces s
  where s.activation_token = p_token
    and s.status = 'pending'
  limit 1;
$$;

grant execute on function public.get_seller_space_by_token(text) to anon, authenticated;

create or replace function public.activate_seller_space(
  p_token text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
begin
  select email into user_email
  from auth.users
  where id = p_user_id;

  update public.seller_spaces
  set
    status = 'activated',
    activation_token = null,
    user_id = p_user_id,
    activated_at = now(),
    updated_at = now()
  where activation_token = p_token
    and status = 'pending'
    and lower(seller_email) = lower(user_email);

  if found then
    insert into public.profiles (id, email, role)
    values (p_user_id, user_email, 'seller')
    on conflict (id) do update
    set
      email = excluded.email,
      role = 'seller';
  end if;
end;
$$;

grant execute on function public.activate_seller_space(text, uuid) to authenticated;
