# Google Places Pet Shop Search Integration

## Overview
This integration adds real Google Maps pet shop / pet store listings to PawPoint, allowing pet owners to discover pet shops near them. It follows the exact same architecture as the Google Vet and Park Search features — server-side Edge Function, 24-hour caching, React hook, and a dedicated results page.

---

## Implementation Summary

### Completed Components

#### 1. Database Migration (`supabase/migrations/20260315000000_google_shops_cache.sql`)
- Created `google_shops_cache` table with:
  - Deterministic cache keys (prefix `shops:` + normalized query + rounded coordinates)
  - 24-hour TTL (expires_at)
  - Hit tracking (hit_count, last_hit_at)
  - Result storage as JSONB
- Indexes on `cache_key` (unique) and `expires_at`
- RLS enabled: public SELECT, service_role ALL
- `cleanup_expired_shops_cache()` cleanup function

#### 2. Edge Function (`supabase/functions/search-google-shops/index.ts`)
- Server-side proxy for Google Places API (New) Text Search
- Uses `includedType: "pet_store"` and query prefix `pet shop`
- Caching logic:
  - Cache HIT: Returns cached results + increments hit_count
  - Cache MISS: Calls Google API + stores in cache with 24hr TTL
- Transforms Google Places data to PawPoint shop format
- CORS-enabled, JWT-verified, uses service role key for cache writes

#### 3. React Hook (`src/hooks/useGoogleShopSearch.ts`)
- `useGoogleShopSearch()` hook with:
  - State: `results`, `loading`, `error`, `dataSource`
  - Function: `searchGoogleShops(params)` (memoized with `useCallback`)
  - 10-second timeout via `Promise.race`
  - Dev-mode logging for cache source
- Exports `GoogleShopPlace` and `GoogleShopSearchParams` interfaces

#### 4. Pet Shops Page (`src/pages/PetShops.tsx`)
- Dedicated results page at `/pet-shops`
- Reads `query` and `location` from URL search params
- Left panel (480px desktop / full mobile):
  - Header with location and result count
  - Loading skeletons while fetching
  - Error and empty states (ShoppingBag icon)
  - Shop cards: name, address, star rating, open/closed badge, Pet Store badge (Store icon)
  - Directions button (opens Google Maps)
  - Save button (placeholder for future favourites)
- Right panel: map placeholder for future integration

#### 5. Route Registration (`src/App.tsx`)
- Added `import PetShops` and `<Route path="/pet-shops" ...>` below `/pet-parks`
- No changes to existing `/search` or `/pet-parks` routes

#### 6. SearchBar Update (`src/components/SearchBar.tsx`)
- Extended `searchMode` prop to `"vets" | "parks" | "shops"` (defaults to `"vets"`)
- Shops mode: placeholder changes to "Food, toys, accessories..."
- Shops mode: navigates to `/pet-shops?query=...&location=...`
- Fully backward-compatible — existing callers unchanged

#### 7. Homepage Toggle (`src/pages/Index.tsx`)
- Extended `SearchMode` type to include `"shops"`
- Third pill-shaped button: "Pet Shops" (ShoppingBag icon)
- Dynamic heading: "Find pet shops near you" when shops is active
- `handleSearch` routes to `/pet-shops` when mode is shops

---

## Architecture Diagram

```
Homepage (Index.tsx)
  |
  |-- [Vets]      --> /search?petType=...&location=...     (unchanged)
  |-- [Parks]     --> /pet-parks?query=...&location=...     (unchanged)
  |-- [Pet Shops] --> /pet-shops?query=...&location=...
                        |
                        v
                  PetShops.tsx
                        |
                        v
               useGoogleShopSearch()
                        |
                        v
            supabase.functions.invoke("search-google-shops")
                        |
                        v
              Edge Function (search-google-shops)
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
| `supabase/migrations/20260315000000_google_shops_cache.sql` | Cache table, indexes, RLS, cleanup function |
| `supabase/functions/search-google-shops/index.ts` | Edge Function — Google Places proxy with caching |
| `src/hooks/useGoogleShopSearch.ts` | React hook for shop search state management |
| `src/pages/PetShops.tsx` | Pet Shops results page |

## Files Modified

| File | Change |
|------|--------|
| `src/App.tsx` | Added PetShops import and `/pet-shops` route |
| `src/components/SearchBar.tsx` | Extended `searchMode` to include `"shops"`, dynamic placeholder, conditional routing |
| `src/pages/Index.tsx` | Added "Pet Shops" toggle button, extended SearchMode type, updated heading and routing |

## Files NOT Modified (by design)

- `supabase/functions/search-google-vets/index.ts`
- `supabase/functions/search-google-parks/index.ts`
- `src/hooks/useGoogleVetSearch.ts`
- `src/hooks/useGoogleParkSearch.ts`
- `src/components/GoogleVetCard.tsx`
- `src/pages/SearchResults.tsx`
- `src/pages/PetParks.tsx`
- `/search` route
- `/pet-parks` route

---

## Testing

### Manual Testing Steps
1. Go to homepage — verify "Vets" is active by default
2. Click "Pet Shops" toggle — heading changes to "Find pet shops near you"
3. Enter "Berlin" in location — click Search
4. Verify: navigates to `/pet-shops?query=&location=Berlin`
5. Verify: loading skeletons appear, then shop cards load
6. Verify: cards show name, address, rating, open/closed badge, Pet Store badge
7. Click "Directions" — opens Google Maps in new tab
8. Switch back to "Vets" — verify vet search still works unchanged
9. Switch to "Pet Parks" — verify park search still works unchanged

### Cache Testing
```sql
-- Check shops cache entries
SELECT cache_key, result_count, hit_count, created_at, expires_at
FROM google_shops_cache
ORDER BY created_at DESC
LIMIT 10;

-- Cache hit rate
SELECT
  COUNT(*) as total_entries,
  SUM(hit_count) as total_hits,
  AVG(hit_count)::numeric(10,1) as avg_hits
FROM google_shops_cache;
```

---

## Maintenance

### Periodic Tasks
1. **Cache Cleanup (Weekly):**
   ```sql
   SELECT cleanup_expired_shops_cache();
   ```

2. **Monitor Cache Size:**
   ```sql
   SELECT
     pg_size_pretty(pg_total_relation_size('google_shops_cache')) as table_size,
     COUNT(*) as entry_count
   FROM google_shops_cache;
   ```

---

## Future Enhancements
- Map integration (Google Maps / Mapbox) in the right panel
- Shop photos via Google Places Photos API
- Save / Favourites with user auth
- Dedicated shop detail page
- Opening hours display on cards
- Filters: rating, open now, distance, product categories
- Geolocation "Near me" for proximity-based results
- Pagination / infinite scroll
- Analytics tracking for shop searches
