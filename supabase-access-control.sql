create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role text not null default 'seller',
  created_at timestamptz not null default now()
);

alter table public.profiles
  add column if not exists email text;

alter table public.profiles
  add column if not exists role text not null default 'seller';

alter table public.profiles
  add column if not exists created_at timestamptz not null default now();

alter table public.profiles
  add column if not exists agency_id uuid;

alter table public.profiles
  add column if not exists status text not null default 'active';

alter table public.profiles
  add column if not exists full_name text;

alter table public.profiles
  add column if not exists phone text;

alter table public.profiles
  add column if not exists updated_at timestamptz not null default now();

do $$
begin
  if to_regclass('public.seller_spaces') is not null then
    execute 'drop policy if exists "agents manage seller spaces" on public.seller_spaces';
    execute 'drop policy if exists "seller reads own space" on public.seller_spaces';
  end if;
end;
$$;

do $$
declare
  profile_policy record;
begin
  for profile_policy in
    select policyname
    from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
  loop
    execute format(
      'drop policy if exists %I on public.profiles',
      profile_policy.policyname
    );
  end loop;
end;
$$;

do $$
declare
  role_data_type text;
begin
  select data_type
  into role_data_type
  from information_schema.columns
  where table_schema = 'public'
    and table_name = 'profiles'
    and column_name = 'role';

  if role_data_type is distinct from 'text' then
    alter table public.profiles
      alter column role drop default;

    alter table public.profiles
      alter column role type text using role::text;
  end if;

  alter table public.profiles
    alter column role set default 'seller';
end;
$$;

alter table public.profiles
  drop constraint if exists profiles_role_check;

update public.profiles
set role = 'seller'
where role::text in ('vendeur', 'buyer');

update public.profiles
set role = 'agent'
where role::text = 'agent_immobilier';

update public.profiles
set role = 'owner'
where lower(email) = 'sempehugo03@gmail.com';

update public.profiles
set role = 'seller'
where role::text not in ('owner', 'agency_admin', 'agent', 'seller');

update public.profiles
set status = 'active'
where status is null
  or status::text not in ('pending', 'active', 'disabled');

alter table public.profiles
  add constraint profiles_role_check
  check (role::text in ('owner', 'agency_admin', 'agent', 'seller'));

alter table public.profiles
  drop constraint if exists profiles_status_check;

alter table public.profiles
  add constraint profiles_status_check
  check (status::text in ('pending', 'active', 'disabled'));

alter table public.profiles enable row level security;

drop policy if exists "users read own profile" on public.profiles;
create policy "users read own profile"
on public.profiles
for select
to authenticated
using (id = auth.uid());

drop policy if exists "users create safe own profile" on public.profiles;
create policy "users create safe own profile"
on public.profiles
for insert
to authenticated
with check (
  id = auth.uid()
  and (
    role = 'seller'
    or (role = 'owner' and lower(auth.email()) = 'sempehugo03@gmail.com')
  )
);

drop policy if exists "users update safe own profile" on public.profiles;
create policy "users update safe own profile"
on public.profiles
for update
to authenticated
using (id = auth.uid())
with check (
  id = auth.uid()
  and (
    role = 'seller'
    or (role = 'owner' and lower(auth.email()) = 'sempehugo03@gmail.com')
  )
);

create table if not exists public.agencies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  city text not null,
  phone text,
  email text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

update public.profiles p
set agency_id = null
where p.agency_id is not null
  and not exists (
    select 1
    from public.agencies a
    where a.id = p.agency_id
  );

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_agency_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_agency_id_fkey
      foreign key (agency_id)
      references public.agencies(id)
      on delete set null;
  end if;
end;
$$;

create table if not exists public.access_invitations (
  id uuid primary key default gen_random_uuid(),
  agency_id uuid not null references public.agencies(id) on delete cascade,
  agency_name text not null,
  agency_city text not null,
  agency_phone text,
  agency_email text,
  first_name text not null,
  last_name text not null,
  email text not null,
  phone text,
  role text not null check (role in ('agency_admin', 'agent')),
  activation_token text unique,
  status text not null default 'pending'
    check (status in ('pending', 'active', 'disabled')),
  user_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  activated_at timestamptz,
  unique (role, email)
);

alter table public.agencies enable row level security;
alter table public.access_invitations enable row level security;

