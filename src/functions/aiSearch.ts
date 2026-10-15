import dayjs from "dayjs";
import { SavedSearchParams } from "@/types";

// Mirrors the options in src/components/filter/filter.tsx's "Posted Date"
// dropdown (24 Hours / 3 Days / 1 Week / 1 Month) — keeping the AI search
// confined to the same presets means its "date" param behaves identically.
export const SUPPORTED_POSTED_WITHIN_DAYS = [1, 3, 7, 30] as const;

// The shape the model's tool call is expected to return. Treated as
// untrusted input from here on — every field is validated before use.
export interface ExtractedJobFilters {
  titleTerms?: unknown;
  broadTerms?: unknown;
  companies?: unknown;
  industries?: unknown;
  postedWithinDays?: unknown;
  unsupported?: unknown;
}

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value)
    ? value.filter(
        (item): item is string =>
          typeof item === "string" && item.trim().length > 0,
      )
    : [];

// Only lets through values that exactly match (case-insensitively) a facet
// value the API actually returned — the model is prone to paraphrasing or
// slightly misspelling company/industry names.
const matchKnownValues = (requested: unknown, known: string[]): string[] => {
  const lookup = new Map(known.map((value) => [value.toLowerCase(), value]));
  const matched = asStringArray(requested)
    .map((value) => lookup.get(value.toLowerCase()))
    .filter((value): value is string => !!value);

  return Array.from(new Set(matched));
};

/**
 * Turns the model's extracted filters into the same query-param shape the
 * rest of the site already uses (Search/Filter components, saved searches).
 * `known` is the live companies/industries facet list so a misheard or
 * invented name can never leak into the URL as a filter.
 */
export const toSavedSearchParams = (
  extracted: ExtractedJobFilters,
  known: { companies: string[]; industries: string[] },
): SavedSearchParams => {
  const params: SavedSearchParams = {};

  const titleTerms = Array.from(new Set(asStringArray(extracted.titleTerms)));
  if (titleTerms.length > 0) params.search = titleTerms.join(",");

  const broadTerms = Array.from(new Set(asStringArray(extracted.broadTerms)));
  if (broadTerms.length > 0) params.keyword = broadTerms.join(",");

  const companies = matchKnownValues(extracted.companies, known.companies);
  if (companies.length > 0) params.company = companies.join(",");

  const industries = matchKnownValues(extracted.industries, known.industries);
  if (industries.length > 0) params.industry = industries.join(",");

  const postedWithinDays = extracted.postedWithinDays;
  if (
    typeof postedWithinDays === "number" &&
    (SUPPORTED_POSTED_WITHIN_DAYS as readonly number[]).includes(
      postedWithinDays,
    )
  ) {
    params.date = dayjs()
      .subtract(postedWithinDays, "day")
      .format("YYYY-MM-DD");
  }

  return params;
};

export const toUnsupportedNotes = (extracted: ExtractedJobFilters): string[] =>
  asStringArray(extracted.unsupported);

// ---------------------------------------------------------------------------
// Rule-based extraction
//
// No external AI call: a fixed set of dictionaries/regexes turns the query
// into the same ExtractedJobFilters shape an LLM tool call would have
// produced. Free and instant, at the cost of only understanding the
// phrasing/vocabulary listed below — unrecognized wording just falls through
// to `titleTerms` rather than being dropped.
// ---------------------------------------------------------------------------

export interface KnownFacets {
  companies: string[];
  industries: string[];
}

// Words that add no search value on their own — stripped from whatever's
// left over after every other pass, so they don't pollute titleTerms.
const STOPWORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "but",
  "for",
  "with",
  "that",
  "who",
  "which",
  "of",
  "to",
  "in",
  "on",
  "at",
  "as",
  "by",
  "from",
  "into",
  "find",
  "me",
  "i",
  "want",
  "looking",
  "search",
  "show",
  "get",
  "give",
  "please",
  "job",
  "jobs",
  "role",
  "roles",
  "position",
  "positions",
  "opening",
  "openings",
  "opportunity",
  "opportunities",
  "listing",
  "listings",
  "use",
  "uses",
  "using",
  "used",
  "work",
  "works",
  "is",
  "are",
  "was",
  "were",
  "be",
  "been",
  "posted",
  "within",
  "ago",
]);

