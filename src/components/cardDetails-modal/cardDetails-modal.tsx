"use client";

import * as S from "./cardDetails-modal.style";
import ModalComponent from "../modal/modal";
import { CsvData } from "@/types";
import { trackEvent } from "@/functions/mixpanel";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import dayjs from "dayjs";
import { useMemo, useState } from "react";
import { sanitizeJobDescriptionClient } from "@/functions/sanitizeJobDescription";

interface CardDetailsProps {
  openModal: boolean;
  setOpenModal: (val: boolean) => void;
  data: CsvData | null;
}

const CardDetails = ({ openModal, setOpenModal, data }: CardDetailsProps) => {
  const user = useAtomValue(userAtom);
  const [showDetails, setShowDetails] = useState<boolean>(false);

  // The API sanitizes this already; sanitize again in the browser as defense
  // in depth before it goes through dangerouslySetInnerHTML. The allow-list
  // is shared with the /jobs/[id] page's server-side sanitizer so the two
  // environments can't drift apart.
  const cleanDescription = useMemo(
    () => sanitizeJobDescriptionClient(data?.Details?.description),
    [data],
  );

  return (
    <ModalComponent
      isOpen={openModal}
      onClose={() => setOpenModal(false)}
      title={`Job Details`}
      size="large"
    >
      <S.ModalWrapper>
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
        </S.ModalBtn>
        <div>
          <span className="title">Company:</span> {data?.Company}
        </div>
        <div>
          <span className="title">Industry:</span> {data?.["Primary Industry"]}
        </div>
        <div>
          <span className="title">Role:</span> {data?.["Role Name"]}
        </div>
        {cleanDescription && (
          <div>
            <span className="title">Job Description:</span>{" "}
            <div dangerouslySetInnerHTML={{ __html: cleanDescription }} />
          </div>
        )}
        <S.ModalBtn>
          <button
            onClick={() => {
              trackEvent(user, "Additional Details");
              setShowDetails(!showDetails);
            }}
            className="submit"
          >
            Additional Details
          </button>
        </S.ModalBtn>
        {showDetails && (
          <>
            <div>
              <i>-- Under Development --</i>
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
          </>
        )}
      </S.ModalWrapper>
    </ModalComponent>
  );
};

export default CardDetails;
