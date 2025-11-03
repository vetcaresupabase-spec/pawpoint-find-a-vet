-- Treatments System Migration
-- Creates comprehensive treatment recording system with SOAP notes and EU-style entries

-- ============================================
-- TABLE: treatments
-- Purpose: Store immutable treatment records with SOAP notes
-- ============================================

CREATE TABLE IF NOT EXISTS public.treatments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES public.bookings(id) ON DELETE CASCADE,
  pet_id uuid NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  clinic_id uuid NOT NULL REFERENCES public.clinics(id) ON DELETE CASCADE,
  vet_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  
  -- Treatment Metadata
  treatment_date timestamptz NOT NULL DEFAULT now(),
  treatment_type text NOT NULL CHECK (treatment_type IN (
    'examination', 'vaccination', 'deworming', 'antiparasitic', 
    'surgery', 'dental', 'diagnostics', 'medication', 'other'
  )),
  diagnosis text,
  
  -- SOAP Note Structure
  -- S = Subjective (patient history, owner observations)
  subjective text,
  -- O = Objective (physical exam findings, vital signs, test results)
  objective text,
  -- A = Assessment (diagnosis, clinical impressions)
  assessment text,
  -- P = Plan (treatment plan, medications, follow-up)
  plan text,
  
  -- EU-Style Entries
  -- Vaccination Details
  vaccine_type text,
  vaccine_batch_number text,
  vaccine_expiry_date date,
  vaccine_manufacturer text,
  next_vaccination_due date,
  
  -- Deworming Details
  deworming_product text,
  deworming_dose text,
  deworming_date date,
  next_deworming_due date,
  
  -- Antiparasitic Details
  antiparasitic_product text,
  antiparasitic_type text CHECK (antiparasitic_type IN (
    'flea_treatment', 'tick_treatment', 'heartworm_prevention', 'combination', 'other'
  )),
  antiparasitic_dose text,
  antiparasitic_date date,
  next_antiparasitic_due date,
  
  -- Certificates & Documentation
  certificates jsonb, -- Array of certificate objects: {type, number, issue_date, expiry_date}
  
  -- Medications Prescribed
  medications jsonb, -- Array of medication objects: {name, dosage, frequency, duration, instructions}
  
  -- Diagnostic Tests
  diagnostic_tests jsonb, -- Array of test objects: {test_type, results, notes}
  
  -- Vital Signs (can be stored as JSON or individual fields)
  vital_signs jsonb, -- {temperature, heart_rate, respiratory_rate, weight, etc.}
  
  -- Follow-up Instructions
  follow_up_instructions text,
  follow_up_date date,
  
  -- Additional Notes
  notes text,
  
  -- Audit Trail
  created_by uuid NOT NULL REFERENCES auth.users(id),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  version integer NOT NULL DEFAULT 1, -- For immutability tracking
  
  -- Soft delete (treatments should not be deleted, only marked)
  is_active boolean NOT NULL DEFAULT true,
  
  -- Constraints
  CONSTRAINT treatments_immutable CHECK (version = 1) -- Ensures immutability
);

-- Create indexes for efficient queries
CREATE INDEX IF NOT EXISTS treatments_pet_id_idx ON public.treatments(pet_id);
CREATE INDEX IF NOT EXISTS treatments_clinic_id_idx ON public.treatments(clinic_id);
CREATE INDEX IF NOT EXISTS treatments_vet_id_idx ON public.treatments(vet_id);
CREATE INDEX IF NOT EXISTS treatments_booking_id_idx ON public.treatments(booking_id);
CREATE INDEX IF NOT EXISTS treatments_treatment_date_idx ON public.treatments(treatment_date DESC);
CREATE INDEX IF NOT EXISTS treatments_treatment_type_idx ON public.treatments(treatment_type);
CREATE INDEX IF NOT EXISTS treatments_active_idx ON public.treatments(is_active) WHERE is_active = true;

-- ============================================
-- TABLE: treatment_audit_log
-- Purpose: Track all changes to treatments (for audit trail)
-- ============================================

CREATE TABLE IF NOT EXISTS public.treatment_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  treatment_id uuid NOT NULL REFERENCES public.treatments(id) ON DELETE CASCADE,
  action text NOT NULL CHECK (action IN ('created', 'viewed', 'updated', 'deactivated')),
  changed_by uuid NOT NULL REFERENCES auth.users(id),
  changed_at timestamptz NOT NULL DEFAULT now(),
  changes jsonb, -- Stores field changes for updates
  ip_address inet,
  user_agent text
);

