-- ============================================
-- STEP 1: Create Clinic (if none exists)
-- ============================================
-- This script creates a sample clinic with a vet user
-- Run this BEFORE running INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql
-- ============================================

-- First, check if any clinics exist
DO $$
DECLARE
  v_clinic_count integer;
  v_vet_id uuid;
  v_clinic_id uuid;
BEGIN
  -- Check if clinics exist
  SELECT COUNT(*) INTO v_clinic_count FROM clinics;
  
  IF v_clinic_count = 0 THEN
    RAISE NOTICE 'No clinics found. Creating a sample clinic...';
    
    -- Get any user with vet role, or create one if needed
    -- First try to find a vet user
    SELECT id INTO v_vet_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'vet' 
    LIMIT 1;
    
    -- If no vet exists, use any authenticated user (we'll update role later)
    IF v_vet_id IS NULL THEN
      SELECT id INTO v_vet_id FROM auth.users LIMIT 1;
      
      IF v_vet_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users. Please create at least one user first.';
      END IF;
      
      RAISE NOTICE 'No vet user found. Using user % as clinic owner. You may need to update their role to "vet" later.', v_vet_id;
    END IF;
    
    -- Create a sample clinic
    INSERT INTO clinics (
      name,
      city,
      address_line1,
      address_line2,
      postal_code,
      phone,
      email,
      website,
      owner_id,
      specialties,
      description,
      latitude,
      longitude
    ) VALUES (
      'VetCare Animal Clinic',
      'Berlin',
      'Main Street 123',
      NULL,
      '10115',
      '+49 30 12345678',
      'info@vetcare-clinic.de',
      'https://vetcare-clinic.de',
      v_vet_id,
      ARRAY['General Practice', 'Surgery', 'Emergency Care'],
      'Full-service veterinary clinic providing comprehensive care for pets.',
      52.5200,  -- Berlin latitude
      13.4050   -- Berlin longitude
    ) RETURNING id INTO v_clinic_id;
    
    RAISE NOTICE '✅ Clinic created successfully!';
    RAISE NOTICE 'Clinic ID: %', v_clinic_id;
    RAISE NOTICE 'Owner (Vet) ID: %', v_vet_id;
    RAISE NOTICE '';
    RAISE NOTICE 'Next step: Run INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql';
    
  ELSE
    RAISE NOTICE '✅ Clinics already exist (% clinics found).', v_clinic_count;
    RAISE NOTICE 'You can proceed to run INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql';
    
    -- Show existing clinics
    SELECT id, name, owner_id INTO v_clinic_id, v_vet_id
    FROM clinics
    LIMIT 1;
    
    RAISE NOTICE 'Using clinic: % (ID: %)', v_clinic_id, v_clinic_id;
    RAISE NOTICE 'Vet/Owner ID: %', v_vet_id;
  END IF;
  
END $$;

-- Verification query
SELECT 
  id,
  name,
  city,
  email,
  owner_id,
  (SELECT email FROM auth.users WHERE id = clinics.owner_id) as owner_email
FROM clinics
ORDER BY created_at DESC
LIMIT 5;

