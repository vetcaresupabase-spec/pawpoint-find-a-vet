-- Migration: Comprehensive Pet Passport & Documentation System
-- Purpose: Add EU Pet Passport compliant fields and comprehensive pet health records

-- ============================================
-- Update pets table with additional fields
-- ============================================

-- Identification & Legal (EU Passport Core)
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS microchip_number TEXT,
  ADD COLUMN IF NOT EXISTS microchip_implantation_date DATE,
  ADD COLUMN IF NOT EXISTS microchip_location TEXT, -- e.g., "neck/shoulder", "other"
  ADD COLUMN IF NOT EXISTS tattoo_id TEXT,
  ADD COLUMN IF NOT EXISTS tattoo_date DATE,
  ADD COLUMN IF NOT EXISTS eu_passport_number TEXT,
  ADD COLUMN IF NOT EXISTS passport_issuing_country TEXT, -- ISO country code
  ADD COLUMN IF NOT EXISTS passport_issue_date DATE,
  ADD COLUMN IF NOT EXISTS primary_vet_clinic TEXT,
  ADD COLUMN IF NOT EXISTS primary_vet_contact TEXT; -- phone/email

-- Health & Wellness
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS species_specific_id TEXT, -- e.g., FCI/Registry number
  ADD COLUMN IF NOT EXISTS color_markings TEXT,
  ADD COLUMN IF NOT EXISTS weight_kg DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS weight_date DATE,
  ADD COLUMN IF NOT EXISTS height_withers_cm DECIMAL(5,2),
  ADD COLUMN IF NOT EXISTS known_conditions TEXT[], -- array of condition names
  ADD COLUMN IF NOT EXISTS conditions_notes TEXT,
  ADD COLUMN IF NOT EXISTS allergies TEXT[], -- array of allergens
  ADD COLUMN IF NOT EXISTS current_medications JSONB, -- [{"name": "...", "dose": "...", "schedule": "..."}]
  ADD COLUMN IF NOT EXISTS past_surgeries JSONB, -- [{"name": "...", "date": "...", "notes": "..."}]
  ADD COLUMN IF NOT EXISTS diet_brand TEXT,
  ADD COLUMN IF NOT EXISTS diet_type TEXT,
  ADD COLUMN IF NOT EXISTS feeding_schedule TEXT,
  ADD COLUMN IF NOT EXISTS behavior_temperament TEXT,
  ADD COLUMN IF NOT EXISTS behavior_triggers TEXT,
  ADD COLUMN IF NOT EXISTS bite_history BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS behavior_notes TEXT;

-- Ownership & Provenance
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS acquired_from TEXT CHECK (acquired_from IN ('breeder', 'rescue', 'private', 'other')),
  ADD COLUMN IF NOT EXISTS breeder_name TEXT,
  ADD COLUMN IF NOT EXISTS breeder_country TEXT,
  ADD COLUMN IF NOT EXISTS breeder_contact TEXT,
  ADD COLUMN IF NOT EXISTS rescue_name TEXT,
  ADD COLUMN IF NOT EXISTS rescue_country TEXT,
  ADD COLUMN IF NOT EXISTS rescue_contact TEXT,
  ADD COLUMN IF NOT EXISTS acquisition_date DATE,
  ADD COLUMN IF NOT EXISTS registration_registry TEXT,
  ADD COLUMN IF NOT EXISTS registration_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_provider TEXT,
  ADD COLUMN IF NOT EXISTS insurance_policy_number TEXT,
  ADD COLUMN IF NOT EXISTS insurance_emergency_hotline TEXT;

-- Contacts & Emergencies
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS primary_vet_clinic_name TEXT,
  ADD COLUMN IF NOT EXISTS primary_vet_phone TEXT,
  ADD COLUMN IF NOT EXISTS primary_vet_address TEXT,
  ADD COLUMN IF NOT EXISTS primary_vet_email TEXT,
  ADD COLUMN IF NOT EXISTS emergency_clinic_name TEXT,
  ADD COLUMN IF NOT EXISTS emergency_clinic_phone TEXT,
  ADD COLUMN IF NOT EXISTS emergency_clinic_address TEXT,
  ADD COLUMN IF NOT EXISTS alternate_emergency_contact_name TEXT,
  ADD COLUMN IF NOT EXISTS alternate_emergency_contact_phone TEXT,
  ADD COLUMN IF NOT EXISTS microchip_registry_name TEXT,
  ADD COLUMN IF NOT EXISTS microchip_registry_id TEXT,
  ADD COLUMN IF NOT EXISTS microchip_registry_url TEXT;

-- Travel & Compliance
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS countries_visited TEXT[], -- ISO country codes
  ADD COLUMN IF NOT EXISTS intended_travel_countries TEXT[], -- ISO country codes
  ADD COLUMN IF NOT EXISTS travel_notes TEXT;

