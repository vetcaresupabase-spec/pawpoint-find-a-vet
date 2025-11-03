-- ============================================
-- Complete Pet Profiles + Historical Treatment Records
-- For: lalit@petowner.com, jaidev@petowner.com, mirea@petowner.com
-- ============================================
-- This script will:
-- 1. Get user IDs for the three pet owners
-- 2. Insert comprehensive pet profiles for each user
-- 3. Insert historical treatment records for each pet
-- ============================================

-- First, get the user IDs (assuming users already exist)
-- If users don't exist, you'll need to create them first via auth.users

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
BEGIN
  -- Get user IDs
  SELECT id INTO v_lalit_id FROM auth.users WHERE email = 'lalit@petowner.com' LIMIT 1;
  SELECT id INTO v_jaidev_id FROM auth.users WHERE email = 'jaidev@petowner.com' LIMIT 1;
  SELECT id INTO v_mirea_id FROM auth.users WHERE email = 'mirea@petowner.com' LIMIT 1;
  
  -- Verify users exist
  IF v_lalit_id IS NULL THEN
    RAISE EXCEPTION 'User lalit@petowner.com not found. Please create user first.';
  END IF;
  
  IF v_jaidev_id IS NULL THEN
    RAISE EXCEPTION 'User jaidev@petowner.com not found. Please create user first.';
  END IF;
  
  IF v_mirea_id IS NULL THEN
    RAISE EXCEPTION 'User mirea@petowner.com not found. Please create user first.';
  END IF;
  
  -- Get or create clinic and vet for treatments
  SELECT clinics.id, clinics.owner_id 
  INTO v_clinic_id, v_vet_id 
  FROM clinics 
  LIMIT 1;
  
  -- If no clinic exists, create one automatically
  IF v_clinic_id IS NULL OR v_vet_id IS NULL THEN
    RAISE NOTICE 'No clinic found. Creating a sample clinic...';
    
    -- Try to find a vet user first
    SELECT id INTO v_vet_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'vet' 
    LIMIT 1;
    
    -- If no vet exists, use any authenticated user
    IF v_vet_id IS NULL THEN
      SELECT id INTO v_vet_id FROM auth.users LIMIT 1;
      
      IF v_vet_id IS NULL THEN
        RAISE EXCEPTION 'No users found in auth.users. Please create at least one user first.';
      END IF;
      
      RAISE NOTICE 'Using user % as clinic owner (consider updating their role to "vet")', v_vet_id;
    END IF;
    
    -- Create a sample clinic
    -- Verify v_vet_id is valid UUID before inserting
    IF v_vet_id IS NULL OR v_vet_id::text = '' THEN
      RAISE EXCEPTION 'Invalid vet_id. Cannot create clinic without valid owner.';
    END IF;
    
    INSERT INTO clinics (
      name,
      city,
      address_line1,
      postal_code,
      phone,
      email,
      owner_id,
      specialties,
      description
    ) VALUES (
      'VetCare Animal Clinic',
      'Berlin',
      'Main Street 123',
      '10115',
      '+49 30 12345678',
      'info@vetcare-clinic.de',
      v_vet_id::uuid,  -- Explicitly cast to UUID
      ARRAY['General Practice', 'Surgery', 'Emergency Care'],
      'Full-service veterinary clinic providing comprehensive care for pets.'
    ) RETURNING id INTO v_clinic_id;
    
    RAISE NOTICE '✅ Clinic created successfully! ID: %, Owner ID: %', v_clinic_id, v_vet_id;
  ELSE
    RAISE NOTICE '✅ Using existing clinic: %, Owner ID: %', v_clinic_id, v_vet_id;
  END IF;

  -- ============================================
  -- LALIT'S PETS
  -- ============================================
  
  -- PET 1: Golden Retriever - Buddy
  INSERT INTO public.pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
    microchip_number, microchip_implantation_date, microchip_location,
    eu_passport_number, passport_issuing_country, passport_issue_date,
    primary_vet_clinic, primary_vet_contact,
    color_markings, weight_kg, weight_date, height_withers_cm,
    known_conditions, allergies,
    diet_brand, diet_type, feeding_schedule,
    behavior_temperament, behavior_triggers,
    acquired_from, breeder_name, breeder_country, breeder_contact, acquisition_date,
    registration_registry, registration_number,
    insurance_provider, insurance_policy_number, insurance_emergency_hotline,
    primary_vet_clinic_name, primary_vet_phone, primary_vet_address, primary_vet_email,
    emergency_clinic_name, emergency_clinic_phone, emergency_clinic_address,
    microchip_registry_name, microchip_registry_id, microchip_registry_url,
    countries_visited, travel_notes,
    data_processing_consent, consent_timestamp, emergency_sharing_enabled,
    photo_url, completeness_score
  ) VALUES (
    v_lalit_id,
    'Lalit Kumar', 'Dog', 'Golden Retriever', 'Buddy', '2020-05-15', 'Male', 'Yes',
    'Very friendly and energetic dog. Loves playing fetch and swimming.',
    '982000123456789', '2020-06-10', 'neck/shoulder',
    'DE-12345-2020', 'DE', '2020-06-15',
    'Happy Paws Berlin', '+49 30 11111111',
    'Golden, white chest marking', 28.5, '2024-10-15', 58.0,
    ARRAY['Hip Dysplasia', 'Seasonal Allergies'], ARRAY['Pollen', 'Dust'],
    'Royal Canin', 'Dry', 'Twice daily: 7am (2 cups), 6pm (2 cups)',
    'Very friendly, energetic, loves people and other dogs', 'Loud noises, fireworks',
    'breeder', 'Golden Dreams Kennel', 'DE', '+49 30 99999999', '2020-06-01',
    'VDH', 'VDH-2020-GR-001234',
    'PetCare Insurance', 'PCI-2020-123456', '+49 800 1234567',
    'Happy Paws Berlin', '+49 30 11111111', 'Alexanderplatz 1, 10178 Berlin', 'info@happypaws.de',
    'Berlin Animal Emergency', '+49 30 88888888', 'Friedrichstraße 100, 10117 Berlin',
    'Tasso', 'TS-2020-001234', 'https://www.tasso.net',
    ARRAY['DE', 'FR', 'IT', 'ES'], 'Requires large crate (size 4). Prefers window seat.',
    true, NOW(), true,
    NULL, 85
  ) RETURNING id INTO v_pet1_id;
  
  -- PET 2: Persian Cat - Luna
  INSERT INTO public.pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
    microchip_number, microchip_implantation_date,
    eu_passport_number, passport_issuing_country, passport_issue_date,
    color_markings, weight_kg, weight_date,
    known_conditions, allergies,
    diet_brand, diet_type, feeding_schedule,
    behavior_temperament,
    acquired_from, rescue_name, rescue_country, acquisition_date,
    insurance_provider, insurance_policy_number,
    primary_vet_clinic_name, primary_vet_phone,
    emergency_clinic_name, emergency_clinic_phone,
    data_processing_consent, consent_timestamp, emergency_sharing_enabled,
    completeness_score
  ) VALUES (
    v_lalit_id,
    'Lalit Kumar', 'Cat', 'Persian', 'Luna', '2021-03-20', 'Female', 'Yes',
    'Calm and gentle cat. Enjoys quiet spaces and window watching.',
    '982000987654321', '2021-04-05',
    'DE-67890-2021', 'DE', '2021-04-10',
    'White with cream markings', 4.2, '2024-10-20',
    ARRAY['Respiratory Issues'], ARRAY['Certain cleaning products'],
    'Hill''s Science Diet', 'Wet + Dry', '3 times daily: small portions',
    'Calm, gentle, prefers quiet environments',
    'rescue', 'Berlin Cat Rescue', 'DE', '2021-05-01',
    'PetCare Insurance', 'PCI-2021-789012',
    'Happy Paws Berlin', '+49 30 11111111',
    'Berlin Animal Emergency', '+49 30 88888888',
    true, NOW(), true,
    72
  ) RETURNING id INTO v_pet2_id;

  -- ============================================
  -- JAIDEV'S PETS
  -- ============================================
  
  -- PET 3: German Shepherd - Max
  INSERT INTO public.pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
    microchip_number, microchip_implantation_date, microchip_location,
    eu_passport_number, passport_issuing_country, passport_issue_date,
    primary_vet_clinic, primary_vet_contact,
    color_markings, weight_kg, weight_date, height_withers_cm,
    known_conditions, allergies,
    diet_brand, diet_type, feeding_schedule,
    behavior_temperament, behavior_triggers,
    acquired_from, breeder_name, breeder_country, breeder_contact, acquisition_date,
    registration_registry, registration_number,
    insurance_provider, insurance_policy_number,
    primary_vet_clinic_name, primary_vet_phone, primary_vet_address,
    emergency_clinic_name, emergency_clinic_phone, emergency_clinic_address,
    microchip_registry_name, microchip_registry_id,
    countries_visited,
    data_processing_consent, consent_timestamp, emergency_sharing_enabled,
    completeness_score
  ) VALUES (
    v_jaidev_id,
    'Jaidev Singh', 'Dog', 'German Shepherd', 'Max', '2019-08-10', 'Male', 'Yes',
    'Intelligent and protective. Very active, needs daily exercise.',
    '982000555666777', '2019-09-01', 'neck/shoulder',
    'DE-54321-2019', 'DE', '2019-09-15',
    'VetCare Munich', '+49 89 22222222',
    'Black and tan, classic GSD coloring', 38.0, '2024-10-10', 63.0,
    ARRAY['Hip Dysplasia (mild)'], ARRAY['Chicken'],
    'Purina Pro Plan', 'Dry', 'Twice daily: 8am (2.5 cups), 7pm (2.5 cups)',
    'Loyal, protective, high energy', 'Strangers approaching owner, loud sudden noises',
    'breeder', 'German Shepherd Elite', 'DE', '+49 89 77777777', '2019-09-05',
    'VDH', 'VDH-2019-GSD-987654',
    'PetCare Insurance', 'PCI-2019-345678',
    'VetCare Munich', '+49 89 22222222', 'Marienplatz 8, 80331 Munich',
    'Munich Animal Emergency', '+49 89 99999999', 'Maximilianstraße 15, 80539 Munich',
    'Tasso', 'TS-2019-987654',
    ARRAY['DE', 'AT', 'CH'],
    true, NOW(), true,
    88
  ) RETURNING id INTO v_pet3_id;
  
  -- PET 4: British Shorthair - Charlie
  INSERT INTO public.pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
    microchip_number, microchip_implantation_date,
    eu_passport_number, passport_issuing_country, passport_issue_date,
    color_markings, weight_kg, weight_date,
    known_conditions,
    diet_brand, diet_type, feeding_schedule,
    behavior_temperament,
    acquired_from, breeder_name, breeder_country, acquisition_date,
    insurance_provider, insurance_policy_number,
    primary_vet_clinic_name, primary_vet_phone,
    emergency_clinic_name, emergency_clinic_phone,
    data_processing_consent, consent_timestamp, emergency_sharing_enabled,
    completeness_score
  ) VALUES (
    v_jaidev_id,
    'Jaidev Singh', 'Cat', 'British Shorthair', 'Charlie', '2022-01-15', 'Male', 'Yes',
    'Placid and easygoing. Loves lounging and gentle petting.',
    '982000111222333', '2022-02-01',
    'DE-11111-2022', 'DE', '2022-02-15',
    'Blue-gray', 5.8, '2024-10-15',
    ARRAY[]::text[],
    'Royal Canin', 'Dry', 'Free feed, 2 meals per day',
    'Calm, relaxed, very gentle',
    'breeder', 'British Blue Cattery', 'DE', '2022-02-10',
    'PetCare Insurance', 'PCI-2022-456789',
    'VetCare Munich', '+49 89 22222222',
    'Munich Animal Emergency', '+49 89 99999999',
    true, NOW(), true,
    68
  ) RETURNING id INTO v_pet4_id;

  -- ============================================
  -- MIREA'S PETS
  -- ============================================
  
  -- PET 5: French Bulldog - Bella
  INSERT INTO public.pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
    microchip_number, microchip_implantation_date, microchip_location,
    eu_passport_number, passport_issuing_country, passport_issue_date,
    primary_vet_clinic, primary_vet_contact,
    color_markings, weight_kg, weight_date, height_withers_cm,
    known_conditions, allergies,
    diet_brand, diet_type, feeding_schedule,
    behavior_temperament, behavior_triggers,
    acquired_from, breeder_name, breeder_country, breeder_contact, acquisition_date,
    registration_registry, registration_number,
    insurance_provider, insurance_policy_number, insurance_emergency_hotline,
    primary_vet_clinic_name, primary_vet_phone, primary_vet_address,
    emergency_clinic_name, emergency_clinic_phone, emergency_clinic_address,
    microchip_registry_name, microchip_registry_id,
    countries_visited,
    data_processing_consent, consent_timestamp, emergency_sharing_enabled,
    completeness_score
  ) VALUES (
    v_mirea_id,
    'Mirea Popescu', 'Dog', 'French Bulldog', 'Bella', '2021-11-05', 'Female', 'Yes',
    'Playful and affectionate. Enjoys short walks and indoor play.',
    '982000444555666', '2021-11-20', 'neck/shoulder',
    'RO-99999-2021', 'RO', '2021-12-01',
    'Pet Health Bucharest', '+40 21 33333333',
    'Brindle with white markings', 11.5, '2024-10-05', 28.0,
    ARRAY['Brachycephalic Syndrome', 'Skin Allergies'], ARRAY['Wheat', 'Beef'],
    'Hill''s Prescription Diet', 'Wet', '3 times daily: 1 can per meal',
    'Playful, affectionate, friendly with everyone', 'Heat, overexertion',
    'breeder', 'Frenchie Delight', 'RO', '+40 21 88888888', '2021-12-05',
    'RO Kennel Club', 'ROKC-2021-FB-555555',
    'PetCare Insurance', 'PCI-2021-567890', '+40 800 123456',
    'Pet Health Bucharest', '+40 21 33333333', 'Calea Victoriei 120, Bucharest',
    'Bucharest Animal Emergency', '+40 21 77777777', 'Bulevardul Unirii 1, Bucharest',
    'PetNET', 'PN-2021-555555',
    ARRAY['RO', 'BG', 'HU'],
    true, NOW(), true,
    82
  ) RETURNING id INTO v_pet5_id;
  
  -- PET 6: Maine Coon - Shadow
  INSERT INTO public.pets (
    owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
    microchip_number, microchip_implantation_date,
    eu_passport_number, passport_issuing_country, passport_issue_date,
    color_markings, weight_kg, weight_date,
    known_conditions, allergies,
    diet_brand, diet_type, feeding_schedule,
    behavior_temperament, behavior_triggers,
    acquired_from, breeder_name, breeder_country, acquisition_date,
    insurance_provider, insurance_policy_number,
    primary_vet_clinic_name, primary_vet_phone,
    emergency_clinic_name, emergency_clinic_phone,
    countries_visited,
    data_processing_consent, consent_timestamp, emergency_sharing_enabled,
    completeness_score
  ) VALUES (
    v_mirea_id,
    'Mirea Popescu', 'Cat', 'Maine Coon', 'Shadow', '2020-09-12', 'Male', 'Yes',
    'Large, friendly cat. Enjoys interactive toys and climbing.',
    '982000777888999', '2020-10-01',
    'RO-88888-2020', 'RO', '2020-10-15',
    'Black with white chest', 7.8, '2024-10-12',
    ARRAY['Hip Dysplasia (monitoring)'], ARRAY['Fish'],
    'Royal Canin Maine Coon', 'Dry', 'Free feed, large breed portions',
    'Friendly, active, dog-like personality', 'Being alone for extended periods',
    'breeder', 'Maine Coon Excellence', 'RO', '2020-10-10',
    'PetCare Insurance', 'PCI-2020-678901',
    'Pet Health Bucharest', '+40 21 33333333',
    'Bucharest Animal Emergency', '+40 21 77777777',
    ARRAY['RO', 'DE'],
    true, NOW(), true,
    75
  ) RETURNING id INTO v_pet6_id;

  -- ============================================
  -- HISTORICAL TREATMENT RECORDS
  -- ============================================
  
  -- BUDDY (Pet 1) - Treatment 1: Routine Checkup (2 months ago)
  INSERT INTO public.treatments (
    booking_id, pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vital_signs,
    medications,
    follow_up_instructions, follow_up_date, notes,
    created_by
  ) VALUES (
    NULL, v_pet1_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 months',
    'examination',
    'Routine health check - Healthy',
    'Owner reports pet is active, eating well, normal behavior. No concerns.',
    'Physical exam: Alert and responsive. Temperature 38.5°C, Heart rate 120 bpm, Respiratory rate 24 bpm. Body condition score 5/9. Mucous membranes pink and moist. No abnormalities detected on auscultation or palpation. Weight: 28.5 kg.',
    'Healthy adult pet. No significant findings on examination.',
    'Continue current diet and exercise routine. Annual vaccination due in 4 months. Recommend dental check in next visit.',
    '{"temperature": "38.5", "heart_rate": "120", "respiratory_rate": "24", "weight_kg": "28.5", "body_condition_score": "5"}',
    NULL,
    'Continue regular exercise. Monitor weight. Next checkup in 6 months.',
    (NOW() - INTERVAL '2 months' + INTERVAL '6 months')::date,
    'Pet in excellent health. Owner advised on maintaining healthy weight and regular exercise.',
    v_vet_id
  );

  -- BUDDY (Pet 1) - Treatment 2: Vaccination (1 month ago)
  INSERT INTO public.treatments (
    booking_id, pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vaccine_type, vaccine_batch_number, vaccine_manufacturer, vaccine_expiry_date, next_vaccination_due,
    vital_signs, certificates, notes, created_by
  ) VALUES (
    NULL, v_pet1_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 month',
    'vaccination',
    'Annual vaccination',
    'Pet presented for annual DHPPi and Rabies vaccination. Owner reports no health concerns since last visit.',
    'Physical exam: Healthy appearance. Temperature 38.3°C. No signs of illness. Weight: 28.7 kg (slight increase, within normal range).',
    'Healthy pet suitable for vaccination.',
    'Administered DHPPi and Rabies vaccines. Next vaccination due in 12 months. Certificate issued.',
    'DHPPi + Rabies', 'VAC-2024-001234', 'Zoetis',
    (NOW() + INTERVAL '1 year')::date,
    (NOW() - INTERVAL '1 month' + INTERVAL '1 year')::date,
    '{"temperature": "38.3", "weight_kg": "28.7"}',
    '[{"type": "EU Pet Passport - Vaccination Record", "number": "PP-2024-5678", "issue_date": "' || (NOW() - INTERVAL '1 month')::date || '", "expiry_date": "' || (NOW() - INTERVAL '1 month' + INTERVAL '1 year')::date || '"}]',
    'Vaccination completed successfully. No adverse reactions observed. Owner provided vaccination certificate.',
    v_vet_id
  );

  -- MAX (Pet 3) - Treatment 1: Routine Checkup (3 months ago)
  INSERT INTO public.treatments (
    booking_id, pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vital_signs, notes, created_by
  ) VALUES (
    NULL, v_pet3_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '3 months',
    'examination',
    'Routine checkup - Healthy',
    'Owner reports active lifestyle, good appetite. Regular exercise routine maintained.',
    'Physical exam: Excellent condition. Temperature 38.2°C, Heart rate 90 bpm, Respiratory rate 20 bpm. Weight: 37.8 kg. Body condition score 5/9. Hip examination: Range of motion good, no signs of discomfort.',
    'Healthy adult dog. Mild hip dysplasia observed (stable, no intervention needed at this time).',
    'Continue regular exercise with joint supplements. Monitor hip health. Next checkup in 6 months.',
    '{"temperature": "38.2", "heart_rate": "90", "respiratory_rate": "20", "weight_kg": "37.8", "body_condition_score": "5"}',
    'Owner provided with joint supplement recommendations. Dog is handling mild hip dysplasia well.',
    v_vet_id
  );

  -- MAX (Pet 3) - Treatment 2: Deworming (2 months ago)
  INSERT INTO public.treatments (
    booking_id, pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    deworming_product, deworming_dose, deworming_date, next_deworming_due,
    medications, follow_up_instructions, notes, created_by
  ) VALUES (
    NULL, v_pet3_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 months',
    'deworming',
    'Routine deworming',
    'Owner requests routine deworming as part of preventive care.',
    'Physical exam: Healthy. Weight: 37.5 kg.',
    'Pet suitable for deworming treatment.',
    'Administered broad-spectrum dewormer. Next treatment due in 3 months.',
    'Drontal Plus', '1 tablet (based on weight: 37.5 kg)', (NOW() - INTERVAL '2 months')::date,
    (NOW() - INTERVAL '2 months' + INTERVAL '3 months')::date,
    '[{"name": "Drontal Plus", "dosage": "1 tablet", "frequency": "Single dose", "duration": "N/A", "instructions": "Given at clinic. Monitor for any adverse reactions."}]',
    'Continue regular preventive care. Next deworming in 3 months or sooner if symptoms of parasites observed.',
    'Deworming treatment completed. Owner advised on importance of regular parasite prevention.',
    v_vet_id
  );

  -- BELLA (Pet 5) - Treatment 1: Antiparasitic (2 weeks ago)
  INSERT INTO public.treatments (
    booking_id, pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    antiparasitic_product, antiparasitic_type, antiparasitic_dose, antiparasitic_date, next_antiparasitic_due,
    notes, created_by
  ) VALUES (
    NULL, v_pet5_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '2 weeks',
    'antiparasitic',
    'Flea and tick prevention',
    'Owner requests flea and tick prevention for upcoming warm season.',
    'Physical exam: No signs of current flea or tick infestation. Skin healthy, no lesions. Weight: 11.3 kg.',
    'Pet suitable for preventive antiparasitic treatment.',
    'Applied topical flea and tick prevention. Next treatment due in 4 weeks.',
    'Frontline Plus', 'combination', '1 pipette (small-medium dog)', (NOW() - INTERVAL '2 weeks')::date,
    (NOW() - INTERVAL '2 weeks' + INTERVAL '4 weeks')::date,
    'Applied topical treatment at base of neck. Owner instructed to avoid bathing for 48 hours. Treatment provides protection for 4 weeks.',
    v_vet_id
  );

  -- BELLA (Pet 5) - Treatment 2: Examination (1 week ago)
  INSERT INTO public.treatments (
    booking_id, pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vital_signs, medications, diagnostic_tests,
    follow_up_instructions, follow_up_date, notes,
    created_by
  ) VALUES (
    NULL, v_pet5_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 week',
    'examination',
    'Mild skin irritation',
    'Owner reports pet scratching at certain areas, particularly after meals. No discharge but slight redness observed.',
    'Physical exam: Slight redness on abdomen area. No signs of infection. Temperature 38.6°C. Heart rate 110 bpm. Rest of examination normal. Weight: 11.4 kg. Skin cytology: Some yeast cells present.',
    'Mild skin irritation, likely food allergy related. No signs of systemic illness.',
    'Prescribed medicated shampoo and antihistamine. Owner to monitor diet and avoid known allergens. Recheck in 2 weeks if symptoms persist.',
    '{"temperature": "38.6", "heart_rate": "110", "weight_kg": "11.4"}',
    '[{"name": "Antihistamine", "dosage": "1/2 tablet daily", "frequency": "Once daily", "duration": "7 days", "instructions": "Given with food. Monitor for drowsiness."}]',
    '[{"test_type": "Skin Cytology", "results": "Yeast cells present (mild)", "notes": "Gram stain showed some yeast cells. No bacteria detected."}]',
    'Monitor skin for improvement. Continue medicated shampoo twice weekly. Return if symptoms worsen or persist after 7 days.',
    (NOW() - INTERVAL '1 week' + INTERVAL '2 weeks')::date,
    'Owner demonstrated proper shampoo application. Provided detailed instructions on medication and allergen avoidance. Pet tolerating examination and treatment well.',
    v_vet_id
  );

  -- SHADOW (Pet 6) - Treatment 1: Vaccination (1 month ago)
  INSERT INTO public.treatments (
    booking_id, pet_id, clinic_id, vet_id, treatment_date, treatment_type, diagnosis,
    subjective, objective, assessment, plan,
    vaccine_type, vaccine_batch_number, vaccine_manufacturer,
    vital_signs, certificates, notes, created_by
  ) VALUES (
    NULL, v_pet6_id, v_clinic_id, v_vet_id,
    NOW() - INTERVAL '1 month',
    'vaccination',
    'Annual vaccination',
    'Pet presented for annual FVRCP and Rabies vaccination. Owner reports no health concerns.',
    'Physical exam: Healthy appearance. Temperature 38.4°C. Weight: 7.6 kg. No signs of illness.',
    'Healthy pet suitable for vaccination.',
    'Administered FVRCP and Rabies vaccines. Next vaccination due in 12 months. Certificate issued.',
    'FVRCP + Rabies', 'VAC-2024-002345', 'Merial',
    '{"temperature": "38.4", "weight_kg": "7.6"}',
    '[{"type": "EU Pet Passport - Vaccination Record", "number": "PP-2024-6789", "issue_date": "' || (NOW() - INTERVAL '1 month')::date || '", "expiry_date": "' || (NOW() - INTERVAL '1 month' + INTERVAL '1 year')::date || '"}]',
    'Vaccination completed successfully. No adverse reactions observed. Large breed cat in excellent health.',
    v_vet_id
  );

  -- Create audit log entries for all treatments
  INSERT INTO public.treatment_audit_log (treatment_id, action, changed_by)
  SELECT id, 'viewed', v_vet_id
  FROM public.treatments
  WHERE pet_id IN (v_pet1_id, v_pet2_id, v_pet3_id, v_pet4_id, v_pet5_id, v_pet6_id);

  RAISE NOTICE 'Successfully inserted pets and treatments!';
  RAISE NOTICE 'Lalit pets: %, %', v_pet1_id, v_pet2_id;
  RAISE NOTICE 'Jaidev pets: %, %', v_pet3_id, v_pet4_id;
  RAISE NOTICE 'Mirea pets: %, %', v_pet5_id, v_pet6_id;
  
END $$;

-- Verification query
SELECT 
  u.email as owner_email,
  COUNT(DISTINCT p.id) as pet_count,
  COUNT(DISTINCT t.id) as treatment_count
FROM auth.users u
LEFT JOIN pets p ON p.owner_id = u.id
LEFT JOIN treatments t ON t.pet_id = p.id
WHERE u.email IN ('lalit@petowner.com', 'jaidev@petowner.com', 'mirea@petowner.com')
GROUP BY u.email
ORDER BY u.email;

