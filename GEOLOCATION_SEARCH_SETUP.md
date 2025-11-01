# Geolocation Search Setup Guide

## Overview
The search bar now uses PostGIS for geospatial queries, supporting:
- **Geolocation-based search**: Shows nearest clinics within 15km
- **City/Postcode search**: Type 2+ characters to search by location
- **Distance display**: Shows how far each clinic is from you

## Setup Steps

### 1. Run the Migration

Open Supabase SQL Editor and run this migration:

```bash
pawpoint-find-a-vet/supabase/migrations/20251101000002_add_postgis_geolocation.sql
```

Or copy the contents of that file and paste it into the Supabase SQL Editor, then click "Run".

### 2. What the Migration Does

- ✅ Enables PostGIS extension for geospatial queries
- ✅ Adds `coords` column (latitude/longitude) to `clinics` table
- ✅ Adds `postcode` column to `clinics` table
- ✅ Adds `is_active` column to `clinics` table
- ✅ Creates geospatial indexes for fast queries
- ✅ Creates `fn_search_clinics` RPC function for search
- ✅ Seeds sample data for Berlin, Munich, Hamburg
- ✅ Updates existing clinics with approximate coordinates

### 3. Test the Feature

#### Test 1: Geolocation Search
1. Load the homepage
2. Allow location access when prompted
3. The Navigation icon should turn blue (filled)
4. Click in the search box
5. You should see clinics within 15km, sorted by distance
6. Each result shows the distance in km

#### Test 2: City Search
1. Type "Berlin" in the search box
2. After 250ms, dropdown shows Berlin clinics
3. Results are sorted by distance from city center
4. Click a result to navigate to booking page

#### Test 3: Postcode Search
1. Type "12043" (Berlin postcode)
2. Results show clinics in that area
3. Distance shown from postcode center

#### Test 4: Keyboard Navigation
1. Type a city name
2. Use Arrow Down/Up to navigate results
3. Press Enter to select
4. Press Escape to close dropdown

## Features

### Geolocation
- Requests location permission on page load
- Shows spinner while loading
- Blue (filled) Navigation icon when location acquired
- Falls back to city search if denied

### Search Behavior
- **Debounced**: 250ms delay after typing
- **Smart mode detection**:
  - If you type 2+ characters → city/postcode search
  - If you have location and no query → nearby search
  - Shows up to 10 results

### Results Display
- Clinic name
- Full address with postcode
- First 2 specialties
- Distance in km (if geolocation used)
- Hover highlights
- Click to book

### Seed Data
The migration includes these test clinics:

**Berlin:**
- PawPoint Tierarztpraxis Neukölln (Mainzer Str. 1, 12043)
- Tierarztpraxis Mitte (Invalidenstr. 10, 10115)

**Munich:**
- Tierarztpraxis Isar (Isarstr. 8, 80469)

**Hamburg:**
- Tierarztpraxis Altona (Altonaer Str. 5, 22767)

## Acceptance Criteria

✅ If user allows geolocation, dropdown lists active clinics within 15 km ordered by distance

✅ Distance shown in km (e.g., "2.3 km")

✅ If user types 2+ chars (e.g., "Berlin" or "12043"), search uses that value

✅ Dropdown opens on focus (if results exist) and after search

✅ Dropdown closes on outside click or selection

✅ Clicking a result routes to booking page (`/book-appointment?clinicId=X`)

✅ DB protected with RLS; only `is_active=true` clinics visible

✅ Seed data provides results in Berlin, Munich, Hamburg

## Technical Details

### Database Function
`fn_search_clinics(in_lat, in_lng, in_city_or_postcode, in_radius_m, in_limit)`

### Search Logic
1. If `in_city_or_postcode` provided → city/postcode mode
2. Else if coordinates provided → geolocation mode (15km radius)
3. Returns results sorted by distance
4. Only returns `is_active=true` clinics

### Coordinates Format
- Stored as `geography(Point, 4326)` (WGS 84)
- Format: `ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)`
- Example: Berlin → `(13.4050, 52.5200)`

## Troubleshooting

### No results when using location
- Check browser console for geolocation errors
- Verify coords are logged: "Geolocation acquired: lat, lng"
- Check if any clinics exist within 15km in database

### Function not found error
- Run the migration in Supabase SQL Editor
- Verify `fn_search_clinics` exists in Database → Functions

### Distance not showing
- Check if `coords` column is populated for clinics
- Run the migration again to update existing clinics

### Permission errors
- Check RLS policies in Supabase Dashboard
- Verify `is_active` column exists and is set to `true`

## Next Steps

1. **Add more clinics**: Insert more clinics with coordinates
2. **Update existing clinics**: Add coordinates to your existing clinics
3. **Adjust radius**: Change `in_radius_m: 15000` to larger value if needed
4. **Add photos**: Extend `ClinicSearchResult` to include profile images

## Database Query Examples

### Add coordinates to existing clinic
```sql
UPDATE public.clinics
SET coords = ST_SetSRID(ST_MakePoint(13.4050, 52.5200), 4326)::geography
WHERE name = 'Your Clinic Name';
```

### Search manually
```sql
SELECT * FROM fn_search_clinics(
  52.5200,  -- latitude
  13.4050,  -- longitude
  null,     -- city/postcode (null for geolocation mode)
  15000,    -- radius in meters (15km)
  10        -- limit
);
```

### Search by city
```sql
SELECT * FROM fn_search_clinics(
  null,     -- latitude
  null,     -- longitude
  'Berlin', -- city name
  15000,    -- radius
  10        -- limit
);
```

