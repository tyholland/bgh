"use client";

import { useEffect, useState } from "react";
import * as S from "./notification-settings.style";
import { getFirebaseAuth } from "@/functions/firebase";
import { getUser, updateEmailNotifications } from "@/requests/user";
import { trackError, trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { useHasMounted } from "@/functions/useHasMounted";

const NotificationSettings = () => {
  const rawUser = useAtomValue(userAtom);
  // Same mount-gating as the rest of the account page — userAtom can already
  // hold a cached-session user before this component's first client render.
  const hasMounted = useHasMounted();
  const user = hasMounted ? rawUser : null;
  const [emailNotifications, setEmailNotifications] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

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
        if (!cancelled) setEmailNotifications(profile.emailNotifications);
      } catch (err) {
        if (!cancelled) {
          trackError(user, "Load Notification Preference", {
            message: (err as { message?: string }).message ?? "",
          });
          setLoadError("We couldn't load your notification preference.");
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

  const handleToggle = async () => {
    if (!user) return;

    const next = !emailNotifications;
    const previous = emailNotifications;

    setEmailNotifications(next);
    setIsSaving(true);
    setSaveError(null);

    try {
      const auth = getFirebaseAuth();
      const idToken = await auth.currentUser?.getIdToken();
      if (!idToken) throw new Error("Not signed in");

      await updateEmailNotifications(user.uid, next, idToken);

      trackEvent(user, "Update Notification Preference", {
        type: "toggle",
        emailNotifications: next,
      });
    } catch (err) {
      setEmailNotifications(previous);
      trackError(user, "Update Notification Preference", {
        message: (err as { message?: string }).message ?? "",
      });
      setSaveError(
        "We couldn't update your notification preference. Please try again.",
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!user) return null;

  if (isLoading) {
    return <S.Wrapper>Loading notification preference...</S.Wrapper>;
  }

  return (
    <S.Wrapper>
      {loadError && <div className="error">{loadError}</div>}
      {saveError && <div className="error">{saveError}</div>}
      <label>
        <input
          type="checkbox"
          checked={emailNotifications}
          onChange={handleToggle}
          disabled={isSaving}
        />
        Email me job alerts and account updates
      </label>
    </S.Wrapper>
  );
};

export default NotificationSettings;
