"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import * as S from "./ai-search.style";
import { AiSearchResponse, SavedSearchParams } from "@/types";
import { trackError, trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import SignInModal from "../signIn-modal/signIn-modal";

const EXAMPLE_QUERY =
  "e.g. \"Remote senior UI developer roles using React, posted in the last week\"";

const applyParams = (params: SavedSearchParams): URLSearchParams => {
  const next = new URLSearchParams();
  (Object.entries(params) as [keyof SavedSearchParams, string | undefined][]).forEach(
    ([key, value]) => {
      if (value) next.set(key, value);
    },
  );
  next.set("page", "1");
  return next;
};

const AiSearch = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);

  const [queryText, setQueryText] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [notes, setNotes] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);

  const handleSubmit = async () => {
    const query = queryText.trim();
    if (!query) return;

    if (!user) {
      setOpenModal(true);
      return;
    }

    setIsLoading(true);
    setError(null);
    setNotes([]);

    try {
      const res = await fetch("/api/ai-search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "AI search is temporarily unavailable.");
      }

      const result = (await res.json()) as AiSearchResponse;
      const next = applyParams(result.params);

      trackEvent(user, "AI Search", {
        query,
        params: result.params,
        notes: result.notes,
      });

      setNotes(result.notes);
      // Preserve the active sort — an AI search replaces the filters, not the
      // view the results are already displayed in.
      const sort = searchParams.get("sort");
      if (sort) next.set("sort", sort);

      router.push(`/?${next.toString()}`, { scroll: false });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "AI search is temporarily unavailable.";
      setError(message);
      trackError(user, "AI Search", { query, message });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <S.Wrapper>
        <div className="header">Describe the job you want</div>
        <div className="sub">
          Tell us what you&apos;re looking for in plain English — we&apos;ll set
          the filters for you.
        </div>
        <S.Section>
          <S.Input
            type="text"
            name="aiSearch"
            placeholder={EXAMPLE_QUERY}
            value={queryText}
            onChange={(e) => setQueryText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
            disabled={isLoading}
          />
          <S.SubmitButton
            onClick={handleSubmit}
            disabled={isLoading || queryText.trim().length === 0}
          >
            {isLoading ? "Searching..." : "Find Jobs"}
          </S.SubmitButton>
        </S.Section>
        {error && (
          <S.Notice className="error">
            <div>{error}</div>
            <button onClick={() => setError(null)} aria-label="Dismiss">
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
            <button onClick={() => setNotes([])} aria-label="Dismiss">
              x
            </button>
          </S.Notice>
        )}
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default AiSearch;