// Matched as OR terms against the broader "keyword" search (title +
// description) rather than required-in-title terms — mostly specific
// technologies/skills that show up in a description more often than a title.
const SKILL_TERMS = [
  "React",
  "Angular",
  "Vue",
  "Node.js",
  "Next.js",
  "Python",
  "Java",
  "JavaScript",
  "TypeScript",
  "C++",
  "C#",
  "Golang",
  "Go",
  "Rust",
  "Ruby",
  "PHP",
  "Swift",
  "Kotlin",
  "SQL",
  "PostgreSQL",
  "MySQL",
  "MongoDB",
  "Redis",
  "GraphQL",
  "AWS",
  "Azure",
  "GCP",
  "Docker",
  "Kubernetes",
  "Terraform",
  "CI/CD",
  "Figma",
  "Sketch",
  "Photoshop",
  "Illustrator",
  "Salesforce",
  "HubSpot",
  "Excel",
  "Tableau",
  "Power BI",
  "SEO",
  "SEM",
  "CRM",
  "HTML",
  "CSS",
  "REST",
].sort((a, b) => b.length - a.length);

// Matched against the job title ("search") — role seniority/function words
// that plausibly appear verbatim in a title.
const SENIORITY_TERMS = [
  "Entry-level",
  "Entry level",
  "Mid-level",
  "Mid level",
  "Junior",
  "Jr",
  "Senior",
  "Sr",
  "Lead",
  "Staff",
  "Principal",
  "Director",
  "Head of",
  "VP",
  "Intern",
  "Manager",
].sort((a, b) => b.length - a.length);

// No dedicated location/remote filter exists (see BACKEND_REPO_PLAN.md) —
// best-effort via the broad keyword search rather than reported as
// unsupported, since "remote" genuinely does show up in a lot of
// descriptions.
const REMOTE_PHRASES = [
  "remote",
  "work from home",
  "wfh",
  "telecommute",
  "telecommuting",
];

// Catches "$100k", "100k+", "pay at least 100,000", "salary of $90k", etc.
// Deliberately broad (and documented as a known limitation) rather than
// narrow enough to miss real phrasings — a false-positive strip just removes
// a token that would have become a (useless) titleTerm anyway.
const SALARY_REGEX =
  /(?:\b(?:pay|salary|compensation|comp)\b[^,.;]{0,40}?\$?\s?\d[\d,]*\s?k?\+?)|(?:\$\s?\d[\d,]*\s?k?\+?)|(?:\b\d{2,3}k\+?)/gi;

const DATE_PATTERNS: { regex: RegExp; days: number }[] = [
  {
    regex: /\b(?:today|last 24 hours|past 24 hours|last day|past day)\b/i,
    days: 1,
  },
  { regex: /\b(?:last|past) 3 days\b/i, days: 3 },
  { regex: /\b(?:last|past) week\b/i, days: 7 },
  { regex: /\bthis week\b/i, days: 7 },
  { regex: /\b(?:last|past) month\b/i, days: 30 },
  { regex: /\bthis month\b/i, days: 30 },
];

const escapeRegExp = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Matches `phrase` as a whole unit without gluing to surrounding
// letters/digits (so "ui" doesn't match inside "build"), but — unlike a
// plain `\b` word boundary — tolerates phrases that end in punctuation
// ("c++", "node.js", "ci/cd"), where `\b` right after a non-word character
// fails to find a boundary against adjacent whitespace.
const phraseRegex = (phrase: string): RegExp =>
  new RegExp(`(?<![a-zA-Z0-9])${escapeRegExp(phrase)}(?![a-zA-Z0-9])`, "gi");