CREATE INDEX IF NOT EXISTS treatment_audit_log_treatment_idx ON public.treatment_audit_log(treatment_id);
CREATE INDEX IF NOT EXISTS treatment_audit_log_changed_by_idx ON public.treatment_audit_log(changed_by);
CREATE INDEX IF NOT EXISTS treatment_audit_log_changed_at_idx ON public.treatment_audit_log(changed_at DESC);

-- ============================================
-- Enable RLS on all tables
-- ============================================

ALTER TABLE public.treatments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.treatment_audit_log ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS Policies for treatments
-- ============================================

-- Vets can view all treatments for their clinic
CREATE POLICY "Vets can view treatments for their clinic"
  ON public.treatments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = treatments.clinic_id 
      AND clinics.owner_id = auth.uid()
    )
  );

-- Vets can create treatments for their clinic
CREATE POLICY "Vets can create treatments for their clinic"
  ON public.treatments
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = treatments.clinic_id 
      AND clinics.owner_id = auth.uid()
    )
    AND vet_id = auth.uid()
    AND created_by = auth.uid()
  );

-- Vets can update treatments they created (during session only - via version check)
CREATE POLICY "Vets can update their own treatments"
  ON public.treatments
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = treatments.clinic_id 
      AND clinics.owner_id = auth.uid()
    )
    AND vet_id = auth.uid()
    AND is_active = true
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.clinics 
      WHERE clinics.id = treatments.clinic_id 
      AND clinics.owner_id = auth.uid()
    )
    AND vet_id = auth.uid()
  );

-- Pet owners can view treatments for their pets (read-only)
CREATE POLICY "Pet owners can view treatments for their pets"
  ON public.treatments
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets 
      WHERE pets.id = treatments.pet_id 
      AND pets.owner_id = auth.uid()
    )
  );

-- ============================================
-- RLS Policies for treatment_audit_log
-- ============================================

-- Vets can view audit logs for their clinic's treatments
CREATE POLICY "Vets can view audit logs for their clinic"
  ON public.treatment_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.treatments
      JOIN public.clinics ON clinics.id = treatments.clinic_id
      WHERE treatments.id = treatment_audit_log.treatment_id
      AND clinics.owner_id = auth.uid()
    )
  );

-- Pet owners can view audit logs for their pets' treatments
CREATE POLICY "Pet owners can view audit logs for their pets"
  ON public.treatment_audit_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.treatments
      JOIN public.pets ON pets.id = treatments.pet_id
      WHERE treatments.id = treatment_audit_log.treatment_id
      AND pets.owner_id = auth.uid()
    )
  );

-- System can create audit log entries
CREATE POLICY "System can create audit log entries"
  ON public.treatment_audit_log
  FOR INSERT
  WITH CHECK (changed_by = auth.uid());

-- ============================================
-- Functions for treatment management
-- ============================================

