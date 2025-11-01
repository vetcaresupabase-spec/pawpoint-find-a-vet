# Booking System Logic - Complete Implementation

## Overview
The booking system prevents double bookings and only shows available time slots to users. This document explains the complete logic and rules.

---

## Core Principles

### 1. **Show All Slots with Visual Distinction**
- The calendar displays all time slots (8:00 AM - 6:00 PM)
- Available slots: Blue background, clickable, shows time
- Unavailable slots: Gray background, disabled, shows "—"
- Booked slots: Marked as unavailable with "—"
- Users see the complete schedule with clear visual indicators

### 2. **Multi-Layer Availability Check**
Each time slot goes through multiple validation layers:

```
Time Slot Generation
    ↓
Is it in the past? → ❌ Hide
    ↓
Is clinic open (regular hours)? → ❌ Hide
    ↓
Is there a clinic exception (closed/special hours)? → ❌ Hide
    ↓
Is the slot already booked? → ❌ Hide
    ↓
✅ SHOW as available
```

---

## Booking Rules

### Rule 1: Time Slot Validity
- **Past slots**: Never shown (automatically filtered)
- **Future slots**: Shown only if all other conditions pass
- **Time range**: 8:00 AM - 6:00 PM (configurable per clinic)
- **Slot duration**: 30 minutes (based on service duration)
- **Slot interval**: 15 minutes (slots start every 15 min: 8:00, 8:15, 8:30, 8:45...)

### Rule 2: Clinic Operating Hours
- **Regular hours**: Defined per weekday (0=Sunday, 6=Saturday)
- **Time ranges**: Clinic can have multiple ranges (e.g., 9:00-12:00, 14:00-18:00)
- **Closed days**: If `is_open = false`, no slots shown for that day
- **Validation**: Slot start time must fall within an open time range

### Rule 3: Clinic Exceptions (Priority Over Regular Hours)
- **Closed days**: `is_closed = true` → No slots shown, displays "Unavailable"
- **Special hours**: Blocks specific time ranges with a reason (e.g., "Lunch Break")
- **Date-specific**: Applies to specific dates (YYYY-MM-DD format)
- **Example**: 
  ```json
  {
    "date": "2025-11-15",
    "is_closed": false,
    "reason": "Team Meeting",
    "time_ranges": [{"start": "14:00", "end": "15:00"}]
  }
  ```
  → Slots from 14:00-15:00 are blocked

### Rule 4: Existing Bookings (Double Booking Prevention)
- **Database constraint**: `UNIQUE(clinic_id, appointment_date, start_time)`
- **Status filter**: Only counts bookings with status: `pending`, `confirmed`, `checked_in`
- **Overlap detection**: Checks if slot overlaps with any existing booking
- **Overlap formula**: `slotStart < bookingEnd AND slotEnd > bookingStart`

#### Example Overlap Scenarios:
```
Existing booking: 10:00 - 10:30
Slot 10:00 - 10:30 → ❌ Overlaps (exact match)
Slot 10:15 - 10:45 → ❌ Overlaps (partial)
Slot 09:45 - 10:15 → ❌ Overlaps (starts before)
Slot 10:30 - 11:00 → ✅ No overlap (starts when booking ends)
```

---

## Implementation Details

### Data Flow

```
1. Page Load
   ├─ Fetch clinic details
   ├─ Fetch clinic_hours_new (regular hours)
   ├─ Fetch clinic_exceptions (future dates only)
   └─ Fetch bookings (next 30 days, active statuses)

2. Generate Time Slots (useEffect)
   ├─ For each day in week:
   │   ├─ Check if clinic is open (regular hours)
   │   ├─ Generate slots (8:00-18:00, 15-min intervals)
   │   ├─ For each slot:
   │   │   ├─ Check if past → mark unavailable
   │   │   ├─ Check regular hours → mark unavailable if outside
   │   │   ├─ Check exceptions → mark unavailable if in blocked range
   │   │   └─ Check existing bookings → mark unavailable if overlaps
   │   └─ Store slots in map

3. Display Slots
   ├─ Show ALL slots (available and unavailable)
   ├─ Available slots: Blue, clickable, show time
   ├─ Unavailable slots: Gray, disabled, show "—"
   └─ Booked slots: Gray, disabled, show "—"

4. Booking Process
   ├─ User selects slot
   ├─ User fills pet details
   ├─ Clicks "Login to Book" or "Book appointment"
   ├─ Pre-insert validation: Check if slot still available
   ├─ Insert booking into database
   ├─ Refresh bookings list
   └─ Navigate to dashboard
```

### Key Functions

#### `isSlotInRegularHours(slotTime, dayOfWeek)`
- Checks if slot falls within clinic's regular operating hours
- Returns `true` if within any time range for that weekday

#### `isSlotInExceptionRange(slotTime, timeRanges)`
- Checks if slot falls within an exception's blocked time ranges
- Used for special hours (e.g., lunch breaks)

#### `isSlotBooked(slotStart, slotEnd, appointmentDate)`
- Checks if slot overlaps with any existing booking
- Filters bookings by date and active status
- Uses overlap detection algorithm
- Includes console logging for debugging

---

## Race Condition Prevention

### Problem
Two users might try to book the same slot simultaneously.

### Solution - Triple Protection:

