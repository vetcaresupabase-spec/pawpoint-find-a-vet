-- Insert Dummy Treatment Records for All Existing Pets
-- This script will add 2-3 historical treatment records for each pet in the database

DO $$
DECLARE
  v_pet RECORD;
  v_clinic_id uuid;
  v_vet_id uuid;
  v_treatment_count integer := 0;
BEGIN
  -- Get or create a clinic
  SELECT id, owner_id INTO v_clinic_id, v_vet_id 
  FROM clinics 
  LIMIT 1;
  
  IF v_clinic_id IS NULL THEN
    -- No clinic exists, create one
    SELECT id INTO v_vet_id 
    FROM auth.users 
    WHERE email LIKE '%@%' 
    LIMIT 1;
    
    IF v_vet_id IS NULL THEN
      RAISE EXCEPTION 'No users found in the database';
    END IF;
    
    INSERT INTO clinics (name, city, address_line1, postal_code, phone, email, owner_id, specialties)
    VALUES (
      'VetCare Animal Clinic',
      'Berlin',
      'Main Street 123',
      '10115',
      '+49 30 12345678',
      'info@vetcare-clinic.de',
      v_vet_id,
      ARRAY['General Practice', 'Emergency Care']
    )
    RETURNING id INTO v_clinic_id;
    
    RAISE NOTICE 'Created clinic: %', v_clinic_id;
  END IF;
  
  -- Ensure we have a valid vet_id
  IF v_vet_id IS NULL THEN
    UPDATE clinics SET owner_id = (SELECT id FROM auth.users LIMIT 1) WHERE id = v_clinic_id;
    SELECT owner_id INTO v_vet_id FROM clinics WHERE id = v_clinic_id;
  END IF;
  
  RAISE NOTICE 'Using Clinic: % with Vet: %', v_clinic_id, v_vet_id;
  
  -- Loop through all pets and add treatment records
  FOR v_pet IN 
    SELECT id, name, owner_id 
    FROM pets 
    ORDER BY created_at DESC
  LOOP
    RAISE NOTICE 'Adding treatments for pet: % (ID: %)', v_pet.name, v_pet.id;
    
    -- Treatment 1: Recent Checkup (2 weeks ago)
    INSERT INTO treatments (
      pet_id,
      clinic_id,
      vet_id,
      treatment_date,
      treatment_type,
      diagnosis,
      subjective,
      objective,
      assessment,
      plan,
      vital_signs,
      notes,
      created_by
    ) VALUES (
      v_pet.id,
      v_clinic_id,
      v_vet_id,
      NOW() - INTERVAL '2 weeks',
      'examination',
      'Routine health checkup - Healthy',
      'Owner reports pet is active, eating well, normal behavior. No concerns reported.',
      'Physical exam: Alert and responsive. Temperature 38.5°C, Heart rate 120 bpm. Coat condition good. No abnormalities detected.',
      'Healthy pet. No significant findings on examination.',
      'Continue current diet and exercise routine. Next checkup in 6 months.',
      jsonb_build_object(
        'temperature', '38.5',
        'heart_rate', '120',
        'respiratory_rate', '24',
        'weight_kg', '12.5',
        'body_condition_score', '5'
      ),
      'Pet is in excellent health. Owner advised on preventive care.',
      v_vet_id
    );
    v_treatment_count := v_treatment_count + 1;
    
    -- Treatment 2: Vaccination (3 months ago)
    INSERT INTO treatments (
      pet_id,
      clinic_id,
      vet_id,
      treatment_date,
      treatment_type,
      diagnosis,
      subjective,
      objective,
      assessment,
      plan,
      vaccine_type,
      vaccine_batch_number,
      vaccine_manufacturer,
      vaccine_expiry_date,
      next_vaccination_due,
      vital_signs,
      certificates,
      notes,
      created_by
    ) VALUES (
      v_pet.id,
      v_clinic_id,
      v_vet_id,
      NOW() - INTERVAL '3 months',
      'vaccination',
      'Annual vaccination - DHPPi + Rabies',
      'Pet presented for annual vaccination. Owner reports no health concerns.',
      'Physical exam normal. Temperature 38.3°C. No signs of illness. Ready for vaccination.',
      'Healthy pet suitable for vaccination.',
      'Administered DHPPi and Rabies vaccines. Next vaccination due in 12 months.',
      'DHPPi + Rabies',
      'VAC-2024-' || LPAD((RANDOM() * 10000)::INTEGER::TEXT, 5, '0'),
      'Zoetis',
      (NOW() + INTERVAL '2 years')::date,
      (NOW() + INTERVAL '9 months')::date,
      jsonb_build_object(
        'temperature', '38.3',
        'weight_kg', '12.0',
        'body_condition_score', '5'
      ),
      jsonb_build_array(
        jsonb_build_object(
          'type', 'EU Pet Passport - Vaccination Record',
          'number', 'PP-2024-' || LPAD((RANDOM() * 10000)::INTEGER::TEXT, 4, '0'),
          'issue_date', (NOW() - INTERVAL '3 months')::date,
          'expiry_date', (NOW() + INTERVAL '9 months')::date
        )
      ),
      'Vaccination completed successfully. No adverse reactions observed.',
      v_vet_id
    );
    v_treatment_count := v_treatment_count + 1;
    
    -- Treatment 3: Deworming (6 months ago)
    INSERT INTO treatments (
      pet_id,
      clinic_id,
      vet_id,
      treatment_date,
      treatment_type,
      diagnosis,
      subjective,
      objective,
      assessment,
      plan,
      deworming_product,
      medications,
      notes,
      created_by
    ) VALUES (
      v_pet.id,
      v_clinic_id,
      v_vet_id,
      NOW() - INTERVAL '6 months',
      'medication',
      'Routine deworming',
      'Routine preventive deworming treatment.',
      'Pet in good health. Weight stable.',
      'Preventive treatment administered.',
      'Next deworming in 3 months.',
      'Milbemax',
      jsonb_build_array(
        jsonb_build_object(
          'name', 'Milbemax',
          'dosage', '1 tablet',
          'route', 'Oral',
          'frequency', 'Single dose',
          'duration', 'One time',
          'instructions', 'Administer with food'
        )
      ),
      'Deworming completed. Owner advised on regular preventive care.',
      v_vet_id
    );
    v_treatment_count := v_treatment_count + 1;
    
  END LOOP;
  
  RAISE NOTICE '✅✅✅ SUCCESS! Added % treatment records for all pets ✅✅✅', v_treatment_count;
  
END $$;

-- Verify the results
SELECT 
  p.name as pet_name,
  p.owner_name,
  COUNT(t.id) as treatment_count,
  STRING_AGG(DISTINCT t.treatment_type, ', ' ORDER BY t.treatment_type) as treatment_types,
  MAX(t.treatment_date)::date as last_treatment
FROM pets p
LEFT JOIN treatments t ON t.pet_id = p.id
GROUP BY p.id, p.name, p.owner_name
ORDER BY p.created_at DESC;