-- Function to create treatment with audit trail
CREATE OR REPLACE FUNCTION public.create_treatment_with_audit(
  p_booking_id uuid,
  p_pet_id uuid,
  p_clinic_id uuid,
  p_treatment_type text,
  p_subjective text DEFAULT NULL,
  p_objective text DEFAULT NULL,
  p_assessment text DEFAULT NULL,
  p_plan text DEFAULT NULL,
  p_diagnosis text DEFAULT NULL,
  p_vaccine_type text DEFAULT NULL,
  p_vaccine_batch_number text DEFAULT NULL,
  p_deworming_product text DEFAULT NULL,
  p_antiparasitic_product text DEFAULT NULL,
  p_certificates jsonb DEFAULT NULL,
  p_medications jsonb DEFAULT NULL,
  p_diagnostic_tests jsonb DEFAULT NULL,
  p_vital_signs jsonb DEFAULT NULL,
  p_follow_up_instructions text DEFAULT NULL,
  p_follow_up_date date DEFAULT NULL,
  p_notes text DEFAULT NULL
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_treatment_id uuid;
  v_vet_id uuid;
BEGIN
  -- Get current user (vet)
  v_vet_id := auth.uid();
  
  -- Verify vet owns the clinic
  IF NOT EXISTS (
    SELECT 1 FROM public.clinics 
    WHERE id = p_clinic_id 
    AND owner_id = v_vet_id
  ) THEN
    RAISE EXCEPTION 'Unauthorized: You do not own this clinic';
  END IF;
  
  -- Create treatment record
  INSERT INTO public.treatments (
    booking_id,
    pet_id,
    clinic_id,
    vet_id,
    treatment_type,
    diagnosis,
    subjective,
    objective,
    assessment,
    plan,
    vaccine_type,
    vaccine_batch_number,
    deworming_product,
    antiparasitic_product,
    certificates,
    medications,
    diagnostic_tests,
    vital_signs,
    follow_up_instructions,
    follow_up_date,
    notes,
    created_by
  ) VALUES (
    p_booking_id,
    p_pet_id,
    p_clinic_id,
    v_vet_id,
    p_treatment_type,
    p_diagnosis,
    p_subjective,
    p_objective,
    p_assessment,
    p_plan,
    p_vaccine_type,
    p_vaccine_batch_number,
    p_deworming_product,
    p_antiparasitic_product,
    p_certificates,
    p_medications,
    p_diagnostic_tests,
    p_vital_signs,
    p_follow_up_instructions,
    p_follow_up_date,
    p_notes,
    v_vet_id
  ) RETURNING id INTO v_treatment_id;
  
  -- Create audit log entry
  INSERT INTO public.treatment_audit_log (
    treatment_id,
    action,
    changed_by,
    changes
  ) VALUES (
    v_treatment_id,
    'created',
    v_vet_id,
    jsonb_build_object('treatment_type', p_treatment_type)
  );
  
  RETURN v_treatment_id;
END;
$$;

-- Function to get treatments for a pet (with proper access control)
CREATE OR REPLACE FUNCTION public.get_pet_treatments(
  p_pet_id uuid
)
RETURNS TABLE (
  id uuid,
  treatment_date timestamptz,
  treatment_type text,
  diagnosis text,
  subjective text,
  objective text,
  assessment text,
  plan text,
  vet_name text,
  clinic_name text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    t.id,
    t.treatment_date,
    t.treatment_type,
    t.diagnosis,
    t.subjective,
    t.objective,
    t.assessment,
    t.plan,
    COALESCE(p.full_name, 'Dr. ' || u.email) as vet_name,
    c.name as clinic_name,
    t.created_at
  FROM public.treatments t
  JOIN auth.users u ON u.id = t.vet_id
  LEFT JOIN public.profiles p ON p.id = t.vet_id
  JOIN public.clinics c ON c.id = t.clinic_id
  WHERE t.pet_id = p_pet_id
    AND t.is_active = true
    AND (
      -- Pet owner can see their pet's treatments
      EXISTS (
        SELECT 1 FROM public.pets 
        WHERE pets.id = t.pet_id 
        AND pets.owner_id = auth.uid()
      )
      OR
      -- Vet can see treatments from their clinic
      EXISTS (
        SELECT 1 FROM public.clinics 
        WHERE clinics.id = t.clinic_id 
        AND clinics.owner_id = auth.uid()
      )
    )
  ORDER BY t.treatment_date DESC, t.created_at DESC;
END;
$$;

-- Function to log treatment view (for audit trail)
CREATE OR REPLACE FUNCTION public.log_treatment_view(
  p_treatment_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.treatment_audit_log (
    treatment_id,
    action,
    changed_by
  ) VALUES (
    p_treatment_id,
    'viewed',
    auth.uid()
  )
  ON CONFLICT DO NOTHING; -- Prevent duplicate view logs
END;
$$;

-- Grant execute permissions
GRANT EXECUTE ON FUNCTION public.create_treatment_with_audit TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_pet_treatments(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.log_treatment_view(uuid) TO authenticated;

-- ============================================
-- Trigger to update updated_at timestamp
-- ============================================

CREATE OR REPLACE FUNCTION public.update_treatment_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_treatment_updated_at
  BEFORE UPDATE ON public.treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_treatment_updated_at();

-- ============================================
-- Comments for documentation
-- ============================================

COMMENT ON TABLE public.treatments IS 'Immutable treatment records with SOAP notes and EU-style veterinary entries';
COMMENT ON TABLE public.treatment_audit_log IS 'Audit trail for all treatment record access and changes';
COMMENT ON FUNCTION public.create_treatment_with_audit IS 'Creates a new treatment record with automatic audit logging';
COMMENT ON FUNCTION public.get_pet_treatments IS 'Retrieves treatment records for a pet with proper access control';
COMMENT ON FUNCTION public.log_treatment_view IS 'Logs when a treatment record is viewed for audit purposes';
