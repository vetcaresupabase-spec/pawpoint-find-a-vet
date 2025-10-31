# 🕐 Availability Management System - Complete Guide

## Overview

A comprehensive interface that helps veterinarians:
✅ Control weekly availability  
✅ Make date-specific exceptions  
✅ Set unavailable time slots  
✅ Ensure pet owners can only book during open hours  

---

## 🎯 Features Implemented

### 1. **Weekly Schedule Management** 📅
- **Toggle Days:** Turn each day on/off with a switch
- **Multiple Time Ranges:** Add split shifts (e.g., 9-12 AM, 2-6 PM)
- **Visual Validation:** Real-time feedback on invalid time ranges
- **Default Hours:** Pre-set Mon-Fri 9 AM - 5 PM

### 2. **Date Exceptions** 🎄
- **Closures:** Mark specific dates as closed (holidays, vacations)
- **Special Hours:** Set different hours for specific dates
- **Reasons:** Add notes explaining why (visible to staff)
- **Future Dates Only:** Can't add exceptions for past dates

### 3. **Time Slot Control** ⏰
- **Flexible Ranges:** Set any start/end time in 1-minute increments
- **Add/Remove:** Easily manage multiple time ranges per day
- **Validation:** Prevents invalid ranges (end before start)

### 4. **Booking Restrictions** 🚫
- Pet owners can ONLY book during:
  - Regular open hours (weekly schedule)
  - Exception hours (if set for that date)
  - Never during closed exceptions
- Automatic enforcement in booking system

---

## 📊 User Interface

### Tab 1: Regular Hours

```
┌─────────────────────────────────────────────────────────────┐
│ Weekly Schedule                            [Save Hours]      │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] Sunday                                      [Closed] │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] Monday                                               │ │
│ │     From [09:00] to [17:00]  🗑️                         │ │
│ │     [+ Add Time Range]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [✓] Tuesday                                              │ │
│ │     From [09:00] to [12:00]  🗑️                         │ │
│ │     From [14:00] to [18:00]  🗑️                         │ │
│ │     [+ Add Time Range]                                   │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Tab 2: Exceptions

```
┌─────────────────────────────────────────────────────────────┐
│ Date Exceptions                          [+ Add Exception]   │
├─────────────────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📅 Monday, December 25, 2024    [Closed]           ✕    │ │
│ │    Christmas Day                                         │ │
│ └─────────────────────────────────────────────────────────┘ │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ 📅 Friday, December 29, 2024    [Special Hours]    ✕    │ │
│ │    Half day before New Year                              │ │
│ │    ⏰ 09:00 - 13:00                                      │ │
│ └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 🛠️ How It Works

### Setting Regular Hours:

1. **Toggle Day On/Off**
   ```
   Click switch → Day enabled
   Default time range added: 09:00 - 17:00
   ```

2. **Add Multiple Time Ranges**
   ```
   Click "+ Add Time Range"
   Enter start time: 14:00
   Enter end time: 18:00
   Result: Split shift (morning + afternoon)
   ```

3. **Save Changes**
   ```
   Click "Save Hours"
   Validates all time ranges
   Updates database
   Pet owners see new availability immediately
   ```

### Adding Exceptions:

1. **Open Dialog**
   ```
   Click "+ Add Exception"
   Dialog opens with today's date selected
   ```

2. **Set Closure**
   ```
   Select date: Dec 25, 2024
   Toggle "Closed all day": ON
   Add reason: "Christmas Day"
   Click "Save Exception"
   ```

3. **Set Special Hours**
   ```
   Select date: Dec 29, 2024
   Toggle "Closed all day": OFF
   Add time range: 09:00 - 13:00
   Add reason: "Half day"
   Click "Save Exception"
   ```

---

## 📋 Database Schema

### Table: `clinic_hours_new`
```sql
- clinic_id: uuid (FK to clinics)
- weekday: integer (0=Sunday, 6=Saturday)
- is_open: boolean
- time_ranges: jsonb [{start, end}, ...]
```

### Table: `clinic_exceptions`
```sql
- id: uuid (PK)
- clinic_id: uuid (FK to clinics)
- date: date (YYYY-MM-DD)
- is_closed: boolean
- reason: text (optional)
- time_ranges: jsonb [{start, end}, ...]
- UNIQUE(clinic_id, date) - one exception per date
```

