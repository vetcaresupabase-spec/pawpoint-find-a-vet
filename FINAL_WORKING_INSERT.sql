-- ============================================
-- FINAL WORKING VERSION - Handles ALL edge cases
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
  v_clinic_count integer;
BEGIN
  -- ==================================================
  -- STEP 1: Get and verify users
  -- ==================================================
  SELECT id INTO v_lalit_id FROM auth.users WHERE email = 'lalit@petowner.com';
  SELECT id INTO v_jaidev_id FROM auth.users WHERE email = 'jaidev@petowner.com';
  SELECT id INTO v_mirea_id FROM auth.users WHERE email = 'mirea@petowner.com';
  
  IF v_lalit_id IS NULL OR v_jaidev_id IS NULL OR v_mirea_id IS NULL THEN
    RAISE EXCEPTION 'Users not found. Create users first.';
  END IF;
  
  RAISE NOTICE '✅ Found all 3 users';

  -- ==================================================
  -- STEP 2: Fix clinic owner_id issue
  -- ==================================================
  SELECT COUNT(*) INTO v_clinic_count FROM clinics;
  
  IF v_clinic_count > 0 THEN
    -- Clinic exists - check if owner_id is valid
    SELECT id, owner_id INTO v_clinic_id, v_vet_id FROM clinics LIMIT 1;
    
    IF v_vet_id IS NULL THEN
      -- Clinic exists but owner_id is NULL - FIX IT
      RAISE NOTICE 'Found clinic with NULL owner_id. Fixing...';
      
      -- Update the clinic to have a valid owner
      UPDATE clinics 
      SET owner_id = v_lalit_id 
      WHERE id = v_clinic_id
      RETURNING owner_id INTO v_vet_id;
      
      RAISE NOTICE '✅ Fixed clinic owner_id: %', v_vet_id;
    ELSE
      RAISE NOTICE '✅ Using existing clinic with valid owner: %', v_vet_id;
    END IF;
  ELSE
    -- No clinic exists - create one
    RAISE NOTICE 'Creating new clinic...';
    v_vet_id := v_lalit_id;
    
    INSERT INTO clinics (
      name, city, address_line1, postal_code, phone, email, owner_id, specialties
    ) VALUES (
      'VetCare Animal Clinic', 'Berlin', 'Main Street 123', '10115',
      '+49 30 12345678', 'info@vetcare-clinic.de', v_vet_id,
      ARRAY['General Practice']
    ) RETURNING id INTO v_clinic_id;
    
    RAISE NOTICE '✅ Created new clinic: %', v_clinic_id;
  END IF;
  
  -- Final verification
  IF v_clinic_id IS NULL OR v_vet_id IS NULL THEN
    RAISE EXCEPTION 'Still NULL after setup. clinic_id=%, vet_id=%', v_clinic_id, v_vet_id;
  END IF;

  -- ==================================================
  -- STEP 3: Insert pets
  -- ==================================================
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, microchip_number
  ) VALUES (
    v_lalit_id, 'Lalit Kumar', 'Dog', 'Golden Retriever', 'Buddy', '2020-05-15', 'Male', 'Yes', '982000123456789'
  ) RETURNING id INTO v_pet1_id;

  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, microchip_number
  ) VALUES (
    v_jaidev_id, 'Jaidev Singh', 'Dog', 'German Shepherd', 'Max', '2019-08-10', 'Male', 'Yes', '982000555666777'
  ) RETURNING id INTO v_pet2_id;

  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, microchip_number
  ) VALUES (
    v_mirea_id, 'Mirea Popescu', 'Dog', 'French Bulldog', 'Bella', '2021-11-05', 'Female', 'Yes', '982000444555666'
  ) RETURNING id INTO v_pet3_id;

  RAISE NOTICE '✅ Created 3 pets';

  -- ==================================================
  -- STEP 4: Insert treatments with verified vet_id
  -- ==================================================
  -- Treatment 1
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan, notes, created_by
  ) VALUES (
    v_pet1_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 months', 'examination', 'Routine checkup - Healthy',
    'Owner reports pet is active and healthy.', 'Physical exam normal. Temperature 38.5°C.',
    'Healthy pet.', 'Continue current care.', 'Pet in excellent health.', v_vet_id
  );

  -- Treatment 2
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan, notes, created_by
  ) VALUES (
    v_pet2_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 month', 'examination', 'Routine checkup',
    'Active dog, good appetite.', 'Excellent condition. Weight 37.8 kg.',
    'Healthy dog.', 'Continue exercise.', 'Dog in great health.', v_vet_id
  );

  -- Treatment 3
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan, notes, created_by
  ) VALUES (
    v_pet3_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 week', 'examination', 'Routine examination',
    'Normal behavior reported.', 'Healthy appearance.',
    'Healthy pet.', 'Continue regular care.', 'Pet doing well.', v_vet_id
  );

  RAISE NOTICE '✅ Created 3 treatments';
  RAISE NOTICE '';
  RAISE NOTICE '========================================';
  RAISE NOTICE '✅✅✅ SUCCESS! ✅✅✅';
  RAISE NOTICE '========================================';
  RAISE NOTICE 'Pets: 3 (Buddy, Max, Bella)';
  RAISE NOTICE 'Treatments: 3 (1 per pet)';
  RAISE NOTICE 'Clinic: %', v_clinic_id;
  RAISE NOTICE 'Vet: %', v_vet_id;
  RAISE NOTICE '========================================';
  
END $$;

-- Verification
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
