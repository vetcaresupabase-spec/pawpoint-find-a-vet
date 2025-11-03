-- Pet Information Sharing System Migration
-- This migration adds pet information sharing functionality between pet owners and vets

-- ============================================
-- Update bookings table to include pet information sharing
-- ============================================

-- Add columns to bookings table for pet information sharing
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS shared_pet_id uuid REFERENCES public.pets(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS pet_info_shared boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS pet_sharing_consent boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS shared_pet_data jsonb;

-- Create index for efficient pet information queries
CREATE INDEX IF NOT EXISTS bookings_shared_pet_idx ON public.bookings(shared_pet_id);
CREATE INDEX IF NOT EXISTS bookings_pet_shared_idx ON public.bookings(pet_info_shared);

-- ============================================
-- Update pets table for sharing preferences
-- ============================================

-- Add sharing preferences to pets table
ALTER TABLE public.pets 
ADD COLUMN IF NOT EXISTS default_sharing_enabled boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS sharing_preferences jsonb DEFAULT '{}';

-- Create index for sharing preferences
CREATE INDEX IF NOT EXISTS pets_sharing_enabled_idx ON public.pets(default_sharing_enabled);

-- ============================================
-- Create pet_sharing_logs table for audit trail
-- ============================================

CREATE TABLE IF NOT EXISTS public.pet_sharing_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  booking_id uuid NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  pet_owner_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Sharing details
  shared_at timestamptz NOT NULL DEFAULT now(),
  sharing_enabled boolean NOT NULL,
  shared_fields jsonb, -- Which fields were shared
  
  -- Metadata
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on pet_sharing_logs
ALTER TABLE public.pet_sharing_logs ENABLE ROW LEVEL SECURITY;

-- RLS policies for pet_sharing_logs
CREATE POLICY "Pet owners can view their own sharing logs"
  ON public.pet_sharing_logs
  FOR SELECT
  USING (auth.uid() = pet_owner_id);

CREATE POLICY "Pet owners can create sharing logs"
  ON public.pet_sharing_logs
  FOR INSERT
  WITH CHECK (auth.uid() = pet_owner_id);

-- Vets can view sharing logs for their clinic's bookings
CREATE POLICY "Vets can view sharing logs for their clinic"
  ON public.pet_sharing_logs
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = pet_sharing_logs.clinic_id 
      AND clinics.owner_id = auth.uid()
    )
  );

-- Create indexes for pet_sharing_logs
CREATE INDEX IF NOT EXISTS pet_sharing_logs_pet_idx ON public.pet_sharing_logs(pet_id);
CREATE INDEX IF NOT EXISTS pet_sharing_logs_booking_idx ON public.pet_sharing_logs(booking_id);
CREATE INDEX IF NOT EXISTS pet_sharing_logs_clinic_idx ON public.pet_sharing_logs(clinic_id);
CREATE INDEX IF NOT EXISTS pet_sharing_logs_owner_idx ON public.pet_sharing_logs(pet_owner_id);

-- ============================================
-- Update RLS policies for bookings to include pet information
-- ============================================

-- Allow vets to see shared pet information in their bookings
DROP POLICY IF EXISTS "Vets can view bookings for their clinic" ON public.bookings;
CREATE POLICY "Vets can view bookings for their clinic"
  ON public.bookings
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = bookings.clinic_id 
      AND clinics.owner_id = auth.uid()
    )
  );

-- ============================================
-- Create function to get shared pet information for vets
-- ============================================

CREATE OR REPLACE FUNCTION public.get_shared_pet_info(booking_id_param uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  booking_record record;
  pet_record record;
  result jsonb;
BEGIN
  -- Get booking information
  SELECT * INTO booking_record
  FROM public.bookings
  WHERE id = booking_id_param;
  
  -- Check if booking exists and pet info is shared
  IF NOT FOUND OR NOT booking_record.pet_info_shared OR booking_record.shared_pet_id IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Check if current user is the vet for this clinic
  IF NOT EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE id = booking_record.clinic_id 
    AND owner_id = auth.uid()
  ) THEN
    RETURN NULL;
  END IF;
  
  -- Get pet information
  SELECT * INTO pet_record
  FROM public.pets
  WHERE id = booking_record.shared_pet_id;
  
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;
  
  -- Build result with pet information
  result := jsonb_build_object(
    'pet_id', pet_record.id,
    'name', pet_record.name,
    'pet_type', pet_record.pet_type,
    'breed', pet_record.breed,
    'date_of_birth', pet_record.date_of_birth,
    'sex', pet_record.sex,
    'neutered_spayed', pet_record.neutered_spayed,
    'owner_name', pet_record.owner_name,
    'photo_url', pet_record.photo_url,
    'microchip_number', pet_record.microchip_number,
    'eu_passport_number', pet_record.eu_passport_number,
    'color_markings', pet_record.color_markings,
    'weight_kg', pet_record.weight_kg,
    'weight_date', pet_record.weight_date,
    'height_withers_cm', pet_record.height_withers_cm,
    'known_conditions', pet_record.known_conditions,
    'allergies', pet_record.allergies,
    'insurance_provider', pet_record.insurance_provider,
    'insurance_policy_number', pet_record.insurance_policy_number,
    'primary_vet_clinic_name', pet_record.primary_vet_clinic_name,
    'primary_vet_phone', pet_record.primary_vet_phone,
    'emergency_clinic_name', pet_record.emergency_clinic_name,
    'emergency_clinic_phone', pet_record.emergency_clinic_phone,
    'notes', pet_record.notes,
    'completeness_score', pet_record.completeness_score
  );
  
  RETURN result;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.get_shared_pet_info(uuid) TO authenticated;

-- ============================================
-- Create function to update pet sharing preferences
-- ============================================

CREATE OR REPLACE FUNCTION public.update_pet_sharing_preference(
  pet_id_param uuid,
  sharing_enabled boolean
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user owns this pet
  IF NOT EXISTS (
    SELECT 1 FROM public.pets 
    WHERE id = pet_id_param 
    AND owner_id = auth.uid()
  ) THEN
    RETURN false;
  END IF;
  
  -- Update sharing preference
  UPDATE public.pets
  SET default_sharing_enabled = sharing_enabled,
      updated_at = now()
  WHERE id = pet_id_param;
  
  RETURN true;
END;
$$;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION public.update_pet_sharing_preference(uuid, boolean) TO authenticated;

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON COLUMN public.bookings.shared_pet_id IS 'Reference to the pet whose information is shared with the vet';
COMMENT ON COLUMN public.bookings.pet_info_shared IS 'Whether pet information is shared with the vet for this booking';
COMMENT ON COLUMN public.bookings.pet_sharing_consent IS 'Whether pet owner has given consent to share pet information';
COMMENT ON COLUMN public.bookings.shared_pet_data IS 'Cached pet information at the time of booking (for historical record)';

COMMENT ON COLUMN public.pets.default_sharing_enabled IS 'Default preference for sharing this pet information with vets';
COMMENT ON COLUMN public.pets.sharing_preferences IS 'Detailed sharing preferences (which fields to share, etc.)';

COMMENT ON TABLE public.pet_sharing_logs IS 'Audit trail for pet information sharing activities';
COMMENT ON FUNCTION public.get_shared_pet_info(uuid) IS 'Securely retrieves shared pet information for vets';
COMMENT ON FUNCTION public.update_pet_sharing_preference(uuid, boolean) IS 'Updates pet sharing preferences for pet owners';
