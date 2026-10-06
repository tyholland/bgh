import { defineConfig, devices } from "@playwright/test";

// Dedicated ports so this never collides with a `next dev` (3000) a
// developer already has running, or the real backend at :3001 (see .env).
const APP_PORT = 3100;
const MOCK_API_PORT = 4310;
const MOCK_API_BASE_URL = `http://127.0.0.1:${MOCK_API_PORT}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: "html",
  use: {
    // Must be "localhost", not "127.0.0.1": Next 16 dev's allowedDevOrigins
    // guard blocks cross-origin requests for its own JS chunks/HMR channel
    // from origins it doesn't recognize, which silently breaks client
    // hydration (inputs work at the DOM level but React state never updates)
    // if the app is loaded from an origin it doesn't allow by default.
    baseURL: `http://localhost:${APP_PORT}`,
    trace: "on-first-retry",
  },

  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],

  // Two servers: the fixture BGH Scout API (page.tsx fetches it from a
  // Server Component, so it's on the real network — Playwright's
  // page.route() can't intercept it) and the Next.js app itself, pointed at
  // that fixture via env. `next dev` keeps NODE_ENV=development, which is
  // what makes src/functions/mixpanel.ts no-op instead of calling the real
  // Mixpanel API during tests.
  webServer: [
    {
      command: "node e2e/fixtures/mock-api-server.mjs",
      // The server only implements /v1/jobs (everything else 404s), and
      // Playwright's readiness probe expects a 2xx response, so it must
      // check that path rather than "/".
      url: `${MOCK_API_BASE_URL}/v1/jobs`,
      reuseExistingServer: !process.env.CI,
      env: { MOCK_API_PORT: String(MOCK_API_PORT) },
    },
    {
      command: "npm run dev",
      url: `http://localhost:${APP_PORT}`,
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
      env: {
        PORT: String(APP_PORT),
        // Next 16's dev-server lockfile is keyed by distDir, not port, so a
        // developer's already-running `next dev` would otherwise block this
        // one from starting (see next.config.ts).
        NEXT_DIST_DIR: ".next-e2e",
        NEXT_PUBLIC_API_BASE_URL: MOCK_API_BASE_URL,
        REVALIDATE_SECRET: "e2e-test-secret",
        // Firebase Auth network calls are mocked per-test via
        // e2e/fixtures/firebase-auth.ts, so these values just need to be
        // present (non-empty) for the client SDK to initialize.
        NEXT_PUBLIC_FIREBASE_KEY: "e2e-test-key",
        NEXT_PUBLIC_FIREBASE_DOMAIN: "e2e-test.firebaseapp.com",
        NEXT_PUBLIC_FIREBASE_PROJECT_ID: "e2e-test-project",
        NEXT_PUBLIC_FIREBASE_BUCKET: "e2e-test-project.appspot.com",
        NEXT_PUBLIC_FIREBASE_SENDER_ID: "000000000000",
        NEXT_PUBLIC_FIREBASE_ID: "1:000000000000:web:0000000000000000000000",
        NEXT_PUBLIC_MIXPANEL_TOKEN: "",
      },
    },
  ],
});
