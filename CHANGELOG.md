# PawPoint (Pet2Vet) — Changelog

All notable changes to this project are documented in this file.

---

## [2026-03-10] — Google Places Pet Park Search

### Added
- **`google_parks_cache` table** — Supabase migration for caching Google park results (24hr TTL, hit tracking, RLS, cleanup function)
- **`search-google-parks` Edge Function** — Server-side proxy for Google Places API (New) Text Search, filtered to `dog_park` type with keywords `dog park pet park off-leash`, 24hr caching
- **`useGoogleParkSearch` React hook** — State management for park search (results, loading, error, dataSource), 10s timeout, memoized with useCallback
- **`PetParks.tsx` results page** — Dedicated `/pet-parks` route with park cards (name, address, rating, open/closed, dog-friendly badge, Directions, Save), loading skeletons, error/empty states, map placeholder
- **`/pet-parks` route** in `App.tsx`
- **`searchMode` prop** on `SearchBar` — accepts `"vets"` (default) or `"parks"`, changes placeholder and navigation target
- **Search mode toggle** on homepage (`Index.tsx`) — Vets / Pet Parks pill buttons, dynamic heading, conditional routing

### Documentation
- Created `GOOGLE_PARKS_INTEGRATION.md` — full implementation guide, architecture diagram, testing steps, maintenance tasks

### Unchanged (by design)
- `search-google-vets` Edge Function
- `useGoogleVetSearch` hook
- `GoogleVetCard` component
- `SearchResults.tsx` and `/search` route
- `google_places_cache` table
- Default homepage experience (Vets mode)

---

## [2026-03-01] — Google Places Vet Search

### Added
- **`google_places_cache` table** — Supabase migration for caching Google vet results (24hr TTL, hit tracking, RLS, cleanup function)
- **`search-google-vets` Edge Function** — Server-side proxy for Google Places API, caches results for 24 hours
- **`useGoogleVetSearch` React hook** — Invokes Edge Function, manages state, 10s timeout, useCallback memoization
- **`GoogleVetCard.tsx` component** — Displays Google vet results with rating, phone, website, open/closed status, Google Maps link
- **Google Vets in SearchResults.tsx** — "More Vets Nearby" section below PawPoint clinics, parallel non-blocking search

### Fixed
- Infinite re-render loop in `SearchResults.tsx` caused by `searchGoogleVets` in useEffect deps (fixed with useCallback)
- `fn_search_clinics` ambiguous column reference for `city` (fixed with table aliasing)
- DNS resolution issue for Supabase connectivity (hosts file fix)

### Documentation
- Created `GOOGLE_PLACES_INTEGRATION.md`
- Created `GOOGLE_API_KEY_SETUP.md`

---

## Pre-existing Features (as of 2026-03-01)

### Core Platform
- **Vet Search** — Two-field SearchBar (name/specialty + location), geolocation "Near me", dropdown autocomplete with distance, `/search` results page with PawPoint clinics
- **Clinic Profiles** — Dedicated `/clinic/:id` page with clinic details
- **Appointment Booking** — `/book-appointment` flow with clinic selection
- **Vet Onboarding** — `/vet-onboarding` registration and `/for-vets` landing page
- **Vet Dashboard** — `/vet-dashboard` with analytics, bookings management
- **Pet Owner Dashboard** — `/pet-owner-dashboard` with pet management, medical records

### Medical Records System
- **Edit Treatment Records** — Full audit trail, amendment tracking, SOAP notes
- **Export PDF** — EU Pet Passport format, complete medical history
- **Treatment database schema** — 10 tables, 6 functions, 20+ RLS policies

### Infrastructure
- **Supabase** — PostgreSQL, Auth, Storage, Edge Functions, PostGIS
- **Geolocation Search** — `fn_search_clinics` RPC with radius expansion (15km → 200km)
- **Translation Banner** — Multi-language support indicator
- **Responsive Design** — Mobile-first with Tailwind CSS breakpoints

### Pages
| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Homepage with search, hero, features |
| `/search` | SearchResults | Vet search results (PawPoint + Google) |
| `/pet-parks` | PetParks | Park search results (Google Places) |
| `/clinic/:id` | ClinicProfile | Clinic details and booking |
| `/book-appointment` | BookAppointment | Appointment booking flow |
| `/for-vets` | ForVets | Vet partner landing page |
| `/vet-onboarding` | VetOnboarding | Vet registration |
| `/vet-dashboard` | VetDashboard | Vet management panel |
| `/pet-owner-dashboard` | PetOwnerDashboard | Pet owner panel |
| `/account` | Account | User account settings |
| `/privacy` | Privacy | Privacy policy |
| `/help` | Help | Help & support |

### Tech Stack
- **Frontend:** Vite, React 18, TypeScript, shadcn/ui, Tailwind CSS
- **Routing:** React Router v6
- **Data Fetching:** TanStack React Query
- **Backend:** Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **APIs:** Google Places API (New) — Text Search
- **Geospatial:** PostGIS, cube, earthdistance extensions
