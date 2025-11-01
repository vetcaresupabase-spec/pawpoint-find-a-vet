-- ============================================
-- PostGIS Geolocation Search for Clinics
-- ============================================

-- 1) Enable PostGIS (no-op if already enabled)
create extension if not exists postgis;

-- 2) Add coords column to existing clinics table
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'clinics' and column_name = 'coords'
  ) then
    alter table public.clinics 
    add column coords geography(Point, 4326);
  end if;
end $$;

-- 3) Add postcode column if not exists
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'clinics' and column_name = 'postcode'
  ) then
    alter table public.clinics 
    add column postcode text;
  end if;
end $$;

-- 4) Add is_active column if not exists
do $$ 
begin
  if not exists (
    select 1 from information_schema.columns 
    where table_name = 'clinics' and column_name = 'is_active'
  ) then
    alter table public.clinics 
    add column is_active boolean default true;
  end if;
end $$;

-- 5) Create indexes for geospatial queries
create index if not exists clinics_city_lower_idx on public.clinics (lower(city));
create index if not exists clinics_active_idx on public.clinics (is_active);
create index if not exists clinics_coords_gix on public.clinics using gist (coords);
create index if not exists clinics_postcode_idx on public.clinics (postcode) where postcode is not null;

-- 6) RPC function: search by either coords (near me) or city/postcode
drop function if exists public.fn_search_clinics(double precision, double precision, text, integer, integer);
create or replace function public.fn_search_clinics(
  in_lat double precision default null,
  in_lng double precision default null,
  in_city_or_postcode text default null,
  in_radius_m integer default 15000,
  in_limit integer default 10
)
returns table(
  id uuid,
  name text,
  city text,
  address_line1 text,
  postcode text,
  distance_m double precision,
  specialties text[]
)
language plpgsql
security definer
as $$
declare
  center_geo geography;
begin
  -- Determine center point
  if in_city_or_postcode is not null and in_city_or_postcode != '' then
    -- City/postcode mode: estimate center by averaging known clinic coords in that city/postcode
    select 
      ST_SetSRID(
        ST_MakePoint(
          coalesce(
            (select avg(ST_X(coords::geometry)) 
             from public.clinics 
             where coords is not null 
               and (lower(city) = lower(in_city_or_postcode) or postcode = in_city_or_postcode)),
            13.4050 -- Default to Berlin
          ),
          coalesce(
            (select avg(ST_Y(coords::geometry)) 
             from public.clinics 
             where coords is not null 
               and (lower(city) = lower(in_city_or_postcode) or postcode = in_city_or_postcode)),
            52.5200 -- Default to Berlin
          )
        ), 4326
      )::geography
    into center_geo;
  elsif in_lat is not null and in_lng is not null then
    -- Near-me mode: use provided coordinates
    center_geo := ST_SetSRID(ST_MakePoint(in_lng, in_lat), 4326)::geography;
  else
    -- No valid input, return empty
    return;
  end if;

  -- Return results
  return query
  select
    c.id, 
    c.name, 
    c.city, 
    c.address_line1, 
    c.postcode,
    case 
      when c.coords is not null then ST_Distance(c.coords, center_geo)
      else null
    end as distance_m,
    c.specialties
  from public.clinics c
  where c.is_active = true
    and (
      -- City/postcode mode: match city OR postcode
      (in_city_or_postcode is not null and in_city_or_postcode != '' 
       and (lower(c.city) = lower(in_city_or_postcode) or c.postcode = in_city_or_postcode))
      or
      -- Near-me mode: within radius (only if coords exist)
      (in_city_or_postcode is null 
       and c.coords is not null 
       and ST_DWithin(c.coords, center_geo, in_radius_m))
    )
  order by 
    case 
      when c.coords is not null then ST_Distance(c.coords, center_geo)
      else 999999999
    end asc
  limit in_limit;
end;
$$;

-- 7) Seed data with coordinates (minimal - will only insert if not exists)
-- Berlin coordinates: ~13.4, 52.5
-- Munich coordinates: ~11.57, 48.13
-- Hamburg coordinates: ~9.99, 53.55

-- Check and insert seed data
do $$
declare
  clinic_count integer;
begin
  select count(*) into clinic_count from public.clinics;
  
  -- Only seed if we have very few clinics
  if clinic_count < 5 then
    -- Berlin clinics
    insert into public.clinics (name, city, address_line1, postcode, coords, specialties, is_active)
    values
      ('PawPoint Tierarztpraxis Neukölln', 'Berlin', 'Mainzer Str. 1', '12043', 
       ST_SetSRID(ST_MakePoint(13.423, 52.485), 4326)::geography, 
       array['Wellness & Preventive Care','Dental Care'], true),
      
      ('Tierarztpraxis Mitte', 'Berlin', 'Invalidenstr. 10', '10115', 
       ST_SetSRID(ST_MakePoint(13.388, 52.532), 4326)::geography, 
       array['Diagnostics & Imaging','Surgery & Anesthesia'], true)
    on conflict (id) do nothing;
    
    -- Munich clinic
    insert into public.clinics (name, city, address_line1, postcode, coords, specialties, is_active)
    values
      ('Tierarztpraxis Isar', 'Munich', 'Isarstr. 8', '80469', 
       ST_SetSRID(ST_MakePoint(11.573, 48.130), 4326)::geography, 
       array['Wellness & Preventive Care','Medical Consults & Chronic Care'], true)
    on conflict (id) do nothing;
    
    -- Hamburg clinic
    insert into public.clinics (name, city, address_line1, postcode, coords, specialties, is_active)
    values
      ('Tierarztpraxis Altona', 'Hamburg', 'Altonaer Str. 5', '22767', 
       ST_SetSRID(ST_MakePoint(9.937, 53.554), 4326)::geography, 
       array['Urgent & End-of-Life Care'], true)
    on conflict (id) do nothing;
  end if;
end $$;

-- 8) Update existing clinics with coordinates (if they don't have them)
-- This is a best-effort update based on city names
do $$
begin
  -- Update Berlin clinics
  update public.clinics
  set coords = ST_SetSRID(ST_MakePoint(13.4050, 52.5200), 4326)::geography
  where lower(city) = 'berlin' 
    and coords is null;
  
  -- Update Munich clinics  
  update public.clinics
  set coords = ST_SetSRID(ST_MakePoint(11.5820, 48.1351), 4326)::geography
  where lower(city) = 'munich' 
    and coords is null;
  
  -- Update Hamburg clinics
  update public.clinics
  set coords = ST_SetSRID(ST_MakePoint(9.9937, 53.5511), 4326)::geography
  where lower(city) = 'hamburg' 
    and coords is null;
end $$;

-- 9) Grant execute permission on the function
grant execute on function public.fn_search_clinics to anon, authenticated;

