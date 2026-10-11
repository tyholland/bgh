import {
  JOB_DESCRIPTION_ALLOWED_ATTR,
  JOB_DESCRIPTION_ALLOWED_TAGS,
} from "./sanitizeJobDescription";

// Sanitizes Details.description for the /jobs/[id] page, which renders it
// during SSR (so crawlers and JSON-LD both see sanitized HTML in the initial
// response, not just after client hydration). DOMPurify requires a DOM;
// jsdom provides one. Per
// DOMPurify's own server-side guidance, this is a defense-in-depth layer on
// top of the API's sanitization (see BACKEND_REPO_PLAN.md §4.4) — never the
// only line of defense.
type Sanitize = (raw: string) => string;

let sanitize: Sanitize | null = null;

// jsdom/DOMPurify are required lazily, on first use, instead of at module
// scope. A failure here used to throw at import time, crashing every
// request to this route before Next's error.tsx boundary ever ran — e.g.
// jsdom's html-encoding-sniffer -> @exodus/bytes chain hit
// `ERR_REQUIRE_ESM` under Turbopack's externalRequire in production
// (see next.config.ts's serverExternalPackages comment, which is the real
// fix for that specific failure). Loading it lazily inside a try/catch
// turns any such failure into a graceful degradation instead, belt-and-
// suspenders alongside that config fix.
const loadSanitize = (): Sanitize => {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { JSDOM } = require("jsdom");
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const createDOMPurify = require("dompurify");

  // Created once per server process and reused — jsdom's JSDOM construction
  // isn't free, and nothing here is request-specific.
  const { window } = new JSDOM("");
  const DOMPurifyServer = createDOMPurify(
    window as unknown as Window & typeof globalThis,
  );

  return (raw) =>
    DOMPurifyServer.sanitize(raw, {
      ALLOWED_TAGS: JOB_DESCRIPTION_ALLOWED_TAGS,
      ALLOWED_ATTR: JOB_DESCRIPTION_ALLOWED_ATTR,
    });
};

// Last-resort fallback if jsdom/DOMPurify can't be loaded at all: strip every
// tag rather than attempt to re-implement allow-listing in regex. The API's
// own sanitization is still the primary defense (see the module comment
// above); this just guarantees no markup — and therefore no script — reaches
// the page even in that scenario.
//
// Exported so tests can exercise it directly: getSanitize()'s catch branch
// that selects it is only reachable in practice when the `require` calls
// above fail, which isn't something a test can simulate (Vitest's module
// mocking intercepts `import`, not a lazily-called `require`).
export const stripAllTags: Sanitize = (raw) => raw.replace(/<[^>]*>/g, "");

const getSanitize = (): Sanitize => {
  if (!sanitize) {
    try {
      sanitize = loadSanitize();
    } catch (error) {
      console.error(
        "sanitizeJobDescriptionServer: jsdom/dompurify failed to load, falling back to stripping all HTML tags",
        error,
      );
      sanitize = stripAllTags;
    }
  }

  return sanitize;
};

export const sanitizeJobDescriptionServer = (
  raw: string | undefined,
): string => {
  if (!raw) return "";

  return getSanitize()(raw);
};
