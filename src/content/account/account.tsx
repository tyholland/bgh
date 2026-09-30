"use client";

import { useRouter } from "next/navigation";
import * as S from "./account.style";
import { trackError, trackEvent, trackPage } from "@/functions/mixpanel";
import { ChangeEvent, useEffect, useState } from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import SignOutModal from "@/components/signOut-modal/signOut-modal";
import SavedSearches from "@/components/saved-searches/saved-searches";
import NotificationSettings from "@/components/notification-settings/notification-settings";
import {
  updatePassword,
  updateProfile,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth } from "@/functions/firebase";
import { updateUser } from "@/requests/user";
import { writeStoredUser } from "@/functions/userState";
import { useHasMounted } from "@/functions/useHasMounted";

const Account = () => {
  const navigate = useRouter();
  const rawUser = useAtomValue(userAtom);
  const setUser = useSetAtom(userAtom);
  // AuthProvider seeds userAtom from a cached session for a fast first paint,
  // but that can land before this route segment hydrates, so the atom's value
  // at hydration time may already differ from what the server rendered
  // (which always sees a signed-out user). Rendering `null` until this
  // component itself has mounted keeps its first client render identical to
  // the server's, then swaps in the real user right after — a normal
  // post-mount update instead of a hydration mismatch.
  const hasMounted = useHasMounted();
  const user = hasMounted ? rawUser : null;
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [pwd, setPwd] = useState<string>("");
  const [confirmPwd, setConfirmPwd] = useState<string>("");
  const [pwdSuccess, setPwdSuccess] = useState<boolean>(false);
  const [pwdError, setPwdError] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState<string>(
    user?.displayName ?? "",
  );
  const [loadedUid, setLoadedUid] = useState<string | undefined>(user?.uid);
  const [isSavingName, setIsSavingName] = useState<boolean>(false);
  const [nameSuccess, setNameSuccess] = useState<boolean>(false);
  const [nameError, setNameError] = useState<string | null>(null);

  if (user?.uid !== loadedUid) {
    setLoadedUid(user?.uid);
    setDisplayName(user?.displayName ?? "");
  }

  // Uses rawUser, not the mount-gated `user` — this is a redirect side effect,
  // not render output, so it should act on the real session immediately
  // rather than waiting an extra tick.
  useEffect(() => {
    if (!rawUser) navigate.replace("/sign-in");
  }, [rawUser, navigate]);

  useEffect(() => {
    trackPage(rawUser, "Account", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUpdateName = async () => {
    setNameError(null);
    setNameSuccess(false);
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;
    const trimmedName = displayName.trim();

    if (!currentUser || !trimmedName || trimmedName === user?.displayName)
      return;

    setIsSavingName(true);

    try {
      await updateProfile(currentUser, { displayName: trimmedName });

      const updatedUser = { ...user!, displayName: trimmedName };
      const idToken = await currentUser.getIdToken();
      await updateUser(updatedUser, idToken);

      writeStoredUser(updatedUser);
      setUser(updatedUser);

      trackEvent(user, "Update Profile", {
        type: "button",
        displayName: trimmedName,
      });

      setNameSuccess(true);
    } catch (error) {
      const code = (error as { code?: string }).code ?? "unknown";
      const message = (error as { message?: string }).message ?? "";

      trackError(user, "Update Profile", {
        code,
        message,
        displayName: trimmedName,
      });
      setNameError("We couldn't update your name. Please try again.");
    } finally {
      setIsSavingName(false);
    }
  };

  const handleChangePwd = async () => {
    setPwdError(null);
    const auth = getFirebaseAuth();
    const currentUser = auth.currentUser;

    if (!currentUser || !currentUser.email || !pwd || !confirmPwd) return;

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, pwd);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, confirmPwd);

      trackEvent(user, "Change Password", {
        type: "button",
        email: currentUser.email,
      });

      setPwdSuccess(true);
      setPwd("");
      setConfirmPwd("");
    } catch (error) {
      const code = (error as { code?: string }).code ?? "unknown";
      const message = (error as { message?: string }).message ?? "";

      trackError(user, "Change Password", {
        code,
        message,
        email: currentUser.email,
      });
      setPwdError("We couldn't update your password. Please try again.");
    }
  };

  return (
    <>
      <S.Wrapper>
        <h1>Account</h1>
        <div>Email: {user?.email}</div>
        <hr />
        <S.Pwd>
          <h3>Name</h3>
          {nameSuccess && (
            <div className="success">Your name has been updated</div>
          )}
          {nameError && <div>{nameError}</div>}
          <div>
            <S.Input
              type="text"
              name="displayName"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setDisplayName(e.target.value)
              }
              placeholder="Enter your name"
              value={displayName}
              required
            />
          </div>
          <button
            onClick={handleUpdateName}
            disabled={
              isSavingName ||
              !displayName.trim() ||
              displayName.trim() === user?.displayName
            }
          >
            {isSavingName ? "Saving..." : "Update Name"}
          </button>
        </S.Pwd>
        <hr />
        <S.Pwd>
          <h3>Change Password</h3>
          {pwdSuccess && (
            <div className="success">Your Password has been updated</div>
          )}
          {pwdError && <div>{pwdError}</div>}
          <div>
            <S.Input
              type="password"
              name="password"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPwd(e.target.value)
              }
              placeholder="Enter current password"
              value={pwd}
              required
            />
          </div>
          <div>
            <S.Input
              type="password"
              name="confirm-password"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setConfirmPwd(e.target.value)
              }
              placeholder="Enter new password"
              value={confirmPwd}
              required
            />
          </div>
          <button onClick={handleChangePwd} disabled={!pwd || !confirmPwd}>
            Update Password
          </button>
        </S.Pwd>
        <hr />
        <S.Pwd>
          <h3>Saved Searches</h3>
          <SavedSearches />
        </S.Pwd>
        <hr />
        <S.Pwd>
          <h3>Notification Emails</h3>
          <NotificationSettings />
        </S.Pwd>
        <hr />
        <button onClick={() => setOpenModal(true)}>Sign Out</button>
      </S.Wrapper>
      <SignOutModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Account;
