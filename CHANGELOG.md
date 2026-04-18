# PawPoint (Pet2Vet) — Changelog

All notable changes to this project are documented in this file.

---

## [2026-04-18] — UI/UX Audit, Mobile Must-Haves & Release Signing

### UI/UX Audit (WCAG 2.1 AA Compliance)
- **Design tokens** — Standardized spacing, color, and typography across all components
- **Interactive states** — Added proper hover, focus-visible, active, and disabled states to all interactive elements
- **Skeleton loading** — Added loading skeletons to replace raw spinners on data-heavy pages
- **Form validation** — Inline validation with blur-based triggering, `aria-invalid` and `aria-describedby` for accessibility
- **Breadcrumbs** — Added `PageBreadcrumbs` component used on BookAppointment, SearchResults, ClinicProfile, and Account pages
- **Skip-to-main** — Added keyboard-accessible skip link for screen reader users
- **404 page** — Redesigned NotFound page with helpful navigation
- **Section progress** — Added `SectionProgressBar` for multi-step pet forms (AddPetDialog, EditPetDialog)
- **Toast improvements** — Always-visible close button with 44px touch target
- **Focus management** — Consistent `focus-visible` ring styles across all interactive components

### Mobile Must-Haves
- **Touch targets** — All buttons, switches, inputs, selects, and icon buttons now meet 44x44px minimum (WCAG 2.5.5)
- **Touch spacing** — Increased spacing between adjacent interactive elements (time slots, form fields)
- **Hover alternatives** — Actions revealed on hover for desktop now always visible on mobile
- **Font sizing** — `text-base` (16px) on mobile for all inputs/textareas/selects to prevent iOS auto-zoom
- **Sticky CTAs** — Fixed bottom action bars on mobile for BookAppointment flow
- **Safe area insets** — Added `viewport-fit=cover` and `env(safe-area-inset-*)` padding for notched devices
- **Keyboard types** — `inputMode="tel"` for phone fields, `inputMode="decimal"` for weight/height fields
- **Haptic feedback** — New `haptics.ts` utility with success/warning/error feedback on booking, pet deletion
- **Offline banner** — New `OfflineBanner` component with real-time online/offline detection
- **Keyboard avoidance** — Added `interactive-widget=resizes-content` viewport meta for proper keyboard handling

### Android Release Signing
- **Release keystore** — Generated signing key for APK Signature Scheme v2
- **Gradle config** — Added `signingConfigs.release` in `build.gradle` with external `keystore.properties`
- **JDK 17 compatibility** — Resolved Java/Kotlin compilation issues across Capacitor plugins
- **Version bump** — Updated to v1.1 (versionCode 2)
- **Security** — Added `keystore.properties` and `*.keystore` to `.gitignore`

### New Files
- `src/components/OfflineBanner.tsx` — Offline status indicator
- `src/components/PageBreadcrumbs.tsx` — Reusable breadcrumb navigation
- `src/components/SectionProgressBar.tsx` — Multi-step form progress indicator
- `src/lib/haptics.ts` — Cross-platform haptic feedback utility
- `_wip/` — Parked testing setup (vitest, component tests) for future completion

### Modified Components (Touch Target & State Fixes)
- `button.tsx`, `input.tsx`, `select.tsx`, `switch.tsx`, `textarea.tsx`, `toast.tsx`
- `Header.tsx`, `PetCard.tsx`, `SearchBar.tsx`, `TranslationBanner.tsx`
- `AddPetDialogComprehensive.tsx`, `EditPetDialog.tsx`, `VetRegistrationDialog.tsx`
- `BookAppointment.tsx`, `PetOwnerDashboard.tsx`, `ClinicProfile.tsx`, `SearchResults.tsx`
- `Account.tsx`, `Index.tsx`, `NotFound.tsx`, `Help.tsx`, `ForVets.tsx`
- `VetDashboard.tsx` and vet sub-tabs (AnalyticsTab, ServicesTab, TodayTab, etc.)
- Gamification components (DailyQuizModal, LeaderboardCard, PointsBadge)

---

## [2026-04-05] — Capacitor Native Builds & Gamification System

### Added
- **Capacitor integration** — Native iOS and Android project scaffolding
- **Gamification system** — Points, streaks, daily quiz, leaderboard, feature flags
- **Release APK** — Android release build pipeline with signing

---

## [2026-03-15] — Google Places Pet Shop Search

### Added
- **`google_shops_cache` table** — Supabase migration for caching Google pet shop results (24hr TTL, hit tracking, RLS, cleanup function)
- **`search-google-shops` Edge Function** — Server-side proxy for Google Places API (New) Text Search, filtered to `pet_store` type, 24hr caching
- **`useGoogleShopSearch` React hook** — State management for shop search (results, loading, error, dataSource), 10s timeout, memoized with useCallback
- **`PetShops.tsx` results page** — Dedicated `/pet-shops` route with shop cards (name, address, rating, open/closed, Pet Store badge, Directions, Save), loading skeletons, error/empty states, map placeholder
- **`/pet-shops` route** in `App.tsx`
- **`searchMode` extended** on `SearchBar` — now accepts `"vets" | "parks" | "shops"`, shops mode placeholder: "Food, toys, accessories..."
- **Pet Shops toggle** on homepage (`Index.tsx`) — third pill button with ShoppingBag icon, dynamic heading "Find pet shops near you"

### Documentation
- Created `GOOGLE_SHOPS_INTEGRATION.md` — full implementation guide, architecture, testing steps

### Unchanged (by design)
- `search-google-vets` Edge Function
- `search-google-parks` Edge Function
- `useGoogleVetSearch` hook
- `useGoogleParkSearch` hook
- `GoogleVetCard` component
- `SearchResults.tsx` and `/search` route
- `PetParks.tsx` and `/pet-parks` route
- `google_places_cache` table
- `google_parks_cache` table
- Default homepage experience (Vets mode)

---

## [2026-03-10] — Google Places Pet Park Search

### Added
- **`google_parks_cache` table** — Supabase migration for caching Google park results (24hr TTL, hit tracking, RLS, cleanup function)
- **`search-google-parks` Edge Function** — Server-side proxy for Google Places API (New) Text Search, filtered to `dog_park` type with keywords `dog park pet park off-leash`, 24hr caching
- **`useGoogleParkSearch` React hook** — State management for park search (results, loading, error, dataSource), 10s timeout, memoized with useCallback
- **`PetParks.tsx` results page** — Dedicated `/pet-parks` route with park cards (name, address, rating, open/closed, dog-friendly badge, Directions, Save), loading skeletons, error/empty states, map placeholder
- **`/pet-parks` route** in `App.tsx`
- **`searchMode` prop** on `SearchBar` — accepts `"vets"` (default), `"parks"`, or `"shops"`, changes placeholder and navigation target
- **Search mode toggle** on homepage (`Index.tsx`) — Vets / Pet Parks / Pet Shops pill buttons, dynamic heading, conditional routing

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
| `/pet-shops` | PetShops | Pet shop search results (Google Places) |
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
