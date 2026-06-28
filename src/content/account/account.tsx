"use client";

import { useRouter } from "next/navigation";
import * as S from "./account.style";
import { trackError, trackEvent, trackPage } from "@/functions/mixpanel";
import { ChangeEvent, useEffect, useState } from "react";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import SignOutModal from "@/components/signOut-modal/signOut-modal";
import {
  getAuth,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { initFirebase } from "@/functions/firebase";

const Account = () => {
  initFirebase();
  const navigate = useRouter();
  const auth = getAuth();
  const user = useAtomValue(userAtom);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [pwd, setPwd] = useState<string | null>(null);
  const [confirmPwd, setConfirmPwd] = useState<string | null>(null);
  const [pwdSuccess, setPwdSuccess] = useState<boolean>(false);

  if (!user) {
    navigate.push("/sign-in");
  }

  const handleChangePwd = async () => {
    try {
      const userData = auth.currentUser;

      if (!userData || !pwd || !confirmPwd) return;

      const credential = EmailAuthProvider.credential(user?.email || "", pwd);

      await reauthenticateWithCredential(userData, credential);

      await updatePassword(userData, confirmPwd);

      trackEvent(user, "Change Password", {
        type: "button",
        email: auth.currentUser?.email,
      });

      setPwdSuccess(true);
      setPwd(null);
      setConfirmPwd(null);
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;

      trackError(user, "Change Password", {
        code: errorCode,
        message: errorMessage,
        email: auth.currentUser?.email,
      });
    }
  };

  useEffect(() => {
    trackPage(user, "Account", window.location.href);
  }, []);

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
          <div>
            <S.Input
              type="password"
              name="password"
              onChange={(e: ChangeEvent<HTMLInputElement>) =>
                setPwd(e.target.value)
              }
              placeholder="Enter current password"
              value={pwd || ""}
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
              value={confirmPwd || ""}
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
