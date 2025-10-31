-- Create clinic_exceptions table for date-specific closures and special hours
CREATE TABLE IF NOT EXISTS public.clinic_exceptions (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  date date NOT NULL,
  is_closed boolean NOT NULL DEFAULT true,
  reason text,
  time_ranges jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(clinic_id, date)
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_clinic_exceptions_clinic_date 
  ON public.clinic_exceptions(clinic_id, date);

-- Enable RLS
ALTER TABLE public.clinic_exceptions ENABLE ROW LEVEL SECURITY;

-- Drop any existing policies (in case of re-run)
DROP POLICY IF EXISTS "Public can view clinic exceptions" ON public.clinic_exceptions;
DROP POLICY IF EXISTS "Clinic owners can manage exceptions" ON public.clinic_exceptions;
DROP POLICY IF EXISTS "exceptions_select_policy" ON public.clinic_exceptions;
DROP POLICY IF EXISTS "exceptions_insert_policy" ON public.clinic_exceptions;
DROP POLICY IF EXISTS "exceptions_update_policy" ON public.clinic_exceptions;
DROP POLICY IF EXISTS "exceptions_delete_policy" ON public.clinic_exceptions;

-- FIXED POLICIES: Using EXISTS instead of IN (prevents RLS error)

-- Policy 1: Anyone can view exceptions (for booking availability)
CREATE POLICY "exceptions_select_policy"
  ON public.clinic_exceptions
  FOR SELECT
  USING (true);

-- Policy 2: Vets can INSERT their own exceptions
CREATE POLICY "exceptions_insert_policy"
  ON public.clinic_exceptions
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = clinic_exceptions.clinic_id 
      AND clinics.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy 3: Vets can UPDATE their own exceptions
CREATE POLICY "exceptions_update_policy"
  ON public.clinic_exceptions
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = clinic_exceptions.clinic_id 
      AND clinics.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = clinic_exceptions.clinic_id 
      AND clinics.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Policy 4: Vets can DELETE their own exceptions
CREATE POLICY "exceptions_delete_policy"
  ON public.clinic_exceptions
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = clinic_exceptions.clinic_id 
      AND clinics.email = (SELECT email FROM auth.users WHERE id = auth.uid())
    )
  );

-- Grant permissions
GRANT ALL ON public.clinic_exceptions TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT SELECT ON auth.users TO authenticated;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION public.update_clinic_exceptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_clinic_exceptions_updated_at ON public.clinic_exceptions;

CREATE TRIGGER trigger_update_clinic_exceptions_updated_at
  BEFORE UPDATE ON public.clinic_exceptions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_clinic_exceptions_updated_at();

-- Add comment
COMMENT ON TABLE public.clinic_exceptions IS 'Stores date-specific exceptions for clinic hours (holidays, special hours, etc.)';
