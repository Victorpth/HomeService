create or replace function private.is_public_cook(cook_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.profiles
    where id = cook_id
      and role = 'cook'
  );
$$;

revoke all on function private.is_public_cook(uuid) from public;
revoke all on function private.is_public_cook(uuid) from anon, authenticated;
grant usage on schema private to anon;
grant execute on function private.is_public_cook(uuid) to anon, authenticated;

create table public.cooks (
  id uuid primary key references public.profiles (id) on delete cascade,
  full_name text not null,
  bio text not null,
  specialties text not null,
  cuisine_origin public.cuisine_origin not null,
  zone text not null,
  base_price_eur integer not null,
  photo_paths text[] not null,
  created_at timestamptz not null default now(),
  constraint cooks_name_check
    check (char_length(btrim(full_name)) between 1 and 80),
  constraint cooks_bio_check
    check (char_length(btrim(bio)) between 20 and 1000),
  constraint cooks_specialties_check
    check (char_length(btrim(specialties)) between 2 and 120),
  constraint cooks_zone_check
    check (char_length(btrim(zone)) between 2 and 80),
  constraint cooks_price_check
    check (base_price_eur between 1 and 10000),
  constraint cooks_photo_paths_check
    check (
      cardinality(photo_paths) between 1 and 3
      and photo_paths[1] ~ ('^' || id::text || '/[^/]+/[^/]+$')
      and photo_paths[1] not like '%..%'
      and (
        cardinality(photo_paths) < 2
        or (
          photo_paths[2] ~ ('^' || id::text || '/[^/]+/[^/]+$')
          and photo_paths[2] not like '%..%'
        )
      )
      and (
        cardinality(photo_paths) < 3
        or (
          photo_paths[3] ~ ('^' || id::text || '/[^/]+/[^/]+$')
          and photo_paths[3] not like '%..%'
        )
      )
    )
);

create table public.dishes (
  id uuid primary key default gen_random_uuid(),
  cook_id uuid not null references public.cooks (id) on delete cascade,
  name text not null,
  photo_path text not null,
  price_eur integer not null,
  created_at timestamptz not null default now(),
  constraint dishes_name_check
    check (char_length(btrim(name)) between 2 and 80),
  constraint dishes_price_check
    check (price_eur between 1 and 10000),
  constraint dishes_photo_path_check
    check (
      photo_path ~ ('^' || cook_id::text || '/[^/]+/[^/]+$')
      and photo_path not like '%..%'
    )
);

create index dishes_cook_created_idx
  on public.dishes (cook_id, created_at desc);

create or replace function private.enforce_dish_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (
    select count(*)
    from public.dishes
    where cook_id = new.cook_id
  ) >= 40 then
    raise exception 'too many dishes';
  end if;

  return new;
end;
$$;

revoke all on function private.enforce_dish_limit() from public;
revoke all on function private.enforce_dish_limit() from anon, authenticated;

create trigger dishes_limit
  before insert on public.dishes
  for each row
  execute function private.enforce_dish_limit();

alter table public.cooks enable row level security;
alter table public.dishes enable row level security;

revoke all on table public.cooks from public, anon, authenticated;
grant select on table public.cooks to anon, authenticated;
grant update (
  bio,
  specialties,
  cuisine_origin,
  zone,
  base_price_eur,
  photo_paths
) on table public.cooks to authenticated;

revoke all on table public.dishes from public, anon, authenticated;
grant select on table public.dishes to anon, authenticated;
grant insert on table public.dishes to authenticated;
grant update (name, photo_path, price_eur) on table public.dishes to authenticated;
grant delete on table public.dishes to authenticated;

create policy "public reads approved cooks"
  on public.cooks
  for select
  to anon, authenticated
  using (private.is_public_cook(id));

create policy "cooks update own profile"
  on public.cooks
  for update
  to authenticated
  using (id = (select auth.uid()) and private.is_public_cook(id))
  with check (id = (select auth.uid()) and private.is_public_cook(id));

create policy "public reads dishes of approved cooks"
  on public.dishes
  for select
  to anon, authenticated
  using (private.is_public_cook(cook_id));

create policy "cooks insert own dishes"
  on public.dishes
  for insert
  to authenticated
  with check (
    cook_id = (select auth.uid())
    and private.is_public_cook(cook_id)
  );

create policy "cooks update own dishes"
  on public.dishes
  for update
  to authenticated
  using (cook_id = (select auth.uid()) and private.is_public_cook(cook_id))
  with check (cook_id = (select auth.uid()) and private.is_public_cook(cook_id));

create policy "cooks delete own dishes"
  on public.dishes
  for delete
  to authenticated
  using (cook_id = (select auth.uid()) and private.is_public_cook(cook_id));

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

    insert into public.cooks (
      id,
      full_name,
      bio,
      specialties,
      cuisine_origin,
      zone,
      base_price_eur,
      photo_paths
    )
    select
      p.id,
      left(btrim(p.full_name), 80),
      a.bio,
      a.specialties,
      a.cuisine_origin,
      a.zone,
      a.base_price_eur,
      a.photo_paths
    from public.cook_applications a
    join public.profiles p on p.id = a.user_id
    where a.id = application_id
      and a.user_id = applicant_id;

    if not found then
      raise exception 'could not create cook profile';
    end if;
  end if;
end;
$$;

insert into public.cooks (
  id,
  full_name,
  bio,
  specialties,
  cuisine_origin,
  zone,
  base_price_eur,
  photo_paths
)
select distinct on (a.user_id)
  p.id,
  left(btrim(p.full_name), 80),
  a.bio,
  a.specialties,
  a.cuisine_origin,
  a.zone,
  a.base_price_eur,
  a.photo_paths
from public.cook_applications a
join public.profiles p on p.id = a.user_id
where a.status = 'approved'
  and p.role = 'cook'
order by a.user_id, a.created_at desc;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'dish-photos',
  'dish-photos',
  true,
  5242880,
  array['image/jpeg', 'image/png', 'image/webp']::text[]
);

create policy "cooks upload cook photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'cook-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name not like '%..%'
    and private.is_public_cook((select auth.uid()))
  );

create policy "cooks upload dish photos"
  on storage.objects
  for insert
  to authenticated
  with check (
    bucket_id = 'dish-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and name not like '%..%'
    and private.is_public_cook((select auth.uid()))
  );

create policy "cooks delete dish photos"
  on storage.objects
  for delete
  to authenticated
  using (
    bucket_id = 'dish-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and private.is_public_cook((select auth.uid()))
  );