---

## 🔒 Booking Enforcement

### How Pet Owners are Restricted:

1. **Check Regular Schedule**
   ```
   User selects Tuesday → Check if Tuesday is open
   If closed → No slots shown
   If open → Show slots within time ranges
   ```

2. **Check for Exception**
   ```
   User selects Dec 25, 2024 → Check exceptions table
   If closed exception → No slots shown
   If special hours → Show slots within exception time ranges
   ```

3. **Priority Order**
   ```
   1. Check exceptions first (overrides regular schedule)
   2. If no exception → Use regular schedule
   3. If closed in either → No booking allowed
   ```

---

## 🎨 UI Components Used

### From Shadcn/UI:
- **Tabs** - Switch between Regular/Exceptions
- **Card** - Container for each day/exception
- **Switch** - Toggle days on/off
- **Input[type="time"]** - Time selection
- **Badge** - Visual status indicators
- **Dialog** - Add exception modal
- **Button** - All actions
- **Textarea** - Exception reasons
- **Label** - Form labels

### Icons (Lucide React):
- **Clock** - Regular hours tab
- **Calendar** - Exceptions tab
- **Plus** - Add actions
- **Trash2** - Remove actions
- **X** - Delete exceptions
- **AlertCircle** - Warnings
- **Info** - Help information

---

## ✅ Validation Rules

### Time Range Validation:
```typescript
✅ Start time < End time
❌ Start time >= End time → Error shown

✅ Multiple non-overlapping ranges allowed
✅ Ranges can be on same day
```

### Date Exception Validation:
```typescript
✅ Date must be today or future
❌ Cannot add exceptions for past dates

✅ One exception per date (uses UNIQUE constraint)
❌ Duplicate dates → Replaces existing

✅ If not closed → Must have at least one time range
❌ Special hours with no ranges → Error
```

---

## 📱 Responsive Design

### Desktop View:
- Full width cards
- Side-by-side time inputs
- All controls visible

### Mobile View:
- Stacked layouts
- Time inputs wrap to new lines
- Touch-friendly buttons
- Scrollable lists

---

## 🚀 Usage Examples

### Example 1: Regular Clinic Hours
```
Monday - Friday: 9 AM - 6 PM
Saturday: 9 AM - 2 PM
Sunday: Closed
```

**Setup:**
1. Mon-Fri: Toggle ON, set 09:00-18:00
2. Saturday: Toggle ON, set 09:00-14:00
3. Sunday: Toggle OFF
4. Click "Save Hours"

### Example 2: Split Shift
```
Tuesday: 9-12 AM (morning), 2-6 PM (afternoon)
Lunch break: 12-2 PM closed
```

**Setup:**
1. Tuesday: Toggle ON
2. Add range 1: 09:00-12:00
3. Add range 2: 14:00-18:00
4. Click "Save Hours"

### Example 3: Holiday Closure
```
December 25, 2024: Closed for Christmas
```

**Setup:**
1. Click "+ Add Exception"
2. Select date: 2024-12-25
3. Toggle "Closed all day": ON
4. Reason: "Christmas Day"
5. Click "Save Exception"

### Example 4: Early Closing
```
December 31, 2024: Open 9 AM - 1 PM only
```

**Setup:**
1. Click "+ Add Exception"
2. Select date: 2024-12-31
3. Toggle "Closed all day": OFF
4. Add time range: 09:00-13:00
5. Reason: "New Year's Eve - Half Day"
6. Click "Save Exception"

---

## 🔍 How Pet Owners Experience This

### Scenario 1: Regular Day
```
Pet owner selects Tuesday, Jan 2, 2025
→ System checks: Tuesday regular hours
→ Shows available slots: 9 AM - 6 PM
→ User can book within these hours
```

### Scenario 2: Holiday
```
Pet owner selects Dec 25, 2024
→ System checks: Exception exists (closed)
→ Shows: "Clinic is closed on this date"
→ No booking slots shown
```

### Scenario 3: Special Hours
```
Pet owner selects Dec 31, 2024
→ System checks: Exception exists (special hours)
→ Shows available slots: 9 AM - 1 PM only
→ User can book within exception hours
```

