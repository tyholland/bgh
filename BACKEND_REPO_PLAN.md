# BGH Scout — Backend Repo Plan

Spec / build checklist for a new backend repo (`bgh-scout-api`) that takes over
reading the Google Sheet CSV and enriching each job with its "additional job
details", then serves the whole dataset from a single endpoint.

Written against the current frontend in this repo (`bgh`, Next.js 16.2.6). Keep
this file in sync if the frontend data contracts change.

---

## 1. Why this exists

Today the frontend does all of this itself, in the browser / server component:

| Concern | Where it lives now |
| --- | --- |
| Download the published Google Sheet CSV | `src/app/page.tsx` → `getCSVData()` |
| Parse CSV (`papaparse`) | `src/app/page.tsx`, `src/functions/search.ts` |
| Filter / sort / paginate | duplicated in `src/app/page.tsx` **and** `src/functions/search.ts` |
| Crawl each job `Link` for JSON-LD `JobPosting` ("additional details") | `getAdditionalJobDetails()` — defined in **both** files, **currently never called** |
| Cache freshness | `src/app/api/revalidate/route.ts` + Vercel cron (`src/vercel.json`), `revalidateTag("leads", "max")` 4×/day at 03/09/15/21 ET |

Problems this backend solves:

- The CSV URL, sheet structure, and scrape cadence are hard-coded in the client bundle.
- "Additional job details" was never shipped because crawling N external URLs per
  request is too slow and unreliable inside a Next.js request.
- Filtering logic is duplicated and must be hand-kept in sync.

**Goal:** the backend produces one enriched, deduped snapshot on a schedule and
serves it from `GET /v1/jobs` in a single response. The frontend keeps its
existing client-side filtering untouched (MVP) and just swaps its data source.

---

## 2. Architecture

Two responsibilities, one repo:

```
            ┌─────────────────────────────────────────┐
            │  Ingest worker (cron: 03/09/15/21 ET)    │
            │  1. GET published Google Sheet CSV       │
            │  2. Parse + normalize rows               │
            │  3. Dedupe by Link, diff vs stored       │
            │  4. Enrich new/stale/failed rows:        │
            │     fetch Link → extract JSON-LD         │
            │     JobPosting → JobDetails              │
            │  5. Persist enriched snapshot            │
            └───────────────┬─────────────────────────┘
                            │  writes
                            ▼
                   ┌──────────────────┐
                   │   Datastore      │  (Postgres recommended)
                   └────────┬─────────┘
                            │  reads
                            ▼
            ┌─────────────────────────────────────────┐
            │  API (HTTP)                              │
            │  GET  /v1/jobs      → full enriched set  │
            │  GET  /v1/status    → last run info      │
            │  GET  /health                           │
            │  POST /v1/ingest    → force re-ingest    │
            └─────────────────────────────────────────┘
```

### 2.1 Recommended stack

- **Runtime:** Node 22 LTS + TypeScript.
- **HTTP:** Fastify (small, fast, good schema validation) — or Express if preferred.
- **CSV:** `papaparse` (same lib the frontend uses — identical parsing behavior) or `csv-parse`.
- **HTML/JSON-LD extraction:** `cheerio` (robust) instead of the current regex.
- **Concurrency control:** `p-limit`.
- **Scheduling:** `node-cron` inside the service **or** the host's scheduler (Render Cron Job / Railway Cron / GitHub Actions) hitting `POST /v1/ingest`.
- **Datastore:** Postgres (Neon or Supabase free tier). Alternative for a bare MVP: a single JSON blob in Upstash Redis / S3 / R2.
- **Hosting:** Render or Railway (a always-on web service + a scheduled job). A
  persistent process matters because the first enrichment backfill can run for
  many minutes.

### 2.2 Alternative: Vercel-only

Doable but more friction: Vercel Cron + Vercel Postgres/KV, and the ingest must be
**chunked** across multiple invocations to stay under the function time limit
(crawl ~50–100 links per invocation, resume via a cursor). Only choose this if you
want everything on one platform.

---

## 3. Data source — the Google Sheet CSV

