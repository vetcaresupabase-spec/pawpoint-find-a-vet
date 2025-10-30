-- Seed test users and clinics for PawPoint
-- 3 pet owners + 10 vets with clinics

-- Note: Supabase auth.users can only be created via the signUp API or admin API
-- This script creates the clinics; users must be created via Auth

-- Pet owner test accounts (create via Supabase Auth or signUp API):
-- 1. lalit@petowner.com / lalit@123 (role: pet_owner)
-- 2. jaidev@petowner.com / jaidev@123 (role: pet_owner)
-- 3. mirea@petowner.com / mirea@123 (role: pet_owner)

-- Vet test accounts with clinics (create via Supabase Auth or signUp API):
-- Berlin (5 vets)
-- 1. berlin1@vet.com / berlin@123 → Happy Paws Berlin
-- 2. berlin2@vet.com / berlin@123 → Tierarzt am Alex
-- 3. berlin3@vet.com / berlin@123 → Berlin Pet Clinic
-- 4. berlin4@vet.com / berlin@123 → Vet Center Mitte
-- 5. berlin5@vet.com / berlin@123 → Tierklinik Prenzlauer Berg

-- Munich (3 vets)
-- 6. munich1@vet.com / munich@123 → München Tierklinik
-- 7. munich2@vet.com / munich@123 → Vet Practice Bavaria
-- 8. munich3@vet.com / munich@123 → Pet Care München

-- Hamburg (2 vets)
-- 9. hamburg1@vet.com / hamburg@123 → Hamburg Animal Hospital
-- 10. hamburg2@vet.com / hamburg@123 → Tierklinik Elbe

-- Insert clinics (without owner_id for now; link after user creation)
insert into public.clinics (name, description, city, address_line1, phone, email, languages, specialties, verified) values
('Happy Paws Berlin', 'Full-service small animal clinic in central Berlin', 'Berlin', 'Alexanderplatz 1', '+49 30 11111111', 'berlin1@vet.com', array['German','English'], array['Dogs','Cats'], true),
('Tierarzt am Alex', 'Emergency vet and routine care', 'Berlin', 'Karl-Marx-Allee 45', '+49 30 22222222', 'berlin2@vet.com', array['German'], array['All Animals'], true),
('Berlin Pet Clinic', 'Specialized in exotic pets', 'Berlin', 'Friedrichstraße 88', '+49 30 33333333', 'berlin3@vet.com', array['German','English'], array['Exotic Animals','Birds'], true),
('Vet Center Mitte', '24/7 emergency and surgery', 'Berlin', 'Unter den Linden 10', '+49 30 44444444', 'berlin4@vet.com', array['German','English'], array['Dogs','Cats','Surgery'], true),
('Tierklinik Prenzlauer Berg', 'Friendly neighborhood vet', 'Berlin', 'Schönhauser Allee 99', '+49 30 55555555', 'berlin5@vet.com', array['German'], array['Dogs','Cats'], true),

('München Tierklinik', 'Modern vet practice in Munich', 'Munich', 'Marienplatz 5', '+49 89 11111111', 'munich1@vet.com', array['German','English'], array['Dogs','Cats','Surgery'], true),
('Vet Practice Bavaria', 'Family-run veterinary clinic', 'Munich', 'Sendlinger Str. 20', '+49 89 22222222', 'munich2@vet.com', array['German'], array['All Animals'], true),
('Pet Care München', 'Holistic and wellness care', 'Munich', 'Leopoldstraße 77', '+49 89 33333333', 'munich3@vet.com', array['German','English'], array['Dogs','Cats','Wellness'], true),

('Hamburg Animal Hospital', 'Leading animal hospital in Hamburg', 'Hamburg', 'Reeperbahn 12', '+49 40 11111111', 'hamburg1@vet.com', array['German','English'], array['All Animals','Surgery'], true),
('Tierklinik Elbe', 'Compassionate care near the harbor', 'Hamburg', 'Hafenstraße 88', '+49 40 22222222', 'hamburg2@vet.com', array['German'], array['Dogs','Cats'], true);

-- Add services for first clinic as example
with c as (select id from public.clinics where email = 'berlin1@vet.com' limit 1)
insert into public.clinic_services (clinic_id, name, description, price_min, price_max)
select id, 'General Checkup', 'Routine examination', 40, 70 from c
union all select id, 'Vaccination', 'Standard vaccines', 50, 90 from c
union all select id, 'Dental Cleaning', 'Professional teeth cleaning', 100, 150 from c;

-- Add hours for first clinic as example
with c as (select id from public.clinics where email = 'berlin1@vet.com' limit 1)
insert into public.clinic_hours (clinic_id, day, opens, closes)
select id, 'mon', '08:00', '18:00' from c
union all select id, 'tue', '08:00', '18:00' from c
union all select id, 'wed', '08:00', '18:00' from c
union all select id, 'thu', '08:00', '18:00' from c
union all select id, 'fri', '08:00', '18:00' from c
union all select id, 'sat', '09:00', '13:00' from c;

