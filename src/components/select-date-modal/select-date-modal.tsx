"use client";

import { useState } from "react";
import ModalComponent from "../modal/modal";
import * as S from "./select-date-modal.style";

interface SelectDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  // "YYYY-MM-DD", or "" for no date currently applied.
  value: string;
  onSubmit: (date: string) => void;
  // Also "YYYY-MM-DD" — bounds the pickable range to where scraped data
  // actually exists (see filter.tsx's minScrapDate/maxScrapDate).
  minDate?: string;
  maxDate?: string;
}

const SelectDateModal = ({
  isOpen,
  onClose,
  value,
  onSubmit,
  minDate,
  maxDate,
}: SelectDateModalProps) => {
  // ModalComponent's underlying MUI Modal unmounts its children whenever
  // `isOpen` is false, so this is re-created fresh every time the modal
  // opens, always starting from whatever date is currently applied —
  // typing here only edits this draft, nothing commits to the URL until
  // Submit is clicked.
  const [draftDate, setDraftDate] = useState(value);

  const handleSubmit = () => {
    onSubmit(draftDate);
    onClose();
  };

  return (
    <ModalComponent isOpen={isOpen} onClose={onClose} title="Select a Date">
      <S.Wrapper>
        <S.Input
          type="date"
          name="exactDateInput"
          value={draftDate}
          onChange={(e) => setDraftDate(e.target.value)}
          min={minDate}
          max={maxDate}
        />
        <S.ModalBtn>
          <button type="button" onClick={handleSubmit}>
            Submit
          </button>
        </S.ModalBtn>
      </S.Wrapper>
    </ModalComponent>
  );
};

export default SelectDateModal;
