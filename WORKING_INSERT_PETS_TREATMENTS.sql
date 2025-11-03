-- ============================================
-- WORKING VERSION: Insert Pets and Treatments
-- Handles all type conversions correctly
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
  v_pet4_id uuid;
  v_pet5_id uuid;
  v_pet6_id uuid;
  rec RECORD;
BEGIN
  -- Debug: Show available users
  RAISE NOTICE 'Available users in database:';
  FOR rec IN SELECT id, email, raw_user_meta_data->>'role' as role FROM auth.users LOOP
    RAISE NOTICE '  User: % (%) - Role: %', rec.email, rec.id, COALESCE(rec.role, 'none');
  END LOOP;
  
  -- Get user IDs
  SELECT id INTO v_lalit_id FROM auth.users WHERE email = 'lalit@petowner.com';
  SELECT id INTO v_jaidev_id FROM auth.users WHERE email = 'jaidev@petowner.com';
  SELECT id INTO v_mirea_id FROM auth.users WHERE email = 'mirea@petowner.com';
  
  -- Verify users exist
  IF v_lalit_id IS NULL THEN
    RAISE EXCEPTION 'User lalit@petowner.com not found';
  END IF;
  IF v_jaidev_id IS NULL THEN
    RAISE EXCEPTION 'User jaidev@petowner.com not found';
  END IF;
  IF v_mirea_id IS NULL THEN
    RAISE EXCEPTION 'User mirea@petowner.com not found';
  END IF;
  
  -- Get or create clinic
  SELECT id, owner_id INTO v_clinic_id, v_vet_id FROM clinics LIMIT 1;
  
  IF v_clinic_id IS NULL THEN
    -- Create clinic - get a user to be the vet
    SELECT id INTO v_vet_id FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'vet' 
    LIMIT 1;
    
    -- If no vet user, use any user
    IF v_vet_id IS NULL THEN
      SELECT id INTO v_vet_id FROM auth.users LIMIT 1;
    END IF;
    
    -- Verify we have a valid vet_id
    IF v_vet_id IS NULL THEN
      RAISE EXCEPTION 'No users found in database. Cannot create clinic without a user.';
    END IF;
    
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
  
  -- Final verification before proceeding with treatments
  IF v_clinic_id IS NULL OR v_vet_id IS NULL THEN
    RAISE EXCEPTION 'Failed to get valid clinic_id (%) or vet_id (%). Cannot proceed with treatments.', v_clinic_id, v_vet_id;
  END IF;
  
  RAISE NOTICE 'Proceeding with clinic_id: %, vet_id: %', v_clinic_id, v_vet_id;

  -- ============================================
  -- INSERT PETS
  -- ============================================
  
  -- Pet 1: Buddy (Lalit's Golden Retriever)
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, color_markings, weight_kg, known_conditions, allergies,
    completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_lalit_id, 'Lalit Kumar', 'Dog', 'Golden Retriever', 'Buddy', '2020-05-15', 'Male', 'Yes',
    '982000123456789', 'Golden with white chest', 28.5, 
    ARRAY['Hip Dysplasia', 'Seasonal Allergies'], ARRAY['Pollen', 'Dust'],
    85, true, true
  ) RETURNING id INTO v_pet1_id;

  -- Pet 2: Luna (Lalit's Persian Cat)
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, color_markings, weight_kg, known_conditions, allergies,
    completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_lalit_id, 'Lalit Kumar', 'Cat', 'Persian', 'Luna', '2021-03-20', 'Female', 'Yes',
    '982000987654321', 'White with cream markings', 4.2,
    ARRAY['Respiratory Issues'], ARRAY['Certain cleaning products'],
    72, true, true
  ) RETURNING id INTO v_pet2_id;

  -- Pet 3: Max (Jaidev's German Shepherd)
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, color_markings, weight_kg, known_conditions, allergies,
    completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_jaidev_id, 'Jaidev Singh', 'Dog', 'German Shepherd', 'Max', '2019-08-10', 'Male', 'Yes',
    '982000555666777', 'Black and tan', 38.0,
    ARRAY['Hip Dysplasia (mild)'], ARRAY['Chicken'],
    88, true, true
  ) RETURNING id INTO v_pet3_id;

  -- Pet 4: Charlie (Jaidev's British Shorthair)
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, color_markings, weight_kg,
    completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_jaidev_id, 'Jaidev Singh', 'Cat', 'British Shorthair', 'Charlie', '2022-01-15', 'Male', 'Yes',
    '982000111222333', 'Blue-gray', 5.8,
    68, true, true
  ) RETURNING id INTO v_pet4_id;

  -- Pet 5: Bella (Mirea's French Bulldog)
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, color_markings, weight_kg, known_conditions, allergies,
    completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_mirea_id, 'Mirea Popescu', 'Dog', 'French Bulldog', 'Bella', '2021-11-05', 'Female', 'Yes',
    '982000444555666', 'Brindle with white markings', 11.5,
    ARRAY['Brachycephalic Syndrome', 'Skin Allergies'], ARRAY['Wheat', 'Beef'],
    82, true, true
  ) RETURNING id INTO v_pet5_id;

  -- Pet 6: Shadow (Mirea's Maine Coon)
  INSERT INTO pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed,
    microchip_number, color_markings, weight_kg, known_conditions, allergies,
    completeness_score, data_processing_consent, emergency_sharing_enabled
  ) VALUES (
    v_mirea_id, 'Mirea Popescu', 'Cat', 'Maine Coon', 'Shadow', '2020-09-12', 'Male', 'Yes',
    '982000777888999', 'Black with white chest', 7.8,
    ARRAY['Hip Dysplasia (monitoring)'], ARRAY['Fish'],
    75, true, true
  ) RETURNING id INTO v_pet6_id;

  -- ============================================
  -- INSERT TREATMENTS (with proper JSONB casting)
  -- ============================================

  -- Treatment 1: Buddy's Routine Checkup (2 months ago)
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vital_signs, notes, created_by
  ) VALUES (
    v_pet1_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 months',
    'examination',
    'Routine health check - Healthy',
    'Owner reports pet is active, eating well, normal behavior. No concerns.',
    'Physical exam: Alert and responsive. Temperature 38.5°C, Heart rate 120 bpm, Weight: 28.5 kg.',
    'Healthy adult pet. No significant findings on examination.',
    'Continue current diet and exercise routine. Next checkup in 6 months.',
    '{"temperature": "38.5", "heart_rate": "120", "weight_kg": "28.5"}'::jsonb,
    'Pet in excellent health. Owner advised on maintaining healthy weight.',
    v_vet_id
  );

  -- Treatment 2: Buddy's Vaccination (1 month ago)
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vaccine_type, vaccine_batch_number, vaccine_manufacturer,
    vital_signs, certificates, notes, created_by
  ) VALUES (
    v_pet1_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 month',
    'vaccination',
    'Annual vaccination',
    'Pet presented for annual DHPPi and Rabies vaccination.',
    'Physical exam: Healthy appearance. Temperature 38.3°C. Weight: 28.7 kg.',
    'Healthy pet suitable for vaccination.',
    'Administered DHPPi and Rabies vaccines. Next vaccination due in 12 months.',
    'DHPPi + Rabies', 'VAC-2024-001234', 'Zoetis',
    '{"temperature": "38.3", "weight_kg": "28.7"}'::jsonb,
    '[{"type": "EU Pet Passport - Vaccination Record", "number": "PP-2024-5678"}]'::jsonb,
    'Vaccination completed successfully. No adverse reactions observed.',
    v_vet_id
  );

  -- Treatment 3: Max's Routine Checkup (3 months ago)
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vital_signs, notes, created_by
  ) VALUES (
    v_pet3_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '3 months',
    'examination',
    'Routine checkup - Healthy',
    'Owner reports active lifestyle, good appetite.',
    'Physical exam: Excellent condition. Temperature 38.2°C, Weight: 37.8 kg.',
    'Healthy adult dog. Mild hip dysplasia observed (stable).',
    'Continue regular exercise with joint supplements.',
    '{"temperature": "38.2", "weight_kg": "37.8"}'::jsonb,
    'Dog is handling mild hip dysplasia well.',
    v_vet_id
  );

  -- Treatment 4: Max's Deworming (2 months ago)
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    deworming_product, deworming_dose,
    medications, notes, created_by
  ) VALUES (
    v_pet3_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 months',
    'deworming',
    'Routine deworming',
    'Drontal Plus', '1 tablet (based on weight: 37.5 kg)',
    '[{"name": "Drontal Plus", "dosage": "1 tablet", "frequency": "Single dose"}]'::jsonb,
    'Deworming treatment completed successfully.',
    v_vet_id
  );

  -- Treatment 5: Bella's Antiparasitic (2 weeks ago)
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    antiparasitic_product, antiparasitic_type, antiparasitic_dose,
    notes, created_by
  ) VALUES (
    v_pet5_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 weeks',
    'antiparasitic',
    'Flea and tick prevention',
    'Frontline Plus', 'combination', '1 pipette (small-medium dog)',
    'Applied topical treatment. Owner instructed to avoid bathing for 48 hours.',
    v_vet_id
  );

  -- Treatment 6: Bella's Skin Examination (1 week ago)
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vital_signs, medications, diagnostic_tests, notes, created_by
  ) VALUES (
    v_pet5_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 week',
    'examination',
    'Mild skin irritation',
    'Owner reports pet scratching, particularly after meals.',
    'Physical exam: Slight redness on abdomen. Temperature 38.6°C.',
    'Mild skin irritation, likely food allergy related.',
    'Prescribed medicated shampoo and antihistamine.',
    '{"temperature": "38.6", "weight_kg": "11.4"}'::jsonb,
    '[{"name": "Antihistamine", "dosage": "1/2 tablet daily", "frequency": "Once daily"}]'::jsonb,
    '[{"test_type": "Skin Cytology", "results": "Yeast cells present (mild)"}]'::jsonb,
    'Owner demonstrated proper shampoo application.',
    v_vet_id
  );

  -- Treatment 7: Shadow's Vaccination (1 month ago)
  INSERT INTO treatments (
    pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    vaccine_type, vaccine_batch_number, vaccine_manufacturer,
    vital_signs, certificates, notes, created_by
  ) VALUES (
    v_pet6_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 month',
    'vaccination',
    'Annual vaccination',
    'FVRCP + Rabies', 'VAC-2024-002345', 'Merial',
    '{"temperature": "38.4", "weight_kg": "7.6"}'::jsonb,
    '[{"type": "EU Pet Passport - Vaccination Record", "number": "PP-2024-6789"}]'::jsonb,
    'Vaccination completed successfully. Large breed cat in excellent health.',
    v_vet_id
  );

  -- Create audit log entries
  INSERT INTO treatment_audit_log (treatment_id, action, changed_by)
  SELECT id, 'created', v_vet_id
  FROM treatments
  WHERE pet_id IN (v_pet1_id, v_pet2_id, v_pet3_id, v_pet4_id, v_pet5_id, v_pet6_id);

  RAISE NOTICE '✅ SUCCESS: All pets and treatments inserted!';
  RAISE NOTICE 'Pets created: 6 (2 for each user)';
  RAISE NOTICE 'Treatments created: 7 (across all pets)';
  RAISE NOTICE 'Lalit pets: Buddy (%), Luna (%)', v_pet1_id, v_pet2_id;
  RAISE NOTICE 'Jaidev pets: Max (%), Charlie (%)', v_pet3_id, v_pet4_id;
  RAISE NOTICE 'Mirea pets: Bella (%), Shadow (%)', v_pet5_id, v_pet6_id;
  
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
