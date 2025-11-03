# Test: Verify Bookings Access for Anonymous Users

## Quick Test in Browser Console

Open the booking page and run this in the browser console:

```javascript
// Test if anonymous users can fetch bookings
const testBookings = async () => {
  const clinicId = new URLSearchParams(window.location.search).get('clinicId');
  if (!clinicId) {
    console.log('❌ No clinicId in URL');
    return;
  }
  
  const today = new Date().toISOString().split('T')[0];
  const { data, error } = await supabase
    .from('bookings')
    .select('id, clinic_id, appointment_date, start_time, end_time, status')
    .eq('clinic_id', clinicId)
    .gte('appointment_date', today)
    .in('status', ['pending', 'confirmed', 'checked_in'])
    .limit(5);
  
  if (error) {
    console.error('❌ ERROR:', error);
    console.error('💡 This means RLS policy is NOT working');
    console.error('💡 Run FIX_CALENDAR_FOR_ALL_USERS.sql in Supabase');
  } else {
    console.log('✅ SUCCESS: Can fetch bookings');
    console.log('📊 Bookings found:', data?.length || 0);
    console.log('📋 Sample:', data);
  }
};

testBookings();
```

## Expected Results

### ✅ Policy Working:
```
✅ SUCCESS: Can fetch bookings
📊 Bookings found: 3
📋 Sample: [...]
```

### ❌ Policy NOT Working:
```
❌ ERROR: {code: 'PGRST116', message: 'permission denied...'}
💡 This means RLS policy is NOT working
💡 Run FIX_CALENDAR_FOR_ALL_USERS.sql in Supabase
```

## If Test Fails

1. **Open Supabase Dashboard → SQL Editor**
2. **Run the SQL from `FIX_CALENDAR_FOR_ALL_USERS.sql`**
3. **Re-run the test** in browser console
4. **Check browser console logs** on the booking page for: `✅ Loaded X existing bookings`


