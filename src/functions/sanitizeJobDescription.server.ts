import { JSDOM } from "jsdom";
import createDOMPurify from "dompurify";
import {
  JOB_DESCRIPTION_ALLOWED_ATTR,
  JOB_DESCRIPTION_ALLOWED_TAGS,
} from "./sanitizeJobDescription";

// Server-side counterpart to sanitizeJobDescriptionClient — needed because
// the /jobs/[id] page renders Details.description during SSR (so crawlers
// and JSON-LD both see sanitized HTML in the initial response, not just
// after client hydration). DOMPurify requires a DOM; jsdom provides one. Per
// DOMPurify's own server-side guidance, this is a defense-in-depth layer on
// top of the API's sanitization (see BACKEND_REPO_PLAN.md §4.4) — never the
// only line of defense.
//
// The window is created once per server process and reused — jsdom's JSDOM
// construction isn't free, and nothing here is request-specific.
const { window } = new JSDOM("");
const DOMPurifyServer = createDOMPurify(
  window as unknown as Window & typeof globalThis,
);

export const sanitizeJobDescriptionServer = (
  raw: string | undefined,
): string => {
  if (!raw) return "";

  return DOMPurifyServer.sanitize(raw, {
    ALLOWED_TAGS: JOB_DESCRIPTION_ALLOWED_TAGS,
    ALLOWED_ATTR: JOB_DESCRIPTION_ALLOWED_ATTR,
  });
};
