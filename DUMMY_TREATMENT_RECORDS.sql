-- Dummy Historical Treatment Records
-- Run this AFTER setting up the treatments system
-- IMPORTANT: Replace the UUIDs below with actual IDs from your database:
--   - pet_id: Use a pet ID from your pets table
--   - clinic_id: Use a clinic ID from your clinics table  
--   - vet_id: Use a user ID from auth.users (vet/ clinic owner)

-- To find IDs, run:
-- SELECT id, name FROM pets LIMIT 5;
-- SELECT id, name FROM clinics LIMIT 5;
-- SELECT id, email FROM auth.users LIMIT 5;

-- Example 1: Routine Checkup (2 months ago)
INSERT INTO public.treatments (
  booking_id,
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
  medications,
  follow_up_instructions,
  follow_up_date,
  notes,
  created_by
) VALUES (
  NULL, -- No booking associated
  'REPLACE_WITH_PET_ID', -- Replace with actual pet ID
  'REPLACE_WITH_CLINIC_ID', -- Replace with actual clinic ID
  'REPLACE_WITH_VET_ID', -- Replace with actual vet user ID
  NOW() - INTERVAL '2 months',
  'examination',
  'Routine health check - Healthy',
  'Owner reports pet is active, eating well, normal behavior. No concerns.',
  'Physical exam: Alert and responsive. Temperature 38.5°C, Heart rate 120 bpm, Respiratory rate 24 bpm. Body condition score 5/9. Mucous membranes pink and moist. No abnormalities detected on auscultation or palpation. Weight: 15.2 kg.',
  'Healthy adult pet. No significant findings on examination.',
  'Continue current diet and exercise routine. Annual vaccination due in 6 months. Recommend dental check in next visit.',
  '{"temperature": "38.5", "heart_rate": "120", "respiratory_rate": "24", "weight_kg": "15.2", "body_condition_score": "5"}',
  NULL,
  'Continue regular exercise. Monitor weight. Next checkup in 6 months.',
  (NOW() - INTERVAL '2 months' + INTERVAL '6 months')::date,
  'Pet in excellent health. Owner advised on maintaining healthy weight and regular exercise.'
) RETURNING id;

-- Example 2: Vaccination (1 month ago)
INSERT INTO public.treatments (
  booking_id,
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
  NULL,
  'REPLACE_WITH_PET_ID',
  'REPLACE_WITH_CLINIC_ID',
  'REPLACE_WITH_VET_ID',
  NOW() - INTERVAL '1 month',
  'vaccination',
  'Annual vaccination',
  'Pet presented for annual DHPPi and Rabies vaccination. Owner reports no health concerns since last visit.',
  'Physical exam: Healthy appearance. Temperature 38.3°C. No signs of illness. Weight: 15.5 kg (slight increase from last visit, within normal range).',
  'Healthy pet suitable for vaccination.',
  'Administered DHPPi and Rabies vaccines. Next vaccination due in 12 months. Certificate issued.',
  'DHPPi + Rabies',
  'VAC-2024-001234',
  'Zoetis',
  (NOW() + INTERVAL '1 year')::date,
  (NOW() - INTERVAL '1 month' + INTERVAL '1 year')::date,
  '{"temperature": "38.3", "weight_kg": "15.5"}',
  '[{"type": "EU Pet Passport - Vaccination Record", "number": "PP-2024-5678", "issue_date": "' || (NOW() - INTERVAL '1 month')::date || '", "expiry_date": "' || (NOW() - INTERVAL '1 month' + INTERVAL '1 year')::date || '"}]',
  'Vaccination completed successfully. No adverse reactions observed. Owner provided vaccination certificate.'
) RETURNING id;

-- Example 3: Deworming (3 weeks ago)
INSERT INTO public.treatments (
  booking_id,
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
  deworming_dose,
  deworming_date,
  next_deworming_due,
  medications,
  follow_up_instructions,
  notes,
  created_by
) VALUES (
  NULL,
  'REPLACE_WITH_PET_ID',
  'REPLACE_WITH_CLINIC_ID',
  'REPLACE_WITH_VET_ID',
  NOW() - INTERVAL '3 weeks',
  'deworming',
  'Routine deworming',
  'Owner requests routine deworming as part of preventive care.',
  'Physical exam: Healthy. Weight: 15.3 kg.',
  'Pet suitable for deworming treatment.',
  'Administered broad-spectrum dewormer. Next treatment due in 3 months.',
  'Drontal Plus',
  '1 tablet (based on weight: 15.3 kg)',
  (NOW() - INTERVAL '3 weeks')::date,
  (NOW() - INTERVAL '3 weeks' + INTERVAL '3 months')::date,
  '[{"name": "Drontal Plus", "dosage": "1 tablet", "frequency": "Single dose", "duration": "N/A", "instructions": "Given at clinic. Monitor for any adverse reactions."}]',
  'Continue regular preventive care. Next deworming in 3 months or sooner if symptoms of parasites observed.',
  'Deworming treatment completed. Owner advised on importance of regular parasite prevention.'
) RETURNING id;

