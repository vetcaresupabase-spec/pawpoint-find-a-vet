-- ============================================
-- Quick Dummy Data Insert - 10 Pets
-- ============================================
-- IMPORTANT: Replace (SELECT id FROM auth.users LIMIT 1) with actual owner_id
-- Find your user ID: SELECT id, email FROM auth.users WHERE email LIKE '%petowner%';
-- ============================================

-- Get your owner_id first:
-- SELECT id, email FROM auth.users LIMIT 1;

-- Then replace all instances of "(SELECT id FROM auth.users LIMIT 1 OFFSET 0)"
-- with your actual UUID, e.g., '123e4567-e89b-12d3-a456-426614174000'

-- ============================================
-- PET 1: Golden Retriever - Full Profile
-- ============================================
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
  data_processing_consent, consent_timestamp, emergency_sharing_enabled
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'John Smith', 'Dog', 'Golden Retriever', 'Buddy', '2020-05-15', 'Male', 'Yes',
  'Very friendly and energetic dog. Loves playing fetch and swimming.',
  '982000123456789', '2020-06-10', 'neck/shoulder',
  'DE-12345-2020', 'DE', '2020-06-15',
  'Happy Paws Berlin', '+49 30 11111111',
  'Golden, white chest marking', 28.5, '2024-10-15', 58.0,
  ARRAY['Hip Dysplasia', 'Seasonal Allergies'], ARRAY['Pollen', 'Dust'],
  'Royal Canin', 'Dry', 'Twice daily: 7am (2 cups), 6pm (2 cups)',
  'Very friendly, energetic, loves people and other dogs', 'Loud noises, fireworks',
  'breeder', 'Golden Dreams Kennel', 'DE', '+49 30 99999999, info@goldendreams.de', '2020-06-01',
  'VDH', 'VDH-2020-GR-001234',
  'PetCare Insurance', 'PCI-2020-123456', '+49 800 1234567',
  'Happy Paws Berlin', '+49 30 11111111', 'Alexanderplatz 1, 10178 Berlin', 'info@happypaws.de',
  'Berlin Animal Emergency', '+49 30 88888888', 'Friedrichstraße 100, 10117 Berlin',
  'Tasso', 'TS-2020-001234', 'https://www.tasso.net',
  ARRAY['DE', 'FR', 'IT', 'ES'], 'Requires large crate (size 4). Prefers window seat.',
  true, NOW(), true
);

-- ============================================
-- PET 2: Persian Cat - Full Profile
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number, microchip_implantation_date,
  eu_passport_number, passport_issuing_country, passport_issue_date,
  primary_vet_clinic, primary_vet_contact,
  color_markings, weight_kg, weight_date, height_withers_cm,
  known_conditions, allergies,
  diet_brand, diet_type, feeding_schedule,
  behavior_temperament, behavior_triggers,
  acquired_from, rescue_name, rescue_country, rescue_contact, acquisition_date,
  insurance_provider, insurance_policy_number,
  primary_vet_clinic_name, primary_vet_phone, primary_vet_address, primary_vet_email,
  emergency_clinic_name, emergency_clinic_phone, emergency_clinic_address,
  countries_visited, data_processing_consent, consent_timestamp
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Emma Johnson', 'Cat', 'Persian', 'Princess', '2019-03-22', 'Female', 'Yes',
  'Calm and gentle. Prefers quiet environments. Requires daily grooming.',
  '982000234567890', '2019-04-05',
  'FR-54321-2019', 'FR', '2019-04-10',
  'Cat Care Clinic', '+33 1 23456789',
  'White with blue eyes', 4.2, '2024-09-20', 25.0,
  ARRAY['Respiratory issues'], ARRAY['Certain fish proteins'],
  'Hills Science Diet', 'Wet', 'Three times daily: small portions',
  'Calm, gentle, affectionate, shy around strangers', 'Loud noises, other cats',
  'rescue', 'Paris Animal Rescue', 'FR', '+33 1 98765432, contact@parisanimalrescue.fr', '2019-06-15',
  'PetSecure', 'PS-2019-789012',
  'Cat Care Clinic', '+33 1 23456789', '12 Rue de la Paix, 75002 Paris', 'catcare@example.fr',
  'Paris Emergency Vet', '+33 1 98765432', '50 Avenue des Champs-Élysées, 75008 Paris',
  ARRAY['FR', 'BE'], true, NOW()
);

