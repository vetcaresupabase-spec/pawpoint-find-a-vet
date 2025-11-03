# Pet Management Setup Guide

## Quick Setup Instructions

Follow these steps to enable the pet management feature in your PawPoint application.

---

## Step 1: Run Database Migrations

### Option A: Using Supabase CLI (Recommended)
```bash
cd pawpoint-find-a-vet
supabase migration up
```

This will run both migrations:
- `20251103000000_update_pets_table.sql` - Updates pets table schema
- `20251103000001_create_pet_photos_bucket.sql` - Creates storage bucket

### Option B: Using Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy contents from `supabase/migrations/20251103000000_update_pets_table.sql`
5. Run the query
6. Repeat for `supabase/migrations/20251103000001_create_pet_photos_bucket.sql`

---

## Step 2: Verify Storage Bucket

### Using Supabase Dashboard
1. Navigate to **Storage** in your Supabase dashboard
2. Verify `pet-photos` bucket exists
3. Check bucket settings:
   - ✅ Public: **Yes** (for viewing photos)
   - ✅ File size limit: **5MB**
   - ✅ Allowed MIME types: `image/*`

### Manual Bucket Creation (if needed)
If the bucket doesn't exist, create it manually:

1. Go to **Storage** → **New Bucket**
2. Bucket name: `pet-photos`
3. Public bucket: **Yes**
4. Click **Create Bucket**

Then add these policies via SQL Editor:

```sql
-- Upload policy
CREATE POLICY "Pet owners can upload their pet photos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'pet-photos'
);

-- View policy
CREATE POLICY "Anyone can view pet photos"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'pet-photos');

-- Update policy
CREATE POLICY "Pet owners can update their pet photos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'pet-photos');

-- Delete policy
CREATE POLICY "Pet owners can delete their pet photos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'pet-photos');
```

---

## Step 3: Verify RLS Policies

### Check Pets Table Policies
Run this query in SQL Editor:

```sql
SELECT * FROM pg_policies WHERE tablename = 'pets';
```

You should see 4 policies:
1. ✅ Users can view their own pets
2. ✅ Users can create their own pets
3. ✅ Users can update their own pets
4. ✅ Users can delete their own pets

### Check Storage Policies
```sql
SELECT * FROM pg_policies WHERE tablename = 'objects';
```

You should see policies for `pet-photos` bucket.

---

## Step 4: Test the Feature

### 1. Start Local Development Server
```bash
cd pawpoint-find-a-vet
npm run dev
```

### 2. Login as Pet Owner
- Navigate to http://localhost:8080
- Click **Log in**
- Use test credentials or create new account

### 3. Add a Pet
1. Go to dashboard
2. Click **Add a Pet** card or navigate to **My Pets** tab
3. Fill in the form:
   - ✅ Owner Name: "John Doe"
   - ✅ Pet Type: "Dog"
   - ✅ Breed: "Golden Retriever"
   - 🌟 Pet Name: "Max"
   - 🌟 Date of Birth: Select a date
   - Upload a photo (optional)
4. Click **Add Pet**

### 4. Verify Pet Card
- Pet should appear in **My Pets** tab
- Photo should display (or avatar if no photo)
- Age should calculate correctly
- All information should be visible

### 5. Test Delete
- Click three-dot menu on pet card
- Select **Delete**
- Confirm deletion
- Pet should be removed from list

---

## Step 5: Troubleshooting

### Issue: "Permission denied for table pets"
**Solution**: RLS policies may not be set correctly

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables WHERE tablename = 'pets';

-- If not enabled, enable it
ALTER TABLE public.pets ENABLE ROW LEVEL SECURITY;

-- Re-run the policies from migration file
```

### Issue: "Storage bucket not found"
**Solution**: Create bucket manually (see Step 2)

### Issue: "Photo upload failed"
**Solution**: Check storage policies

```sql
-- List all storage policies
SELECT * FROM pg_policies WHERE tablename = 'objects';

-- If missing, run the policies from Step 2
```

### Issue: "Age not calculating"
**Solution**: Ensure `date-fns` is installed

```bash
npm install date-fns
```

### Issue: Pet card not displaying
**Solution**: Check browser console for errors
- Open DevTools (F12)
- Check Console tab
- Check Network tab for failed requests

---

## Step 6: Verify Database Schema

Run this query to verify the pets table structure:

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'pets'
ORDER BY ordinal_position;
```

Expected columns:
```
id              | uuid      | NO  | gen_random_uuid()
owner_id        | uuid      | NO  | 
owner_name      | text      | NO  | ''
pet_type        | text      | NO  | 'Dog'
breed           | text      | NO  | ''
name            | text      | YES | NULL
date_of_birth   | date      | YES | NULL
sex             | text      | YES | 'Unknown'
neutered_spayed | text      | YES | 'Unknown'
photo_url       | text      | YES | NULL
notes           | text      | YES | NULL
created_at      | timestamptz | NO | now()
updated_at      | timestamptz | NO | now()
```

---

## Success Checklist

Use this checklist to verify everything is working:

### Database
- [ ] Pets table has new columns (owner_name, pet_type, sex, etc.)
- [ ] RLS policies are enabled on pets table
- [ ] Storage bucket `pet-photos` exists
- [ ] Storage policies allow upload/view/delete

### Application
- [ ] Can navigate to Pet Owner Dashboard
- [ ] "Add a Pet" card is clickable
- [ ] Add Pet dialog opens correctly
- [ ] Form validation works (required fields)
- [ ] Photo upload preview works
- [ ] Can submit form successfully
- [ ] Pet appears in "My Pets" tab
- [ ] Pet card displays all information
- [ ] Age calculation is correct
- [ ] Can delete pet with confirmation
- [ ] Responsive layout works on mobile

### Testing
- [ ] Added pet with photo
- [ ] Added pet without photo (uses avatar)
- [ ] Deleted pet successfully
- [ ] Tested on mobile device
- [ ] Checked browser console (no errors)

---

## Production Deployment

### Additional Steps for Production

1. **Environment Variables**
   - Ensure Supabase URL and keys are set
   - Verify storage bucket is in production project

2. **Migration Deployment**
   ```bash
   # Apply migrations to production
   supabase db push
   ```

3. **Storage Configuration**
   - Set appropriate file size limits
   - Configure CDN if needed
   - Set up image optimization

4. **Monitoring**
   - Enable database logs
   - Monitor storage usage
   - Set up error tracking (e.g., Sentry)

5. **Backup**
   - Schedule regular database backups
   - Backup storage bucket periodically

---

## Support

If you encounter any issues:

1. Check the `PET_MANAGEMENT_FEATURE.md` for detailed documentation
2. Review Supabase dashboard for error logs
3. Check browser console for client-side errors
4. Verify all migrations ran successfully

---

## Quick Commands Reference

```bash
# Start development server
npm run dev

# Run migrations
supabase migration up

# Reset local database (careful!)
supabase db reset

# Check migration status
supabase migration list

# Generate TypeScript types
supabase gen types typescript --local > src/types/database.types.ts
```

---

**Setup Time**: ~10 minutes
**Difficulty**: Easy
**Requirements**: 
- Supabase project
- Node.js installed
- Development server running

**Status**: ✅ Ready for testing

