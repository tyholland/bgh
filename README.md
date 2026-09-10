# BGH Scout

Job-aggregation site (bghscout.com). Surfaces newly posted roles pulled from
employer career pages so job seekers find them sooner.

## Stack

- **Next.js 16** (App Router) + React 19 + TypeScript
- **styled-components** / MUI for UI
- **Firebase Auth** (email/password) — client SDK, state owned by
  `src/components/authProvider/authProvider.tsx`
- **jotai** for `userAtom`
- **Mixpanel** for analytics (no-ops to the console in development)

## Architecture

- The job data comes from the **BGH Scout API** (`NEXT_PUBLIC_API_BASE_URL`) —
  see `BACKEND_REPO_PLAN.md`. It reads the source Google Sheet, dedupes,
  sanitizes, and enriches each job with schema.org/JobPosting details.
- `src/app/page.tsx` (server) fetches the full list once (cached 15 min, tag
  `leads`), runs `src/functions/filterJobs.ts`, and hands **one page** of
  results to the client. The full dataset never ships to the browser.
- Search / Filter / Pagination / Sort update the query string via
  `router.push`; the server re-filters. `src/functions/filterJobs.ts` is the one
  and only filter implementation.
- `POST /api/revalidate` (bearer `REVALIDATE_SECRET`) is called by the API after
  each ingest to refresh the `leads` cache tag.

## Environment

Copy to `.env.local`:

```
NEXT_PUBLIC_API_BASE_URL=        # BGH Scout API base URL
REVALIDATE_SECRET=               # shared secret the API uses to bust the cache

NEXT_PUBLIC_FIREBASE_KEY=
NEXT_PUBLIC_FIREBASE_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_BUCKET=
NEXT_PUBLIC_FIREBASE_SENDER_ID=
NEXT_PUBLIC_FIREBASE_ID=

NEXT_PUBLIC_MIXPANEL_TOKEN=
```

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
npm run lint
npx tsc --noEmit
```

## Notes

- This repo uses a modified Next.js — read `node_modules/next/dist/docs/` before
  relying on framework behavior from memory. See `AGENTS.md`.
- `BACKEND_REPO_PLAN.md` tracks everything the API needs to do, plus the
  remaining frontend follow-ups (env values, true per-user gating).
