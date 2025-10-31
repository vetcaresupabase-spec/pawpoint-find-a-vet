-- VetConnect Core Schema Migration
-- This migration creates all tables needed for the complete booking platform

-- ============================================
-- TABLE: bookings (appointments)
-- Purpose: Store all appointment bookings
-- ============================================
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  service_id uuid references public.clinic_services(id) on delete set null,
  pet_owner_id uuid not null references auth.users(id) on delete cascade,
  assigned_staff_id uuid references auth.users(id) on delete set null,
  
  -- Pet information
  pet_name text not null,
  pet_type text,
  
  -- Scheduling
  appointment_date date not null,
  start_time time not null,
  end_time time not null,
  duration_minutes int not null default 30,
  
  -- Status tracking
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'checked_in', 'completed', 'no_show', 'canceled')),
  
  -- Timestamps for status changes
  confirmed_at timestamptz,
  checked_in_at timestamptz,
  completed_at timestamptz,
  no_show_at timestamptz,
  canceled_at timestamptz,
  
  -- Notes
  notes text,
  cancellation_reason text,
  
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  -- Prevent double booking
  unique (clinic_id, appointment_date, start_time)
);

create index if not exists bookings_clinic_date_idx on public.bookings(clinic_id, appointment_date);
create index if not exists bookings_pet_owner_idx on public.bookings(pet_owner_id);
create index if not exists bookings_status_idx on public.bookings(status);
create index if not exists bookings_assigned_staff_idx on public.bookings(assigned_staff_id);

-- ============================================
-- TABLE: clinic_staff
-- Purpose: Manage staff members at each clinic
-- ============================================
create table if not exists public.clinic_staff (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  
  -- Staff details
  name text not null,
  email text not null,
  role text not null check (role in ('vet', 'assistant', 'technician', 'reception', 'nurse', 'admin')),
  
  -- Status
  is_active boolean not null default true,
  can_book_appointments boolean not null default true,
  
  -- Invite system
  invite_code text unique,
  invite_accepted_at timestamptz,
  
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (clinic_id, email)
);

create index if not exists clinic_staff_clinic_idx on public.clinic_staff(clinic_id);
create index if not exists clinic_staff_user_idx on public.clinic_staff(user_id);
create index if not exists clinic_staff_invite_idx on public.clinic_staff(invite_code) where invite_code is not null;

-- ============================================
-- TABLE: clinic_hours
-- Purpose: Store weekly operating hours per clinic
-- ============================================
create table if not exists public.clinic_hours (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  
  -- Weekday (0=Sunday, 1=Monday, ..., 6=Saturday)
  weekday int not null check (weekday >= 0 and weekday <= 6),
  
  -- Is clinic open this day?
  is_open boolean not null default true,
  
  -- Time ranges (stored as JSON array of {start, end} objects)
  -- Example: [{"start": "09:00", "end": "12:00"}, {"start": "13:00", "end": "17:00"}]
  time_ranges jsonb not null default '[]'::jsonb,
  
  -- Metadata
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  
  unique (clinic_id, weekday)
);

create index if not exists clinic_hours_clinic_idx on public.clinic_hours(clinic_id);

-- ============================================
-- TABLE: analytics_events (for tracking)
-- Purpose: Log important clinic actions for analytics
-- ============================================
create table if not exists public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  clinic_id uuid not null references public.clinics(id) on delete cascade,
  user_id uuid references auth.users(id) on delete set null,
  
  event_type text not null,
  event_data jsonb,
  
  created_at timestamptz not null default now()
);

create index if not exists analytics_events_clinic_date_idx on public.analytics_events(clinic_id, created_at desc);
create index if not exists analytics_events_type_idx on public.analytics_events(event_type);

-- ============================================
-- Add missing columns to existing tables
-- ============================================

-- Add is_active to clinic_services if not exists
do $$ 
begin
  if not exists (select 1 from information_schema.columns where table_name = 'clinic_services' and column_name = 'is_active') then
    alter table public.clinic_services add column is_active boolean not null default true;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'clinic_services' and column_name = 'duration_minutes') then
    alter table public.clinic_services add column duration_minutes int not null default 30;
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'clinic_services' and column_name = 'created_at') then
    alter table public.clinic_services add column created_at timestamptz not null default now();
  end if;
  if not exists (select 1 from information_schema.columns where table_name = 'clinic_services' and column_name = 'updated_at') then
    alter table public.clinic_services add column updated_at timestamptz not null default now();
  end if;
end $$;

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function: Get today's bookings for a clinic
create or replace function public.get_todays_bookings(p_clinic_id uuid)
returns table (
  id uuid,
  pet_name text,
  pet_owner_name text,
  service_name text,
  assigned_staff_name text,
  start_time time,
  end_time time,
  status text,
  checked_in_at timestamptz,
  no_show_at timestamptz
) language sql stable as $$
  select 
    b.id,
    b.pet_name,
    coalesce(p.display_name, b_owner.email) as pet_owner_name,
    cs.name as service_name,
    coalesce(staff.name, staff_user.email) as assigned_staff_name,
    b.start_time,
    b.end_time,
    b.status,
    b.checked_in_at,
    b.no_show_at
  from public.bookings b
  left join public.profiles p on p.user_id = b.pet_owner_id
  left join auth.users b_owner on b_owner.id = b.pet_owner_id
  left join public.clinic_services cs on cs.id = b.service_id
  left join public.clinic_staff staff on staff.user_id = b.assigned_staff_id and staff.clinic_id = p_clinic_id
  left join auth.users staff_user on staff_user.id = b.assigned_staff_id
  where b.clinic_id = p_clinic_id
    and b.appointment_date = current_date
  order by b.start_time;
