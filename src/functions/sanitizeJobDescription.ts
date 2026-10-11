import DOMPurify from "dompurify";

// Shared allow-list for job description HTML (`Details.description`), used
// by both the client sanitizer (cardDetails-modal, run in the browser) and
// the server sanitizer (the /jobs/[id] page, run during SSR, in
// sanitizeJobDescription.server.ts). Keeping the list in one place means the
// two environments can never drift apart and silently permit different
// markup. This file is client-only — only import it from "use client"
// components; the server equivalent lives in sanitizeJobDescription.server.ts.
export const JOB_DESCRIPTION_ALLOWED_TAGS = [
  "p",
  "br",
  "ul",
  "ol",
  "li",
  "strong",
  "b",
  "em",
  "i",
  "h3",
  "h4",
  "a",
];

export const JOB_DESCRIPTION_ALLOWED_ATTR = ["href"];

// The API sanitizes `Details.description` already (see BACKEND_REPO_PLAN.md
// §4.4); this is defense in depth before it goes through
// dangerouslySetInnerHTML, same reasoning as the previous client-only version
// of this logic in cardDetails-modal.tsx.
export const sanitizeJobDescriptionClient = (
  raw: string | undefined,
): string => {
  if (typeof window === "undefined" || !raw) return "";

  return DOMPurify.sanitize(raw, {
    ALLOWED_TAGS: JOB_DESCRIPTION_ALLOWED_TAGS,
    ALLOWED_ATTR: JOB_DESCRIPTION_ALLOWED_ATTR,
  });
};