1. **UI Level** (First Defense)
   - Slots refresh when bookings change
   - Selected slot validated before submission
   - If unavailable, shows error and refreshes

2. **Pre-Insert Validation** (Second Defense)
   ```javascript
   if (isSlotBooked(selectedSlot.start, selectedSlot.end, appointmentDate)) {
     // Show error, refresh bookings, prevent insert
   }
   ```

3. **Database Level** (Final Defense)
   - Unique constraint: `(clinic_id, appointment_date, start_time)`
   - PostgreSQL rejects duplicate bookings
   - Error code `23505` detected and handled with clear message

---

## User Experience

### For Pet Owners

#### What They See:
- ✅ Complete calendar view (8:00 AM - 6:00 PM)
- ✅ Available slots in blue (clickable)
- ✅ Unavailable slots in gray with "—" (disabled)
- ✅ Booked slots shown as "—" (cannot be selected)
- ✅ Reason displayed for special hours/exceptions
- ✅ Immediate feedback if slot becomes unavailable

#### Visual Indicators:
- 🔵 **Blue button with time** = Available for booking
- ⚪ **Gray button with "—"** = Unavailable (past, outside hours, or booked)
- 🟡 **Amber button** = Special hours/exception (reason displayed)

### For Vets

#### Dashboard Visibility:
- Today's appointments (separate section)
- Upcoming appointments (future bookings)
- Ability to check-in, mark as no-show, or decline

#### Booking Protection:
- Cannot overbook time slots
- Database prevents conflicts
- Real-time booking list updates

---

## Database Schema

### `bookings` Table
```sql
CREATE TABLE bookings (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  service_id UUID REFERENCES clinic_services(id),
  pet_owner_id UUID REFERENCES auth.users(id),
  pet_name TEXT NOT NULL,
  pet_type TEXT,
  appointment_date DATE NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  duration_minutes INT DEFAULT 30,
  status TEXT CHECK (status IN ('pending', 'confirmed', 'checked_in', 'completed', 'no_show', 'canceled', 'declined')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Prevent double booking at database level
  UNIQUE (clinic_id, appointment_date, start_time)
);
```

### `clinic_hours_new` Table
```sql
CREATE TABLE clinic_hours_new (
  clinic_id UUID REFERENCES clinics(id),
  weekday INT CHECK (weekday >= 0 AND weekday <= 6),
  is_open BOOLEAN DEFAULT true,
  time_ranges JSONB NOT NULL,
  UNIQUE (clinic_id, weekday)
);
```

### `clinic_exceptions` Table
```sql
CREATE TABLE clinic_exceptions (
  id UUID PRIMARY KEY,
  clinic_id UUID REFERENCES clinics(id),
  date DATE NOT NULL,
  is_closed BOOLEAN DEFAULT false,
  reason TEXT,
  time_ranges JSONB,
  UNIQUE (clinic_id, date)
);
```

---

## Error Messages

### User-Friendly Messages:
- **"Slot no longer available"**: When pre-insert validation fails
- **"Double booking prevented"**: When database constraint is violated
- **"No available slots"**: When filtering leaves no bookable times
- **"Booking failed"**: Generic error with description

---

## Testing Scenarios

### Scenario 1: Normal Booking
1. User views calendar
2. Sees only available slots
3. Selects a slot
4. Fills details and books
5. Slot disappears from availability
6. ✅ Success

### Scenario 2: Simultaneous Booking (Race Condition)
1. User A selects slot 10:00
2. User B selects slot 10:00
3. User A books first → ✅ Success
4. User B tries to book → ❌ Pre-insert validation catches it
5. User B sees error, slot refreshed as unavailable
6. User B selects different slot → ✅ Success

### Scenario 3: Clinic Exception
1. Vet sets exception: Nov 15, 14:00-15:00, "Team Meeting"
2. Pet owner views Nov 15
3. Slots 14:00, 14:15, 14:30, 14:45 are hidden
4. Other slots remain available
5. ✅ Prevents bookings during meeting

### Scenario 4: Outside Operating Hours
1. Clinic hours: Mon-Fri 9:00-17:00
2. Closed on weekends
3. Pet owner views calendar
4. Saturday/Sunday show "Unavailable"
5. Weekdays show slots only from 9:00-17:00
6. ✅ No bookings outside hours

---

## Debugging

### Console Logs:
- `📅 Loaded N existing bookings` - Shows all fetched bookings
- `🚫 Slot blocked` - When overlap detected
- `🔒 Marking slot as booked` - When slot marked unavailable

### Chrome DevTools:
1. Open Console
2. Watch for booking logs
3. Check Network tab for Supabase queries
4. Verify `bookings` table queries return correct data

---

## Future Enhancements

### Potential Improvements:
1. **Waiting List**: When all slots full, allow users to join waitlist
2. **Buffer Time**: Add 5-10 min buffer between appointments
3. **Service Duration**: Different slot durations based on service type
4. **Recurring Bookings**: Allow booking multiple appointments at once
5. **Capacity Management**: Multiple vets per clinic, parallel bookings
6. **Reminder System**: Email/SMS reminders before appointment

---

**Status**: ✅ Fully Implemented
**Last Updated**: November 1, 2025
**Version**: 2.0 (Show Available Slots Only)

