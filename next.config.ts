import type { NextConfig } from "next";

const apiOrigin = (() => {
  try {
    return process.env.NEXT_PUBLIC_API_BASE_URL
      ? new URL(process.env.NEXT_PUBLIC_API_BASE_URL).origin
      : "";
  } catch {
    return "";
  }
})();

// Next injects inline bootstrap scripts without a nonce, so script-src needs
// 'unsafe-inline'. The primary XSS defense for scraped job HTML is DOMPurify
// (sanitizeJobDescription.server.ts); this CSP is defense in depth. A
// nonce-based policy (via middleware) is the follow-up if we want to drop
// 'unsafe-inline'.
// Dev mode also needs 'unsafe-eval' — React uses eval() there to reconstruct
// callstacks and power Fast Refresh; it never does in production.
const isDev = process.env.NODE_ENV !== "production";

const csp = [
  "default-src 'self'",
  "base-uri 'self'",
  "object-src 'none'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "style-src 'self' 'unsafe-inline'",
  // https://apis.google.com is Firebase Auth's own gapi loader
  // (node_modules/@firebase/auth: `gapiScript`), injected as a <script> tag
  // by signInWithPopup/signInWithRedirect for any OAuth provider (Google
  // included) — without it the popup flow fails with auth/internal-error.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.mxpnl.com https://apis.google.com`,
  // Firebase Auth's popup/redirect flow opens a hidden same-page iframe at
  // https://<authDomain>/__/auth/iframe (see @firebase/auth's _openIframe)
  // to relay the OAuth result back from the popup — without frame-src this
  // falls back to default-src 'self' and silently breaks Google sign-in.
  "frame-src 'self' https://*.firebaseapp.com",
  [
    "connect-src 'self'",
    "https://*.googleapis.com",
    "https://*.firebaseio.com",
    "wss://*.firebaseio.com",
    "https://api-js.mixpanel.com",
    "https://api.mixpanel.com",
    apiOrigin,
  ]
    .filter(Boolean)
    .join(" "),
]
  .filter(Boolean)
  .join("; ");

const nextConfig: NextConfig = {
  compiler: {
    styledComponents: true,
  },
  // jsdom (used by sanitizeJobDescription.server.ts, /jobs/[id] only) is on
  // Next's own default serverExternalPackages list, but that hasn't been
  // enough in practice: Turbopack has a known bug (vercel/next.js — search
  // "ERR_REQUIRE_ESM" + "externalRequire" + jsdom) where it still bundles
  // jsdom into the server chunk instead of leaving it truly external, and
  // its own externalRequire shim can't do Node's require(ESM) interop that
  // jsdom's html-encoding-sniffer -> @exodus/bytes chain relies on — it
  // crashes the whole route on import with "Failed to load external module
  // jsdom...: ERR_REQUIRE_ESM" (this is exactly what happened on
  // bghscout.com/jobs/[id] in production). Re-declaring all three here
  // forces Turbopack to route the require through real Node, which handles
  // it fine.
  serverExternalPackages: ["jsdom", "html-encoding-sniffer", "@exodus/bytes"],
  // Next 16 locks a single `next dev` per resolved distDir (see
  // node_modules/next/dist/build/lockfile.js), independent of port. Playwright's
  // webServer starts its own `next dev` on a dedicated port (see
  // playwright.config.ts), which would otherwise collide with a developer's
  // already-running dev server on the default `.next` distDir.
  ...(process.env.NEXT_DIST_DIR ? { distDir: process.env.NEXT_DIST_DIR } : {}),
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "Content-Security-Policy", value: csp },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
