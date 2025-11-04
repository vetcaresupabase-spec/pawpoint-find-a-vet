-- Allow vets to create pet records for their appointments
-- This enables the treatment system to work regardless of pet sharing status

-- Add RLS policy to allow vets to create pet records for their appointments
CREATE POLICY "Vets can create pets for their appointments"
  ON public.pets
  FOR INSERT
  WITH CHECK (
    -- Vet can create a pet record if they have an appointment with that pet owner
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.clinics c ON c.id = b.clinic_id
      WHERE b.pet_owner_id = pets.owner_id
      AND c.owner_id = auth.uid()
    )
  );

-- Add RLS policy to allow vets to view pet records for their appointments
CREATE POLICY "Vets can view pets for their appointments"
  ON public.pets
  FOR SELECT
  USING (
    -- Vet can view pet records if they have an appointment with that pet owner
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.clinics c ON c.id = b.clinic_id
      WHERE b.pet_owner_id = pets.owner_id
      AND c.owner_id = auth.uid()
    )
  );

-- Add RLS policy to allow vets to update pet records for their appointments (limited updates)
CREATE POLICY "Vets can update pets for their appointments"
  ON public.pets
  FOR UPDATE
  USING (
    -- Vet can update pet records if they have an appointment with that pet owner
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.clinics c ON c.id = b.clinic_id
      WHERE b.pet_owner_id = pets.owner_id
      AND c.owner_id = auth.uid()
    )
  )
  WITH CHECK (
    -- Vet can update pet records if they have an appointment with that pet owner
    EXISTS (
      SELECT 1 FROM public.bookings b
      JOIN public.clinics c ON c.id = b.clinic_id
      WHERE b.pet_owner_id = pets.owner_id
      AND c.owner_id = auth.uid()
    )
  );

-- Add missing columns to bookings table if they don't exist
DO $$ 
BEGIN
  -- Add shared_pet_id column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'shared_pet_id'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN shared_pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS bookings_shared_pet_id_idx ON public.bookings(shared_pet_id);
  END IF;

  -- Add pet_info_shared column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'bookings' 
    AND column_name = 'pet_info_shared'
  ) THEN
    ALTER TABLE public.bookings ADD COLUMN pet_info_shared boolean DEFAULT false;
    CREATE INDEX IF NOT EXISTS bookings_pet_info_shared_idx ON public.bookings(pet_info_shared);
  END IF;
END $$;

-- Comment for documentation
COMMENT ON POLICY "Vets can create pets for their appointments" ON public.pets IS 'Allows vets to create pet records for appointments to enable medical record creation regardless of pet sharing status';
COMMENT ON POLICY "Vets can view pets for their appointments" ON public.pets IS 'Allows vets to view pet records for their appointments to enable treatment management';
COMMENT ON POLICY "Vets can update pets for their appointments" ON public.pets IS 'Allows vets to update pet records for their appointments (e.g., adding medical information)';
