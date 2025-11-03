# 🎯 Manual Migration Guide - Run in Supabase Dashboard

Follow these steps **exactly** to enable the pet management feature.

---

## 📋 Prerequisites

1. ✅ Access to your Supabase project dashboard
2. ✅ Admin/owner permissions
3. ✅ 5 minutes of time

---

## 🚀 Step-by-Step Instructions

### STEP 1: Update Pets Table (3 minutes)

#### 1.1 Open Supabase SQL Editor
1. Go to your Supabase project dashboard
2. Click **SQL Editor** in the left sidebar
3. Click **New Query**

#### 1.2 Run the Migration
1. Open the file: `RUN_THIS_IN_SUPABASE_STEP1.sql`
2. **Copy ALL the SQL code** (Ctrl+A, Ctrl+C)
3. **Paste** into the Supabase SQL Editor
4. Click **Run** button (or press F5)

#### 1.3 Verify Success
You should see a result showing all the columns in the pets table, including:
- ✅ `owner_name`
- ✅ `pet_type`
- ✅ `breed`
- ✅ `sex`
- ✅ `neutered_spayed`
- ✅ `photo_url`

If you see an error, **don't panic!** Common issues:
- If "column already exists" → That's OK, it means it's already done
- If "table pets does not exist" → See troubleshooting below

---

### STEP 2: Create Storage Bucket (2 minutes)

#### 2.1 Open New Query
1. Still in **SQL Editor**
2. Click **New Query** (or use the same query window)

#### 2.2 Run the Storage Setup
1. Open the file: `RUN_THIS_IN_SUPABASE_STEP2.sql`
2. **Copy ALL the SQL code**
3. **Paste** into the Supabase SQL Editor
4. Click **Run** button

#### 2.3 Verify Success
You should see two results:
1. **Bucket created**: Shows `pet-photos` with `public = true`
2. **Policies created**: Shows 4 policies for pet photos

#### 2.4 Check in Storage UI (Optional but Recommended)
1. Click **Storage** in left sidebar
2. You should see **pet-photos** bucket listed
3. It should show "Public" badge

---

## ✅ Verification Steps

### 1. Check Pets Table Structure
Run this query in SQL Editor:
```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'pets'
ORDER BY ordinal_position;
```

**Expected columns:**
```
id              | uuid      | NO
owner_id        | uuid      | NO
owner_name      | text      | NO
pet_type        | text      | NO
breed           | text      | NO
name            | text      | YES
date_of_birth   | date      | YES
sex             | text      | YES
neutered_spayed | text      | YES
photo_url       | text      | YES
notes           | text      | YES
created_at      | timestamp | NO
updated_at      | timestamp | NO
```

### 2. Check Storage Bucket
Run this query:
```sql
SELECT id, name, public FROM storage.buckets WHERE id = 'pet-photos';
```

**Expected result:**
```
id          | name        | public
pet-photos  | pet-photos  | true
```

### 3. Check RLS Policies
Run this query:
```sql
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'objects' 
  AND policyname LIKE '%pet photos%';
```

**Expected policies (4 total):**
1. Pet owners can upload their pet photos
2. Anyone can view pet photos
3. Pet owners can update their pet photos
4. Pet owners can delete their pet photos

---

## 🎉 Success Confirmation

If all verification steps pass, you're done! ✅

**Test the feature:**
1. Go to your app: http://localhost:8080
2. Login as a pet owner
3. Click "Add a Pet"
4. Fill the form and upload a photo
5. Your pet should appear in "My Pets" tab

---

## ⚠️ Troubleshooting

### Error: "table pets does not exist"

This means the pets table wasn't created in the initial migrations. Run this first:

```sql
-- Create pets table
CREATE TABLE IF NOT EXISTS public.pets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  species TEXT NOT NULL,
  breed TEXT,
  date_of_birth DATE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own pets"
  ON public.pets FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own pets"
  ON public.pets FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own pets"
  ON public.pets FOR UPDATE
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own pets"
  ON public.pets FOR DELETE
  USING (auth.uid() = owner_id);
```

Then run STEP 1 again.

