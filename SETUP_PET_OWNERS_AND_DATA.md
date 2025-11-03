# Setup Pet Owners and Insert Complete Pet Data

## 📋 **Prerequisites**

Before running the main SQL script, ensure:

1. ✅ **Users exist** with these credentials:
   - `lalit@petowner.com` / `lalit@123` (role: `pet_owner`)
   - `jaidev@petowner.com` / `jaidev@123` (role: `pet_owner`)
   - `mirea@petowner.com` / `mirea@123` (role: `pet_owner`)

2. ✅ **At least one clinic exists** in the `clinics` table

3. ✅ **Treatments system is set up** (run `RUN_THIS_IN_SUPABASE_TREATMENTS.sql` first)

---

## 🚀 **Quick Setup Steps**

### **Step 1: Verify Users Exist**

Run this query in Supabase SQL Editor:

```sql
SELECT id, email, raw_user_meta_data->>'role' as role
FROM auth.users
WHERE email IN ('lalit@petowner.com', 'jaidev@petowner.com', 'mirea@petowner.com');
```

**If users don't exist**, you need to create them first. You can:
- Use Supabase Dashboard → Authentication → Users → "Add User"
- Or use the Auth API to create users programmatically

### **Step 2: Verify Clinic Exists**

```sql
SELECT id, name, owner_id FROM clinics LIMIT 1;
```

You need at least one clinic. If none exists, create one via your application or directly:

```sql
-- Get a vet user ID first
SELECT id FROM auth.users WHERE raw_user_meta_data->>'role' = 'vet' LIMIT 1;

-- Then create a clinic (replace VET_USER_ID)
INSERT INTO clinics (
  name, city, address_line1, phone, email, owner_id, specialties
) VALUES (
  'Sample Clinic', 'Berlin', 'Main Street 1', '+49 30 12345678', 'clinic@example.com',
  'VET_USER_ID', ARRAY['General Practice']
);
```

### **Step 3: Run the Main Insert Script**

Execute the complete insert script:

```sql
-- Run: INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql
```

This will:
- ✅ Insert 6 pets (2 per user) with complete profiles
- ✅ Insert historical treatment records for each pet
- ✅ Create audit log entries

---

## 📊 **What Gets Inserted**

### **For Lalit Kumar (lalit@petowner.com):**

1. **Buddy** - Golden Retriever, Male, DOB: 2020-05-15
   - Complete profile with microchip, passport, insurance, etc.
   - 2 historical treatments:
     - Routine checkup (2 months ago)
     - Vaccination (1 month ago)

2. **Luna** - Persian Cat, Female, DOB: 2021-03-20
   - Complete profile
   - No historical treatments (new patient)

### **For Jaidev Singh (jaidev@petowner.com):**

1. **Max** - German Shepherd, Male, DOB: 2019-08-10
   - Complete profile with comprehensive details
   - 2 historical treatments:
     - Routine checkup (3 months ago)
     - Deworming (2 months ago)

2. **Charlie** - British Shorthair, Male, DOB: 2022-01-15
   - Complete profile
   - No historical treatments (new patient)

### **For Mirea Popescu (mirea@petowner.com):**

1. **Bella** - French Bulldog, Female, DOB: 2021-11-05
   - Complete profile with health conditions noted
   - 2 historical treatments:
     - Antiparasitic treatment (2 weeks ago)
     - Examination for skin irritation (1 week ago)

2. **Shadow** - Maine Coon, Male, DOB: 2020-09-12
   - Complete profile
   - 1 historical treatment:
     - Vaccination (1 month ago)

---

## ✅ **Verification**

After running the script, verify the data:

```sql
-- Check pets were created
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

-- Check treatments were created
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

-- Summary
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
```

Expected results:
- **lalit@petowner.com**: 2 pets, 2 treatments
- **jaidev@petowner.com**: 2 pets, 2 treatments
- **mirea@petowner.com**: 2 pets, 3 treatments

---

## 🐛 **Troubleshooting**

### **Error: "User not found"**

**Solution:**
1. Check if users exist:
   ```sql
   SELECT id, email FROM auth.users WHERE email LIKE '%petowner%';
   ```
2. If users don't exist, create them via Supabase Dashboard → Authentication → Users

### **Error: "No clinic found"**

**Solution:**
1. Check if clinics exist:
   ```sql
   SELECT id, name, owner_id FROM clinics;
   ```
2. Create a clinic if none exists (see Step 2 above)

### **Error: "Table 'treatments' does not exist"**

**Solution:**
Run the treatments system migration first:
```sql
-- Execute: RUN_THIS_IN_SUPABASE_TREATMENTS.sql
```

### **Error: Foreign key constraint violation**

**Solution:**
- Ensure all referenced tables exist (pets, clinics, auth.users)
- Verify the UUIDs are correct
- Check that users have the correct role

---

## 📝 **Data Details**

### **Pet Profiles Include:**
- ✅ Basic info (name, type, breed, DOB, sex, neutered status)
- ✅ Microchip information
- ✅ EU Passport details
- ✅ Physical characteristics (color, weight, height)
- ✅ Health information (conditions, allergies)
- ✅ Diet and feeding schedule
- ✅ Behavior and temperament
- ✅ Ownership and provenance (breeder/rescue info)
- ✅ Insurance details
- ✅ Veterinary contacts
- ✅ Emergency contacts
- ✅ Travel information
- ✅ Completeness scores (calculated automatically)

### **Treatment Records Include:**
- ✅ SOAP notes (Subjective, Objective, Assessment, Plan)
- ✅ Vital signs
- ✅ Vaccination details (for vaccination treatments)
- ✅ Deworming details (for deworming treatments)
- ✅ Antiparasitic details (for antiparasitic treatments)
- ✅ Medications prescribed
- ✅ Diagnostic tests
- ✅ Certificates issued
- ✅ Follow-up instructions
- ✅ Complete audit trail

---

## 🎯 **Next Steps**

After successful insertion:

1. **Login as each pet owner** and verify:
   - Pets appear in their dashboard
   - Pet cards show all information
   - Medical history displays treatments

2. **Test treatment viewing:**
   - Navigate to pet details
   - View medical history
   - Check that treatments are displayed correctly

3. **Test vet functionality:**
   - Login as vet
   - View appointments
   - Start new treatment for these pets
   - Verify "Previous Records" shows historical treatments

---

## 📚 **File Reference**

- **Main Script:** `INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql`
- **This Guide:** `SETUP_PET_OWNERS_AND_DATA.md`
- **Treatments Setup:** `RUN_THIS_IN_SUPABASE_TREATMENTS.sql`

---

## ✅ **Success Checklist**

- [ ] Users exist and can login
- [ ] At least one clinic exists
- [ ] Treatments system is set up
- [ ] SQL script executed without errors
- [ ] 6 pets created (2 per user)
- [ ] 7 treatments created across pets
- [ ] Audit logs created
- [ ] Verification queries return expected results
- [ ] Users can login and see their pets
- [ ] Medical history displays correctly

---

**Ready to proceed?** Run `INSERT_PETS_AND_TREATMENTS_FOR_USERS.sql` in Supabase SQL Editor!