create or replace function public.current_user_role()
returns text
language sql
security definer
set search_path = public
stable
as $$
  select p.role
  from public.profiles p
  where p.id = auth.uid()
  limit 1;
$$;

create or replace function public.current_user_agency_id()
returns uuid
language sql
security definer
set search_path = public
stable
as $$
  select coalesce(
    (
      select p.agency_id
      from public.profiles p
      where p.id = auth.uid()
      limit 1
    ),
    (
      select ai.agency_id
      from public.access_invitations ai
      where ai.user_id = auth.uid()
        and ai.status = 'active'
      order by ai.created_at desc
      limit 1
    )
  );
$$;

drop policy if exists "owner manages agencies" on public.agencies;
create policy "owner manages agencies"
on public.agencies
for all
to authenticated
using (
  public.current_user_role() = 'owner'
  or lower(auth.email()) = 'sempehugo03@gmail.com'
)
with check (
  public.current_user_role() = 'owner'
  or lower(auth.email()) = 'sempehugo03@gmail.com'
);

drop policy if exists "agency users read own agency" on public.agencies;
create policy "agency users read own agency"
on public.agencies
for select
to authenticated
using (
  id = public.current_user_agency_id()
  or public.current_user_role() = 'owner'
  or lower(auth.email()) = 'sempehugo03@gmail.com'
);

drop policy if exists "owner manages all access invitations" on public.access_invitations;
create policy "owner manages all access invitations"
on public.access_invitations
for all
to authenticated
using (
  public.current_user_role() = 'owner'
  or lower(auth.email()) = 'sempehugo03@gmail.com'
)
with check (
  public.current_user_role() = 'owner'
  or lower(auth.email()) = 'sempehugo03@gmail.com'
);

drop policy if exists "agency admin manages agent invitations" on public.access_invitations;
create policy "agency admin manages agent invitations"
on public.access_invitations
for all
to authenticated
using (
  public.current_user_role() = 'agency_admin'
  and role = 'agent'
  and agency_id = public.current_user_agency_id()
)
with check (
  public.current_user_role() = 'agency_admin'
  and role = 'agent'
  and agency_id = public.current_user_agency_id()
);

do $$
begin
  if to_regclass('public.seller_spaces') is not null then
    alter table public.seller_spaces enable row level security;

    execute 'drop policy if exists "agents manage seller spaces" on public.seller_spaces';
    execute $policy$
      create policy "agents manage seller spaces"
      on public.seller_spaces
      for all
      to authenticated
      using (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.role::text in ('owner', 'agency_admin', 'agent')
        )
      )
      with check (
        exists (
          select 1
          from public.profiles
          where profiles.id = auth.uid()
            and profiles.role::text in ('owner', 'agency_admin', 'agent')
        )
      )
    $policy$;

    execute 'drop policy if exists "seller reads own space" on public.seller_spaces';
    execute $policy$
      create policy "seller reads own space"
      on public.seller_spaces
      for select
      to authenticated
      using (user_id = auth.uid())
    $policy$;
  end if;
end;
$$;

create or replace function public.get_my_agency()
returns table (
  id uuid,
  name text,
  city text,
  phone text,
  email text
)
language sql
security definer
set search_path = public
as $$
  select a.id, a.name, a.city, a.phone, a.email
  from public.agencies a
  join public.access_invitations ai on ai.agency_id = a.id
  where ai.user_id = auth.uid()
    and ai.status = 'active'
  order by ai.created_at desc
  limit 1;
$$;

grant execute on function public.get_my_agency() to authenticated;

