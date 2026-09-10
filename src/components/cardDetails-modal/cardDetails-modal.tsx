"use client";

import * as S from "./cardDetails-modal.style";
import ModalComponent from "../modal/modal";
import { CsvData } from "@/types";
import { trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import dayjs from "dayjs";
import DOMPurify from "dompurify";
import { useMemo } from "react";

interface CardDetailsProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
  data: CsvData | null;
}

const CardDetails = ({ openModal, setOpenModal, data }: CardDetailsProps) => {
  const user = useAtomValue(userAtom);

  // The API sanitizes this already; sanitize again in the browser as defense
  // in depth before it goes through dangerouslySetInnerHTML.
  const cleanDescription = useMemo(() => {
    const raw = data?.Details?.description;
    if (typeof window === "undefined" || !raw) return "";

    return DOMPurify.sanitize(raw, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "ul",
        "ol",
        "li",
        "strong",
        "b",
        "em",
        "i",
        "h3",
        "h4",
        "a",
      ],
      ALLOWED_ATTR: ["href"],
    });
  }, [data]);

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
        {data?.Details?.datePosted && (
          <div>
            <span className="title">Date Posted by Company:</span>{" "}
            {dayjs(data.Details.datePosted).format("MM-DD-YYYY")}
          </div>
        )}
        {data?.Details?.validThrough && (
          <div>
            <span className="title">Valid Through:</span>{" "}
            {dayjs(data.Details.validThrough).format("MM-DD-YYYY")}
          </div>
        )}
        {data?.Details?.employmentType && (
          <div>
            <span className="title">Employment Type:</span>{" "}
            {data.Details.employmentType}
          </div>
        )}
        {data?.Details?.jobLocation?.address?.addressLocality && (
          <div>
            <span className="title">Location:</span>{" "}
            {data.Details.jobLocation.address.addressLocality}
          </div>
        )}
        {data?.Details?.jobBenefits && (
          <div>
            <span className="title">Job Benefits:</span>{" "}
            {data.Details.jobBenefits}
          </div>
        )}
        {cleanDescription && (
          <div>
            <span className="title">Job Description:</span>{" "}
            <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />
          </div>
        )}
        <S.ModalBtn>
          <button
            onClick={() => {
              trackEvent(user, "See Role", { type: "card", ...data });
              setOpenModal(false);
              if (data?.Link) window.open(data.Link, "_blank", "noopener");
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
