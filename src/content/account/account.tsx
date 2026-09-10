"use client";

import { useRouter } from "next/navigation";
import * as S from "./account.style";
import { trackError, trackEvent, trackPage } from "@/functions/mixpanel";
import { ChangeEvent, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import SignOutModal from "@/components/signOut-modal/signOut-modal";
import {
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirebaseAuth } from "@/functions/firebase";

const Account = () => {
  const navigate = useRouter();
  const user = useAtomValue(userAtom);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [pwd, setPwd] = useState<string>("");
  const [confirmPwd, setConfirmPwd] = useState<string>("");
  const [pwdSuccess, setPwdSuccess] = useState<boolean>(false);
  const [pwdError, setPwdError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) navigate.replace("/sign-in");
  }, [user, navigate]);

  useEffect(() => {
    trackPage(user, "Account", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        <div>Name: {user?.displayName}</div>
        <div>Email: {user?.email}</div>
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
        <button onClick={() => setOpenModal(true)}>Sign Out</button>
      </S.Wrapper>
      <SignOutModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Account;
