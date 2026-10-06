"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import * as S from "./save-search-modal.style";
import ModalComponent from "../modal/modal";
import { getFirebaseAuth } from "@/functions/firebase";
import { createSavedSearch, getSavedSearches } from "@/requests/savedSearches";
import { SavedSearchParams } from "@/types";
import { trackError, trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";

interface SaveSearchModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const PARAM_KEYS: (keyof SavedSearchParams)[] = [
  "search",
  "company",
  "date",
  "exact",
  "keyword",
  "industry",
  "sort",
];

const readCurrentParams = (searchParams: URLSearchParams): SavedSearchParams =>
  Object.fromEntries(
    PARAM_KEYS.map((key) => [key, searchParams.get(key) || ""]).filter(
      ([, value]) => value,
    ),
  );

const paramsMatch = (a: SavedSearchParams, b: SavedSearchParams) =>
  PARAM_KEYS.every((key) => (a[key] || "") === (b[key] || ""));

const SaveSearchModal = ({ openModal, setOpenModal }: SaveSearchModalProps) => {
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);
  const [name, setName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySaved, setAlreadySaved] = useState<boolean>(false);
  const [isChecking, setIsChecking] = useState<boolean>(false);

  const currentParams = readCurrentParams(searchParams);

  // Check this exact set of filters against the user's existing saved
  // searches whenever the modal opens, so we can warn instead of letting
  // them create an identical duplicate.
  useEffect(() => {
    if (!openModal || !user) return;

    let cancelled = false;

    const checkExisting = async () => {
      setIsChecking(true);

      try {
        const auth = getFirebaseAuth();
        const idToken = await auth.currentUser?.getIdToken();
        if (!idToken) throw new Error("Not signed in");

        const existing = await getSavedSearches(idToken);
        const match = existing.some((saved) =>
          paramsMatch(saved.params, currentParams),
        );

        if (!cancelled) setAlreadySaved(match);
      } catch (err) {
        if (!cancelled) {
          trackError(user, "Check Saved Search", {
            message: (err as { message?: string }).message ?? "",
          });
        }
      } finally {
        if (!cancelled) setIsChecking(false);
      }
    };

    checkExisting();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openModal, user]);

  const handleClose = () => {
    setOpenModal(false);
    setName("");
    setSuccess(false);
    setError(null);
    setAlreadySaved(false);
  };

  const handleSave = async () => {
    if (!user || alreadySaved) return;

    setIsSaving(true);
    setError(null);

    try {
      const auth = getFirebaseAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      await createSavedSearch(currentParams, idToken, name.trim() || undefined);

      trackEvent(user, "Save Search", {
        type: "button",
        params: currentParams,
      });

      setSuccess(true);
      setName("");
    } catch (err) {
      trackError(user, "Save Search", {
        message: (err as { message?: string }).message ?? "",
        params: currentParams,
      });
      setError("We couldn't save this search. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ModalComponent
      isOpen={openModal}
      onClose={handleClose}
      title="Save Search"
      size="medium"
    >
      <S.ModalWrapper>
        {success ? (
          <div className="success">Your search has been saved.</div>
        ) : alreadySaved ? (
          <div className="notice">This search is already saved.</div>
        ) : (
          <>
            <span>
              Save your current search and filters to revisit them later from
              your account.
            </span>
            <S.Input
              type="text"
              name="savedSearchName"
              placeholder="Name this search (optional)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSave()}
            />
            {error && <div className="error">{error}</div>}
          </>
        )}
        <S.ModalBtn>
          {!success && !alreadySaved && (
            <button onClick={handleSave} disabled={isSaving || isChecking}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default SaveSearchModal;