-- ============================================
-- PET 3: Mixed Breed - Minimal Profile
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  color_markings, weight_kg, weight_date,
  behavior_temperament,
  acquired_from, acquisition_date,
  primary_vet_clinic_name, primary_vet_phone,
  data_processing_consent, consent_timestamp
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Michael Brown', 'Dog', 'Mixed Breed', 'Max', '2021-08-10', 'Male', 'Yes',
  'Rescued from shelter. Very playful and energetic.',
  'Brown and white, medium-sized', 18.0, '2024-10-01',
  'Playful, energetic, loves kids',
  'rescue', '2021-09-01',
  'City Animal Hospital', '+49 30 55555555',
  true, NOW()
);

-- ============================================
-- PET 4: German Shepherd - Full Profile with Medications
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number, microchip_implantation_date, microchip_location,
  eu_passport_number, passport_issuing_country, passport_issue_date,
  color_markings, weight_kg, weight_date, height_withers_cm,
  known_conditions, allergies,
  current_medications, past_surgeries,
  diet_brand, diet_type, feeding_schedule,
  behavior_temperament, behavior_notes,
  acquired_from, breeder_name, breeder_country, breeder_contact, acquisition_date,
  registration_registry, registration_number,
  insurance_provider, insurance_policy_number,
  primary_vet_clinic_name, primary_vet_phone, primary_vet_address,
  emergency_clinic_name, emergency_clinic_phone,
  microchip_registry_name, microchip_registry_id,
  countries_visited, travel_notes,
  data_processing_consent, consent_timestamp, emergency_sharing_enabled
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Sarah Miller', 'Dog', 'German Shepherd', 'Rex', '2018-11-05', 'Male', 'Yes',
  'Trained police dog (retired). Very obedient and protective.',
  '982000345678901', '2018-11-15', 'neck/shoulder',
  'DE-67890-2018', 'DE', '2018-11-20',
  'Black and tan, traditional', 35.0, '2024-10-10', 65.0,
  ARRAY['Hip Dysplasia'], ARRAY[]::TEXT[],
  '[{"name": "Joint supplements", "dose": "2 tablets daily", "schedule": "Morning with food"}]'::JSONB,
  '[{"name": "Hip surgery", "date": "2022-03-15", "notes": "Successful procedure, full recovery"}]'::JSONB,
  'Royal Canin Large Breed', 'Dry', 'Twice daily: 8am (1.5 cups), 7pm (1.5 cups)',
  'Obedient, protective, intelligent, loyal', 'Excellent with commands. Needs regular mental stimulation.',
  'breeder', 'Elite German Shepherds', 'DE', '+49 30 77777777, contact@elitegs.de', '2018-12-01',
  'VDH', 'VDH-2018-GS-005678',
  'Comprehensive Pet Insurance', 'CPI-2018-456789',
  'Berlin Veterinary Center', '+49 30 22222222', 'Karl-Marx-Allee 45, 10178 Berlin',
  'Berlin Emergency Veterinary', '+49 30 33333333',
  'Tasso', 'TS-2018-005678',
  ARRAY['DE', 'AT', 'CH', 'CZ'], 'Experienced traveler. Well-behaved. Needs large crate.',
  true, NOW(), true
);

