create type public.application_status as enum ('pending', 'approved', 'rejected');

create type public.cuisine_origin as enum (
  'french',
  'italian',
  'japanese',
  'chinese',
  'indian',
  'mexican',
  'thai',
  'mediterranean',
  'middle_eastern',
  'american',
  'other'
);

create table public.cook_applications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  bio text not null,
  specialties text not null,
  cuisine_origin public.cuisine_origin not null,
  zone text not null,
  base_price_eur integer not null,
  photo_paths text[] not null,
  cv_path text not null,
  status public.application_status not null default 'pending',
  created_at timestamptz not null default now(),
  reviewed_at timestamptz,
  reviewed_by uuid references public.profiles (id) on delete restrict,
  constraint cook_applications_bio_check
    check (char_length(btrim(bio)) between 20 and 1000),
  constraint cook_applications_specialties_check
    check (char_length(btrim(specialties)) between 2 and 120),
  constraint cook_applications_zone_check
    check (char_length(btrim(zone)) between 2 and 80),
  constraint cook_applications_price_check
    check (base_price_eur between 1 and 10000),
  constraint cook_applications_photo_paths_check
    check (
      cardinality(photo_paths) between 1 and 3
      and photo_paths[1] ~ ('^' || user_id::text || '/[^/]+/[^/]+$')
      and photo_paths[1] not like '%..%'
      and (
        cardinality(photo_paths) < 2
        or (
          photo_paths[2] ~ ('^' || user_id::text || '/[^/]+/[^/]+$')
          and photo_paths[2] not like '%..%'
        )
      )
      and (
        cardinality(photo_paths) < 3
        or (
          photo_paths[3] ~ ('^' || user_id::text || '/[^/]+/[^/]+$')
          and photo_paths[3] not like '%..%'
        )
      )
    ),
  constraint cook_applications_cv_path_check
    check (
      cv_path ~ ('^' || user_id::text || '/[^/]+/[^/]+$')
      and cv_path not like '%..%'
    ),
  constraint cook_applications_review_check
    check (
      (
        status = 'pending'
        and reviewed_at is null
        and reviewed_by is null
      )
      or (
        status in ('approved', 'rejected')
        and reviewed_at is not null
        and reviewed_by is not null
      )
    )
);

create unique index cook_applications_one_pending_idx
  on public.cook_applications (user_id)
  where status = 'pending';

create index cook_applications_user_created_idx
  on public.cook_applications (user_id, created_at desc);

create index cook_applications_pending_created_idx
  on public.cook_applications (created_at desc)
  where status = 'pending';

create index cook_applications_reviewed_by_idx
  on public.cook_applications (reviewed_by);

alter table public.cook_applications enable row level security;

revoke all on table public.cook_applications from public, anon, authenticated;
grant select, insert on table public.cook_applications to authenticated;
grant select, insert, update, delete on table public.cook_applications to service_role;

create or replace function private.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = (select auth.uid())
      and role = 'admin'
  );
$$;

revoke all on function private.is_admin() from public;
revoke all on function private.is_admin() from anon;
grant usage on schema private to authenticated;
grant execute on function private.is_admin() to authenticated;

create policy "hosts insert own application"
  on public.cook_applications
  for insert
  to authenticated
  with check (
    user_id = (select auth.uid())
    and status = 'pending'
    and reviewed_at is null
    and reviewed_by is null
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'host'
    )
  );

create policy "users read own applications"
  on public.cook_applications
  for select
  to authenticated
  using (user_id = (select auth.uid()));

create policy "admins read applications"
  on public.cook_applications
  for select
  to authenticated
  using (private.is_admin());

create policy "admins read profiles"
  on public.profiles
  for select
  to authenticated
  using (private.is_admin());

create or replace function public.review_cook_application(
  application_id uuid,
  decision text,
  admin_id uuid
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  applicant_id uuid;
begin
  if decision not in ('approved', 'rejected') then
    raise exception 'invalid decision';
  end if;

  if not exists (
    select 1
    from public.profiles
    where id = admin_id
      and role = 'admin'
  ) then
    raise exception 'not allowed';
  end if;

  select user_id
  into applicant_id
  from public.cook_applications
  where id = application_id
    and status = 'pending'
  for update;

  if applicant_id is null then
    raise exception 'application is not pending';
  end if;

  update public.cook_applications
  set
    status = decision::public.application_status,
    reviewed_at = now(),
    reviewed_by = admin_id
  where id = application_id;

  if decision = 'approved' then
    update public.profiles
    set role = 'cook'
    where id = applicant_id
      and role = 'host';

    if not found then
      raise exception 'applicant is not a host';
    end if;
  end if;
end;
$$;

revoke all on function public.review_cook_application(uuid, text, uuid) from public;
revoke all on function public.review_cook_application(uuid, text, uuid) from anon, authenticated;
grant execute on function public.review_cook_application(uuid, text, uuid) to service_role;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  (
    'cook-photos',
    'cook-photos',
    true,
    5242880,
    array['image/jpeg', 'image/png', 'image/webp']::text[]
  ),
  (
    'cook-cvs',
    'cook-cvs',
    false,
    10485760,
    array['application/pdf']::text[]
  );

create policy "hosts upload cook photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cook-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name not like '%..%'
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'host'
    )
  );

create policy "hosts upload cook cvs"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cook-cvs'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name not like '%..%'
    and exists (
      select 1
      from public.profiles
      where id = (select auth.uid())
        and role = 'host'
    )
  );

create policy "applicant or admin reads cook cvs"
  on storage.objects
  for select
  to authenticated
  using (
    bucket_id = 'cook-cvs'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or private.is_admin()
    )
  );
