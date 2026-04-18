# Work In Progress

This folder contains incomplete/interrupted tasks that are parked for later.

---

## testing/

**Status:** Interrupted — not yet functional

**What's here:**
- `vitest.config.ts` — Vitest configuration with jsdom environment
- `src/test/setup.ts` — Test setup file (DOM mocks, matchMedia, IntersectionObserver)
- `src/test/test-utils.tsx` — Custom render wrapper with providers (QueryClient, Router, Auth)
- `src/test/smoke.test.ts` — Basic smoke test
- `src/components/__tests__/Header.test.tsx` — Header component tests
- `src/pages/__tests__/` — Page-level tests (Account, BookAppointment, ClinicProfile, NotFound, SearchResults)

**To resume:**
1. Move `vitest.config.ts` back to project root
2. Move `src/` contents back to `src/`
3. Install test dependencies: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
4. Run `npx vitest` to check status

**Dependencies needed (check if already in package.json):**
- vitest
- @testing-library/react
- @testing-library/jest-dom
- @testing-library/user-event
- jsdom
