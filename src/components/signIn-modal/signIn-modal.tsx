"use client";

import * as S from "./signIn-modal.style";
import ModalComponent from "../modal/modal";
import { useRouter } from "next/navigation";

interface SignInModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const SignInModal = ({ openModal, setOpenModal }: SignInModalProps) => {
  const navigate = useRouter();

  return (
    <ModalComponent isOpen={openModal} title={`Please Sign In`}>
      <S.ModalWrapper>
        <span>You need to sign in, in order to use BGH features</span>
        <S.ModalBtn>
          <button
            onClick={() => {
              setOpenModal(false);
              navigate.push("/sign-in");
            }}
          >
            Sign In
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

export default SignInModal;