-- ============================================
-- PET 5: British Shorthair Cat
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number, microchip_implantation_date,
  eu_passport_number, passport_issuing_country, passport_issue_date,
  color_markings, weight_kg, weight_date,
  diet_brand, diet_type, feeding_schedule,
  behavior_temperament,
  acquired_from, breeder_name, breeder_country, acquisition_date,
  insurance_provider,
  primary_vet_clinic_name, primary_vet_phone,
  emergency_clinic_name, emergency_clinic_phone,
  data_processing_consent, consent_timestamp
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'David Wilson', 'Cat', 'British Shorthair', 'Winston', '2020-01-20', 'Male', 'Yes',
  'Calm and dignified. Loves attention on his own terms.',
  '982000456789012', '2020-02-01',
  'UK-98765-2020', 'GB', '2020-02-05',
  'Blue (gray), round face', 5.8, '2024-09-15',
  'Purina Pro Plan', 'Dry', 'Free feeding (measured amount)',
  'Calm, independent, affectionate when he wants',
  'breeder', 'British Elegance Cattery', 'GB', '2020-03-01',
  'UK Pet Insurance',
  'London Cat Clinic', '+44 20 12345678',
  'London Emergency Vet', '+44 20 98765432',
  true, NOW()
);

-- ============================================
-- PET 6: Border Collie
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number, microchip_implantation_date,
  color_markings, weight_kg, weight_date, height_withers_cm,
  allergies,
  diet_brand, feeding_schedule,
  behavior_temperament, behavior_triggers, behavior_notes,
  acquired_from, rescue_name, rescue_country, acquisition_date,
  primary_vet_clinic_name, primary_vet_phone,
  emergency_clinic_name, emergency_clinic_phone,
  countries_visited,
  data_processing_consent, consent_timestamp, emergency_sharing_enabled
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Lisa Anderson', 'Dog', 'Border Collie', 'Luna', '2022-04-12', 'Female', 'Yes',
  'Highly intelligent and energetic. Requires lots of mental and physical exercise.',
  '982000567890123', '2022-04-25',
  'Black and white, merle pattern', 20.0, '2024-10-05', 52.0,
  ARRAY['Chicken'],
  'Eukanuba', 'Three times daily: 7am, 1pm, 7pm',
  'Highly intelligent, energetic, eager to please, herding instinct', 'Boredom, being alone too long',
  'Needs at least 2 hours exercise daily. Enjoys agility training.',
  'rescue', 'Border Collie Rescue Network', 'DE', '2022-05-15',
  'Munich Animal Clinic', '+49 89 12345678',
  'Munich Emergency', '+49 89 98765432',
  ARRAY['DE', 'AT'], true, NOW(), true
);

-- ============================================
-- PET 7: Siamese Cat
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number,
  color_markings, weight_kg, weight_date,
  known_conditions, allergies,
  diet_brand, diet_type,
  behavior_temperament, behavior_triggers,
  acquired_from, breeder_name, breeder_country, acquisition_date,
  insurance_provider, insurance_policy_number,
  primary_vet_clinic_name, primary_vet_phone,
  data_processing_consent, consent_timestamp
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Robert Taylor', 'Cat', 'Siamese', 'Mimi', '2021-07-08', 'Female', 'Yes',
  'Very vocal and social. Demands attention.',
  '982000678901234',
  'Seal point (cream body, dark face, ears, paws, tail)', 4.5, '2024-09-25',
  ARRAY['Asthma'], ARRAY['Dust', 'Strong perfumes'],
  'Royal Canin Siamese', 'Wet',
  'Very vocal, social, affectionate, talkative', 'Being ignored, closed doors, other cats',
  'breeder', 'Siamese Elegance', 'IT', '2021-08-01',
  'PetLife Insurance', 'PLI-2021-345678',
  'Milan Cat Hospital', '+39 02 12345678',
  true, NOW()
);

