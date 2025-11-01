# How Location Search Works

## Updated Behavior

The search flow has been updated based on your requirements:

### Step 1: Click the Navigation Arrow Icon (🧭)
**Purpose:** Get your current location

**What happens:**
1. Browser asks for location permission
2. Icon shows spinner while loading
3. When location acquired:
   - Icon turns **blue (filled)**
   - Coordinates stored (lat, lng)
   - Console logs: "Location acquired: [lat], [lng]"
4. Location text field is cleared (ready for Seek)

**Visual feedback:**
- Gray icon = No location
- Spinner = Getting location
- **Blue filled icon** = ✅ Location acquired

### Step 2: Click the "Seek" Button
**Purpose:** Search for nearby clinics

**What happens:**
1. Calls the database function with your coordinates
2. Searches clinics within 15km radius
3. Dropdown appears with results
4. Clinics sorted **nearest to farthest**
5. Shows distance in km (e.g., "2.3 km")

**Result display:**
```
┌─────────────────────────────────────────┐
│ 🏥 PawPoint Tierarztpraxis     2.3 km  │
│    Mainzer Str. 1 • 12043 • Berlin     │
│    Wellness, Dental Care               │
├─────────────────────────────────────────┤
│ 🏥 Tierarztpraxis Mitte        5.8 km  │
│    Invalidenstr. 10 • 10115 • Berlin   │
│    Diagnostics, Surgery                │
└─────────────────────────────────────────┘
```

## Complete Flow

### Option A: Use My Location
1. Click navigation icon (🧭) → get location → icon turns blue
2. Click "Seek" button → dropdown shows nearby clinics
3. Clinics sorted nearest to farthest
4. Click a clinic → go to booking page

### Option B: Type City Name
1. Type "Berlin" in location field
2. After 250ms → dropdown shows automatically
3. Clinics in Berlin sorted by distance from city center
4. Click a clinic → go to booking page

### Option C: Type Postcode
1. Type "12043" in location field
2. After 250ms → dropdown shows automatically
3. Clinics in that postcode sorted by distance
4. Click a clinic → go to booking page

## Key Features

### ✅ Automatic Location Detection
- On page load, browser asks for location permission (optional)
- If granted, location is stored for later use
- If denied, user can still search by city/postcode

### ✅ Smart Search Behavior
- **Navigation icon click:** Only gets location, doesn't search yet
- **Seek button click:** Triggers the search with current location
- **Typing in field:** Auto-searches after 250ms delay

### ✅ Distance Display
- Only shows when using geolocation (not city search)
- Format: "X.X km" (e.g., "2.3 km")
- Sorted from nearest to farthest

### ✅ Keyboard Support
- Arrow Up/Down: Navigate results
- Enter: Select highlighted result
- Escape: Close dropdown

## Example Usage

### Scenario 1: Find nearest vet
```
1. User clicks navigation icon 🧭
2. Browser: "Allow location?"
3. User: "Allow"
4. Icon turns blue ✅
5. User clicks "Seek"
6. Dropdown shows: 
   - Clinic A (2.3 km)
   - Clinic B (5.8 km)
   - Clinic C (12.1 km)
```

### Scenario 2: Search by city
```
1. User types "Berlin"
2. After 250ms → dropdown shows
3. Results sorted by distance from Berlin center
4. User clicks a clinic
5. Navigate to booking page
```

## Database Function

The search uses PostGIS for accurate distance calculations:

```sql
fn_search_clinics(
  in_lat:              52.5200,  -- your latitude
  in_lng:              13.4050,  -- your longitude
  in_city_or_postcode: null,     -- null for geolocation mode
  in_radius_m:         15000,    -- 15km radius
  in_limit:            10        -- max 10 results
)
```

### Returns:
- Clinic details (name, address, postcode, city)
- Specialties
- **Distance in meters** (converted to km in UI)
- Sorted by distance (ascending)

## Testing

### Test 1: Navigation Icon
1. Open page
2. Click navigation icon (🧭)
3. Allow location
4. ✅ Icon should turn blue
5. ✅ Console should log coordinates

### Test 2: Seek Button
1. After getting location (blue icon)
2. Click "Seek" button
3. ✅ Dropdown should appear
4. ✅ Should show clinics with distances
5. ✅ Sorted nearest to farthest

### Test 3: Distance Display
1. Use geolocation (blue icon)
2. Click "Seek"
3. ✅ Each clinic shows "X.X km"
4. ✅ Distances increase from top to bottom

### Test 4: City Search
1. Type "Berlin" in location field
2. ✅ Dropdown appears after 250ms
3. ✅ Shows Berlin clinics
4. May or may not show distance (depends on coords)

## Troubleshooting

### Navigation icon doesn't turn blue
- Check browser console for errors
- Try allowing location permission again
- Check if geolocation is enabled in browser

### No results when clicking Seek
- Make sure migration is run (PostGIS enabled)
- Check console for errors
- Verify clinics exist in database with coordinates

### Distance not showing
- Make sure you clicked navigation icon first (get location)
- Check if `coords` column is populated in database
- Run: `SELECT id, name, coords FROM clinics LIMIT 5;`

### Wrong distances
- Verify coordinates are in correct format: (longitude, latitude)
- Check coordinate data: `ST_X(coords::geometry), ST_Y(coords::geometry)`
- Ensure PostGIS extension is enabled

## Technical Details

### State Management
```typescript
coords: { lat: number; lng: number } | null  // Current location
location: string                              // Text in location field
results: ClinicSearchResult[]                 // Search results
showResults: boolean                          // Show/hide dropdown
locationStatus: "idle" | "loading" | "granted" | "denied"
```

### Search Priority
1. If `coords` exists + no location text → use geolocation
2. If `location` text exists (2+ chars) → search by city/postcode
3. Results always sorted by distance (if available)

### Distance Calculation
- Uses PostGIS `ST_Distance` function
- Calculates great-circle distance (accurate for Earth)
- Returns meters → converted to km for display
- Sorted in SQL query for optimal performance

## Migration Required

Before testing, run this migration:
```bash
pawpoint-find-a-vet/supabase/migrations/20251101000002_add_postgis_geolocation.sql
```

This enables:
- PostGIS extension
- `coords` column in clinics table
- `fn_search_clinics` RPC function
- Sample data for Berlin, Munich, Hamburg

