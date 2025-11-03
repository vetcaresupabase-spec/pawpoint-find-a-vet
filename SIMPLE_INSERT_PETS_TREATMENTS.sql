-- ============================================
-- SIMPLE VERSION: Insert Pets and Treatments
-- Focuses on fixing the vet_id NULL issue
-- ============================================

DO $$
DECLARE
  v_lalit_id uuid;
  v_jaidev_id uuid;
  v_mirea_id uuid;
  v_clinic_id uuid;
  v_vet_id uuid;
  v_pet1_id uuid;
  v_pet2_id uuid;
  v_pet3_id uuid;
BEGIN
  -- Step 1: Get user IDs and verify they exist
  SELECT id INTO v_lalit_id FROM auth.users WHERE email = 'lalit@petowner.com';
  SELECT id INTO v_jaidev_id FROM auth.users WHERE email = 'jaidev@petowner.com';
  SELECT id INTO v_mirea_id FROM auth.users WHERE email = 'mirea@petowner.com';
  
  IF v_lalit_id IS NULL OR v_jaidev_id IS NULL OR v_mirea_id IS NULL THEN
    RAISE EXCEPTION 'One or more users not found. Please create all three users first.';
  END IF;
  
  RAISE NOTICE 'Found users: Lalit=%, Jaidev=%, Mirea=%', v_lalit_id, v_jaidev_id, v_mirea_id;

  -- Step 2: Get or create clinic and ensure we have a valid vet
  SELECT id, owner_id INTO v_clinic_id, v_vet_id FROM clinics LIMIT 1;
  
  IF v_clinic_id IS NULL OR v_vet_id IS NULL THEN
    -- No clinic exists or invalid owner - create one
    RAISE NOTICE 'No valid clinic found. Creating one...';
    
    -- Use the first available user as vet (could be any of the three users)
    v_vet_id := v_lalit_id;  -- Use Lalit as the vet for simplicity
    
    INSERT INTO clinics (
      name, city, address_line1, postal_code, phone, email, owner_id, specialties
    ) VALUES (
      'VetCare Animal Clinic', 'Berlin', 'Main Street 123', '10115',
      '+49 30 12345678', 'info@vetcare-clinic.de', v_vet_id,
      ARRAY['General Practice', 'Surgery', 'Emergency Care']
    ) RETURNING id INTO v_clinic_id;
    
    RAISE NOTICE 'Created clinic: %, Owner: %', v_clinic_id, v_vet_id;
  ELSE
    RAISE NOTICE 'Using existing clinic: %, Owner: %', v_clinic_id, v_vet_id;
  END IF;
  
  -- Step 3: Verify we have valid IDs before proceeding
  IF v_clinic_id IS NULL OR v_vet_id IS NULL THEN
    RAISE EXCEPTION 'Still missing clinic_id (%) or vet_id (%) after setup', v_clinic_id, v_vet_id;
  END IF;

  -- Step 4: Insert pets (simplified - just 3 pets, one per user)
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_lalit_id, 'Lalit Kumar', 'Dog', 'Golden Retriever', 'Buddy', '2020-05-15', 'Male', 'Yes',
    '982000123456789', 85, true, true
  ) RETURNING id INTO v_pet1_id;

  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_jaidev_id, 'Jaidev Singh', 'Dog', 'German Shepherd', 'Max', '2019-08-10', 'Male', 'Yes',
    '982000555666777', 88, true, true
  ) RETURNING id INTO v_pet2_id;

  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_mirea_id, 'Mirea Popescu', 'Dog', 'French Bulldog', 'Bella', '2021-11-05', 'Female', 'Yes',
    '982000444555666', 82, true, true
  ) RETURNING id INTO v_pet3_id;

  RAISE NOTICE 'Created pets: Buddy=%, Max=%, Bella=%', v_pet1_id, v_pet2_id, v_pet3_id;

  -- Step 5: Insert treatments (with explicit verification)
  RAISE NOTICE 'Inserting treatments with vet_id: %', v_vet_id;
  
  -- Treatment 1: Buddy's checkup
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan, notes, created_by
  ) VALUES (
    v_pet1_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 months',
    'examination',
    'Routine health check - Healthy',
    'Owner reports pet is active, eating well.',
    'Physical exam: Alert and responsive. Temperature 38.5°C.',
    'Healthy adult pet. No significant findings.',
    'Continue current diet and exercise routine.',
    'Pet in excellent health.',
    v_vet_id
  );

  -- Treatment 2: Max's checkup
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan, notes, created_by
  ) VALUES (
    v_pet2_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 month',
    'examination',
    'Routine checkup - Healthy',
    'Owner reports active lifestyle, good appetite.',
    'Physical exam: Excellent condition. Weight: 37.8 kg.',
    'Healthy adult dog.',
    'Continue regular exercise.',
    'Dog in excellent health.',
    v_vet_id
  );

  -- Treatment 3: Bella's examination
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan, notes, created_by
  ) VALUES (
    v_pet3_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 week',
    'examination',
    'Routine examination',
    'Owner reports normal behavior.',
    'Physical exam: Healthy appearance.',
    'Healthy pet.',
    'Continue regular care.',
    'Pet in good health.',
    v_vet_id
  );

  RAISE NOTICE '✅ SUCCESS: All pets and treatments inserted!';
  RAISE NOTICE 'Pets: 3, Treatments: 3';
  RAISE NOTICE 'Clinic ID: %, Vet ID: %', v_clinic_id, v_vet_id;
  
END $$;

-- Verification query
SELECT 
  u.email,
  COUNT(DISTINCT p.id) as pets,
  COUNT(DISTINCT t.id) as treatments,
  STRING_AGG(DISTINCT p.name, ', ') as pet_names
FROM auth.users u
LEFT JOIN pets p ON p.owner_id = u.id
LEFT JOIN treatments t ON t.pet_id = p.id
WHERE u.email IN ('lalit@petowner.com', 'jaidev@petowner.com', 'mirea@petowner.com')
GROUP BY u.email
ORDER BY u.email;
