// Shared allow-list for job description HTML (`Details.description`), used
// by the server sanitizer (the /jobs/[id] page, run during SSR, in
// sanitizeJobDescription.server.ts).
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