- URL (currently in `src/app/page.tsx`):
  `https://docs.google.com/spreadsheets/d/e/2PACX-1vTWtRcbb_EAVdtXttu1a9auwcoh67J9kY92xsDf-zttSXKSrIq6olsZq5GI6gNgJ85119sgnpiVGNFy/pub?output=csv`
  → move to env var `CSV_SOURCE_URL`.
- Parse options must match the frontend: `{ header: true, skipEmptyLines: true }`.
- Columns (exact header strings — keep them as-is in the API row objects for MVP):
  - `Role Name` — string
  - `Primary Industry` — string
  - `Scrape_DateTime` — timestamp, parsed with dayjs; used for "most recent" sort and the "Opportunity Refresh" label (`allData[0].Scrape_DateTime`)
  - `Scrape_Date` — date string with **`/` separators** (frontend compares `item.Scrape_Date === exact.replaceAll("-", "/")`)
  - `Company` — string
  - `Link` — absolute URL to the job posting (dedupe key + crawl target)
- Open questions to confirm with the sheet owner:
  - Can a row's `Link` change while representing the same job? (affects dedupe key)
  - Are delisted jobs **removed** from the sheet, or do they stay forever? (affects whether the API should drop rows no longer present)
  - Max expected row count? (affects backfill time + response size)

---

## 4. Enrichment — "additional job details"

This is the feature that was never shipped. For each job `Link`, fetch the page
and pull structured data from its `schema.org/JobPosting` JSON-LD.

### 4.1 Target shape (must match frontend `JobDetails` in `src/types.ts`)

```ts
interface JobDetails {
  datePosted: string;        // ISO date from JSON-LD
  description: string;       // raw HTML string — frontend runs he.decode() + dangerouslySetInnerHTML
  employmentType: string;    // JSON-LD may give string | string[]; join array with ", "
  jobLocation: {
    address: {
      addressLocality: string;
    };
  };
  validThrough?: string;
  jobBenefits?: string;
}
```

The frontend renders these fields in `src/components/cardDetails-modal/cardDetails-modal.tsx`
(currently shows `"Additional Job Details: Coming Soon..."` — that placeholder gets
removed once the API returns real data).

### 4.2 Extraction algorithm

1. `fetch(link)` with:
   - Browser-like `User-Agent` (env `CRAWL_USER_AGENT`).
   - `Accept: text/html`.
   - Timeout ~10s (`AbortController`, env `CRAWL_TIMEOUT_MS`).
   - Follow redirects; cap body size (~2 MB) to avoid huge pages.
2. Load HTML with cheerio; select **every** `script[type="application/ld+json"]`.
3. For each block: `JSON.parse` inside `try/catch` (skip invalid blocks — many
   sites emit trailing commas or multiple blocks).
   - **Do not** replicate the bug in `src/functions/search.ts`, which does
     `JSON.parse(JSON.stringify(script[1]))` — that double-encodes and always
     fails. The correct form is in `src/app/page.tsx`: `JSON.parse(script[1])`.
4. Normalize each parsed value into a flat list of nodes:
   - plain object → `[obj]`
   - array → the array
   - object with `@graph` → `obj["@graph"]`
5. Find the first node whose `@type` is `"JobPosting"` **or** an array containing
   `"JobPosting"`.
6. Map to `JobDetails` defensively:
   - `datePosted`, `validThrough`, `jobBenefits` → copy if string.
   - `description` → **sanitize before storing** (see §4.4). This is untrusted
     third-party HTML that the frontend injects via `dangerouslySetInnerHTML`.
   - `employmentType` → `Array.isArray(x) ? x.join(", ") : String(x)`.
   - `jobLocation` → may be an object **or an array**; take the first. Its
     `address` may be an object or array; take the first; read
     `addressLocality`. If the posting is remote (`jobLocationType: "TELECOMMUTE"`
     or `applicantLocationRequirements` present), set `addressLocality` to
     `"Remote"`.
   - Missing pieces → omit / empty string; never throw.
7. Record `detailsStatus`: `"ok"` | `"not_found"` (no JobPosting node) |
   `"failed"` (fetch/parse error) and `detailsFetchedAt`.

### 4.4 Sanitize `description` (XSS — do not skip)

