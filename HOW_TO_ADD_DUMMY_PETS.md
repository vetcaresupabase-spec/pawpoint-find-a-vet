# How to Add 10 Dummy Pets - Quick Guide

## 🎯 Purpose
This guide helps you quickly populate your database with 10 comprehensive pet records for testing the Pet Passport feature.

---

## 📋 Prerequisites

1. ✅ All database migrations have been run:
   - Step 1: `RUN_THIS_IN_SUPABASE_STEP1.sql` ✅
   - Step 2: `RUN_THIS_IN_SUPABASE_STEP2.sql` ✅
   - Step 3: `RUN_THIS_IN_SUPABASE_STEP3_COMPREHENSIVE_PASSPORT.sql` ✅

2. ✅ You have at least one user account created in Supabase

---

## 🚀 Quick Steps

### Step 1: Find Your Owner ID

1. Go to **Supabase Dashboard**
2. Navigate to **Authentication** → **Users**
3. Copy one of the user IDs (UUID format)
   - Or find by email: Look for `lalit@petowner.com` or any pet owner account

### Step 2: Update the SQL File

1. Open `DUMMY_PETS_QUICK_INSERT.sql` in your editor
2. Find this line (appears multiple times):
   ```sql
   (SELECT id FROM auth.users LIMIT 1),
   ```
3. Replace with your actual user ID:
   ```sql
   '123e4567-e89b-12d3-a456-426614174000',  -- Replace with your UUID
   ```
4. Or keep the `(SELECT id FROM auth.users LIMIT 1)` if you want to use the first user

### Step 3: Run in Supabase SQL Editor

1. Go to **Supabase Dashboard** → **SQL Editor**
2. Click **New Query**
3. Open `DUMMY_PETS_QUICK_INSERT.sql`
4. Copy ALL the SQL code
5. Paste into SQL Editor
6. Click **Run** (or press F5)

### Step 4: Verify

Run this query to verify all pets were inserted:
```sql
SELECT 
  name, 
  pet_type, 
  breed, 
  owner_name,
  microchip_number,
  eu_passport_number,
  weight_kg,
  completeness_score
FROM public.pets
ORDER BY created_at DESC
LIMIT 10;
```

---

## 📊 What You'll Get

### 10 Diverse Pet Profiles

1. **Buddy** - Golden Retriever (Male, Full Profile)
   - Complete EU Passport details
   - Microchip, weight, height
   - Known conditions & allergies
   - Insurance, vet contacts
   - Travel history

2. **Princess** - Persian Cat (Female, Full Profile)
   - Complete passport info
   - Health conditions
   - Rescue origin
   - Insurance details

3. **Max** - Mixed Breed (Male, Minimal Profile)
   - Only basic fields filled
   - Shows how minimal profiles look

4. **Rex** - German Shepherd (Male, Full Profile)
   - Complete profile
   - Current medications (JSONB)
   - Past surgeries (JSONB)
   - Registration papers

5. **Winston** - British Shorthair (Male)
   - Passport details
   - Insurance info
   - Breeder information

6. **Luna** - Border Collie (Female)
   - Allergies
   - Detailed behavior notes
   - Travel history

7. **Mimi** - Siamese Cat (Female)
   - Health conditions
   - Multiple allergies
   - Insurance details

8. **Bella** - French Bulldog (Female)
   - Brachycephalic conditions
   - Complete passport
   - Emergency contacts

9. **Charlie** - Labrador Retriever (Male)
   - Minimal passport info
   - Travel to multiple countries

10. **Bandit** - Ferret (Male)
    - Exotic pet example
    - Specialized diet
    - Health monitoring

---

## 🔍 Data Coverage

Each pet includes different combinations of:
- ✅ Basic info (Owner, Type, Breed, Name, DOB, Sex)
- ✅ EU Passport fields (Microchip, Passport number, Country)
- ✅ Health metrics (Weight, Height, Color)
- ✅ Conditions & Allergies (arrays)
- ✅ Diet information
- ✅ Behavior details
- ✅ Ownership provenance (Breeder/Rescue/Private)
- ✅ Insurance details
- ✅ Veterinary contacts
- ✅ Emergency contacts
- ✅ Travel history
- ✅ Privacy settings

---

## 💡 Tips

### For Testing Different Scenarios

1. **Test Completeness Score**
   - Compare Buddy (full profile) vs Max (minimal profile)
   - See how completeness score varies

2. **Test Pet Card Display**
   - Cards show different information based on what's filled
   - Minimal profiles show less, full profiles show more

3. **Test Edit Functionality**
   - Edit any pet to add more details
   - Watch completeness score update

4. **Test Search/Filter**
   - Search by breed, type, microchip number
   - Filter by completeness score

---

## ⚠️ Troubleshooting

### Error: "owner_id does not exist"
**Solution**: Make sure you replaced the owner_id placeholder with a valid UUID

### Error: "column does not exist"
**Solution**: Make sure you ran Step 3 migration (comprehensive passport fields)

### Error: "permission denied"
**Solution**: Make sure you're running as a database admin or the pet owner

### No pets showing in UI
**Solution**: 
1. Check if pets exist: `SELECT COUNT(*) FROM pets;`
2. Verify you're logged in as the same user who owns the pets
3. Check RLS policies are correct

---

## 🔄 Alternative: Add Pets via UI

You can also add pets manually through the UI:
1. Login to your app
2. Go to "My Pets" tab
3. Click "Add Pet"
4. Fill the comprehensive form
5. Submit

The UI form is the same as the database - whatever you fill will be saved!

---

## 📝 Notes

- All dates are realistic (past dates for older pets)
- Microchip numbers follow ISO format (15 digits starting with 982)
- Passport numbers follow country-specific formats
- Phone numbers use country codes (+49 for Germany, +33 for France, etc.)
- Countries use ISO 3166-1 alpha-2 codes (DE, FR, GB, IT, etc.)
- JSONB fields (medications, surgeries) are properly formatted

---

## ✅ Success Criteria

After running the SQL:
- ✅ You should see 10 pets in the query result
- ✅ Each pet has different data coverage
- ✅ Completeness scores vary (0-100%)
- ✅ Pets appear in your app's "My Pets" tab
- ✅ Pet Cards show different information based on what's filled

---

**Ready?** Open `DUMMY_PETS_QUICK_INSERT.sql`, update the owner_id, and run it! 🚀

