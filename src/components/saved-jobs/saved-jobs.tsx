"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import dayjs from "dayjs";
import * as S from "./saved-jobs.style";
import { getFirebaseAuth } from "@/functions/firebase";
import {
  deleteSavedJob,
  getSavedJobs,
  updateSavedJob,
} from "@/requests/savedJobs";
import { SavedJob, SavedJobAlertFrequency } from "@/types";
import { trackError, trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { useHasMounted } from "@/functions/useHasMounted";

const SavedJobs = () => {
  const rawUser = useAtomValue(userAtom);
  // Gate on mount for the same reason as saved-searches.tsx: userAtom can
  // already hold a cached-session user by the time this component hydrates,
  // which the server-rendered HTML never saw.
  const hasMounted = useHasMounted();
  const user = hasMounted ? rawUser : null;
  const [savedJobs, setSavedJobs] = useState<SavedJob[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [savingAlertId, setSavingAlertId] = useState<string | null>(null);
  const [alertError, setAlertError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;

    let cancelled = false;

    const load = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const idToken = await getFirebaseAuth().currentUser?.getIdToken();
        if (!idToken) throw new Error("Not signed in");

        const result = await getSavedJobs(idToken);
        if (!cancelled) setSavedJobs(result);
      } catch (err) {
        if (!cancelled) {
          trackError(user, "Load Saved Jobs", {
            message: (err as { message?: string }).message ?? "",
          });
          setLoadError("We couldn't load your saved jobs.");
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

  const handleDelete = async (savedJob: SavedJob) => {
    if (!user) return;

    setDeletingId(savedJob.id);
    setActionError(null);

    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      await deleteSavedJob(savedJob.id, idToken);

      setSavedJobs((prev) => prev.filter((item) => item.id !== savedJob.id));

      trackEvent(user, "Unsave Job", {
        type: "button",
        roleName: savedJob.roleName,
      });
    } catch (err) {
      trackError(user, "Unsave Job", {
        message: (err as { message?: string }).message ?? "",
        id: savedJob.id,
      });
      setActionError("We couldn't remove that job. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const handleAlertFrequencyChange = async (
    savedJob: SavedJob,
    nextFrequency: SavedJobAlertFrequency,
  ) => {
    if (!user) return;

    const previous = savedJob.alertFrequency;
    setSavingAlertId(savedJob.id);
    setAlertError(null);

    setSavedJobs((prev) =>
      prev.map((item) =>
        item.id === savedJob.id
          ? { ...item, alertFrequency: nextFrequency }
          : item,
      ),
    );

    try {
      const idToken = await getFirebaseAuth().currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      await updateSavedJob(savedJob.id, nextFrequency, idToken);

      trackEvent(user, "Update Saved Job Alert", {
        type: "select",
        id: savedJob.id,
        alertFrequency: nextFrequency,
      });
    } catch (err) {
      setSavedJobs((prev) =>
        prev.map((item) =>
          item.id === savedJob.id
            ? { ...item, alertFrequency: previous }
            : item,
        ),
      );
      trackError(user, "Update Saved Job Alert", {
        message: (err as { message?: string }).message ?? "",
        id: savedJob.id,
      });
      setAlertError("We couldn't update that alert. Please try again.");
    } finally {
      setSavingAlertId(null);
    }
  };

  if (!user) {
    return (
      <S.Wrapper>
        <div className="empty">Sign in to view your saved jobs.</div>
      </S.Wrapper>
    );
  }

  if (isLoading) return <S.Wrapper>Loading saved jobs...</S.Wrapper>;

  return (
    <S.Wrapper>
      {actionError && <div className="error">{actionError}</div>}
      {alertError && <div className="error">{alertError}</div>}
      {loadError ? (
        <div className="error">{loadError}</div>
      ) : savedJobs.length === 0 ? (
        <div className="empty">You haven&apos;t saved any jobs yet.</div>
      ) : (
        <S.List>
          {savedJobs.map((savedJob) => (
            <S.Item key={savedJob.id}>
              <div className="details">
                <div className="name">{savedJob.roleName}</div>
                {savedJob.company && (
                  <div className="company">{savedJob.company}</div>
                )}
                <div className="date">
                  Saved {dayjs(savedJob.createdAt).format("MM-DD-YYYY")}
                </div>
                <label className="alertFrequency">
                  Email alerts:
                  <select
                    value={savedJob.alertFrequency}
                    disabled={savingAlertId === savedJob.id}
                    onChange={(e) =>
                      handleAlertFrequencyChange(
                        savedJob,
                        e.target.value as SavedJobAlertFrequency,
                      )
                    }
                  >
                    <option value="off">Off</option>
                    <option value="daily">Daily</option>
                  </select>
                </label>
              </div>
              <div className="actions">
                <Link href={`/jobs/${savedJob.jobId}`}>View Job</Link>
                <button
                  className="delete"
                  onClick={() => handleDelete(savedJob)}
                  disabled={deletingId === savedJob.id}
                >
                  {deletingId === savedJob.id ? "Deleting..." : "Delete"}
                </button>
              </div>
            </S.Item>
          ))}
        </S.List>
      )}
    </S.Wrapper>
  );
};

export default SavedJobs;