`JobDetails.description` is HTML pulled from arbitrary employer career sites and
is rendered by the frontend with `he.decode(...)` +
`dangerouslySetInnerHTML` in `src/components/cardDetails-modal/cardDetails-modal.tsx`.
Same origin as the user's session / `localStorage`. A malicious or compromised
job page can put `<script>` / `<img onerror>` / event handlers in its JobPosting
`description` and it will execute in every viewer's browser on `bghscout.com`.

- Sanitize server-side during enrichment with `sanitize-html` (or `DOMPurify` +
  `jsdom`): allow a small tag set (`p`, `ul`/`ol`/`li`, `br`, `strong`/`b`,
  `em`/`i`, `h3`/`h4`, `a[href]`), strip all attributes except `href` (and force
  `rel="noopener nofollow"` / `target="_blank"`), drop `<script>`, `<style>`,
  `<iframe>`, `on*` handlers, `javascript:` URLs.
- Also sanitize / plain-text `jobBenefits` and `employmentType`.
- Store the sanitized string. The frontend can then drop the `he.decode` +
  `dangerouslySetInnerHTML` risk, or keep rendering it knowing it is clean.
- Defense in depth: add a CSP header on the frontend (`next.config.ts`) too.

### 4.3 Politeness & efficiency

- Concurrency cap: `CRAWL_CONCURRENCY` (default 6–8) via `p-limit`.
- Per-host throttle: small delay (200–500ms) between requests to the same domain.
- Retry once on `429` / `5xx` with exponential backoff; then mark `failed`.
- **Only crawl a row when:**
  - it has no stored `Details`, or
  - `detailsStatus === "failed"` and `detailsFetchedAt` older than ~6h, or
  - `detailsStatus === "ok"` and `detailsFetchedAt` older than a long TTL (e.g. 7 days) — job pages rarely change.
- Fresh, already-enriched rows are skipped so steady-state runs are cheap.
- The **first run backfills everything** and may take a while — make sure the host
  won't kill a long-running job, or chunk it (see §2.2).

---

## 5. API contract

Base URL via frontend env `NEXT_PUBLIC_API_BASE_URL` (or non-public if we proxy).

### `GET /v1/jobs`

Returns the entire enriched dataset in one response. The frontend fetches this
once (server-side, cached 15 min) and does all filter/sort/paginate in
`src/functions/filterJobs.ts` on the server — only one page of results ever
reaches the browser.

```jsonc
{
  "meta": {
    "generatedAt": "2026-09-10T15:00:12.000Z",  // when this snapshot was built
    "sourceScrapedAt": "2026-09-10T14:32:00.000Z", // max Scrape_DateTime in the data
    "total": 1234,
    "enriched": 1180,      // rows with Details populated
    "enrichFailed": 41
  },
  "jobs": [
    {
      "Role Name": "Senior Product Manager",
      "Primary Industry": "Technology",
      "Scrape_DateTime": "2026-09-10 14:32:00",
      "Scrape_Date": "2026/09/10",
      "Company": "Acme Corp",
      "Link": "https://careers.acme.com/jobs/123",
      "Details": {
        "datePosted": "2026-09-08",
        "description": "<p>…</p>",
        "employmentType": "FULL_TIME",
        "jobLocation": { "address": { "addressLocality": "Boston, MA" } },
        "validThrough": "2026-10-08",
        "jobBenefits": "Health, dental, 401k"
      }
    }
    // …
  ]
}
```

- **Row object keys stay identical to the CSV headers** (`"Role Name"`, `"Primary
  Industry"`, `Scrape_DateTime`, `Scrape_Date`, `Company`, `Link`) — this is the
  `CsvData` shape `src/functions/filterJobs.ts` consumes directly.
- `Details` is present when `detailsStatus === "ok"`, otherwise omitted (matches
  the optional `Details?` in `src/types.ts`).
- `Details.description` **must be sanitized HTML** (see §4.4). The frontend also
  runs DOMPurify on it, but the API is the primary line of defense.
- Sort the array newest-first by `Scrape_DateTime` before returning (frontend
  already re-sorts, but this makes the raw payload sane and keeps `jobs[0]` = most
  recent for the "Opportunity Refresh" label).
- Response headers: `Cache-Control: public, s-maxage=900, stale-while-revalidate=3600`
  + `ETag`. Gzip/brotli on (payload can be a few MB).

### `GET /v1/status`

