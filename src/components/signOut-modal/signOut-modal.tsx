"use client";

import * as S from "./signOut-modal.style";
import ModalComponent from "../modal/modal";
import { useRouter } from "next/navigation";
import { getAuth, signOut } from "firebase/auth";
import { trackError } from "@/functions/mixpanel";
import { initFirebase } from "@/functions/firebase";
import { useAtomValue, useSetAtom } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { jobAtom } from "@/caches/JobsAtom";

interface SignOutModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const SignOutModal = ({ openModal, setOpenModal }: SignOutModalProps) => {
  initFirebase();
  const navigate = useRouter();
  const auth = getAuth();
  const setUser = useSetAtom(userAtom);
  const jobData = useAtomValue(jobAtom);

  const handleSignOut = async () => {
    try {
      await signOut(auth);

      setOpenModal(false);
      window.localStorage.removeItem("bgh.user");
      setUser(null);
      navigate.push(!!jobData ? "/home" : "/");
    } catch (error: any) {
      const errorCode = error.code;
      const errorMessage = error.message;

      trackError("Sign Out", {
        code: errorCode,
        message: errorMessage,
        email: auth.currentUser?.email,
      });
    }
  };

  return (
    <ModalComponent isOpen={openModal} title={`Your Account`}>
      <S.ModalWrapper>
        <span>Do you want to sign out?</span>
        <S.ModalBtn>
          <button onClick={handleSignOut}>Sign Out</button>
          <button
            onClick={() => {
              setOpenModal(false);
            }}
          >
            Close
          </button>
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default SignOutModal;
