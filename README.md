# PawPoint (Pet2Vet.app)

A veterinary clinic booking platform that helps pet owners find trusted vets, pet parks, and pet shops — all in one place.

**Live:** [Pet2Vet.app](https://pet2vet.app)

---

## Features

### Vet Search
- Two-field search bar (name/specialty + location) with geolocation "Near me"
- PawPoint registered clinics from Supabase with radius-expanding search (15km to 200km)
- Google Places API integration showing additional vets nearby
- Clinic profile pages with details and booking

### Pet Park Search
- Discover dog parks, off-leash areas, and pet-friendly parks via Google Places
- Dedicated `/pet-parks` results page with park cards, ratings, open/closed status
- Dog-friendly badges, directions via Google Maps

### Pet Shop Search
- Find pet stores, food, toys, and accessories via Google Places
- Dedicated `/pet-shops` results page with shop cards, ratings, open/closed status
- Pet Store badges, directions via Google Maps

### Appointment Booking
- 24/7 online booking flow with clinic selection
- No phone calls required

### Vet Dashboard
- Vet onboarding and registration
- Analytics, booking management, availability settings

### Pet Owner Dashboard
- Pet management and medical records
- Treatment history with SOAP notes, PDF export (EU Pet Passport format)

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vite, React 18, TypeScript, shadcn/ui, Tailwind CSS |
| Routing | React Router v6 |
| Data Fetching | TanStack React Query |
| Backend | Supabase (PostgreSQL, Auth, Storage, Edge Functions) |
| Geospatial | PostGIS, cube, earthdistance extensions |
| External APIs | Google Places API (New) — Text Search |

---

## Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Index | Homepage with search, mode toggle, hero section |
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
| `/help` | Help | Help and support |

---

## Getting Started

### Prerequisites
- Node.js 18+ and npm
- A Supabase project with the required tables and Edge Functions deployed

### Local Development

```bash
git clone https://github.com/vetcaresupabase-spec/pawpoint-find-a-vet.git
cd pawpoint-find-a-vet
npm install
npm run dev
```

The dev server starts at `http://localhost:8080`.

### Environment Variables

Create a `.env` file in the project root:

```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
```

### Supabase Secrets

Set the Google Places API key as an Edge Function secret (never commit to git):

```
GOOGLE_PLACES_API_KEY=<your-key>
```

See [GOOGLE_API_KEY_SETUP.md](./GOOGLE_API_KEY_SETUP.md) for detailed instructions.

---

## Project Structure

```
src/
  components/       UI components (SearchBar, GoogleVetCard, etc.)
  hooks/            React hooks (useGoogleVetSearch, useGoogleParkSearch, useGoogleShopSearch)
  pages/            Route pages (Index, SearchResults, PetParks, PetShops, etc.)
  integrations/     Supabase client configuration
supabase/
  functions/        Edge Functions (search-google-vets, search-google-parks, search-google-shops)
  migrations/       Database migrations (cache tables, RLS, cleanup functions)
```

---

## Documentation

| Document | Description |
|----------|-------------|
| [CHANGELOG.md](./CHANGELOG.md) | Complete changelog with all features and fixes |
| [GOOGLE_PLACES_INTEGRATION.md](./GOOGLE_PLACES_INTEGRATION.md) | Google Vet Search — architecture, deployment, testing |
| [GOOGLE_PARKS_INTEGRATION.md](./GOOGLE_PARKS_INTEGRATION.md) | Google Park Search — architecture, deployment, testing |
| [GOOGLE_SHOPS_INTEGRATION.md](./GOOGLE_SHOPS_INTEGRATION.md) | Google Shop Search — architecture, deployment, testing |
| [GOOGLE_API_KEY_SETUP.md](./GOOGLE_API_KEY_SETUP.md) | How to set the Google API key in Supabase |

---

## License

Private repository. All rights reserved.
