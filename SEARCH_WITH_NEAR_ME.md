# Search with "Near Me" - Complete Guide

## Updated Flow

The search now shows "Near me" when location is acquired, allowing you to filter by name/expertise.

---

## Step-by-Step Usage

### 1️⃣ Get Location
**Click the navigation icon (🧭)**

What happens:
- Browser asks for location permission
- Icon shows spinner while loading
- When location acquired:
  - ✅ Icon turns **blue (filled)**
  - ✅ Location field shows **"Near me"**
  - ✅ Coordinates stored in background

```
Before:  [                           ] 🧭
After:   [ Near me                   ] 🧭✓
```

### 2️⃣ Enter Name or Expertise (Optional)
**Type in the first field**

You can now filter nearby clinics by:
- Vet name: "Dr. Stefan"
- Field of expertise: "Dermatology"
- Institution: "PawPoint"
- City: "Berlin"

```
[ Dr. Stefan                        ] [ Near me                   ] 🧭✓ | Seek
```

### 3️⃣ Click Seek
**Press the "Seek" button**

Results shown:
- All nearby clinics (within 15km)
- Filtered by your search term (if provided)
- Sorted nearest to farthest
- Distance shown in km

```
Results dropdown:
┌─────────────────────────────────────────┐
│ 🏥 Dr. Stefan Chwalek        2.3 km    │ ← Matches name
│    Arzt - Frankfurt am Main             │
│    Dermatology                          │
├─────────────────────────────────────────┤
│ 🏥 PawPoint Berlin           5.8 km    │ ← Within range
│    Mainzer Str. 1 • 12043 • Berlin     │
│    Wellness, Dental Care                │
└─────────────────────────────────────────┘
```

---

## Complete Examples

### Example 1: Find nearest vet (any specialty)
```
1. Click 🧭 → Location acquired
2. Location field shows: "Near me"
3. Leave name field empty
4. Click "Seek"
5. See all nearby clinics sorted by distance
```

### Example 2: Find nearby dermatologist
```
1. Click 🧭 → Location acquired
2. Location field shows: "Near me"
3. Type in name field: "Dermatology"
4. Click "Seek"
5. See only nearby dermatology clinics
```

### Example 3: Find specific vet by name
```
1. Click 🧭 → Location acquired
2. Location field shows: "Near me"
3. Type in name field: "Dr. Stefan"
4. Click "Seek"
5. See "Dr. Stefan Chwalek" if nearby
```

### Example 4: Search Berlin vets (without location)
```
1. Don't click navigation icon
2. Type in location field: "Berlin"
3. Type in name field: "Dental" (optional)
4. Click "Seek" or wait 250ms
5. See Berlin clinics with dental services
```

---

## Search Modes

### Mode A: Near Me + Name Filter
- Location: "Near me" (with coords)
- Name: "Dr. Stefan" or "Dermatology"
- Result: Nearby clinics matching the name/expertise

### Mode B: Near Me (All)
- Location: "Near me" (with coords)
- Name: (empty)
- Result: All nearby clinics within 15km

### Mode C: City + Name Filter
- Location: "Berlin"
- Name: "Dermatology"
- Result: Berlin clinics with dermatology

### Mode D: City Only
- Location: "Berlin"
- Name: (empty)
- Result: All Berlin clinics

---

## Filtering Logic

When you click "Seek", the search:

1. **Gets nearby clinics** (based on location/coords)
   - Within 15km if using "Near me"
   - All clinics in city if typing city name

2. **Filters by name/expertise** (if provided)
   - Matches clinic name
   - Matches city name
   - Matches specialties
   - Case-insensitive

3. **Sorts by distance** (nearest first)

4. **Shows in dropdown** with distance

---

## Visual States

### Location Icon States
```
⚪ Gray     = No location
🔄 Spinner  = Getting location
🔵 Blue     = Location acquired ✓
```

### Location Field Text
```
Empty               → No location
"Near me"           → Location acquired ✓
"Berlin"            → City search
"12043"             → Postcode search
```

