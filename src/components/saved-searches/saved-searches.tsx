"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import * as S from "./saved-searches.style";
import { getFirebaseAuth } from "@/functions/firebase";
import {
  deleteSavedSearch,
  getSavedSearches,
} from "@/requests/savedSearches";
import { SavedSearch, SavedSearchParams } from "@/types";
import { trackError, trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { useHasMounted } from "@/functions/useHasMounted";

const FIELD_LABELS: Record<keyof SavedSearchParams, string> = {
  search: "Search",
  company: "Company",
  date: "Posted after",
  exact: "Posted on",
  keyword: "Keywords",
  industry: "Industry",
  sort: "Sort",
};

const describeParams = (params: SavedSearchParams) =>
  (Object.keys(FIELD_LABELS) as (keyof SavedSearchParams)[])
    .filter((key) => params[key])
    .map((key) => `${FIELD_LABELS[key]}: ${params[key]}`)
    .join(" · ") || "All jobs";

const toQueryString = (params: SavedSearchParams) => {
  const query = new URLSearchParams();

  (Object.keys(FIELD_LABELS) as (keyof SavedSearchParams)[]).forEach(
    (key) => {
      if (params[key]) query.set(key, params[key]!);
    },
  );

  query.set("page", "1");
  return query.toString();
};

const SavedSearches = () => {
  const rawUser = useAtomValue(userAtom);
  // Gate on mount for the same reason as `src/content/account/account.tsx`:
  // userAtom can already hold a cached-session user by the time this
  // component hydrates, which the server-rendered HTML never saw.
  const hasMounted = useHasMounted();
  const user = hasMounted ? rawUser : null;
  const [searches, setSearches] = useState<SavedSearch[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const auth = getFirebaseAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Not signed in");

        const result = await getSavedSearches(idToken);
        if (!cancelled) setSearches(result);
      } catch (err) {
        if (!cancelled) {
          trackError(user, "Load Saved Searches", {
            message: (err as { message?: string }).message ?? "",
          });
          setLoadError("We couldn't load your saved searches.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const handleDelete = async (savedSearch: SavedSearch) => {
    if (!user) return;

    setDeletingId(savedSearch.id);
    setActionError(null);

    try {
      const auth = getFirebaseAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      await deleteSavedSearch(savedSearch.id, idToken);

      setSearches((prev) => prev.filter((item) => item.id !== savedSearch.id));

      trackEvent(user, "Delete Saved Search", {
        type: "button",
        name: savedSearch.name ?? "",
      });
    } catch (err) {
      trackError(user, "Delete Saved Search", {
        message: (err as { message?: string }).message ?? "",
        id: savedSearch.id,
      });
      setActionError("We couldn't delete that search. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (!user) {
    return (
      <S.Wrapper>
        <div className="empty">Sign in to view your saved searches.</div>
      </S.Wrapper>
    );
  }

  if (isLoading) return <S.Wrapper>Loading saved searches...</S.Wrapper>;

  return (
    <S.Wrapper>
      {actionError && <div className="error">{actionError}</div>}
      {loadError ? (
        <div className="error">{loadError}</div>
      ) : searches.length === 0 ? (
        <div className="empty">You haven&apos;t saved any searches yet.</div>
      ) : (
        <S.List>
          {searches.map((savedSearch) => (
            <S.Item key={savedSearch.id}>
              <div className="details">
                <div className="name">
                  {savedSearch.name || describeParams(savedSearch.params)}
                </div>
                {savedSearch.name && (
                  <div className="summary">
                    {describeParams(savedSearch.params)}
                  </div>
                )}
                <div className="date">
                  Saved {dayjs(savedSearch.createdAt).format("MM-DD-YYYY")}
                </div>
              </div>
              <div className="actions">
                <Link href={`/?${toQueryString(savedSearch.params)}`}>
                  View Results
                </Link>
                <button
                  className="delete"
                  onClick={() => handleDelete(savedSearch)}
                  disabled={deletingId === savedSearch.id}
                >
                  {deletingId === savedSearch.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </S.Item>
          ))}
        </S.List>
      )}
    </S.Wrapper>
  );
};

export default SavedSearches;
