"use client";

import * as S from "./cardDetails-modal.style";
import ModalComponent from "../modal/modal";
import { CsvData } from "@/types";
import { trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import dayjs from "dayjs";
import he from "he";

interface CardDetailsProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
  data: CsvData | null;
}

const CardDetails = ({ openModal, setOpenModal, data }: CardDetailsProps) => {
  const user = useAtomValue(userAtom);

  return (
    <ModalComponent isOpen={openModal} title={`Job Details`} size="large">
      <S.ModalWrapper>
        <div>Company: {data?.Company}</div>
        <div>Industry: {data?.["Primary Industry"]}</div>
        <div>Role: {data?.["Role Name"]}</div>
        {data?.Details?.datePosted && (
          <div>
            Date Posted by Company:{" "}
            {dayjs(data?.Details?.datePosted).format("MM-DD-YYYY")}
          </div>
        )}
        {data?.Details?.validThrough && (
          <div>
            Valid Through:{" "}
            {dayjs(data?.Details?.validThrough).format("MM-DD-YYYY")}
          </div>
        )}
        {data?.Details?.employmentType && (
          <div>Employment Type: {data?.Details?.employmentType}</div>
        )}
        {data?.Details?.jobLocation.address?.addressLocality && (
          <div>
            Location: {data?.Details?.jobLocation.address.addressLocality}
          </div>
        )}
        {data?.Details?.jobBenefits && (
          <div>Job Benefits: {data?.Details?.jobBenefits}</div>
        )}
        {data?.Details?.description && (
          <div>
            Job Description:{" "}
            <div
              dangerouslySetInnerHTML={{
                __html: he.decode(data?.Details?.description),
              }}
            />
          </div>
        )}
        <S.ModalBtn>
          <button
            onClick={() => {
              trackEvent(user, "See Role", {
                type: "card",
                ...data,
              });
              setOpenModal(false);
              window.open(data?.Link);
            }}
          >
            See Role
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

export default CardDetails;