-- Privacy & Consent
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS data_processing_consent BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS consent_timestamp TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS share_with_vets JSONB, -- {clinic_id: boolean}
  ADD COLUMN IF NOT EXISTS emergency_sharing_enabled BOOLEAN DEFAULT FALSE;

-- Completeness score (computed, but we'll store it for performance)
ALTER TABLE public.pets
  ADD COLUMN IF NOT EXISTS completeness_score INTEGER DEFAULT 0; -- 0-100%

-- Add comments for documentation
COMMENT ON COLUMN public.pets.microchip_number IS 'ISO 15-digit microchip number (preferred)';
COMMENT ON COLUMN public.pets.microchip_location IS 'Location of microchip implantation';
COMMENT ON COLUMN public.pets.eu_passport_number IS 'EU Pet Passport identification number';
COMMENT ON COLUMN public.pets.passport_issuing_country IS 'ISO 3166-1 alpha-2 country code';
COMMENT ON COLUMN public.pets.completeness_score IS 'Percentage of recommended fields filled (0-100)';

-- ============================================
-- Table: pet_vaccinations
-- Purpose: Store vaccination records (rabies, core vaccines)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pet_vaccinations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  
  -- Vaccination type
  vaccine_type TEXT NOT NULL CHECK (vaccine_type IN ('rabies', 'core', 'non_core', 'rabies_titer')),
  vaccine_name TEXT NOT NULL,
  batch_lot_number TEXT,
  
  -- Dates
  vaccination_date DATE NOT NULL,
  valid_from DATE,
  expiry_date DATE,
  next_due_date DATE,
  
  -- Administration details
  administering_vet_name TEXT,
  administering_vet_clinic TEXT,
  administering_vet_contact TEXT,
  
  -- Lab details (for titer test)
  lab_name TEXT,
  lab_number TEXT,
  sample_date DATE,
  result TEXT, -- e.g., "Positive", "Negative", "0.5 IU/ml"
  
  -- Documents
  certificate_url TEXT, -- Link to uploaded certificate/scan
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pet_vaccinations_pet_id_idx ON public.pet_vaccinations(pet_id);
CREATE INDEX IF NOT EXISTS pet_vaccinations_type_idx ON public.pet_vaccinations(vaccine_type);
CREATE INDEX IF NOT EXISTS pet_vaccinations_expiry_idx ON public.pet_vaccinations(expiry_date);
CREATE INDEX IF NOT EXISTS pet_vaccinations_next_due_idx ON public.pet_vaccinations(next_due_date);

-- RLS for pet_vaccinations
ALTER TABLE public.pet_vaccinations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their pet vaccinations"
  ON public.pet_vaccinations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create vaccinations for their pets"
  ON public.pet_vaccinations FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their pet vaccinations"
  ON public.pet_vaccinations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their pet vaccinations"
  ON public.pet_vaccinations FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_vaccinations.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

-- ============================================
-- Table: pet_parasite_treatments
-- Purpose: Store flea/tick/heartworm/deworming treatments
-- ============================================
CREATE TABLE IF NOT EXISTS public.pet_parasite_treatments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  
  -- Treatment type
  treatment_type TEXT NOT NULL CHECK (treatment_type IN ('flea_tick', 'heartworm', 'deworming', 'tapeworm')),
  product_name TEXT NOT NULL,
  
  -- Dates
  treatment_date DATE NOT NULL,
  next_due_date DATE,
  validity_window_days INTEGER, -- For travel compliance
  
  -- Administration
  administering_vet_name TEXT,
  administering_vet_clinic TEXT,
  
  -- Metadata
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pet_parasite_treatments_pet_id_idx ON public.pet_parasite_treatments(pet_id);
CREATE INDEX IF NOT EXISTS pet_parasite_treatments_type_idx ON public.pet_parasite_treatments(treatment_type);
CREATE INDEX IF NOT EXISTS pet_parasite_treatments_next_due_idx ON public.pet_parasite_treatments(next_due_date);

-- RLS for pet_parasite_treatments
ALTER TABLE public.pet_parasite_treatments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their pet treatments"
  ON public.pet_parasite_treatments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_parasite_treatments.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create treatments for their pets"
  ON public.pet_parasite_treatments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_parasite_treatments.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their pet treatments"
  ON public.pet_parasite_treatments FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_parasite_treatments.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their pet treatments"
  ON public.pet_parasite_treatments FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_parasite_treatments.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

-- ============================================
-- Table: pet_documents
-- Purpose: Store uploaded documents (passports, certificates, etc.)
-- ============================================
CREATE TABLE IF NOT EXISTS public.pet_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pet_id UUID NOT NULL REFERENCES public.pets(id) ON DELETE CASCADE,
  
  -- Document metadata
  document_type TEXT NOT NULL CHECK (document_type IN (
    'passport_scan', 'vaccination_card', 'prescription', 'passport_page',
    'certificate', 'invoice', 'lab_report', 'vet_letter', 'registration_paper', 'other'
  )),
  document_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT, -- MIME type
  file_size_bytes BIGINT,
  
  -- Related records (optional)
  related_vaccination_id UUID REFERENCES public.pet_vaccinations(id) ON DELETE SET NULL,
  related_treatment_id UUID REFERENCES public.pet_parasite_treatments(id) ON DELETE SET NULL,
  
  -- Metadata
  description TEXT,
  uploaded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS pet_documents_pet_id_idx ON public.pet_documents(pet_id);
CREATE INDEX IF NOT EXISTS pet_documents_type_idx ON public.pet_documents(document_type);

-- RLS for pet_documents
ALTER TABLE public.pet_documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their pet documents"
  ON public.pet_documents FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_documents.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents for their pets"
  ON public.pet_documents FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_documents.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their pet documents"
  ON public.pet_documents FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_documents.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their pet documents"
  ON public.pet_documents FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.pets
      WHERE pets.id = pet_documents.pet_id
      AND pets.owner_id = auth.uid()
    )
  );

