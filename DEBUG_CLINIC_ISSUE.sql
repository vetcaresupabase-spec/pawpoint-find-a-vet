-- ============================================
-- DEBUG: Clinic Table Structure and Data
-- ============================================
-- Run this to diagnose the UUID conversion error
-- ============================================

-- 1. Check clinics table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'clinics'
ORDER BY ordinal_position;

-- 2. Check existing clinics (if any)
SELECT 
  id,
  name,
  owner_id,
  city,
  created_at
FROM clinics
ORDER BY created_at DESC
LIMIT 5;

-- 3. Check if there's a clinic with problematic name
SELECT 
  id,
  name,
  owner_id,
  CASE 
    WHEN id::text != id::uuid::text THEN 'UUID MISMATCH'
    ELSE 'OK'
  END as uuid_check
FROM clinics
WHERE name LIKE '%Happy Paws%'
   OR name LIKE '%Veterinary%';

-- 4. Test SELECT INTO (safe test)
DO $$
DECLARE
  v_test_clinic_id uuid;
  v_test_vet_id uuid;
BEGIN
  -- Try to select from clinics
  SELECT clinics.id, clinics.owner_id 
  INTO v_test_clinic_id, v_test_vet_id 
  FROM clinics 
  LIMIT 1;
  
  IF v_test_clinic_id IS NULL THEN
    RAISE NOTICE 'No clinics found in database';
  ELSE
    RAISE NOTICE 'Found clinic: ID = %, Owner ID = %', v_test_clinic_id, v_test_vet_id;
    
    -- Verify these are valid UUIDs
    IF v_test_clinic_id IS NULL OR v_test_vet_id IS NULL THEN
      RAISE EXCEPTION 'Selected values are NULL';
    END IF;
    
    RAISE NOTICE 'Both IDs are valid UUIDs';
  END IF;
EXCEPTION
  WHEN invalid_text_representation THEN
    RAISE NOTICE 'ERROR: Invalid UUID format detected';
  WHEN OTHERS THEN
    RAISE NOTICE 'ERROR: % - %', SQLSTATE, SQLERRM;
END $$;

-- 5. Check users table (for vet)
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'vet'
LIMIT 5;

-- If no vet, show any user
SELECT 
  id,
  email,
  raw_user_meta_data->>'role' as role
FROM auth.users
LIMIT 5;

