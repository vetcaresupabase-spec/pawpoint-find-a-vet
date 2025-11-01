-- Add Services System Migration
-- This migration adds proper services management for vets

-- ============================================
-- Add category column to clinic_services
-- ============================================
DO $$ 
BEGIN
  -- Add category column if it doesn't exist
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'clinic_services' AND column_name = 'category') THEN
    ALTER TABLE public.clinic_services ADD COLUMN category text;
  END IF;
END $$;

-- ============================================
-- Create default services function
-- ============================================
CREATE OR REPLACE FUNCTION public.create_default_services_for_clinic(p_clinic_id uuid)
RETURNS void
LANGUAGE plpgsql
AS $$
BEGIN
  -- Insert default services if clinic has no services
  IF NOT EXISTS (SELECT 1 FROM public.clinic_services WHERE clinic_id = p_clinic_id) THEN
    INSERT INTO public.clinic_services (clinic_id, name, category, duration_minutes, is_active)
    VALUES 
      (p_clinic_id, 'General Health Check', 'Wellness & Preventive Care', 30, true),
      (p_clinic_id, 'Vaccination', 'Wellness & Preventive Care', 15, true),
      (p_clinic_id, 'X-Ray Examination', 'Diagnostics & Imaging', 45, true),
      (p_clinic_id, 'Blood Test', 'Diagnostics & Imaging', 20, true),
      (p_clinic_id, 'Dental Cleaning', 'Dental Care', 60, true),
      (p_clinic_id, 'Dental Surgery', 'Dental Care', 90, true),
      (p_clinic_id, 'Minor Surgery', 'Surgery & Anesthesia', 120, true),
      (p_clinic_id, 'Consultation', 'Medical Consults & Chronic Care', 30, true),
      (p_clinic_id, 'Emergency Care', 'Urgent & End-of-Life Care', 60, true),
      (p_clinic_id, 'End-of-Life Care', 'Urgent & End-of-Life Care', 90, true);
  END IF;
END;
$$;

-- ============================================
-- Create trigger to auto-create default services
-- ============================================
CREATE OR REPLACE FUNCTION public.auto_create_default_services()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create default services for new clinic
  PERFORM public.create_default_services_for_clinic(NEW.id);
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_auto_create_default_services ON public.clinics;

-- Create trigger for new clinics
CREATE TRIGGER trigger_auto_create_default_services
  AFTER INSERT ON public.clinics
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_create_default_services();

-- ============================================
-- Create default services for existing clinics
-- ============================================
DO $$
DECLARE
  clinic_record RECORD;
BEGIN
  -- Loop through all existing clinics and create default services
  FOR clinic_record IN SELECT id FROM public.clinics LOOP
    PERFORM public.create_default_services_for_clinic(clinic_record.id);
  END LOOP;
END $$;

-- ============================================
-- Add unique constraint for service names per clinic
-- ============================================
DO $$
BEGIN
  -- Add unique constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'clinic_services_clinic_name_unique' 
    AND table_name = 'clinic_services'
  ) THEN
    ALTER TABLE public.clinic_services 
    ADD CONSTRAINT clinic_services_clinic_name_unique 
    UNIQUE (clinic_id, name);
  END IF;
END $$;

-- ============================================
-- Update RLS policies for clinic_services
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Clinic services are viewable by everyone" ON public.clinic_services;
DROP POLICY IF EXISTS "Clinic owners can manage their services" ON public.clinic_services;

-- Create new policies
CREATE POLICY "Anyone can view active clinic services"
  ON public.clinic_services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Clinic owners can manage their services"
  ON public.clinic_services FOR ALL
  USING (
    clinic_id IN (
      SELECT id FROM public.clinics 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- ============================================
-- Create function to get services with real-time updates
-- ============================================
CREATE OR REPLACE FUNCTION public.get_clinic_services(p_clinic_id uuid)
RETURNS TABLE (
  id uuid,
  clinic_id uuid,
  name text,
  description text,
  category text,
  duration_minutes int,
  price_min numeric,
  price_max numeric,
  is_active boolean,
  created_at timestamptz,
  updated_at timestamptz
)
LANGUAGE sql
STABLE
AS $$
  SELECT 
    s.id,
    s.clinic_id,
    s.name,
    s.description,
    s.category,
    s.duration_minutes,
    s.price_min,
    s.price_max,
    s.is_active,
    s.created_at,
    s.updated_at
  FROM public.clinic_services s
  WHERE s.clinic_id = p_clinic_id
  ORDER BY s.category, s.name;
$$;


