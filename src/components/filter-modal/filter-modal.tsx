"use client";

import * as S from "./signIn-modal.style";
import ModalComponent from "../modal/modal";
import Filter from "../filter/filter";

interface FilterModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
}

const FilterModal = ({ openModal, setOpenModal }: FilterModalProps) => {
  return (
    <ModalComponent isOpen={openModal} title={`Filter Jobs`} size="large">
      <S.ModalWrapper>
        <Filter />
        <S.ModalBtn>
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

export default FilterModal;
