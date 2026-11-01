import sanitizeHtml from "sanitize-html";
import {
  JOB_DESCRIPTION_ALLOWED_ATTR,
  JOB_DESCRIPTION_ALLOWED_TAGS,
} from "./sanitizeJobDescription";

// Sanitizes Details.description for the /jobs/[id] page, which renders it
// during SSR (so crawlers and JSON-LD both see sanitized HTML in the initial
// response, not just after client hydration). This is a defense-in-depth
// layer on top of the API's own sanitization (see BACKEND_REPO_PLAN.md
// §4.4) — never the only line of defense.
//
// Previously used jsdom + DOMPurify, which requires a DOM. That pulled in
// jsdom's html-encoding-sniffer -> @exodus/bytes chain, an ESM-only module
// loaded via `require()` — Turbopack's externalRequire shim can't do the
// require(ESM) interop that needs, and crashed every request to this route
// with "ERR_REQUIRE_ESM" in production (bghscout.com/jobs/[id]). Declaring
// jsdom/html-encoding-sniffer/@exodus-bytes in next.config.ts's
// serverExternalPackages didn't resolve it. sanitize-html parses HTML
// directly (via htmlparser2) instead of building a DOM, so it has no jsdom
// dependency and avoids that chain entirely.
export const sanitizeJobDescriptionServer = (
  raw: string | undefined,
): string => {
  if (!raw) return "";

  return sanitizeHtml(raw, {
    allowedTags: JOB_DESCRIPTION_ALLOWED_TAGS,
    allowedAttributes: { "*": JOB_DESCRIPTION_ALLOWED_ATTR },
  });
};
