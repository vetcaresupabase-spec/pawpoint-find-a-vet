# Search Bar Implementation

## Overview

The search bar maintains the original two-field design with geolocation functionality added to the location field only.

## Field 1: Name, Field of Expertise, Institution
**Placeholder:** "Name, field of expertise, institution"

**Status:** Ready for implementation
- This field is prepared for searching by:
  - Vet name
  - Field of expertise (e.g., "Cardiology", "Dermatology")
  - Institution name (e.g., clinic name)
- Currently stores the search term but doesn't execute search
- Can be enhanced to search the database when needed

## Field 2: Location with Geolocation
**Placeholder:** "e.g. Berlin or 12043"

**Status:** ✅ Fully implemented with PostGIS

### Features:
1. **Auto-detects location** on page load
   - Requests browser geolocation permission
   - Shows spinner while loading
   - Navigation icon turns blue when location acquired

2. **Search modes:**
   - **Near me**: If location granted → shows clinics within 15km
   - **City search**: Type "Berlin" → shows all Berlin clinics
   - **Postcode search**: Type "12043" → shows clinics in that area

3. **Dropdown results show:**
   - Clinic name
   - Full address with postcode
   - Specialties
   - **Distance in km** (when using geolocation)

4. **Navigation icon:**
   - Gray = no location
   - Spinner = requesting location
   - Blue (filled) = location acquired
   - Click to use current location

## How It Works

### When page loads:
1. Automatically requests geolocation permission
2. If granted: stores coordinates (lat, lng)
3. Navigation icon turns blue

### When user types in location field:
1. Waits 250ms after typing stops (debounced)
2. Calls `fn_search_clinics` RPC function
3. Shows dropdown with nearest clinics
4. Results sorted by distance

### When user clicks navigation icon:
1. If location not granted yet → requests permission
2. If already granted → clears text and searches nearby

### When user clicks a result:
- Navigates to: `/book-appointment?clinicId=XXX`

## Database Function

```sql
fn_search_clinics(
  in_lat,              -- latitude (null for city mode)
  in_lng,              -- longitude (null for city mode)
  in_city_or_postcode, -- city name or postcode
  in_radius_m,         -- radius in meters (default: 15000 = 15km)
  in_limit             -- max results (default: 10)
)
```

### Search Logic:
- If `in_city_or_postcode` provided → searches by city OR postcode
- Else if coordinates provided → searches within radius
- Returns results sorted by distance

## Setup Required

1. **Run Migration:**
   ```bash
   pawpoint-find-a-vet/supabase/migrations/20251101000002_add_postgis_geolocation.sql
   ```

2. **Test:**
   - Allow location when prompted
   - See nearby clinics (or type "Berlin")
   - Click a result to navigate to booking

## Future Enhancements (Field 1)

To enable the first search field, you could:

### Option 1: Search by vet name
```typescript
const { data } = await supabase
  .from("clinics")
  .select("id, name, city, address_line1, specialties")
  .or(`name.ilike.%${searchTerm}%`)
  .limit(10);
```

### Option 2: Search by specialty
```typescript
const { data } = await supabase
  .from("clinics")
  .select("*")
  .contains("specialties", [searchTerm])
  .limit(10);
```

### Option 3: Combined search
Search across multiple fields and combine results from both search boxes.

## UI Layout

```
┌────────────────────────────────────────────────────────────────┐
│  🔍 Name, field of expertise...  │  📍 Berlin or 12043  🧭 │ Seek │
│         [Field 1]                 │       [Field 2]           │      │
│                                   │   ↓ Dropdown shows here   │      │
└────────────────────────────────────────────────────────────────┘
```

- **Field 1**: For name/expertise search (not yet active)
- **Field 2**: Geolocation + city/postcode search ✅
- **Navigation icon**: Use my location button
- **Seek button**: Execute search

## Testing

1. **Test geolocation:**
   - Open page → allow location
   - Click in location field → see nearby clinics
   - Distance shown in km

2. **Test city search:**
   - Type "Berlin" in location field
   - See all Berlin clinics sorted by distance

3. **Test postcode:**
   - Type "12043" in location field
   - See clinics in that postcode

4. **Test navigation icon:**
   - Click icon → requests location if not granted
   - Icon turns blue when location acquired

5. **Test results:**
   - Click a clinic → navigates to booking page
   - Keyboard arrows work
   - Press Enter to select
   - Press Escape to close

## Notes

- Only Field 2 (location) has active search functionality
- Field 1 is ready for future name/expertise search implementation
- Geolocation is optional - search works with city/postcode too
- All results go to booking page: `/book-appointment?clinicId=XXX`

