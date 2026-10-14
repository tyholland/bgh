import { NextRequest, NextResponse } from "next/server";
import { getJobs } from "@/requests/jobs";
import {
  extractJobFilters,
  toSavedSearchParams,
  toUnsupportedNotes,
} from "@/functions/aiSearch";
import { AiSearchResponse } from "@/types";

const MAX_QUERY_LENGTH = 400;
// Keeps the parser's input bounded if the dataset ever grows a very long
// facet list — matching more than this many companies/industries by name
// isn't realistic for one free-text query anyway.
const MAX_KNOWN_VALUES = 300;

export async function POST(req: NextRequest) {
  let query = "";
  try {
    const body = await req.json();
    query = typeof body?.query === "string" ? body.query.trim() : "";
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  if (!query) {
    return NextResponse.json({ error: "A search query is required." }, { status: 400 });
  }

  if (query.length > MAX_QUERY_LENGTH) {
    return NextResponse.json(
      { error: `Query is too long (max ${MAX_QUERY_LENGTH} characters).` },
      { status: 400 },
    );
  }

  // The live facet lists, so a company/industry can only ever match one that
  // actually exists instead of a near-miss leaking into the URL as a filter.
  let knownCompanies: string[];
  let knownIndustries: string[];
  try {
    const { companies, industries } = await getJobs({}, 1);
    knownCompanies = companies.map((item) => item.value).slice(0, MAX_KNOWN_VALUES);
    knownIndustries = industries.map((item) => item.value).slice(0, MAX_KNOWN_VALUES);
  } catch (err) {
    console.error("AI search facet lookup failed", err);
    return NextResponse.json(
      { error: "AI search is temporarily unavailable. Try again shortly." },
      { status: 502 },
    );
  }

  const known = { companies: knownCompanies, industries: knownIndustries };
  const extracted = extractJobFilters(query, known);
  const params = toSavedSearchParams(extracted, known);
  const notes = toUnsupportedNotes(extracted);

  if (Object.keys(params).length === 0 && notes.length === 0) {
    notes.push("We couldn't match any filters to that request — showing all jobs.");
  }

  const body: AiSearchResponse = { params, notes };
  return NextResponse.json(body);
}
