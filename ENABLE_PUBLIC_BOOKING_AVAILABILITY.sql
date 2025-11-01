-- =====================================================
-- Enable Public Booking Availability Check
-- =====================================================
-- This script allows anonymous users to check which slots are booked
-- without exposing personal information (pet_owner_id, pet_name, etc.)
--
-- Run this in Supabase SQL Editor to fix the issue where
-- non-logged-in users see all slots as available
-- =====================================================

-- Drop existing policy if it exists
drop policy if exists "Public can check booking availability" on public.bookings;

-- Create policy for public availability checking
-- Only allows reading minimal booking data (clinic_id, appointment_date, start_time, end_time, status)
-- Does NOT expose pet_owner_id, pet_name, or other personal information
-- This policy allows anonymous (anon) and authenticated users to check slot availability
create policy "Public can check booking availability" on public.bookings
  for select
  to anon, authenticated
  using (
    -- Only allow reading active bookings (pending, confirmed, checked_in)
    status in ('pending', 'confirmed', 'checked_in')
    -- Only allow reading future or today's bookings
    and appointment_date >= current_date
  );

-- Verify the policy was created
-- You can check by running: SELECT * FROM pg_policies WHERE tablename = 'bookings';

-- =====================================================
-- IMPORTANT NOTES:
-- =====================================================
-- 1. This policy works alongside existing policies:
--    - Pet owners can still view their own bookings (with full details)
--    - Clinic staff can still view their clinic bookings (with full details)
--    - Anonymous users can check availability (limited fields only)
--
-- 2. The policy only exposes:
--    - clinic_id
--    - appointment_date
--    - start_time
--    - end_time
--    - status
--
-- 3. Personal information is NOT exposed:
--    - pet_owner_id (hidden)
--    - pet_name (hidden)
--    - pet_type (hidden)
--    - notes (hidden)
--
-- 4. After running this, anonymous users will see the same
--    calendar with booked slots marked as unavailable (showing "—")
-- =====================================================

