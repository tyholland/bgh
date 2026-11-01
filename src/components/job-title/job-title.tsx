"use client";

import { ChangeEvent, useEffect, useState } from "react";
import * as S from "./job-title.style";
import { getFirebaseAuth } from "@/functions/firebase";
import { getUser, updateJobTitle } from "@/requests/user";
import { trackError, trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { useHasMounted } from "@/functions/useHasMounted";

const JobTitle = () => {
  const rawUser = useAtomValue(userAtom);
  // Same mount-gating as the rest of the account page — userAtom can already
  // hold a cached-session user before this component's first client render.
  const hasMounted = useHasMounted();
  const user = hasMounted ? rawUser : null;
  const [jobTitle, setJobTitle] = useState<string>("");
  const [savedJobTitle, setSavedJobTitle] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

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

        const profile = await getUser(user.uid, idToken);
        if (!cancelled) {
          setJobTitle(profile.jobTitle ?? "");
          setSavedJobTitle(profile.jobTitle ?? "");
        }
      } catch (err) {
        if (!cancelled) {
          trackError(user, "Load Job Title", {
            message: (err as { message?: string }).message ?? "",
          });
          setLoadError("We couldn't load your job title.");
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

  const handleSave = async () => {
    if (!user) return;

    const trimmedJobTitle = jobTitle.trim();
    if (trimmedJobTitle === savedJobTitle) return;

    setIsSaving(true);
    setSaveError(null);
    setSaveSuccess(false);

    try {
      const auth = getFirebaseAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      await updateJobTitle(user.uid, trimmedJobTitle || null, idToken);

      setSavedJobTitle(trimmedJobTitle);
      setJobTitle(trimmedJobTitle);

      trackEvent(user, "Update Job Title", {
        type: "button",
        jobTitle: trimmedJobTitle,
      });

      setSaveSuccess(true);
    } catch (err) {
      trackError(user, "Update Job Title", {
        message: (err as { message?: string }).message ?? "",
      });
      setSaveError("We couldn't update your job title. Please try again.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return <S.Wrapper>Loading job title...</S.Wrapper>;
  }

  return (
    <S.Wrapper>
      {saveSuccess && (
        <div className="success">Your job title has been updated</div>
      )}
      {loadError && <div className="error">{loadError}</div>}
      {saveError && <div className="error">{saveError}</div>}
      <div>
        <S.Input
          type="text"
          name="jobTitle"
          onChange={(e: ChangeEvent<HTMLInputElement>) => {
            setJobTitle(e.target.value);
            setSaveSuccess(false);
          }}
          placeholder="Enter your job title"
          value={jobTitle}
        />
      </div>
      <button
        onClick={handleSave}
        disabled={isSaving || jobTitle.trim() === savedJobTitle}
      >
        {isSaving ? "Saving..." : "Update Job Title"}
      </button>
    </S.Wrapper>
  );
};

export default JobTitle;
