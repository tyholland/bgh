"use client";

import * as S from "./reset-pwd-modal.style";
import ModalComponent from "../modal/modal";
import { initFirebase } from "@/functions/firebase";
import { getAuth, sendPasswordResetEmail } from "firebase/auth";
import { ChangeEvent, useState } from "react";
import { trackEvent } from "@/functions/mixpanel";

interface ResetPwdProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const ResetPwd = ({ openModal, setOpenModal }: ResetPwdProps) => {
  initFirebase();
  const auth = getAuth();
  const [resetEmail, setResetEmail] = useState<string>("");

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(auth, resetEmail);

      trackEvent(null, "Forgot Password", {
        type: "click",
        email: resetEmail,
      });
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;
      console.error("Error resetting password:", errorCode, errorMessage);
    }
  };

  return (
    <ModalComponent isOpen={openModal} title={`Forgot Password`}>
      <S.ModalWrapper>
        <span>
          Enter your email and click "Reset Password" to get an email to reset
          your password
        </span>
        <S.Input
          type="text"
          value={resetEmail}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setResetEmail(e.target.value)
          }
          placeholder="Enter your email..."
        />
        <S.ModalBtn>
          <button
            onClick={() => {
              resetPassword();
              setOpenModal(false);
            }}
            disabled={!resetEmail}
          >
            Reset Password
          </button>
          <button
            onClick={() => {
              setOpenModal(false);
            }}
            className="submit"
          >
            Close
          </button>
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default ResetPwd;
