# 🔧 Fix: Decline Appointment Error

## ❌ Problem
Getting error "Failed to decline appointment" when clicking Decline button.

---

## 🔍 Common Causes

### 1. **RLS (Row Level Security) Policy Blocking**
**Most Common Issue:** The vet doesn't have UPDATE permission on the `bookings` table.

**Solution:** Run the SQL fix in Supabase.

### 2. **Status Column Constraint**
The `status` column might not allow "declined" value (though unlikely).

### 3. **Booking Doesn't Exist**
The booking ID might not exist or already be deleted.

---

## ✅ Solution: Run SQL Fix

### Step 1: Open Supabase SQL Editor
1. Go to your Supabase Dashboard
2. Click **"SQL Editor"** in left menu
3. Click **"+ New Query"**

### Step 2: Run This SQL
Copy and paste the contents of **`FIX_DECLINE_PERMISSIONS.sql`** and click **"Run"**.

This will:
- ✅ Check existing policies
- ✅ Drop old/conflicting policies
- ✅ Create new UPDATE policy for vets
- ✅ Grant UPDATE permissions
- ✅ Verify policy creation

---

## 🧪 Testing After Fix

1. **Refresh your browser** (Ctrl+F5)
2. **Login as vet**
3. Go to **Dashboard → Today tab**
4. Find an appointment with "pending" or "confirmed" status
5. Click **"Decline"** button
6. Confirm in dialog

**Expected:**
- ✅ Success toast: "Appointment Declined"
- ✅ Status changes to "declined"
- ✅ Decline button disappears
- ✅ Pet owner sees crossed-out appointment

---

## 🔍 Debugging

### If Still Getting Error:

1. **Check Browser Console** (Press F12 → Console tab)
   - Look for error message
   - Copy the exact error

2. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Look for RLS violations

3. **Verify Clinic Ownership**
   - Run this in SQL Editor:
   ```sql
   SELECT 
     c.id as clinic_id,
     c.email as clinic_email,
     u.id as user_id,
     u.email as user_email
   FROM public.clinics c
   INNER JOIN auth.users u ON u.email = c.email
   WHERE u.id = auth.uid();
   ```
   - Should return your clinic

4. **Test Update Manually**
   ```sql
   -- Replace BOOKING_ID with actual booking ID
   UPDATE public.bookings
   SET status = 'declined'
   WHERE id = 'BOOKING_ID'
   RETURNING *;
   ```
   - If this works, it's not a database issue
   - If this fails, check RLS policies

---

## 📋 What the Fix Does

### Creates UPDATE Policy:
```sql
CREATE POLICY "bookings_update_policy"
  ON public.bookings
  FOR UPDATE
  TO authenticated
  USING (
    -- Only allow if vet owns the clinic
    EXISTS (
      SELECT 1 FROM public.clinics c
      INNER JOIN auth.users u ON u.email = c.email
      WHERE c.id = bookings.clinic_id
      AND u.id = auth.uid()
    )
  );
```

### Grants Permission:
```sql
GRANT UPDATE ON public.bookings TO authenticated;
```

---

## 🎯 Expected Error Messages

### If RLS Blocks:
```
"new row violates row-level security policy for table 'bookings'"
```

### If No Permission:
```
"permission denied for table bookings"
```

### If Status Invalid:
```
"invalid input value for enum bookings_status_enum"
```

### If Booking Doesn't Exist:
```
"No rows updated"
```

---

## ✅ After Running Fix

You should see:
```
✅ Policy created successfully
✅ UPDATE permission granted
✅ Verification shows policy exists
```

Then test declining again - it should work! 🎉

---

## 🆘 If Still Not Working

1. **Check the exact error message** in browser console
2. **Verify you're logged in as a vet** (not pet owner)
3. **Check your clinic email matches user email**
4. **Try the manual SQL update** to test permissions
5. **Share the error message** for further debugging

---

**Most likely:** RLS policy blocking → Run `FIX_DECLINE_PERMISSIONS.sql` ✅



