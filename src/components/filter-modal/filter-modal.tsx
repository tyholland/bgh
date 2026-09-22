"use client";

import * as S from "./signIn-modal.style";
import ModalComponent from "../modal/modal";
import Filter from "../filter/filter";
import { AllSearchData } from "@/types";

interface FilterModalProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
  data: AllSearchData;
  onSaveSearchClick: () => void;
}

const FilterModal = ({
  openModal,
  setOpenModal,
  data,
  onSaveSearchClick,
}: FilterModalProps) => {
  const handleSaveSearch = () => {
    setOpenModal(false);
    onSaveSearchClick();
  };

  return (
    <ModalComponent isOpen={openModal} title={`Filter Jobs`} size="large">
      <S.ModalWrapper>
        <Filter
          companies={data.companies}
          industries={data.industries}
          scrapDates={data.scrapDates}
        />
        <S.ModalBtn>
          <button onClick={handleSaveSearch}>Save Search</button>
          <button
            className="submit"
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