### Error: "column already exists"

This is **normal** if you've run the migration before. The `IF NOT EXISTS` clauses should prevent errors, but if you see this, it means the column is already there. Continue to the next step.

### Error: "policy already exists"

This happens if you run STEP 2 multiple times. The script includes `DROP POLICY IF EXISTS` to handle this, but if you still see the error:

1. Go to **Database** → **Policies** in Supabase dashboard
2. Find the `storage.objects` table
3. Delete any policies with "pet photos" in the name
4. Run STEP 2 again

### Error: "permission denied"

Make sure you're logged in as the project owner or have admin permissions in Supabase.

### Storage bucket not showing in UI

1. Refresh the Supabase dashboard page
2. Check the **Storage** section again
3. If still not there, run this query:
   ```sql
   SELECT * FROM storage.buckets WHERE id = 'pet-photos';
   ```
4. If the query returns a row, the bucket exists even if UI doesn't show it

---

## 🔄 If You Need to Start Over

If something went wrong and you want to reset:

```sql
-- WARNING: This will delete all pet data!

-- Drop the pets table columns (careful!)
ALTER TABLE public.pets DROP COLUMN IF EXISTS owner_name CASCADE;
ALTER TABLE public.pets DROP COLUMN IF EXISTS pet_type CASCADE;
ALTER TABLE public.pets DROP COLUMN IF EXISTS breed CASCADE;
ALTER TABLE public.pets DROP COLUMN IF EXISTS sex CASCADE;
ALTER TABLE public.pets DROP COLUMN IF EXISTS neutered_spayed CASCADE;
ALTER TABLE public.pets DROP COLUMN IF EXISTS photo_url CASCADE;

-- Delete storage bucket (removes all photos!)
DELETE FROM storage.buckets WHERE id = 'pet-photos';

-- Drop policies
DROP POLICY IF EXISTS "Pet owners can upload their pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Anyone can view pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Pet owners can update their pet photos" ON storage.objects;
DROP POLICY IF EXISTS "Pet owners can delete their pet photos" ON storage.objects;
```

Then run STEP 1 and STEP 2 again.

---

## 📞 Need Help?

If you're still having issues:

1. **Check Supabase Logs**: Database → Logs
2. **Copy the exact error message**
3. **Check which step failed** (Step 1 or Step 2)
4. **Take a screenshot** of the error

Common issues are usually:
- ✅ Permissions (not project owner)
- ✅ Wrong project (check project name)
- ✅ Already migrated (run verification steps)

---

## 📊 What Each Step Does

### Step 1 - Update Pets Table
- Adds new columns for comprehensive pet info
- Migrates old `species` column to new `breed` column
- Makes pet `name` optional instead of required
- Adds database constraints for data validation
- Creates indexes for better query performance

### Step 2 - Create Storage Bucket
- Creates `pet-photos` bucket for storing images
- Sets bucket as public (for viewing photos)
- Creates RLS policies for security:
  - Authenticated users can upload
  - Everyone can view
  - Authenticated users can update/delete their own

---

## ✨ After Migration

Once both steps are complete:

1. ✅ Pet owners can add pets with photos
2. ✅ Photos are stored securely in Supabase Storage
3. ✅ Only pet owners can see their own pets
4. ✅ Age is calculated automatically from birth date
5. ✅ Responsive design works on all devices

---

## 🎯 Quick Command Summary

```sql
-- Step 1: Run RUN_THIS_IN_SUPABASE_STEP1.sql
-- Step 2: Run RUN_THIS_IN_SUPABASE_STEP2.sql

-- Verify pets table
SELECT column_name FROM information_schema.columns WHERE table_name = 'pets';

-- Verify storage bucket
SELECT * FROM storage.buckets WHERE id = 'pet-photos';

-- Verify policies
SELECT policyname FROM pg_policies WHERE policyname LIKE '%pet photos%';
```

---

**Total Time**: 5 minutes  
**Difficulty**: Easy (copy & paste)  
**Risk**: Low (safe migrations with IF NOT EXISTS)

**Ready?** Start with Step 1! 🚀

