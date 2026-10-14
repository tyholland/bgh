import { describe, expect, it } from "vitest";
import dayjs from "dayjs";
import {
  ExtractedJobFilters,
  extractJobFilters,
  toSavedSearchParams,
  toUnsupportedNotes,
} from "@/functions/aiSearch";

const known = {
  companies: ["Acme Corp", "Globex Corporation"],
  industries: ["Technology", "Healthcare"],
};

describe("toSavedSearchParams", () => {
  it("joins title and broad terms into search/keyword", () => {
    const extracted: ExtractedJobFilters = {
      titleTerms: ["UI", "developer"],
      broadTerms: ["React", "remote"],
    };

    expect(toSavedSearchParams(extracted, known)).toEqual({
      search: "UI,developer",
      keyword: "React,remote",
    });
  });

  it("de-duplicates repeated terms", () => {
    const extracted: ExtractedJobFilters = {
      titleTerms: ["developer", "developer"],
    };

    expect(toSavedSearchParams(extracted, known).search).toBe("developer");
  });

  it("only keeps companies/industries that match a known facet value, case-insensitively", () => {
    const extracted: ExtractedJobFilters = {
      companies: ["acme corp", "Made Up Inc"],
      industries: ["technology", "Finance"],
    };

    expect(toSavedSearchParams(extracted, known)).toEqual({
      company: "Acme Corp",
      industry: "Technology",
    });
  });

  it("maps a supported postedWithinDays onto the same date math filter.tsx uses", () => {
    const extracted: ExtractedJobFilters = { postedWithinDays: 7 };

    const expected = dayjs().subtract(7, "day").format("YYYY-MM-DD");
    expect(toSavedSearchParams(extracted, known)).toEqual({ date: expected });
  });

  it("ignores an unsupported postedWithinDays value instead of inventing a date", () => {
    const extracted: ExtractedJobFilters = { postedWithinDays: 14 };

    expect(toSavedSearchParams(extracted, known)).toEqual({});
  });

  it("ignores null/missing fields", () => {
    const extracted: ExtractedJobFilters = { postedWithinDays: null };

    expect(toSavedSearchParams(extracted, known)).toEqual({});
  });

  it("drops non-string entries from array fields instead of throwing", () => {
    const extracted: ExtractedJobFilters = {
      titleTerms: ["developer", 42, null, ""],
    };

    expect(toSavedSearchParams(extracted, known)).toEqual({
      search: "developer",
    });
  });
});

describe("toUnsupportedNotes", () => {
  it("passes through string notes", () => {
    const extracted: ExtractedJobFilters = {
      unsupported: ["Pay isn't filtered — job listings don't include salary data."],
    };

    expect(toUnsupportedNotes(extracted)).toEqual([
      "Pay isn't filtered — job listings don't include salary data.",
    ]);
  });

  it("returns an empty array when absent or malformed", () => {
    expect(toUnsupportedNotes({})).toEqual([]);
    expect(toUnsupportedNotes({ unsupported: "not an array" })).toEqual([]);
  });
});

describe("extractJobFilters", () => {
  it("parses the canonical example query end to end", () => {
    const result = extractJobFilters(
      "Find remote senior UI developer positions that use React, pay at least $100K, and were posted within the last week.",
      known,
    );

    expect(result.titleTerms).toEqual(
      expect.arrayContaining(["Senior", "UI", "developer"]),
    );
    expect(result.broadTerms).toEqual(expect.arrayContaining(["Remote", "React"]));
    expect(result.companies).toEqual([]);
    expect(result.industries).toEqual([]);
    expect(result.postedWithinDays).toBe(7);
    expect(result.unsupported).toEqual([
      "Pay isn't filtered — job listings don't include salary data.",
    ]);
  });

  it("matches known companies and industries by name, case-insensitively", () => {
    const result = extractJobFilters(
      "developer jobs at acme corp in technology",
      known,
    );

    expect(result.companies).toEqual(["Acme Corp"]);
    expect(result.industries).toEqual(["Technology"]);
    expect(result.titleTerms).toEqual(["developer"]);
  });

  it("doesn't match a company/industry that isn't in the known facet list", () => {
    const result = extractJobFilters("developer jobs at Wayne Enterprises", known);

    expect(result.companies).toEqual([]);
    expect(result.titleTerms).toEqual(
      expect.arrayContaining(["developer", "Wayne", "Enterprises"]),
    );
  });

  it("ignores a bad facet value that's just a period instead of matching it against sentence punctuation", () => {
    const dirtyKnown = {
      companies: ["Acme Corp", "."],
      industries: [".", "Technology"],
    };

    const result = extractJobFilters("Find developer jobs at Acme Corp.", dirtyKnown);

    expect(result.companies).toEqual(["Acme Corp"]);
    expect(result.industries).toEqual([]);
    expect(result.titleTerms).not.toContain(".");
  });

  it.each([
    ["posted today", 1],
    ["posted in the last 24 hours", 1],
    ["posted in the last 3 days", 3],
    ["posted last week", 7],
    ["posted this week", 7],
    ["posted last month", 30],
    ["posted this month", 30],
  ])("maps %j to postedWithinDays=%i", (phrase, days) => {
    expect(extractJobFilters(phrase, known).postedWithinDays).toBe(days);
  });

  it("snaps an arbitrary 'last N days' to the closest supported bucket", () => {
    expect(extractJobFilters("posted in the last 10 days", known).postedWithinDays).toBe(7);
    expect(extractJobFilters("posted in the last 20 days", known).postedWithinDays).toBe(30);
  });

  it("returns null postedWithinDays when recency isn't mentioned", () => {
    expect(extractJobFilters("frontend developer", known).postedWithinDays).toBeNull();
  });

  it("recognizes punctuation-heavy skill terms like c++ and node.js", () => {
    const result = extractJobFilters("c++ and node.js engineer", known);

    expect(result.broadTerms).toEqual(expect.arrayContaining(["C++", "Node.js"]));
  });

  it("strips stopwords and filler instead of treating them as title terms", () => {
    const result = extractJobFilters("I want a job in marketing", known);

    expect(result.titleTerms).not.toContain("want");
    expect(result.titleTerms).not.toContain("job");
    expect(result.titleTerms).not.toContain("in");
  });

  it("falls through unrecognized wording to a plain title term instead of dropping it", () => {
    const result = extractJobFilters("zookeeper", known);

    expect(result.titleTerms).toEqual(["zookeeper"]);
    expect(result.unsupported).toEqual([]);
  });
});
