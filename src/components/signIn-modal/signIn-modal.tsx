"use client";

import * as S from "./signIn-modal.style";
import ModalComponent from "../modal/modal";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface SignInModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const SignInModal = ({ openModal, setOpenModal }: SignInModalProps) => {
  const navigate = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const goToAuth = (path: "/sign-in" | "/sign-up") => {
    const query = searchParams.toString();
    const redirectTo = `${pathname}${query ? `?${query}` : ""}`;

    setOpenModal(false);
    navigate.push(`${path}?redirect=${encodeURIComponent(redirectTo)}`);
  };

  return (
    <ModalComponent
      isOpen={openModal}
      onClose={() => setOpenModal(false)}
      title={`Please Sign In`}
    >
      <S.ModalWrapper>
        <span>You need to sign in, in order to use BGH features</span>
        <S.ModalBtn>
          <button className="submit" onClick={() => goToAuth("/sign-up")}>
            Sign Up
          </button>
          <button onClick={() => goToAuth("/sign-in")}>Sign In</button>
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default SignInModal;