-- Example 4: Antiparasitic Treatment (2 weeks ago)
INSERT INTO public.treatments (
  booking_id,
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
  antiparasitic_product,
  antiparasitic_type,
  antiparasitic_dose,
  antiparasitic_date,
  next_antiparasitic_due,
  notes,
  created_by
) VALUES (
  NULL,
  'REPLACE_WITH_PET_ID',
  'REPLACE_WITH_CLINIC_ID',
  'REPLACE_WITH_VET_ID',
  NOW() - INTERVAL '2 weeks',
  'antiparasitic',
  'Flea and tick prevention',
  'Owner requests flea and tick prevention for upcoming warm season.',
  'Physical exam: No signs of current flea or tick infestation. Skin healthy, no lesions.',
  'Pet suitable for preventive antiparasitic treatment.',
  'Applied topical flea and tick prevention. Next treatment due in 4 weeks.',
  'Frontline Plus',
  'combination',
  '1 pipette (large dog)',
  (NOW() - INTERVAL '2 weeks')::date,
  (NOW() - INTERVAL '2 weeks' + INTERVAL '4 weeks')::date,
  'Applied topical treatment at base of neck. Owner instructed to avoid bathing for 48 hours. Treatment provides protection for 4 weeks.'
) RETURNING id;

-- Example 5: Examination with Minor Issue (1 week ago)
INSERT INTO public.treatments (
  booking_id,
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
  medications,
  diagnostic_tests,
  follow_up_instructions,
  follow_up_date,
  notes,
  created_by
) VALUES (
  NULL,
  'REPLACE_WITH_PET_ID',
  'REPLACE_WITH_CLINIC_ID',
  'REPLACE_WITH_VET_ID',
  NOW() - INTERVAL '1 week',
  'examination',
  'Mild ear infection',
  'Owner reports pet shaking head and scratching at ears for past 2 days. No discharge observed but mild odor noted.',
  'Physical exam: Slight redness in right ear canal. No discharge. Temperature 38.7°C (slightly elevated). Heart rate 110 bpm. Rest of examination normal. Weight: 15.4 kg. Ear cytology: Small number of yeast cells present.',
  'Mild unilateral otitis externa, likely yeast-related. No signs of systemic illness.',
  'Prescribed topical ear medication. Owner to clean ear daily and apply medication twice daily for 7 days. Recheck in 1 week if symptoms persist or worsen.',
  '{"temperature": "38.7", "heart_rate": "110", "weight_kg": "15.4"}',
  '[{"name": "Ear Cleaner + Antifungal Drops", "dosage": "2-3 drops per ear", "frequency": "Twice daily", "duration": "7 days", "instructions": "Clean ear gently before applying medication. Apply drops to affected ear twice daily."}]',
  '[{"test_type": "Ear Cytology", "results": "Yeast cells present (mild)", "notes": "Gram stain showed small number of yeast cells. No bacteria detected."}]',
  'Monitor ear for improvement. Clean ear gently before each medication application. Return if symptoms worsen or persist after 7 days.',
  (NOW() - INTERVAL '1 week' + INTERVAL '1 week')::date,
  'Owner demonstrated proper ear cleaning technique. Provided detailed instructions on medication administration. Pet tolerating examination and treatment well.'
) RETURNING id;

-- Create audit log entries for all dummy treatments
-- Note: This will create view logs as if the vet viewed these records

-- After inserting treatments above, you can create audit logs like this:
-- (Replace treatment_id with the IDs returned from inserts above)

/*
INSERT INTO public.treatment_audit_log (treatment_id, action, changed_by)
SELECT id, 'viewed', 'REPLACE_WITH_VET_ID'
FROM public.treatments
WHERE pet_id = 'REPLACE_WITH_PET_ID'
ORDER BY treatment_date DESC
LIMIT 5;
*/

-- Verification query - Check that treatments were created successfully
-- SELECT 
--   id,
--   treatment_date,
--   treatment_type,
--   diagnosis,
--   pet_id,
--   clinic_id,
--   vet_id
-- FROM public.treatments
-- WHERE pet_id = 'REPLACE_WITH_PET_ID'
-- ORDER BY treatment_date DESC;