-- ============================================
-- Function: Calculate completeness score
-- Purpose: Compute % of recommended fields filled
-- ============================================
CREATE OR REPLACE FUNCTION public.calculate_pet_completeness(pet_record public.pets)
RETURNS INTEGER
LANGUAGE plpgsql
AS $$
DECLARE
  score INTEGER := 0;
  total_fields INTEGER := 0;
BEGIN
  -- Count mandatory fields (always 100% if filled)
  IF pet_record.owner_name IS NOT NULL AND pet_record.owner_name != '' THEN
    score := score + 10;
  END IF;
  total_fields := total_fields + 10;
  
  IF pet_record.pet_type IS NOT NULL AND pet_record.pet_type != '' THEN
    score := score + 10;
  END IF;
  total_fields := total_fields + 10;
  
  IF pet_record.breed IS NOT NULL AND pet_record.breed != '' THEN
    score := score + 10;
  END IF;
  total_fields := total_fields + 10;
  
  -- Recommended fields (30 points total)
  IF pet_record.name IS NOT NULL AND pet_record.name != '' THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  IF pet_record.date_of_birth IS NOT NULL THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  -- EU Passport fields (20 points)
  IF pet_record.microchip_number IS NOT NULL AND pet_record.microchip_number != '' THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  IF pet_record.eu_passport_number IS NOT NULL AND pet_record.eu_passport_number != '' THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  IF pet_record.passport_issuing_country IS NOT NULL AND pet_record.passport_issuing_country != '' THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  IF pet_record.passport_issue_date IS NOT NULL THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  -- Health fields (20 points)
  IF pet_record.weight_kg IS NOT NULL THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  IF pet_record.color_markings IS NOT NULL AND pet_record.color_markings != '' THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  IF pet_record.sex IS NOT NULL AND pet_record.sex != 'Unknown' THEN
    score := score + 3;
  END IF;
  total_fields := total_fields + 3;
  
  IF pet_record.neutered_spayed IS NOT NULL AND pet_record.neutered_spayed != 'Unknown' THEN
    score := score + 2;
  END IF;
  total_fields := total_fields + 2;
  
  -- Contacts (10 points)
  IF pet_record.primary_vet_clinic_name IS NOT NULL AND pet_record.primary_vet_clinic_name != '' THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  IF pet_record.emergency_clinic_name IS NOT NULL AND pet_record.emergency_clinic_name != '' THEN
    score := score + 5;
  END IF;
  total_fields := total_fields + 5;
  
  -- Photo (10 points)
  IF pet_record.photo_url IS NOT NULL AND pet_record.photo_url != '' THEN
    score := score + 10;
  END IF;
  total_fields := total_fields + 10;
  
  RETURN (score * 100) / GREATEST(total_fields, 1);
END;
$$;

-- ============================================
-- Trigger: Auto-update completeness score
-- ============================================
CREATE OR REPLACE FUNCTION public.update_pet_completeness()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.completeness_score := public.calculate_pet_completeness(NEW);
  RETURN NEW;
END;
$$;

CREATE TRIGGER update_pet_completeness_trigger
  BEFORE INSERT OR UPDATE ON public.pets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_pet_completeness();

-- Add updated_at trigger for related tables
CREATE TRIGGER update_pet_vaccinations_updated_at
  BEFORE UPDATE ON public.pet_vaccinations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_pet_parasite_treatments_updated_at
  BEFORE UPDATE ON public.pet_parasite_treatments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

