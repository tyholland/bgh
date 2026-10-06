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
// 'unsafe-inline'. The primary XSS defense for scraped job HTML is DOMPurify in
// cardDetails-modal; this CSP is defense in depth. A nonce-based policy (via
// middleware) is the follow-up if we want to drop 'unsafe-inline'.
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
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""} https://cdn.mxpnl.com`,
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