### Example UI States

**Initial state:**
```
[ Name, expertise...              ] [ e.g. Berlin or 12043        ] 🧭  | Seek
```

**After clicking navigation icon:**
```
[ Name, expertise...              ] [ Near me                     ] 🧭✓ | Seek
```

**After typing name:**
```
[ Dr. Stefan                      ] [ Near me                     ] 🧭✓ | Seek
```

**After clicking Seek (dropdown appears):**
```
[ Dr. Stefan                      ] [ Near me                     ] 🧭✓ | Seek
                                     ↓
                                     [Dropdown with filtered results]
```

---

## Auto-Search vs Manual Search

### Auto-search (250ms delay)
- Typing in location field (NOT "Near me")
- Example: Type "Berlin" → auto-searches after 250ms

### Manual search (Seek button)
- When location is "Near me"
- When you want to apply name filter
- Click "Seek" button to trigger search

---

## Technical Details

### State Management
```typescript
searchTerm: string        // Name/expertise field
location: string          // "Near me" or city/postcode
coords: { lat, lng }      // User coordinates
results: Clinic[]         // Search results
```

### Search Flow
```
1. Click 🧭
   → Get location
   → Set location = "Near me"
   → Set coords = { lat, lng }

2. Type in name field
   → Set searchTerm = "Dr. Stefan"

3. Click Seek
   → Call fn_search_clinics(coords)
   → Filter results by searchTerm
   → Sort by distance
   → Show dropdown
```

### Filtering Code
```typescript
if (searchTerm.length >= 2) {
  results = results.filter(clinic => 
    clinic.name.includes(searchTerm) ||
    clinic.city.includes(searchTerm) ||
    clinic.specialties.includes(searchTerm)
  );
}
```

---

## Testing Scenarios

### ✅ Test 1: Basic Near Me Search
1. Click navigation icon
2. Verify: "Near me" appears in location field
3. Click "Seek"
4. Verify: Dropdown shows nearby clinics with distances

### ✅ Test 2: Near Me + Name Filter
1. Click navigation icon → "Near me" appears
2. Type "Dental" in name field
3. Click "Seek"
4. Verify: Only dental clinics shown

### ✅ Test 3: Auto-search Prevention
1. Click navigation icon → "Near me" appears
2. Verify: Dropdown does NOT auto-appear
3. Must click "Seek" to search

### ✅ Test 4: City Search Still Works
1. Type "Berlin" in location field (don't click icon)
2. Verify: Dropdown auto-appears after 250ms
3. Shows Berlin clinics

### ✅ Test 5: Combined Search
1. Get location → "Near me"
2. Type "Dr. Stefan" in name
3. Click "Seek"
4. Verify: Only nearby vets named Stefan

---

## Troubleshooting

### "Near me" doesn't appear
- Click the navigation icon (🧭)
- Allow location permission in browser
- Check console for "Location acquired: lat, lng"

### No results when clicking Seek
- Make sure migration is run (PostGIS enabled)
- Check if clinics exist within 15km
- Try increasing radius in code (in_radius_m: 15000)

### Filtering not working
- Make sure searchTerm is at least 2 characters
- Check spelling in name field
- Try partial matches (e.g., "Derm" instead of "Dermatology")

### Icon doesn't turn blue
- Browser may block geolocation
- Check browser settings for location permission
- Try HTTPS (required for geolocation in production)

---

## Migration Required

Before testing, run this migration:
```bash
pawpoint-find-a-vet/supabase/migrations/20251101000002_add_postgis_geolocation.sql
```

This enables:
- PostGIS for geospatial queries
- Distance calculations
- "Near me" functionality

---

## Summary

✅ **Click 🧭** → Shows "Near me"  
✅ **Type name/expertise** → Filters results  
✅ **Click "Seek"** → Shows nearby clinics  
✅ **Sorted by distance** → Nearest first  

The search is now fully functional with location-based filtering! 🎉

