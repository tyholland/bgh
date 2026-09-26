"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import * as S from "./save-search-modal.style";
import ModalComponent from "../modal/modal";
import { getFirebaseAuth } from "@/functions/firebase";
import { createSavedSearch } from "@/requests/savedSearches";
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

const SaveSearchModal = ({ openModal, setOpenModal }: SaveSearchModalProps) => {
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);
  const [name, setName] = useState<string>("");
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [success, setSuccess] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const currentParams = readCurrentParams(searchParams);

  const handleClose = () => {
    setOpenModal(false);
    setName("");
    setSuccess(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!user) return;

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
          {!success && (
            <button onClick={handleSave} disabled={isSaving}>
              {isSaving ? "Saving..." : "Save"}
            </button>
          )}
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default SaveSearchModal;