create or replace function public.get_access_invitation_by_token(
  p_token text,
  p_role text
)
returns table (
  id uuid,
  agency_id uuid,
  agency_name text,
  agency_city text,
  agency_phone text,
  agency_email text,
  first_name text,
  last_name text,
  email text,
  phone text,
  role text,
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
    ai.id,
    ai.agency_id,
    ai.agency_name,
    ai.agency_city,
    ai.agency_phone,
    ai.agency_email,
    ai.first_name,
    ai.last_name,
    ai.email,
    ai.phone,
    ai.role,
    ai.activation_token,
    ai.status,
    ai.user_id,
    ai.created_at,
    ai.activated_at
  from public.access_invitations ai
  where ai.activation_token = p_token
    and ai.role = p_role
    and ai.status = 'pending'
  limit 1;
$$;

grant execute on function public.get_access_invitation_by_token(text, text) to anon, authenticated;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  metadata jsonb;
  requested_role text;
  invitation record;
  profile_full_name text;
  profile_phone text;
begin
  metadata := coalesce(new.raw_user_meta_data, '{}'::jsonb);
  requested_role := coalesce(nullif(metadata->>'role', ''), 'seller');

  if requested_role = 'vendeur' then
    requested_role := 'seller';
  elsif requested_role = 'agent_immobilier' then
    requested_role := 'agent';
  end if;

  if requested_role not in ('owner', 'agency_admin', 'agent', 'seller') then
    requested_role := 'seller';
  end if;

  if requested_role = 'owner' and lower(new.email) <> 'sempehugo03@gmail.com' then
    requested_role := 'seller';
  end if;

  if requested_role in ('agency_admin', 'agent') then
    select *
    into invitation
    from public.access_invitations ai
    where lower(ai.email) = lower(new.email)
      and ai.role = requested_role
      and ai.status = 'pending'
    order by ai.created_at desc
    limit 1;

    if not found then
      raise exception 'No pending access invitation for this account';
    end if;

    profile_full_name := coalesce(
      nullif(trim(concat_ws(' ', invitation.first_name, invitation.last_name)), ''),
      new.email
    );
    profile_phone := invitation.phone;

    insert into public.profiles (
      id,
      email,
      role,
      agency_id,
      status,
      full_name,
      phone,
      updated_at
    )
    values (
      new.id,
      new.email,
      requested_role,
      invitation.agency_id,
      'pending',
      profile_full_name,
      profile_phone,
      now()
    )
    on conflict (id) do update
    set
      email = excluded.email,
      role = excluded.role,
      agency_id = excluded.agency_id,
      status = excluded.status,
      full_name = excluded.full_name,
      phone = excluded.phone,
      updated_at = now();
  else
    profile_full_name := coalesce(
      nullif(metadata->>'full_name', ''),
      nullif(trim(concat_ws(' ', metadata->>'first_name', metadata->>'last_name')), ''),
      new.email
    );
    profile_phone := nullif(metadata->>'phone', '');

    insert into public.profiles (
      id,
      email,
      role,
      status,
      full_name,
      phone,
      updated_at
    )
    values (
      new.id,
      new.email,
      requested_role,
      'active',
      profile_full_name,
      profile_phone,
      now()
    )
    on conflict (id) do update
    set
      email = excluded.email,
      role = excluded.role,
      status = excluded.status,
      full_name = excluded.full_name,
      phone = excluded.phone,
      updated_at = now();
  end if;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

create or replace function public.activate_access_invitation(
  p_token text,
  p_role text,
  p_user_id uuid
)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  user_email text;
  invitation record;
  profile_full_name text;
begin
  if p_role not in ('agency_admin', 'agent') then
    raise exception 'Invalid role';
  end if;

  select email into user_email
  from auth.users
  where id = p_user_id;

  if user_email is null then
    raise exception 'User not found';
  end if;

  select *
  into invitation
  from public.access_invitations ai
  where ai.activation_token = p_token
    and ai.role = p_role
    and ai.status = 'pending'
    and lower(ai.email) = lower(user_email)
  limit 1;

  if not found then
    raise exception 'Invalid or expired activation token';
  end if;

  update public.access_invitations
  set
    status = 'active',
    activation_token = null,
    user_id = p_user_id,
    activated_at = now(),
    updated_at = now()
  where id = invitation.id;

  profile_full_name := coalesce(
    nullif(trim(concat_ws(' ', invitation.first_name, invitation.last_name)), ''),
    user_email
  );

  insert into public.profiles (
    id,
    email,
    role,
    agency_id,
    status,
    full_name,
    phone,
    updated_at
  )
  values (
    p_user_id,
    user_email,
    p_role,
    invitation.agency_id,
    'active',
    profile_full_name,
    invitation.phone,
    now()
  )
  on conflict (id) do update
  set
    email = excluded.email,
    role = excluded.role,
    agency_id = excluded.agency_id,
    status = 'active',
    full_name = excluded.full_name,
    phone = excluded.phone,
    updated_at = now();
end;
$$;

grant execute on function public.activate_access_invitation(text, text, uuid) to authenticated;
