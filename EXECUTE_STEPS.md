# Step-by-Step Execution Guide

## 🚨 **ERROR RESOLUTION: "No clinic found"**

This error occurs because the script requires at least one clinic to exist in the database.

---

## ✅ **Step-by-Step Execution**

### **STEP 1: Verify Users Exist**

Run this query first to check if your pet owner users exist:

```sql
SELECT 
  id, 
  email,
  raw_user_meta_data->>'role' as role,
  created_at
FROM auth.users
WHERE email IN ('lalit@petowner.com', 'jaidev@petowner.com', 'mirea@petowner.com');
```

**Expected Result:** Should show 3 rows with the pet owner emails.

**If users don't exist:**
- You need to create them via Supabase Dashboard → Authentication → Users
- Or use the Auth API

---

### **STEP 2: Create Clinic (REQUIRED)**

**Run this script:** `STEP1_CREATE_CLINIC_FIRST.sql`

Or manually run:

```sql
-- Check if clinics exist
SELECT COUNT(*) as clinic_count FROM clinics;

-- If count is 0, create a clinic
-- First, get a vet user ID (or use any user)
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE raw_user_meta_data->>'role' = 'vet'
LIMIT 1;

-- If no vet exists, use any user
SELECT id, email FROM auth.users LIMIT 1;

-- Create clinic (replace USER_ID with actual ID from above)
INSERT INTO clinics (
  name,
  city,
  address_line1,
  postal_code,
  phone,
  email,
  owner_id,
  specialties
) VALUES (
  'VetCare Animal Clinic',
  'Berlin',
  'Main Street 123',
  '10115',
  '+49 30 12345678',
  'info@vetcare-clinic.de',
  'USER_ID_HERE',  -- Replace with actual user ID
  ARRAY['General Practice', 'Surgery', 'Emergency Care']
) RETURNING id, name, owner_id;
```

**Verify clinic was created:**

```sql
SELECT 
  id,
  name,
  city,
  owner_id,
  (SELECT email FROM auth.users WHERE id = clinics.owner_id) as owner_email
FROM clinics;
```

---

### **STEP 3: Verify Treatments System is Set Up**

Check if the treatments table exists:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name = 'treatments';
```

**If table doesn't exist:**
- Run `RUN_THIS_IN_SUPABASE_TREATMENTS.sql` first

---

### **STEP 4: Run Main Insert Script**

**Execute:** `INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql`

This will:
- ✅ Insert 6 pets (2 per user)
- ✅ Insert 7 historical treatment records
- ✅ Create audit log entries

---

### **STEP 5: Verify Results**

Run these verification queries:

#### **5.1: Check Pets Were Created**

```sql
SELECT 
  u.email,
  p.name as pet_name,
  p.pet_type,
  p.breed,
  p.completeness_score
FROM auth.users u
JOIN pets p ON p.owner_id = u.id
WHERE u.email IN ('lalit@petowner.com', 'jaidev@petowner.com', 'mirea@petowner.com')
ORDER BY u.email, p.name;
```

**Expected:** 6 rows (2 pets per user)

#### **5.2: Check Treatments Were Created**

```sql
SELECT 
  u.email,
  p.name as pet_name,
  t.treatment_type,
  t.diagnosis,
  t.treatment_date
FROM auth.users u
JOIN pets p ON p.owner_id = u.id
JOIN treatments t ON t.pet_id = p.id
WHERE u.email IN ('lalit@petowner.com', 'jaidev@petowner.com', 'mirea@petowner.com')
ORDER BY u.email, p.name, t.treatment_date DESC;
```

**Expected:** 7 rows (various treatments across pets)

#### **5.3: Summary**

```sql
SELECT 
  u.email as owner_email,
  COUNT(DISTINCT p.id) as pet_count,
  COUNT(DISTINCT t.id) as treatment_count,
  STRING_AGG(DISTINCT p.name, ', ') as pet_names
