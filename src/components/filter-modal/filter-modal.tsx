"use client";

import { useRouter, useSearchParams } from "next/navigation";
import * as S from "./signIn-modal.style";
import ModalComponent from "../modal/modal";
import Filter from "../filter/filter";
import { AllSearchData } from "@/types";
import { trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";

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
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);

  const hasActiveFilters =
    !!searchParams.get("company") ||
    !!searchParams.get("industry") ||
    !!searchParams.get("date") ||
    !!searchParams.get("exact");

  const handleSaveSearch = () => {
    setOpenModal(false);
    onSaveSearchClick();
  };

  const handleResetAll = () => {
    const params = new URLSearchParams(searchParams.toString());
    ["company", "industry", "date", "exact"].forEach((key) =>
      params.delete(key),
    );
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });

    trackEvent(user, "Filter", { type: "reset", value: "all filters" });
  };

  return (
    <ModalComponent
      isOpen={openModal}
      onClose={() => setOpenModal(false)}
      title={`Filter Jobs`}
      size="large"
    >
      <S.ModalWrapper>
        <Filter
          companies={data.companies}
          industries={data.industries}
          scrapDates={data.scrapDates}
        />
        <S.ModalBtn>
          <button
            className="resetAll"
            onClick={handleResetAll}
            disabled={!hasActiveFilters}
          >
            Reset All Filters
          </button>
          <button onClick={handleSaveSearch}>Save Search</button>
          <button onClick={() => setOpenModal(false)}>See Results</button>
        </S.ModalBtn>
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default FilterModal;
