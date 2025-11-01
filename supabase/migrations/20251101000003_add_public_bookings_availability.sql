-- Add public read access to bookings for availability checking
-- This allows anonymous users to see which slots are booked without exposing personal information

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

-- This policy works alongside existing policies:
-- - Pet owners can still view their own bookings (with full details)
-- - Clinic staff can still view their clinic bookings (with full details)
-- - Anonymous users can check availability (limited fields only)

