-- ============================================
-- COMPREHENSIVE TREATMENT SYSTEM ENHANCEMENTS
-- Phase 1, 2, 3 Database Schema
-- ============================================

-- ============================================
-- PHASE 1: Core Enhancements
-- ============================================

-- Treatment Templates Table
CREATE TABLE IF NOT EXISTS treatment_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  treatment_type TEXT NOT NULL,
  diagnosis TEXT,
  subjective TEXT,
  objective TEXT,
  assessment TEXT,
  plan TEXT,
  medications JSONB DEFAULT '[]'::jsonb,
  vital_signs JSONB,
  is_active BOOLEAN DEFAULT true,
  use_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for templates
CREATE INDEX idx_treatment_templates_clinic ON treatment_templates(clinic_id);
CREATE INDEX idx_treatment_templates_type ON treatment_templates(treatment_type);

-- Treatment Amendments (for edit tracking)
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS amended_at TIMESTAMPTZ;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS amendment_notes TEXT;
ALTER TABLE treatments ADD COLUMN IF NOT EXISTS amendment_count INT DEFAULT 0;

-- ============================================
-- PHASE 2: Advanced Features
-- ============================================

-- Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  treatment_id UUID NOT NULL REFERENCES treatments(id) ON DELETE CASCADE,
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  prescribed_by UUID NOT NULL REFERENCES auth.users(id),
  
  -- Medication details
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  quantity TEXT,
  
  -- Prescription details
  refills_allowed INT DEFAULT 0,
  refills_remaining INT DEFAULT 0,
  instructions TEXT,
  notes TEXT,
  
  -- Status tracking
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  start_date DATE DEFAULT CURRENT_DATE,
  end_date DATE,
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date >= start_date)
);

-- Indexes for prescriptions
CREATE INDEX idx_prescriptions_treatment ON prescriptions(treatment_id);
CREATE INDEX idx_prescriptions_pet ON prescriptions(pet_id);
CREATE INDEX idx_prescriptions_clinic ON prescriptions(clinic_id);
CREATE INDEX idx_prescriptions_status ON prescriptions(status);

-- Follow-up Appointments (link to treatments)
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS linked_treatment_id UUID REFERENCES treatments(id);
ALTER TABLE bookings ADD COLUMN IF NOT EXISTS is_follow_up BOOLEAN DEFAULT false;

CREATE INDEX IF NOT EXISTS idx_bookings_linked_treatment ON bookings(linked_treatment_id);

-- Medication Tracking (for pet owners)
CREATE TABLE IF NOT EXISTS pet_medications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  prescription_id UUID REFERENCES prescriptions(id) ON DELETE SET NULL,
  
  -- Medication info
  medication_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  
  -- Schedule
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  times_per_day INT DEFAULT 1,
  
  -- Tracking
  last_given_at TIMESTAMPTZ,
  next_due_at TIMESTAMPTZ,
  reminder_enabled BOOLEAN DEFAULT true,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_pet_medications_pet ON pet_medications(pet_id);
CREATE INDEX idx_pet_medications_active ON pet_medications(is_active);

-- Medication Doses Log
CREATE TABLE IF NOT EXISTS medication_doses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_medication_id UUID NOT NULL REFERENCES pet_medications(id) ON DELETE CASCADE,
  given_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  given_by TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_medication_doses_pet_med ON medication_doses(pet_medication_id);
CREATE INDEX idx_medication_doses_date ON medication_doses(given_at);

-- Vaccination Reminders
CREATE TABLE IF NOT EXISTS vaccination_reminders (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  treatment_id UUID REFERENCES treatments(id) ON DELETE SET NULL,
  
  -- Vaccination details
  vaccine_name TEXT NOT NULL,
  next_due_date DATE NOT NULL,
  reminder_sent BOOLEAN DEFAULT false,
  reminder_sent_at TIMESTAMPTZ,
  
  -- Status
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vaccination_reminders_pet ON vaccination_reminders(pet_id);
CREATE INDEX idx_vaccination_reminders_due_date ON vaccination_reminders(next_due_date);
CREATE INDEX idx_vaccination_reminders_pending ON vaccination_reminders(is_completed, next_due_date);

-- ============================================
-- PHASE 3: Premium Features
-- ============================================

-- Multi-Vet Record Sharing
CREATE TABLE IF NOT EXISTS treatment_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
  owner_id UUID NOT NULL REFERENCES auth.users(id),
  shared_with_clinic_id UUID REFERENCES clinics(id) ON DELETE CASCADE,
  shared_with_email TEXT,
  
  -- Share settings
  share_token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT true,
  
  -- Access tracking
  access_count INT DEFAULT 0,
  last_accessed_at TIMESTAMPTZ,
  
  -- Permissions
  can_view_treatments BOOLEAN DEFAULT true,
  can_view_prescriptions BOOLEAN DEFAULT true,
  can_view_documents BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT valid_expiry CHECK (expires_at IS NULL OR expires_at > created_at)
);