### Scenario 4: Closed Day
```
Pet owner selects Sunday
→ System checks: Sunday is closed (regular schedule)
→ Shows: "Clinic is closed on Sundays"
→ No booking slots shown
```

---

## 🎯 Benefits

### For Veterinarians:
✅ **Flexible Control** - Set any schedule pattern  
✅ **Easy Exceptions** - Add holidays with 3 clicks  
✅ **Visual Feedback** - See schedule at a glance  
✅ **Split Shifts** - Support any work pattern  
✅ **Future-proof** - Plan months ahead  

### For Pet Owners:
✅ **Clear Availability** - Only see valid booking times  
✅ **No Confusion** - Can't book closed days  
✅ **Transparency** - Know when clinic is open  
✅ **Respect Boundaries** - No inappropriate booking attempts  

### For The System:
✅ **Automatic Enforcement** - No manual intervention  
✅ **Database-Driven** - Single source of truth  
✅ **Real-time Updates** - Changes apply immediately  
✅ **Scalable** - Works for any number of vets  

---

## 🐛 Edge Cases Handled

### 1. **No Time Ranges Set**
```
Day toggled ON but no ranges → Warning shown
Prevents saving until at least one range added
```

### 2. **Invalid Time Range**
```
Start: 18:00, End: 09:00 → Error on save
Message: "start time must be before end time"
```

### 3. **Past Date Exception**
```
User tries to add exception for yesterday
Form blocks past dates (min="today")
```

### 4. **Duplicate Exception**
```
Exception already exists for Dec 25
New exception replaces old one (UNIQUE constraint)
```

### 5. **Exception Without Hours**
```
Special hours toggled but no ranges added
Validation error: "add at least one time range"
```

---

## 📚 Code Structure

### Main Component:
```typescript
OpeningHoursTab.tsx
├─ State Management
│  ├─ schedule[] (weekly)
│  ├─ exceptions[] (dates)
│  └─ exceptionForm (dialog)
├─ Data Fetching
│  ├─ useQuery (hours)
│  └─ useQuery (exceptions)
├─ Mutations
│  ├─ saveMutation (hours)
│  ├─ saveExceptionMutation
│  └─ deleteExceptionMutation
└─ UI
   ├─ Tabs (Regular/Exceptions)
   ├─ Weekly Schedule Cards
   ├─ Exception List
   └─ Add Exception Dialog
```

---

## 🔄 Integration with Booking

### In `BookAppointment.tsx`:

```typescript
// 1. Fetch regular hours
const regularHours = await fetchClinicHours(clinicId);

// 2. Check for exception on selected date
const exception = await fetchException(clinicId, selectedDate);

// 3. Determine available hours
if (exception) {
  if (exception.is_closed) {
    // Show "Closed" message
    return [];
  } else {
    // Use exception time ranges
    return exception.time_ranges;
  }
} else {
  // Use regular schedule for that weekday
  const dayOfWeek = selectedDate.getDay();
  return regularHours[dayOfWeek];
}

// 4. Generate time slots within available hours
// 5. Show only valid slots to pet owner
```

---

## 📊 Testing Checklist

### Regular Hours:
- [ ] Toggle day ON → Default time range appears
- [ ] Toggle day OFF → Shows "Closed"
- [ ] Add multiple time ranges
- [ ] Remove time range
- [ ] Edit time range values
- [ ] Save changes → Success toast
- [ ] Invalid time range → Error shown

### Exceptions:
- [ ] Click "+ Add Exception" → Dialog opens
- [ ] Select future date
- [ ] Toggle "Closed all day" → Removes time ranges
- [ ] Add exception reason
- [ ] Add special hours time ranges
- [ ] Save exception → Appears in list
- [ ] Delete exception → Confirmation, then removed

### Integration:
- [ ] Pet owner booking page checks regular hours
- [ ] Pet owner booking page checks exceptions
- [ ] Closed days show no slots
- [ ] Open days show slots within time ranges
- [ ] Exception dates override regular schedule

---

## 🎉 Summary

### What Was Built:
✅ Complete weekly schedule manager  
✅ Date-specific exception system  
✅ Validation and error handling  
✅ Beautiful, intuitive UI  
✅ Database tables and migrations  
✅ Integration with booking system  

### Result:
Veterinarians have full control over their availability, and pet owners can only book during valid hours. The system automatically enforces all rules with no manual intervention needed! 🚀

