"use client";

import { useRef, useState } from "react";
import * as S from "./search.style";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent, trackError } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import SignInModal from "../signIn-modal/signIn-modal";
import SaveSearchModal from "../save-search-modal/save-search-modal";
import { getJobs } from "@/requests/jobs";
import {
  extractJobFilters,
  KnownFacets,
  toSavedSearchParams,
  toUnsupportedNotes,
} from "@/functions/aiSearch";
import { SavedSearchParams } from "@/types";

const EXAMPLE_QUERY =
  'e.g. "Remote senior UI developer roles using React, posted in the last week"';

// Caps how many companies/industries the parser matches against — mirrors
// the old /api/ai-search route's limit (see git history) so one very long
// facet list can't make every keystroke's parse slower.
const MAX_KNOWN_VALUES = 500;

type BubbleField = "company" | "industry" | "search" | "keyword";

const BUBBLE_FIELDS: BubbleField[] = [
  "company",
  "industry",
  "search",
  "keyword",
];

// Prefixes shown on a bubble so a matched company/industry reads as what it
// is rather than looking like a plain keyword.
const FIELD_LABELS: Record<BubbleField, string> = {
  company: "Company: ",
  industry: "Industry: ",
  search: "",
  keyword: "",
};

const splitParam = (value: string | null) =>
  value ? value.split(",").filter(Boolean) : [];

const Search = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openSaveSearchModal, setOpenSaveSearchModal] =
    useState<boolean>(false);
  const [searchWord, setSearchWord] = useState<string>("");
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);

  // Lazily fetched the first time a search runs, then cached for the rest of
  // the component's life — the company/industry facet list doesn't change
  // within a session, and fetching unfiltered (search/keyword/date all
  // unset) keeps it the full list regardless of what's currently applied.
  const knownFacets = useRef<Promise<KnownFacets> | null>(null);

  const loadKnownFacets = (): Promise<KnownFacets> => {
    if (!knownFacets.current) {
      knownFacets.current = getJobs({}, 1)
        .then(({ companies, industries }) => ({
          companies: companies
            .map((item) => item.value)
            .slice(0, MAX_KNOWN_VALUES),
          industries: industries
            .map((item) => item.value)
            .slice(0, MAX_KNOWN_VALUES),
        }))
        .catch((err) => {
          knownFacets.current = null;
          throw err;
        });
    }

    return knownFacets.current;
  };

  const activeFilters = BUBBLE_FIELDS.flatMap((field) =>
    splitParam(searchParams.get(field)).map((value) => ({ field, value })),
  );

  const requireUser = () => {
    if (user) return true;
    setOpenModal(true);
    return false;
  };

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const handleSearch = async () => {
    const query = searchWord.trim();
    if (!query || isSearching) return;

    setIsSearching(true);
    setError(null);

    try {
      const known = await loadKnownFacets();
      const extracted = extractJobFilters(query, known);
      const result = toSavedSearchParams(extracted, known);
      const newNotes = toUnsupportedNotes(extracted);

      if (Object.keys(result).length === 0 && newNotes.length === 0) {
        newNotes.push(
          "We couldn't match any filters to that search — try different wording.",
        );
      }

      pushParams((params) => {
        (Object.keys(result) as (keyof SavedSearchParams)[]).forEach((key) => {
          const value = result[key];
          if (!value) return;

          // Every other field is a comma-joined set of values that should
          // add to whatever's already active; a date range just replaces
          // the last one.
          if (key === "date") {
            params.set("date", value);
            return;
          }

          const merged = Array.from(
            new Set([...splitParam(params.get(key)), ...value.split(",")]),
          );
          params.set(key, merged.join(","));
        });
      });

      setNotes(newNotes);
      setSearchWord("");

      trackEvent(user, "Search", {
        type: "search",
        value: query,
        params: result,
      });
    } catch {
      const message = "Search is temporarily unavailable. Try again shortly.";
      setError(message);
      trackError(user, "Search", { query, message });
    } finally {
      setIsSearching(false);
    }
  };

  const handleRemoveFilter = (field: BubbleField, value: string) => {
    const updated = splitParam(searchParams.get(field)).filter(
      (item) => item !== value,
    );

    pushParams((params) =>
      updated.length > 0
        ? params.set(field, updated.join(","))
        : params.delete(field),
    );

    trackEvent(user, "Search", {
      type: "remove search",
      field,
      value,
      remaining: updated.join(","),
    });
  };

  const handleSaveSearchClick = () => {
    if (!requireUser()) return;
    setOpenSaveSearchModal(true);
  };

  return (
    <>
      <S.Wrapper>
        <div className="header">Stop Searching. Start Discovering.</div>
        <div>
          Tell BGH Scout what you're looking for, and we'll help you find
          matching opportunities across companies and industries. Save your
          search and get email alerts when new opportunities become available.
        </div>
        <S.Section>
          <S.Input
            type="text"
            name="mainSearch"
            placeholder={EXAMPLE_QUERY}
            value={searchWord}
            onChange={(e) => setSearchWord(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            disabled={isSearching}
          />
          <div className="searchBtn">
            <button
              onClick={handleSearch}
              disabled={isSearching || searchWord.trim().length === 0}
            >
              {isSearching ? "Searching..." : "Search Jobs"}
            </button>
            <button
              className="save"
              onClick={handleSaveSearchClick}
              disabled={activeFilters.length === 0 && !searchParams.get("date")}
            >
              Save Search
            </button>
          </div>
        </S.Section>
        {activeFilters.length > 0 && (
          <S.KeywordBubble>
            {activeFilters.map(({ field, value }) => (
              <button
                className="bubble"
                onClick={() => handleRemoveFilter(field, value)}
                key={`${field}-${value}`}
              >
                {FIELD_LABELS[field]}
                {value} <span>x</span>
              </button>
            ))}
          </S.KeywordBubble>
        )}
        {error && (
          <S.Notice className="error">
            <div>{error}</div>
            <button
              className="dismiss"
              onClick={() => setError(null)}
              aria-label="Dismiss"
            >
              x
            </button>
          </S.Notice>
        )}
        {notes.length > 0 && (
          <S.Notice>
            <div>
              Heads up:
              <ul>
                {notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            </div>
            <button
              className="dismiss"
              onClick={() => setNotes([])}
              aria-label="Dismiss"
            >
              x
            </button>
          </S.Notice>
        )}
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
      <SaveSearchModal
        openModal={openSaveSearchModal}
        setOpenModal={setOpenSaveSearchModal}
      />
    </>
  );
};

export default Search;
