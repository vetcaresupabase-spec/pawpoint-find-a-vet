# Google Places Pet Park Search Integration

## Overview
This integration adds real Google Maps dog park and pet park listings to PawPoint, allowing pet owners to discover parks near them. It follows the exact same architecture as the Google Vet Search feature — server-side Edge Function, 24-hour caching, React hook, and a dedicated results page.

---

## Implementation Summary

### Completed Components

#### 1. Database Migration (`supabase/migrations/20260310000000_google_parks_cache.sql`)
- Created `google_parks_cache` table with:
  - Deterministic cache keys (prefix `parks:` + normalized query + rounded coordinates)
  - 24-hour TTL (expires_at)
  - Hit tracking (hit_count, last_hit_at)
  - Result storage as JSONB
- Indexes on `cache_key` (unique) and `expires_at`
- RLS enabled: public SELECT, service_role ALL
- `cleanup_expired_parks_cache()` cleanup function

#### 2. Edge Function (`supabase/functions/search-google-parks/index.ts`)
- Server-side proxy for Google Places API (New) Text Search
- Uses `includedType: "dog_park"` and keywords `dog park pet park off-leash`
- Caching logic:
  - Cache HIT: Returns cached results + increments hit_count
  - Cache MISS: Calls Google API + stores in cache with 24hr TTL
- Transforms Google Places data to PawPoint park format
- CORS-enabled, JWT-verified, uses service role key for cache writes

#### 3. React Hook (`src/hooks/useGoogleParkSearch.ts`)
- `useGoogleParkSearch()` hook with:
  - State: `results`, `loading`, `error`, `dataSource`
  - Function: `searchGoogleParks(params)` (memoized with `useCallback`)
  - 10-second timeout via `Promise.race`
  - Dev-mode logging for cache source
- Exports `GoogleParkPlace` and `GoogleParkSearchParams` interfaces

#### 4. Pet Parks Page (`src/pages/PetParks.tsx`)
- Dedicated results page at `/pet-parks`
- Reads `query` and `location` from URL search params
- Left panel (480px desktop / full mobile):
  - Header with location and result count
  - Loading skeletons while fetching
  - Error and empty states
  - Park cards: name, address, star rating, open/closed badge, dog-friendly badge
  - Directions button (opens Google Maps)
  - Save button (placeholder for future favourites)
- Right panel: map placeholder for future integration

#### 5. Route Registration (`src/App.tsx`)
- Added `import PetParks` and `<Route path="/pet-parks" ...>` above catch-all
- No changes to existing `/search` route

#### 6. SearchBar Update (`src/components/SearchBar.tsx`)
- New optional prop: `searchMode?: "vets" | "parks"` (defaults to `"vets"`)
- Parks mode: placeholder changes to "e.g. dog park, off-leash area"
- Parks mode: navigates to `/pet-parks?query=...&location=...`
- Fully backward-compatible — existing callers unchanged

#### 7. Homepage Toggle (`src/pages/Index.tsx`)
- `useState<"vets" | "parks">("vets")` — defaults to Vets
- Two pill-shaped toggle buttons: "Vets" (Stethoscope icon) / "Pet Parks" (TreePine icon)
- Dynamic heading: "Find trusted vets near you" / "Find pet parks near you"
- Passes `searchMode` to SearchBar
- `handleSearch` routes to correct page based on mode

---

## Architecture Diagram

```
Homepage (Index.tsx)
  |
  |-- [Vets] --> /search?petType=...&location=...  (unchanged)
  |-- [Parks] --> /pet-parks?query=...&location=...
                     |
                     v
              PetParks.tsx
                     |
                     v
            useGoogleParkSearch()
                     |
                     v
         supabase.functions.invoke("search-google-parks")
                     |
                     v
           Edge Function (search-google-parks)
              |                    |
         Cache HIT            Cache MISS
         (return)          (Google Places API)
                               |
                          Transform + Cache
                               |
                          Return results
```

---

## Files Created

| File | Purpose |
|------|---------|
| `supabase/migrations/20260310000000_google_parks_cache.sql` | Cache table, indexes, RLS, cleanup function |
| `supabase/functions/search-google-parks/index.ts` | Edge Function — Google Places proxy with caching |
| `src/hooks/useGoogleParkSearch.ts` | React hook for park search state management |
| `src/pages/PetParks.tsx` | Pet Parks results page |

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Added PetParks import and `/pet-parks` route |
| `src/components/SearchBar.tsx` | Added `searchMode` prop, dynamic placeholder, conditional routing |
| `src/pages/Index.tsx` | Added search mode state, toggle UI, dynamic heading |

## Files NOT Modified (by design)

- `supabase/functions/search-google-vets/index.ts`
- `src/hooks/useGoogleVetSearch.ts`
- `src/components/GoogleVetCard.tsx`
- `src/pages/SearchResults.tsx`
- `/search` route

---

## Testing

### Manual Testing Steps
1. Go to homepage — verify "Vets" is active by default
2. Click "Pet Parks" toggle — heading and placeholder change
3. Enter "Mumbai" in location — click Search
4. Verify: navigates to `/pet-parks?query=&location=Mumbai`
5. Verify: loading skeletons appear, then park cards load
6. Verify: cards show name, address, rating, badges, action buttons
7. Click "Directions" — opens Google Maps in new tab
8. Switch back to "Vets" — verify vet search still works unchanged

### Cache Testing
```sql
-- Check parks cache entries
SELECT cache_key, result_count, hit_count, created_at, expires_at
FROM google_parks_cache
ORDER BY created_at DESC
LIMIT 10;

-- Cache hit rate
SELECT
  COUNT(*) as total_entries,
  SUM(hit_count) as total_hits,
  AVG(hit_count)::numeric(10,1) as avg_hits
FROM google_parks_cache;
```

---

## Maintenance

### Periodic Tasks
1. **Cache Cleanup (Weekly):**
   ```sql
   SELECT cleanup_expired_parks_cache();
   ```

2. **Monitor Cache Size:**
   ```sql
   SELECT
     pg_size_pretty(pg_total_relation_size('google_parks_cache')) as table_size,
     COUNT(*) as entry_count
   FROM google_parks_cache;
   ```

---

## Future Enhancements
- Map integration (Google Maps / Mapbox) in the right panel
- Park photos via Google Places Photos API
- Save / Favourites with user auth
- Dedicated park detail page
- Opening hours display on cards
- Filters: rating, open now, distance, off-leash vs fenced
- Geolocation "Near me" for proximity-based results
- Pagination / infinite scroll
- Analytics tracking for park searches
