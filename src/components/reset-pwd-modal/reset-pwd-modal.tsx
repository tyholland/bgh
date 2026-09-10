"use client";

import * as S from "./reset-pwd-modal.style";
import ModalComponent from "../modal/modal";
import { getFirebaseAuth } from "@/functions/firebase";
import { sendPasswordResetEmail } from "firebase/auth";
import { ChangeEvent, useState } from "react";
import { trackError, trackEvent } from "@/functions/mixpanel";

interface ResetPwdProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const ResetPwd = ({ openModal, setOpenModal }: ResetPwdProps) => {
  const [resetEmail, setResetEmail] = useState<string>("");
  const [status, setStatus] = useState<"idle" | "sent" | "error">("idle");

  const resetPassword = async () => {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), resetEmail);
      setStatus("sent");
      trackEvent(null, "Forgot Password", { type: "click", email: resetEmail });
    } catch (error) {
      setStatus("error");
      trackError(null, "Forgot Password", {
        code: (error as { code?: string }).code ?? "unknown",
        message: (error as { message?: string }).message ?? "",
        email: resetEmail,
      });
    }
  };

  const close = () => {
    setOpenModal(false);
    setStatus("idle");
    setResetEmail("");
  };

  return (
    <ModalComponent isOpen={openModal} title={`Forgot Password`}>
      <S.ModalWrapper>
        {status === "sent" ? (
          <span>
            If an account exists for {resetEmail}, a reset link is on its way.
          </span>
        ) : (
          <>
            <span>
              Enter your email and click &quot;Reset Password&quot; to get an
              email to reset your password
            </span>
            {status === "error" && (
              <span>Something went wrong. Check the email and try again.</span>
            )}
            <S.Input
              type="email"
              value={resetEmail}
              onChange={(e: ChangeEvent<HTMLInputElement>) => {
                setResetEmail(e.target.value);
                setStatus("idle");
              }}
              placeholder="Enter your email..."
            />
          </>
        )}
        <S.ModalBtn>
          {status !== "sent" && (
            <button onClick={resetPassword} disabled={!resetEmail}>
              Reset Password
            </button>
          )}
          <button onClick={close} className="submit">
            Close
          </button>
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default ResetPwd;