CREATE INDEX idx_treatment_shares_pet ON treatment_shares(pet_id);
CREATE INDEX idx_treatment_shares_token ON treatment_shares(share_token);
CREATE INDEX idx_treatment_shares_clinic ON treatment_shares(shared_with_clinic_id);

-- Share Access Log
CREATE TABLE IF NOT EXISTS treatment_share_access_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  share_id UUID NOT NULL REFERENCES treatment_shares(id) ON DELETE CASCADE,
  accessed_by TEXT,
  accessed_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address TEXT,
  user_agent TEXT
);

CREATE INDEX idx_share_access_log_share ON treatment_share_access_log(share_id);

-- ============================================
-- RLS POLICIES
-- ============================================

-- Treatment Templates RLS
ALTER TABLE treatment_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can view their clinic's templates"
  ON treatment_templates FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can create templates"
  ON treatment_templates FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can update their templates"
  ON treatment_templates FOR UPDATE
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can delete their templates"
  ON treatment_templates FOR DELETE
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Prescriptions RLS
ALTER TABLE prescriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Vets can view their clinic's prescriptions"
  ON prescriptions FOR SELECT
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Pet owners can view their prescriptions"
  ON prescriptions FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can create prescriptions"
  ON prescriptions FOR INSERT
  WITH CHECK (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can update their prescriptions"
  ON prescriptions FOR UPDATE
  USING (
    clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- Pet Medications RLS
ALTER TABLE pet_medications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can manage their pet medications"
  ON pet_medications FOR ALL
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

-- Medication Doses RLS
ALTER TABLE medication_doses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can manage medication doses"
  ON medication_doses FOR ALL
  USING (
    pet_medication_id IN (
      SELECT pm.id FROM pet_medications pm
      JOIN pets p ON p.id = pm.pet_id
      WHERE p.owner_id = auth.uid()
    )
  );

-- Vaccination Reminders RLS
ALTER TABLE vaccination_reminders ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can view their vaccination reminders"
  ON vaccination_reminders FOR SELECT
  USING (
    pet_id IN (
      SELECT id FROM pets WHERE owner_id = auth.uid()
    )
  );

CREATE POLICY "Vets can manage vaccination reminders"
  ON vaccination_reminders FOR ALL
  USING (
    pet_id IN (
      SELECT p.id FROM pets p
      JOIN treatments t ON t.pet_id = p.id
      JOIN clinics c ON c.id = t.clinic_id
      WHERE c.owner_id = auth.uid()
    )
  );

-- Treatment Shares RLS
ALTER TABLE treatment_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pet owners can manage their shares"
  ON treatment_shares FOR ALL
  USING (owner_id = auth.uid());

CREATE POLICY "Shared clinics can view shares"
  ON treatment_shares FOR SELECT
  USING (
    shared_with_clinic_id IN (
      SELECT id FROM clinics WHERE owner_id = auth.uid()
    )
  );

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update template use count
CREATE OR REPLACE FUNCTION increment_template_use_count(template_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE treatment_templates
  SET use_count = use_count + 1, updated_at = NOW()
  WHERE id = template_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create prescription from treatment
CREATE OR REPLACE FUNCTION create_prescription_from_treatment(
  p_treatment_id UUID,
  p_medication_name TEXT,
  p_dosage TEXT,
  p_frequency TEXT,
  p_duration TEXT,
  p_refills INT DEFAULT 0
)
RETURNS UUID AS $$
DECLARE
  v_prescription_id UUID;
  v_pet_id UUID;
  v_clinic_id UUID;
BEGIN
  -- Get pet and clinic from treatment
  SELECT pet_id, clinic_id INTO v_pet_id, v_clinic_id
  FROM treatments
  WHERE id = p_treatment_id;
  
  -- Create prescription
  INSERT INTO prescriptions (
    treatment_id, pet_id, clinic_id, prescribed_by,
    medication_name, dosage, frequency, duration, refills_allowed, refills_remaining
  ) VALUES (
    p_treatment_id, v_pet_id, v_clinic_id, auth.uid(),
    p_medication_name, p_dosage, p_frequency, p_duration, p_refills, p_refills
  ) RETURNING id INTO v_prescription_id;
  
  RETURN v_prescription_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to schedule follow-up appointment
CREATE OR REPLACE FUNCTION schedule_follow_up(
  p_treatment_id UUID,
  p_appointment_date DATE,
  p_start_time TIME,
  p_end_time TIME,
  p_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_booking_id UUID;
  v_pet_id UUID;
  v_clinic_id UUID;
  v_pet_name TEXT;
  v_owner_id UUID;
BEGIN
  -- Get details from treatment
  SELECT t.pet_id, t.clinic_id, p.name, p.owner_id
  INTO v_pet_id, v_clinic_id, v_pet_name, v_owner_id
  FROM treatments t
  JOIN pets p ON p.id = t.pet_id
  WHERE t.id = p_treatment_id;
  
  -- Create booking
  INSERT INTO bookings (
    clinic_id, user_id, appointment_date, start_time, end_time,
    pet_name, pet_type, service_type, status, notes,
    linked_treatment_id, is_follow_up
  ) VALUES (
    v_clinic_id, v_owner_id, p_appointment_date, p_start_time, p_end_time,
    v_pet_name, 'dog', 'Follow-up Consultation', 'pending',
    COALESCE(p_notes, 'Follow-up appointment from treatment'),
    p_treatment_id, true
  ) RETURNING id INTO v_booking_id;
  
  RETURN v_booking_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate share token
CREATE OR REPLACE FUNCTION generate_treatment_share_token()
RETURNS TEXT AS $$
BEGIN
  RETURN encode(gen_random_bytes(32), 'base64');
END;
$$ LANGUAGE plpgsql;

-- Function to create treatment share
CREATE OR REPLACE FUNCTION create_treatment_share(
  p_pet_id UUID,
  p_shared_with_email TEXT DEFAULT NULL,
  p_shared_with_clinic_id UUID DEFAULT NULL,
  p_expires_in_days INT DEFAULT 30
)
RETURNS TABLE (
  share_id UUID,
  share_token TEXT,
  expires_at TIMESTAMPTZ
) AS $$
DECLARE
  v_share_id UUID;
  v_token TEXT;
  v_expires_at TIMESTAMPTZ;
BEGIN
  v_token := generate_treatment_share_token();
  v_expires_at := NOW() + (p_expires_in_days || ' days')::INTERVAL;
  
  INSERT INTO treatment_shares (
    pet_id, owner_id, shared_with_email, shared_with_clinic_id,
    share_token, expires_at
  ) VALUES (
    p_pet_id, auth.uid(), p_shared_with_email, p_shared_with_clinic_id,
    v_token, v_expires_at
  ) RETURNING id INTO v_share_id;
  
  RETURN QUERY SELECT v_share_id, v_token, v_expires_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update treatment (with audit)
CREATE OR REPLACE FUNCTION update_treatment_with_audit(
  p_treatment_id UUID,
  p_amendment_notes TEXT,
  p_updates JSONB
)
RETURNS VOID AS $$
DECLARE
  v_old_data JSONB;
BEGIN
  -- Get old data for audit
  SELECT to_jsonb(t.*) INTO v_old_data
  FROM treatments t
  WHERE id = p_treatment_id;
  
  -- Update treatment
  UPDATE treatments
  SET
    diagnosis = COALESCE((p_updates->>'diagnosis')::TEXT, diagnosis),
    subjective = COALESCE((p_updates->>'subjective')::TEXT, subjective),
    objective = COALESCE((p_updates->>'objective')::TEXT, objective),
    assessment = COALESCE((p_updates->>'assessment')::TEXT, assessment),
    plan = COALESCE((p_updates->>'plan')::TEXT, plan),
    notes = COALESCE((p_updates->>'notes')::TEXT, notes),
    amendment_notes = p_amendment_notes,
    amended_at = NOW(),
    amendment_count = amendment_count + 1,
    updated_at = NOW()
  WHERE id = p_treatment_id;
  
  -- Log the amendment
  INSERT INTO treatment_audit_log (
    treatment_id, action, performed_by, old_data, new_data
  ) VALUES (
    p_treatment_id, 'update', auth.uid(), v_old_data, p_updates
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_treatment_templates_updated_at
  BEFORE UPDATE ON treatment_templates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
  BEFORE UPDATE ON prescriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pet_medications_updated_at
  BEFORE UPDATE ON pet_medications
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- INITIAL DATA
-- ============================================

-- Insert default treatment templates for existing clinics
INSERT INTO treatment_templates (clinic_id, created_by, name, treatment_type, diagnosis, subjective, objective, assessment, plan)
SELECT 
  c.id,
  c.owner_id,
  'Annual Vaccination',
  'vaccination',
  'Routine vaccination - healthy',
  'Owner brought pet for annual vaccination. No concerns reported.',
  'Physical examination normal. Pet in good health.',
  'Pet suitable for vaccination.',
  'Administered required vaccines. Next vaccination due in 12 months.'
FROM clinics c
ON CONFLICT DO NOTHING;

-- Success message
DO $$
BEGIN
  RAISE NOTICE '✅ Comprehensive Treatment System Enhancement Complete!';
  RAISE NOTICE '   - Treatment Templates: Ready';
  RAISE NOTICE '   - Prescriptions: Ready';
  RAISE NOTICE '   - Medication Tracking: Ready';
  RAISE NOTICE '   - Vaccination Reminders: Ready';
  RAISE NOTICE '   - Follow-up Scheduling: Ready';
  RAISE NOTICE '   - Multi-Vet Sharing: Ready';
END $$;