$$;

-- Function: Get analytics metrics
create or replace function public.get_clinic_analytics(p_clinic_id uuid, p_days int default 30)
returns jsonb language plpgsql stable as $$
declare
  v_result jsonb;
  v_total_appointments int;
  v_last_7_days int;
  v_failed_appointments int;
  v_unique_owners int;
begin
  select count(*) into v_total_appointments
  from public.bookings
  where clinic_id = p_clinic_id
    and appointment_date >= current_date - p_days
    and status != 'canceled';

  select count(*) into v_last_7_days
  from public.bookings
  where clinic_id = p_clinic_id
    and appointment_date >= current_date - 7
    and status != 'canceled';

  select count(*) into v_failed_appointments
  from public.bookings
  where clinic_id = p_clinic_id
    and appointment_date >= current_date - p_days
    and status in ('canceled', 'no_show');

  select count(distinct pet_owner_id) into v_unique_owners
  from public.bookings
  where clinic_id = p_clinic_id
    and appointment_date >= current_date - p_days;

  v_result := jsonb_build_object(
    'total_appointments', v_total_appointments,
    'last_7_days', v_last_7_days,
    'failed_appointments', v_failed_appointments,
    'unique_owners', v_unique_owners
  );

  return v_result;
end;
$$;

-- Function: Get daily booking trend
create or replace function public.get_booking_trend(p_clinic_id uuid, p_days int default 14)
returns table (
  date date,
  count bigint
) language sql stable as $$
  select 
    appointment_date as date,
    count(*) as count
  from public.bookings
  where clinic_id = p_clinic_id
    and appointment_date >= current_date - p_days
    and appointment_date <= current_date
    and status != 'canceled'
  group by appointment_date
  order by appointment_date;
$$;

-- Trigger: Update updated_at on bookings
create or replace function public.update_updated_at_column()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists update_bookings_updated_at on public.bookings;
create trigger update_bookings_updated_at
  before update on public.bookings
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_clinic_services_updated_at on public.clinic_services;
create trigger update_clinic_services_updated_at
  before update on public.clinic_services
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_clinic_staff_updated_at on public.clinic_staff;
create trigger update_clinic_staff_updated_at
  before update on public.clinic_staff
  for each row execute function public.update_updated_at_column();

drop trigger if exists update_clinic_hours_updated_at on public.clinic_hours;
create trigger update_clinic_hours_updated_at
  before update on public.clinic_hours
  for each row execute function public.update_updated_at_column();

-- ============================================
-- RLS POLICIES
-- ============================================

-- Enable RLS
alter table public.bookings enable row level security;
alter table public.clinic_staff enable row level security;
alter table public.clinic_hours enable row level security;
alter table public.analytics_events enable row level security;

-- BOOKINGS policies
drop policy if exists "Pet owners can view their own bookings" on public.bookings;
create policy "Pet owners can view their own bookings" on public.bookings
  for select using (auth.uid() = pet_owner_id);

drop policy if exists "Clinic staff can view their clinic bookings" on public.bookings;
create policy "Clinic staff can view their clinic bookings" on public.bookings
  for select using (
    exists (
      select 1 from public.clinics c
      where c.id = bookings.clinic_id
        and c.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.clinic_staff cs
      where cs.clinic_id = bookings.clinic_id
        and cs.user_id = auth.uid()
        and cs.is_active = true
    )
  );

drop policy if exists "Clinic staff can update their clinic bookings" on public.bookings;
create policy "Clinic staff can update their clinic bookings" on public.bookings
  for update using (
    exists (
      select 1 from public.clinics c
      where c.id = bookings.clinic_id
        and c.owner_id = auth.uid()
    )
    or exists (
      select 1 from public.clinic_staff cs
      where cs.clinic_id = bookings.clinic_id
        and cs.user_id = auth.uid()
        and cs.is_active = true
    )
  );

drop policy if exists "Pet owners can create bookings" on public.bookings;
create policy "Pet owners can create bookings" on public.bookings
  for insert with check (auth.uid() = pet_owner_id);

-- CLINIC_STAFF policies
drop policy if exists "Clinic owners can manage their staff" on public.clinic_staff;
create policy "Clinic owners can manage their staff" on public.clinic_staff
  for all using (
    exists (
      select 1 from public.clinics c
      where c.id = clinic_staff.clinic_id
        and c.owner_id = auth.uid()
    )
  );

drop policy if exists "Staff can view their own record" on public.clinic_staff;
create policy "Staff can view their own record" on public.clinic_staff
  for select using (user_id = auth.uid());

-- CLINIC_HOURS policies
drop policy if exists "Anyone can view clinic hours" on public.clinic_hours;
create policy "Anyone can view clinic hours" on public.clinic_hours
  for select using (true);

drop policy if exists "Clinic owners can manage hours" on public.clinic_hours;
create policy "Clinic owners can manage hours" on public.clinic_hours
  for all using (
    exists (
      select 1 from public.clinics c
      where c.id = clinic_hours.clinic_id
        and c.owner_id = auth.uid()
    )
  );

-- ANALYTICS_EVENTS policies
drop policy if exists "Clinic owners can view their analytics" on public.analytics_events;
create policy "Clinic owners can view their analytics" on public.analytics_events
  for select using (
    exists (
      select 1 from public.clinics c
      where c.id = analytics_events.clinic_id
        and c.owner_id = auth.uid()
    )
  );

drop policy if exists "System can insert analytics events" on public.analytics_events;
create policy "System can insert analytics events" on public.analytics_events
  for insert with check (true);




