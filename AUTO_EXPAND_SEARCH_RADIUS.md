# Automatic Search Radius Expansion

## Feature Overview

When no clinics are found nearby, the search automatically expands the radius to find the closest available clinics.

---

## How It Works

### Smart Radius Expansion

The search tries progressively larger radii until it finds results:

```
1. Try 15km   → No results
2. Try 50km   → No results  
3. Try 100km  → No results
4. Try 200km  → Found 5 clinics ✓
```

**Result:** Shows the 5 clinics found within 200km, sorted by distance.

---

## Search Flow

### Step 1: Initial Search (15km)
```
User location: Berlin center
Search radius: 15km
Result: 0 clinics found
```

### Step 2: Expand to 50km
```
User location: Berlin center
Search radius: 50km
Result: 0 clinics found
```

### Step 3: Expand to 100km
```
User location: Berlin center
Search radius: 100km
Result: 0 clinics found
```

### Step 4: Expand to 200km
```
User location: Berlin center
Search radius: 200km
Result: 3 clinics found ✓
```

### Display Results
```
┌─────────────────────────────────────────┐
│ 🏥 Clinic A                   95.3 km  │
│    Hamburg                               │
├─────────────────────────────────────────┤
│ 🏥 Clinic B                  132.7 km  │
│    Munich                                │
├─────────────────────────────────────────┤
│ 🏥 Clinic C                  187.2 km  │
│    Frankfurt                             │
└─────────────────────────────────────────┘
```

---

## Radius Progression

### 4-Stage Expansion
1. **15km** - Immediate neighborhood (first try)
2. **50km** - Extended local area (second try)
3. **100km** - Regional search (third try)
4. **200km** - Wide area search (final try)

### Why These Distances?

- **15km**: Local clinics, quick commute
- **50km**: Nearby cities, reasonable drive
- **100km**: Regional coverage, day trip distance
- **200km**: Ensures results in most countries

---

## User Experience

### What Users See

1. **Click "Seek"** → Search starts
2. **Spinner shows** → "Searching..."
3. **Results appear** → Sorted by distance
4. **Distance shown** → "95.3 km" (actual distance)

### Console Feedback (for debugging)
```
Found 3 clinics within 200km
Expanded search to 200km to find results
```

---

## Example Scenarios

### Scenario 1: Dense Urban Area (Berlin)
```
Search: "Near me"
Radius 15km: 8 clinics found ✓
Display: All 8 clinics within 15km
```

### Scenario 2: Suburban Area
```
Search: "Near me"
Radius 15km: 0 clinics found
Radius 50km: 4 clinics found ✓
Display: 4 clinics within 50km
```

### Scenario 3: Rural Area
```
Search: "Near me"
Radius 15km: 0 clinics found
Radius 50km: 0 clinics found
Radius 100km: 0 clinics found
Radius 200km: 2 clinics found ✓
Display: 2 clinics within 200km
```

### Scenario 4: Very Remote Location
```
Search: "Near me"
Radius 15km: 0 clinics found
Radius 50km: 0 clinics found
Radius 100km: 0 clinics found
Radius 200km: 0 clinics found
Display: "No results found" message
```

---

## With Name/Expertise Filter

The radius expansion also works with filters:

### Example: Find Dermatologist
```
Name field: "Dermatology"
Location: "Near me" (rural area)

Search process:
1. 15km → 0 dermatology clinics
2. 50km → 0 dermatology clinics
3. 100km → 2 dermatology clinics ✓

Result: Shows 2 dermatology clinics within 100km
```

---

## Technical Implementation

### Code Flow
```typescript
const radii = [15000, 50000, 100000, 200000]; // meters

for (const radius of radii) {
  // Search with current radius
  const results = await searchClinics(radius);
  
  // Apply name/expertise filter if provided
  if (searchTerm) {
    results = filterByName(results, searchTerm);
  }
  
  // If found results, stop expanding
  if (results.length > 0) {
    return results;
  }
}

// No results found even at 200km
return [];
```

### Database Function Called
```sql
fn_search_clinics(
  in_lat:              user_latitude,
  in_lng:              user_longitude,
  in_city_or_postcode: null,
  in_radius_m:         15000, -- then 50000, 100000, 200000
  in_limit:            20     -- fetch up to 20, display 10
)
```

### Performance Optimization
- Fetches 20 results per query
- Displays top 10 only
- Stops expanding once results found
- Each query is fast (PostGIS indexed)

---

## Benefits

### ✅ Better User Experience
- Always shows results (if any clinics exist)
- No frustrating "No results found" in suburbs/rural areas
- Realistic distances displayed

### ✅ Geographic Flexibility
- Works in cities (finds nearby)
- Works in suburbs (expands to 50km)
- Works in rural areas (expands to 200km)
- Handles edge cases automatically

### ✅ Smart Search
- Prioritizes closest clinics first
- Only expands when necessary
- Maintains distance sorting
- Respects name/expertise filters

---

## User Messages

### When Results Found Nearby (15km)
```
Console: "Found 5 clinics within 15km"
Display: Normal dropdown with results
```

### When Search Expanded (50km+)
```
Console: "Expanded search to 100km to find results"
Display: Normal dropdown with results + actual distances
```

### When No Results Found
```
Display: "No clinics found. Try adjusting your search criteria."
```

---

## Testing

### Test 1: Urban Area
1. Set location to Berlin center
2. Click "Seek"
3. ✅ Should find clinics within 15km
4. ✅ Console: "Found X clinics within 15km"

### Test 2: Suburban Area
1. Set location to suburban area (no clinics nearby)
2. Click "Seek"
3. ✅ Should expand to 50km or 100km
4. ✅ Console: "Expanded search to 50km..."
5. ✅ Results show actual distances

### Test 3: With Filter
1. Set location to "Near me"
2. Type "Dermatology" in name field
3. Click "Seek"
4. ✅ Expands until dermatology clinics found
5. ✅ Only shows matching specialties

### Test 4: No Results
1. Set location where no clinics exist within 200km
2. Click "Seek"
3. ✅ Shows "No results found" message
4. ✅ Console: "Found 0 clinics within 200km"

---

## Configuration

### Adjusting Radii

To change the search radii, edit `SearchBar.tsx`:

```typescript
// Current configuration
const radii = [15000, 50000, 100000, 200000];

// Example: More aggressive expansion
const radii = [10000, 30000, 75000, 150000, 300000];

// Example: Conservative (city-focused)
const radii = [10000, 25000, 50000];
```

### Adjusting Result Limit

```typescript
// Fetch more results per query
in_limit: 20  // Currently 20, display 10

// Change to fetch/display more
in_limit: 50  // Fetch 50, display top 10-15
```

---

## Migration Required

This feature requires the PostGIS migration to be run:

```bash
pawpoint-find-a-vet/supabase/migrations/20251101000002_add_postgis_geolocation.sql
```

---

## Summary

✅ **Automatic expansion**: No manual adjustment needed  
✅ **Smart radius**: 15km → 50km → 100km → 200km  
✅ **Always sorted**: Nearest first, regardless of radius  
✅ **Works with filters**: Name/expertise filtering maintained  
✅ **User-friendly**: Shows actual distances in results  

The search now intelligently finds the closest clinics, even in rural areas! 🎉