FROM auth.users u
LEFT JOIN pets p ON p.owner_id = u.id
LEFT JOIN treatments t ON t.pet_id = p.id
WHERE u.email IN ('lalit@petowner.com', 'jaidev@petowner.com', 'mirea@petowner.com')
GROUP BY u.email
ORDER BY u.email;
```

**Expected Results:**
- **lalit@petowner.com**: 2 pets, 2 treatments
- **jaidev@petowner.com**: 2 pets, 2 treatments  
- **mirea@petowner.com**: 2 pets, 3 treatments

---

## 🔧 **Quick Fix Script**

If you want to run everything in one go, here's a combined script:

```sql
-- ============================================
-- COMPLETE SETUP: Clinic + Pets + Treatments
-- ============================================

DO $$
DECLARE
  v_lalit_id uuid;
  v_jaidev_id uuid;
  v_mirea_id uuid;
  v_clinic_id uuid;
  v_vet_id uuid;
  v_clinic_count integer;
BEGIN
  -- Get user IDs
  SELECT id INTO v_lalit_id FROM auth.users WHERE email = 'lalit@petowner.com' LIMIT 1;
  SELECT id INTO v_jaidev_id FROM auth.users WHERE email = 'jaidev@petowner.com' LIMIT 1;
  SELECT id INTO v_mirea_id FROM auth.users WHERE email = 'mirea@petowner.com' LIMIT 1;
  
  -- Check for clinic
  SELECT COUNT(*) INTO v_clinic_count FROM clinics;
  
  -- Create clinic if it doesn't exist
  IF v_clinic_count = 0 THEN
    -- Get any user to be clinic owner (preferably vet)
    SELECT id INTO v_vet_id 
    FROM auth.users 
    WHERE raw_user_meta_data->>'role' = 'vet'
    LIMIT 1;
    
    IF v_vet_id IS NULL THEN
      SELECT id INTO v_vet_id FROM auth.users LIMIT 1;
    END IF;
    
    INSERT INTO clinics (
      name, city, address_line1, postal_code, phone, email, owner_id, specialties
    ) VALUES (
      'VetCare Animal Clinic',
      'Berlin',
      'Main Street 123',
      '10115',
      '+49 30 12345678',
      'info@vetcare-clinic.de',
      v_vet_id,
      ARRAY['General Practice', 'Surgery', 'Emergency Care']
    ) RETURNING id INTO v_clinic_id;
    
    RAISE NOTICE '✅ Clinic created: %', v_clinic_id;
  ELSE
    SELECT id, owner_id INTO v_clinic_id, v_vet_id FROM clinics LIMIT 1;
    RAISE NOTICE '✅ Using existing clinic: %', v_clinic_id;
  END IF;
  
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
  
  IF v_clinic_id IS NULL OR v_vet_id IS NULL THEN
    RAISE EXCEPTION 'Failed to get clinic and vet. Please check your database.';
  END IF;
  
  RAISE NOTICE '✅ All prerequisites met. Ready to insert pets and treatments.';
  RAISE NOTICE 'Lalit ID: %', v_lalit_id;
  RAISE NOTICE 'Jaidev ID: %', v_jaidev_id;
  RAISE NOTICE 'Mirea ID: %', v_mirea_id;
  RAISE NOTICE 'Clinic ID: %', v_clinic_id;
  RAISE NOTICE 'Vet ID: %', v_vet_id;
  
END $$;
```

Then proceed with the main insert script.

---

## 🐛 **Troubleshooting**

### **Issue: "User not found"**

**Solution:**
```sql
-- Check if users exist
SELECT id, email FROM auth.users WHERE email LIKE '%petowner%';

-- If they don't exist, create them via Supabase Dashboard
```

### **Issue: "Table 'treatments' does not exist"**

**Solution:**
```sql
-- Run this first:
-- Execute: RUN_THIS_IN_SUPABASE_TREATMENTS.sql
```

### **Issue: "Foreign key constraint violation"**

**Solution:**
- Verify all referenced tables exist
- Check that users have correct IDs
- Ensure clinic was created successfully

---

## 📋 **Execution Checklist**

- [ ] Users exist (lalit, jaidev, mirea)
- [ ] At least one clinic exists (or created via STEP1)
- [ ] Treatments table exists
- [ ] Run INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql
- [ ] Verify 6 pets created
- [ ] Verify 7 treatments created
- [ ] Check audit logs exist
- [ ] Test login as pet owners
- [ ] Verify pets appear in dashboard
- [ ] Verify treatments appear in medical history

---

**Ready to proceed?** Follow the steps above in order!