```jsonc
{
  "lastRun": {
    "startedAt": "…", "finishedAt": "…", "ok": true,
    "rowsIn": 1234, "rowsEnriched": 42, "rowsFailed": 3,
    "durationMs": 81234
  },
  "nextScheduledRun": "2026-09-10T21:00:00.000Z"
}
```

### `GET /health`

`200 { "status": "ok" }` — for uptime checks / host health probes.

### `POST /v1/ingest`

- Auth: `Authorization: Bearer <INGEST_TRIGGER_SECRET>`.
- Kicks a fresh ingest run (async; returns `202` with a run id). Used by the
  external scheduler and for manual refreshes.
- **After a successful run**, call the frontend's revalidation hook so the site
  picks up new jobs immediately instead of waiting out its 15-minute fetch
  cache (see §5.1).

### `POST /v1/contact`

Replaces the frontend's old open mail relay (`/api/send-email`, deleted). The
frontend now sends only the message; the API owns the recipient list.

```jsonc
// request body
{
  "kind": "feedback" | "company-request",
  "firstName": "…",
  "lastName": "…",
  "email": "…",       // the sender's email, for the reply-to
  "message": "…"
}
```

- **Recipients are hardcoded server-side** (`ty@heiprodigital.com`,
  `cpbeganski@gmail.com`, `ben@greenefamily.us`) — never taken from the request.
- Validate: `kind` in the enum, `email` is a well-formed address, `message`
  length 1–5000, names ≤ 100 chars. Reject otherwise with `400`.
- **Rate limit** by IP (e.g. 5/hour) — this endpoint is public and unauthenticated.
  Optionally require a Cloudflare Turnstile token from the frontend.
- Send via the mail provider (SMTP / Resend / SES) using server-only creds
  (`MAIL_*` env — **not** `NEXT_PUBLIC_*`). Subject line from `kind`.
- Return `202 { ok: true }` on success, a generic `500 { ok: false }` on
  failure — never echo the provider error.

### `POST /v1/users`

Registers a Firebase account with the API's user profile store, right after
sign-up (`src/content/sign-up/sign-up.tsx`). Best-effort from the frontend's
side — a failure here is logged but doesn't block account creation, since
Firebase remains the source of truth for auth.

```jsonc
// request body
{
  "uid": "…",              // Firebase uid — must match the bearer token's subject
  "email": "…",
  "displayName": "…",
  "phoneNumber": null,
  "photoURL": null,
  "providerId": "password"
}
```

- Auth: `Authorization: Bearer <Firebase ID token>`. The API must verify the
  token (`firebase-admin`) and reject if its `uid` doesn't match the body's
  `uid` — never trust the body alone.
- Upsert semantics are fine (sign-up already guarantees the uid is new via
  Firebase, but treat a duplicate as a no-op rather than a hard failure).
- Return `201 { ok: true }`; `4xx` on a token/uid mismatch or malformed body.

### `PATCH /v1/users/:uid`

Syncs profile edits (e.g. display name) made from `src/content/account/account.tsx`
after they've already been applied in Firebase.

```jsonc
// request body — same shape as POST /v1/users
{
  "uid": "…",
  "email": "…",
  "displayName": "…",
  "phoneNumber": null,
  "photoURL": null,
  "providerId": "password"
}
```

- Auth: `Authorization: Bearer <Firebase ID token>`, same uid-match rule as
  above — a user may only update their own record.
- Return `200 { ok: true }`; `404` if the uid has no profile row yet (the
  frontend doesn't currently handle this as a fallback create — decide
  whether the API should upsert instead).

### `POST /v1/saved-searches`

Lets a signed-in user save the current search/filter criteria (roadmap:
"Saved searches" — not yet built in the frontend UI, but the API should exist
first). `params` is the same shape as `UrlParams` in `src/types.ts`.

```jsonc
// request body
{
  "name": "Remote PM roles",       // optional, user-supplied label
  "params": {
    "search": "product manager",
    "company": "",
    "date": "",
    "exact": "",
    "keyword": "",
    "industry": "Technology",
    "sort": "newest"
  }
}
```

- Auth: `Authorization: Bearer <Firebase ID token>`. The `uid` is taken from
  the verified token only — never accepted in the body.
