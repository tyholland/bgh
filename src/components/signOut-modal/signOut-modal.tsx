"use client";

import * as S from "./signOut-modal.style";
import ModalComponent from "../modal/modal";
import { useRouter } from "next/navigation";
import { signOut } from "firebase/auth";
import { trackError, trackEvent } from "@/functions/mixpanel";
import { getFirebaseAuth } from "@/functions/firebase";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";

interface SignOutModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const SignOutModal = ({ openModal, setOpenModal }: SignOutModalProps) => {
  const navigate = useRouter();
  const user = useAtomValue(userAtom);

  const handleSignOut = async () => {
    const auth = getFirebaseAuth();
    const email = auth.currentUser?.email;

    try {
      // The auth listener in <AuthProvider /> clears the cached session + atom.
      await signOut(auth);

      setOpenModal(false);
      trackEvent(user, "Sign Out", { type: "button", email });
      navigate.push("/");
    } catch (error) {
      trackError(user, "Sign Out", {
        code: (error as { code?: string }).code ?? "unknown",
        message: (error as { message?: string }).message ?? "",
        email,
      });
    }
  };

  return (
    <ModalComponent isOpen={openModal} title={`Your Account`}>
      <S.ModalWrapper>
        <span>Do you want to sign out?</span>
        <S.ModalBtn>
          <button className="submit" onClick={handleSignOut}>
            Sign Out
          </button>
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
