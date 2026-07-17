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
        <div>
          <span className="title">Company:</span> {data?.Company}
        </div>
        <div>
          <span className="title">Industry:</span> {data?.["Primary Industry"]}
        </div>
        <div>
          <span className="title">Role:</span> {data?.["Role Name"]}
        </div>
        <div>
          <span className="title">Additional Job Details:</span> Cominng Soon...
        </div>
        {data?.Details?.datePosted && (
          <div>
            <span className="title">Date Posted by Company:</span>{" "}
            {dayjs(data?.Details?.datePosted).format("MM-DD-YYYY")}
          </div>
        )}
        {data?.Details?.validThrough && (
          <div>
            <span className="title">Valid Through:</span>{" "}
            {dayjs(data?.Details?.validThrough).format("MM-DD-YYYY")}
          </div>
        )}
        {data?.Details?.employmentType && (
          <div>
            <span className="title">Employment Type:</span>{" "}
            {data?.Details?.employmentType}
          </div>
        )}
        {data?.Details?.jobLocation.address?.addressLocality && (
          <div>
            <span className="title">Location:</span>{" "}
            {data?.Details?.jobLocation.address.addressLocality}
          </div>
        )}
        {data?.Details?.jobBenefits && (
          <div>
            <span className="title">Job Benefits:</span>{" "}
            {data?.Details?.jobBenefits}
          </div>
        )}
        {data?.Details?.description && (
          <div>
            <span className="title">Job Description:</span>{" "}
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