- Validate: `name` ≤ 100 chars if present; `params` is an object with only
  known `UrlParams` keys, each a string ≤ 500 chars. Reject otherwise with
  `400`.
- Return `201 { id, uid, name, params, createdAt }`.

### `GET /v1/saved-searches`

Lists the caller's own saved searches (needed so the frontend can render them
and let the user pick which one to delete).

- Auth: `Authorization: Bearer <Firebase ID token>`.
- Return `200 { savedSearches: [{ id, uid, name, params, createdAt }, …] }`,
  newest first. Only rows owned by the token's `uid` — never another user's.

### `DELETE /v1/saved-searches/:id`

Removes one saved search.

- Auth: `Authorization: Bearer <Firebase ID token>`.
- The row's `uid` must match the token's `uid`; otherwise `404` (don't leak
  whether another user's `id` exists).
- Return `200 { ok: true }`; `404` if `id` doesn't exist or isn't owned by the
  caller.

### 5.1 Frontend cache revalidation

The frontend exposes `POST {FRONTEND_URL}/api/revalidate` guarded by a shared
secret. After each ingest, the API calls it:

```
POST https://www.bghscout.com/api/revalidate
Authorization: Bearer <REVALIDATE_SECRET>
```

It runs `revalidateTag("leads", "max")` and returns `{ revalidated: true }`.
`REVALIDATE_SECRET` must match on both sides. (This replaces the old Vercel cron
at `src/vercel.json`, which was deleted — it sat at the wrong path and never
ran.)

### CORS

- Allow only the frontend origins: `https://www.bghscout.com`, `https://bghscout.com`,
  and `http://localhost:3000` (dev). Env `ALLOWED_ORIGINS` (comma list).

### Optional v2 (not MVP)

- `GET /v1/jobs?search=&company=&industry=&keyword=&date=&exact=&sort=&page=&limit=`
  doing the filtering in the API instead of `src/functions/filterJobs.ts`, and
  requiring a Firebase ID token to return more than a teaser — this is what
  truly gates the data per user (see §13). Defer until MVP is stable.

---

## 6. Datastore

Postgres, one table:

```sql
create table jobs (
  link                text primary key,
  role_name           text not null,
  primary_industry    text,
  company             text,
  scrape_datetime     timestamptz,
  scrape_date         text,          -- keep the raw "YYYY/MM/DD" string
  details             jsonb,         -- JobDetails or null
  details_status      text not null default 'pending', -- pending|ok|not_found|failed
  details_fetched_at  timestamptz,
  first_seen_at       timestamptz not null default now(),
  last_seen_at        timestamptz not null default now(),  -- last time this Link was in the CSV
  updated_at          timestamptz not null default now()
);

create table users (
  uid           text primary key,       -- Firebase uid
  email         text,
  display_name  text,
  phone_number  text,
  photo_url     text,
  provider_id   text not null default 'password',
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table saved_searches (
  id          uuid primary key default gen_random_uuid(),
  uid         text not null references users(uid) on delete cascade,
  name        text,
  params      jsonb not null,     -- UrlParams (search/company/date/exact/keyword/industry/sort)
  created_at  timestamptz not null default now()
);
create index saved_searches_uid_idx on saved_searches (uid);

create table ingest_runs (
  id           uuid primary key default gen_random_uuid(),
  started_at   timestamptz not null default now(),
  finished_at  timestamptz,
  ok           boolean,
  rows_in      int,
  rows_enriched int,
  rows_failed  int,
  error        text
);
```

- `GET /v1/jobs` = `select … from jobs where last_seen_at >= <this run's start>`
  (i.e. still present in the latest CSV) — or serve all rows if the sheet never
  deletes (confirm in §3).
- Bare-MVP alternative: skip Postgres, store the computed `GET /v1/jobs` body as
  one JSON document in Redis/S3; the API just streams it back. Lose per-row
  enrichment caching (would re-crawl more), fine for small datasets.

---

## 7. Ingest run — pseudocode

```
run():
  csv   = fetch(CSV_SOURCE_URL)
  rows  = parse(csv, {header:true, skipEmptyLines:true})
          .map(normalize)            # trim, coerce, drop rows with no Link
  dedupe rows by Link (keep newest Scrape_DateTime)

  upsert each row into `jobs` (set last_seen_at = now)

  toEnrich = jobs where
      details_status = 'pending'
      or (details_status = 'failed'   and details_fetched_at < now - 6h)
      or (details_status = 'ok'       and details_fetched_at < now - 7d)

  limit = p-limit(CRAWL_CONCURRENCY)
  await Promise.all(toEnrich.map(job => limit(() => enrich(job))))
      # enrich(): fetch Link, extract JobPosting JSON-LD (§4.2),
      #           write details + details_status + details_fetched_at

  optionally: mark jobs not in this CSV as stale / delete (per §3 answer)

  write ingest_runs row
  bump snapshot cache / ETag
```

---

## 8. Environment variables

| Var | Purpose |
| --- | --- |
| `CSV_SOURCE_URL` | Published Google Sheet CSV URL |
| `DATABASE_URL` | Postgres connection string |
| `PORT` | HTTP port |
| `ALLOWED_ORIGINS` | CORS allow-list (comma-separated) |
| `INGEST_TRIGGER_SECRET` | Bearer token for `POST /v1/ingest` |
| `INGEST_CRON` | Cron expr if scheduling in-process (e.g. `0 3,9,15,21 * * *` in ET) |
| `FRONTEND_REVALIDATE_URL` | e.g. `https://www.bghscout.com/api/revalidate` |
| `REVALIDATE_SECRET` | Bearer token for the call above — must match the frontend's `REVALIDATE_SECRET` |
| `MAIL_HOST` / `MAIL_USER` / `MAIL_PASS` / `MAIL_FROM` | `POST /v1/contact` sender (server-only, never `NEXT_PUBLIC_*`) |
| `CONTACT_RECIPIENTS` | Comma list of where `/v1/contact` messages go |
| `FIREBASE_SERVICE_ACCOUNT` | JSON service-account credentials (`firebase-admin`) for verifying ID tokens on `POST /v1/users` and `PATCH /v1/users/:uid` |
| `TURNSTILE_SECRET` | (optional) Cloudflare Turnstile verification for `/v1/contact` |
| `CRAWL_CONCURRENCY` | Parallel enrichment fetches (default 6) |
| `CRAWL_TIMEOUT_MS` | Per-link fetch timeout (default 10000) |
| `CRAWL_USER_AGENT` | UA string for enrichment fetches |
| `DETAILS_OK_TTL_HOURS` | Re-crawl an `ok` row after this (default 168) |
| `DETAILS_RETRY_HOURS` | Re-crawl a `failed` row after this (default 6) |

---

## 9. Repo scaffold

```
bgh-scout-api/
  src/
    server.ts            # Fastify app, route registration, CORS
    routes/
      jobs.ts            # GET /v1/jobs
      status.ts          # GET /v1/status, GET /health
      ingest.ts          # POST /v1/ingest (auth)
      contact.ts         # POST /v1/contact (validate + rate limit + send)
      users.ts            # POST /v1/users, PATCH /v1/users/:uid (Firebase ID token auth)
      savedSearches.ts    # POST/GET /v1/saved-searches, DELETE /v1/saved-searches/:id
    ingest/
      run.ts             # orchestrator (§7)
      csv.ts             # download + parse + normalize
      enrich.ts          # fetch Link + JSON-LD → JobDetails (§4)
      jsonld.ts          # flatten @graph/arrays, find JobPosting, map fields
      sanitize.ts        # scrubbed description / benefits (§4.4)
      revalidate.ts      # POST the frontend revalidation hook after a run
    auth/
      verifyIdToken.ts   # firebase-admin token verification for /v1/users
    db/
      client.ts
      migrations/
      jobs.repo.ts
      users.repo.ts
      savedSearches.repo.ts
    lib/
      cache.ts           # snapshot body + ETag
      logger.ts
      env.ts             # zod-validated env
    types.ts             # CsvRow, JobDetails, JobsResponse — mirror frontend src/types.ts
  scripts/
    ingest-once.ts       # `npm run ingest` for local/manual + external cron
  test/
  package.json
  tsconfig.json
  README.md
  .env.example
```

---

## 10. Build checklist

### Phase 0 — setup
- [ ] Create repo, Node 22 + TS + Fastify + eslint/prettier.
- [ ] `env.ts` with zod validation of all vars in §8.
- [ ] Provision Postgres (Neon/Supabase); wire `DATABASE_URL`; add migration runner.
- [ ] Create `jobs` + `ingest_runs` tables (§6).

### Phase 1 — CSV ingest (no enrichment yet)
- [ ] `csv.ts`: download `CSV_SOURCE_URL`, parse `{header:true, skipEmptyLines:true}`, normalize, drop rows without `Link`, dedupe by `Link`.
- [ ] `jobs.repo.ts`: upsert rows, set `last_seen_at`.
- [ ] `run.ts`: orchestrate; write `ingest_runs`.
- [ ] `scripts/ingest-once.ts` + `npm run ingest`.
- [ ] `GET /v1/jobs` returning rows with CSV-identical keys, `meta`, sorted newest-first, `Cache-Control` + `ETag`.
- [ ] `GET /health`, `GET /v1/status`.
- [ ] `POST /v1/ingest` with bearer auth.
- [ ] CORS from `ALLOWED_ORIGINS`.

### Phase 2 — enrichment (the additional job details)
- [ ] `jsonld.ts`: flatten `@graph`/arrays, find `JobPosting` (incl. `@type` array), map → `JobDetails` defensively (§4.2). Unit-test with real saved HTML fixtures from a few `Link`s.
- [ ] `sanitize.ts`: scrub `description` + `jobBenefits` (§4.4). Unit-test with a `<script>` / `<img onerror>` payload.
- [ ] `enrich.ts`: fetch with UA + timeout + size cap + redirect follow; retry once on 429/5xx; classify `ok`/`not_found`/`failed`.
- [ ] `run.ts`: select `toEnrich` set (TTL rules), crawl with `p-limit`, per-host throttle, persist `details` + status + timestamp.
- [ ] `GET /v1/jobs` includes `Details` when `ok`; `meta.enriched` / `meta.enrichFailed`.
- [ ] Handle first-run backfill (long job or chunked).

### Phase 3 — contact + revalidation + schedule + deploy
- [ ] `POST /v1/contact`: validate, rate-limit, send to `CONTACT_RECIPIENTS`, generic errors (§5).
- [ ] `POST /v1/users` + `PATCH /v1/users/:uid`: `firebase-admin` ID token verification (uid must match), upsert into `users` table.
- [ ] `POST /v1/saved-searches` + `GET /v1/saved-searches` + `DELETE /v1/saved-searches/:id`: `firebase-admin` ID token verification, scoped to the token's `uid`, backed by the `saved_searches` table (§6).
- [ ] `revalidate.ts`: after a successful ingest, `POST FRONTEND_REVALIDATE_URL` with `Bearer REVALIDATE_SECRET` (§5.1).
- [ ] Deploy web service (Render/Railway).
- [ ] Schedule ingest at 03/09/15/21 America/New_York (host cron → `POST /v1/ingest`, or in-process `node-cron`).
- [ ] Structured logs + error alerting (host logs, or a webhook/Sentry).
- [ ] Uptime check on `/health`.

### Phase 4 — frontend cutover — DONE in this repo (`update` branch)
- [x] `src/app/page.tsx`: fetches `${NEXT_PUBLIC_API_BASE_URL}/v1/jobs` (cached 15 min, tag `leads`), checks `res.ok`, throws a clear error if the env var is unset. All filter/sort/paginate now runs server-side in `src/functions/filterJobs.ts`.
- [x] `src/functions/filterJobs.ts`: the single filter implementation (search / company / industry / keyword / date-range / exact-date / sort). Replaces the two drifted copies (`page.tsx` inline + `src/functions/search.ts`, both deleted). Date filtering fixed to compare real days, not `toDateString()` strings.
- [x] Search / Filter / Pagination / sort now push to the URL and let the server re-render — `allData` (the full dataset) no longer ships to the browser; only one page + facet lists do. `src/caches/JobsAtom.ts` deleted.
- [x] Facet counts precomputed server-side (`Facet[]` = `{ value, count }`); `getItemTotalCount` gone.
- [x] `cardDetails-modal.tsx`: dropped `he.decode`; runs DOMPurify on `Details.description` before `dangerouslySetInnerHTML`. `he` / `@types/he` removed.
- [x] `next.config.ts`: CSP + `X-Content-Type-Options` / `X-Frame-Options` / `Referrer-Policy` / `Permissions-Policy`.
- [x] Auth: `src/components/authProvider/authProvider.tsx` (mounted in layout) is the source of truth via `onAuthStateChanged` — clears a stale cached session. `readStoredUser()` parses `localStorage` safely (try/catch + shape check). `getFirebaseAuth()` guarantees init.
- [x] sign-in / sign-up: dropped the 2s + 7s `setTimeout` redirects; navigate on the auth promise. account / sign-in / sign-up: redirect moved out of render into `useEffect`.
- [x] `/api/send-email` **deleted** (was an open mail relay). `src/requests/email.ts` → `sendContactMessage()` → `POST ${API}/v1/contact` (no client-controlled `to`). `nodemailer` removed.
- [x] `src/requests/user.ts` → `createUser()` / `updateUser()`, Firebase ID token bearer auth. Wired into sign-up (`src/content/sign-up/sign-up.tsx`, best-effort after Firebase account creation) and account (`src/content/account/account.tsx`, new "Name" section — updates Firebase `displayName` then syncs it). Blocked on the API implementing `POST /v1/users` + `PATCH /v1/users/:uid` (§5).
- [x] `/api/revalidate`: now `POST` only, requires `Bearer REVALIDATE_SECRET`, no hour logic. `src/vercel.json` (dead cron at wrong path) deleted.
- [x] `src/app/error.tsx` / `global-error.tsx` / `not-found.tsx` / `loading.tsx` added.
- [x] Cleanup: `card`/`list` keys use `item.Link`; pagination `forcePage` clamped; sort `<select>` options match the state; `mixpanel` `debug` dev-only + `Object`→typed; unused deps removed (`papaparse`, `mailto-link`, `react-toggle-button`); README rewritten.
- [ ] **Set env in Vercel:** `NEXT_PUBLIC_API_BASE_URL`, `REVALIDATE_SECRET`.
- [ ] Confirm the API emits `Scrape_Date` as `YYYY/MM/DD` and a `Scrape_DateTime` dayjs can parse (`filterJobs.ts` accepts `YYYY/MM/DD`, `YYYY-MM-DD`, `MM/DD/YYYY`, `MM-DD-YYYY` for the date, but the sheet's real format should be confirmed).
- [ ] Smoke test against a live API: search, every filter, sort, pagination, grid/list, a job-details modal with an enriched + a non-enriched job, sign in/out, contact + request forms.

### §13 — true per-user gating (still open, needs the API)

Server-side filtering means the browser only gets one page at a time now, not
the whole dataset — but a logged-out visitor can still page through results by
editing the URL; the sign-in modal is client-side. Fully gating the data needs:

- `/v1/jobs` (or a filtered `/v1/jobs?…`) requires a **Firebase ID token**;
  unauthenticated requests get a small teaser or `401`.
- The frontend verifies the session server-side — Firebase **session cookies**
  (`firebase-admin` + a `/api/session` route that sets an httpOnly cookie + Next
  middleware) — and `page.tsx` forwards the token / refuses when absent.

This is a feature, not a fix — deferred until the API exists.

---

## 11. Testing

- Unit: `jsonld.ts` against saved HTML fixtures (Greenhouse, Lever, Workday, a
  plain careers page, a page with `@graph`, a page with no JSON-LD).
- Unit: `csv.ts` normalization + dedupe.
- Integration: run ingest against a small fixture CSV + a local HTTP server
  serving fixture job pages; assert `GET /v1/jobs` body.
- Contract: a JSON schema for `GET /v1/jobs` shared with / checked by the frontend.

---

## 12. Open questions (confirm before Phase 2)

1. Does the sheet ever remove delisted jobs, or only append? → drop-vs-keep logic.
2. Stable dedupe key — is `Link` guaranteed unique + stable per job?
3. Expected max row count (affects backfill time and whether `/v1/jobs` should
   stay "return everything" or move to server-side pagination sooner).
4. Any career-site domains known to hard-block bots? (may need per-domain handling
   or accept `not_found`).
5. Should `/v1/jobs` be auth-gated (API key) or stay public like the current CSV?