-- ============================================
-- PET 8: French Bulldog
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number, microchip_implantation_date,
  eu_passport_number, passport_issuing_country,
  color_markings, weight_kg, weight_date,
  known_conditions,
  diet_brand, diet_type, feeding_schedule,
  behavior_temperament,
  acquired_from, breeder_name, breeder_country, acquisition_date,
  insurance_provider, insurance_policy_number, insurance_emergency_hotline,
  primary_vet_clinic_name, primary_vet_phone, primary_vet_address,
  emergency_clinic_name, emergency_clinic_phone,
  countries_visited,
  data_processing_consent, consent_timestamp
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Jennifer Martinez', 'Dog', 'French Bulldog', 'Bella', '2023-02-14', 'Female', 'No',
  'Sweet and playful. Loves to cuddle. Can be stubborn.',
  '982000789012345', '2023-02-28',
  'FR-11111-2023', 'FR',
  'Brindle (brown with black stripes)', 12.5, '2024-10-12',
  ARRAY['Brachycephalic syndrome', 'Allergies'],
  'Hills Science Plan Small Breed', 'Dry', 'Three small meals: 8am, 2pm, 8pm',
  'Sweet, playful, sometimes stubborn, loves attention',
  'breeder', 'French Bulldog Paris', 'FR', '2023-03-10',
  'PetAssure', 'PA-2023-789012', '+33 800 123456',
  'Paris Pet Clinic', '+33 1 55555555', '15 Rue de Rivoli, 75001 Paris',
  'Paris Emergency', '+33 1 66666666',
  ARRAY['FR'], true, NOW()
);

-- ============================================
-- PET 9: Labrador Retriever
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number, microchip_implantation_date,
  color_markings, weight_kg, weight_date, height_withers_cm,
  allergies,
  diet_brand, feeding_schedule,
  behavior_temperament, behavior_notes,
  acquired_from, acquisition_date,
  primary_vet_clinic_name, primary_vet_phone,
  emergency_clinic_name,
  countries_visited,
  data_processing_consent, consent_timestamp, emergency_sharing_enabled
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Christopher Lee', 'Dog', 'Labrador Retriever', 'Charlie', '2019-09-30', 'Male', 'Yes',
  'Very friendly and gentle. Great with children. Loves water.',
  '982000890123456', '2019-10-10',
  'Black, shiny coat', 32.0, '2024-10-08', 57.0,
  ARRAY['Certain grains'],
  'Purina Pro Plan', 'Twice daily: 7am, 6pm',
  'Very friendly, gentle, loves people and water', 'Excellent with kids. Loves swimming and retrieving.',
  'private', '2019-11-01',
  'Hamburg Animal Care', '+49 40 12345678',
  'Hamburg Emergency Vet',
  ARRAY['DE', 'DK', 'NL'], true, NOW(), true
);

-- ============================================
-- PET 10: Ferret
-- ============================================
INSERT INTO public.pets (
  owner_id, owner_name, pet_type, breed, name, date_of_birth, sex, neutered_spayed, notes,
  microchip_number, microchip_implantation_date,
  color_markings, weight_kg, weight_date,
  known_conditions,
  diet_brand, diet_type, feeding_schedule,
  behavior_temperament, behavior_notes,
  acquired_from, acquisition_date,
  primary_vet_clinic_name, primary_vet_phone,
  emergency_clinic_name, emergency_clinic_phone,
  data_processing_consent, consent_timestamp
) VALUES (
  (SELECT id FROM auth.users LIMIT 1),
  'Amanda White', 'Ferret', 'Standard', 'Bandit', '2022-11-05', 'Male', 'Yes',
  'Very playful and curious. Requires daily exercise and stimulation.',
  '982000901234567', '2022-11-15',
  'Sable (brown with dark mask)', 1.2, '2024-09-30',
  ARRAY['Insulinoma (monitored)'],
  'Marshall Premium Ferret Diet', 'Dry pellets', 'Free feeding (small portions, multiple times)',
  'Playful, curious, energetic, mischievous',
  'Needs at least 4 hours out-of-cage time daily. Loves tunnels and toys.',
  'breeder', '2022-12-01',
  'Exotic Pet Clinic', '+49 30 44444444',
  'Berlin Exotic Emergency', '+49 30 55555555',
  true, NOW()
);

-- ============================================
-- Verify the inserts
-- ============================================
SELECT 
  name, 
  pet_type, 
  breed, 
  owner_name,
  microchip_number,
  eu_passport_number,
  weight_kg,
  completeness_score,
  created_at
FROM public.pets
ORDER BY created_at DESC
LIMIT 10;