// A phrase with no letters/digits at all (e.g. a bad company/industry value
// in the source data that's just "." or "-") would match any stray
// punctuation in the query — a sentence-ending period, a stray dash — since
// phraseRegex only checks that its *neighbors* aren't alphanumeric. Skip
// those instead of letting them eat real punctuation out of the query.
const hasAlphanumeric = (phrase: string) => /[a-zA-Z0-9]/.test(phrase);

// Strips every phrase (longest first, so "entry-level" is consumed before
// "entry") found in `text`, returning what's left plus which phrases hit.
const stripAll = (
  text: string,
  phrases: string[],
): { text: string; found: string[] } => {
  const found: string[] = [];
  let next = text;

  for (const phrase of phrases) {
    if (!hasAlphanumeric(phrase)) continue;

    if (phraseRegex(phrase).test(next)) {
      found.push(phrase);
      next = next.replace(phraseRegex(phrase), " ");
    }
  }

  return { text: next, found };
};

const closestSupportedDays = (days: number): number =>
  SUPPORTED_POSTED_WITHIN_DAYS.reduce((closest, option) =>
    Math.abs(option - days) < Math.abs(closest - days) ? option : closest,
  );

const extractPostedWithinDays = (
  text: string,
): { text: string; days: number | null } => {
  const genericMatch = text.match(/\b(?:last|past)\s+(\d+)\s+days?\b/i);
  if (genericMatch) {
    return {
      text: text.replace(genericMatch[0], " "),
      days: closestSupportedDays(Number(genericMatch[1])),
    };
  }

  for (const { regex, days } of DATE_PATTERNS) {
    if (regex.test(text)) {
      return { text: text.replace(regex, " "), days };
    }
  }

  return { text, days: null };
};

/**
 * Turns a free-text query into the same shape a model's tool call would —
 * via dictionaries and regexes instead of an API call. `known` is the live
 * companies/industries facet list, matched the same way an LLM extraction
 * would be (see toSavedSearchParams) so a near-miss can't leak in.
 */
export const extractJobFilters = (
  query: string,
  known: KnownFacets,
): ExtractedJobFilters => {
  let working = query;
  const unsupported: string[] = [];
  const broadTerms: string[] = [];
  const titleTerms: string[] = [];

  // A replacer callback (rather than a separate `.test()` call) detects and
  // strips a match in one pass — SALARY_REGEX is a shared module-level
  // `g`-flagged regex, so a stray `.test()`/`.exec()` call could otherwise
  // leak `lastIndex` state across unrelated requests handled by this
  // long-lived server process.
  let salaryMatched = false;
  working = working.replace(SALARY_REGEX, () => {
    salaryMatched = true;
    return " ";
  });
  if (salaryMatched) {
    unsupported.push(
      "Pay isn't filtered — job listings don't include salary data.",
    );
  }

  const posted = extractPostedWithinDays(working);
  working = posted.text;

  // Company/industry names first — they're the most specific match and may
  // otherwise get fragmented by the generic word-splitting pass below.
  const companyMatch = stripAll(working, known.companies);
  working = companyMatch.text;

  const industryMatch = stripAll(working, known.industries);
  working = industryMatch.text;

  const remoteMatch = stripAll(working, REMOTE_PHRASES);
  working = remoteMatch.text;
  if (remoteMatch.found.length > 0) broadTerms.push("Remote");

  const skillMatch = stripAll(working, SKILL_TERMS);
  working = skillMatch.text;
  broadTerms.push(...skillMatch.found);

  const seniorityMatch = stripAll(working, SENIORITY_TERMS);
  working = seniorityMatch.text;
  titleTerms.push(...seniorityMatch.found);

  // Whatever's left — minus stopwords, bare numbers, and single characters —
  // is treated as additional title terms.
  const leftoverTerms = working
    .split(/[^a-zA-Z0-9]+/)
    .filter(
      (token) =>
        token.length > 1 &&
        !/^\d+$/.test(token) &&
        !STOPWORDS.has(token.toLowerCase()),
    );
  titleTerms.push(...leftoverTerms);

  return {
    titleTerms,
    broadTerms,
    companies: companyMatch.found,
    industries: industryMatch.found,
    postedWithinDays: posted.days,
    unsupported,
  };
};
