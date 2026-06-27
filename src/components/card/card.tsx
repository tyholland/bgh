"use client";

import * as S from "./card.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { trackEvent } from "@/functions/mixpanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SignInModal from "../signIn-modal/signIn-modal";
import { useState } from "react";
import { userAtom } from "@/caches/UserAtom";
import CardDetails from "../cardDetails-modal/cardDetails-modal";

const Card = () => {
  const user = useAtomValue(userAtom);
  const jobData = useAtomValue(jobAtom);
  dayjs.extend(relativeTime);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [cardModal, setCardModal] = useState<boolean>(false);
  const [cardData, setCardData] = useState<CsvData | null>(null);

  return (
    <>
      {jobData?.data.map((item: CsvData, index: number) => {
        const openJobDetails = () => {
          if (!user) {
            setOpenModal(true);
            return;
          }

          trackEvent(user, "Job Listing", {
            type: "card",
            ...item,
          });

          setCardData(item);
          setCardModal(true);
        };

        const currentDate = dayjs(item.Details?.datePosted);
        const postedTime = dayjs(currentDate).fromNow();

        return (
          <button onClick={openJobDetails}>
            <S.Wrapper key={index}>
              <div className="posted">Posted: {postedTime}</div>
              <S.Section className="first">
                <div className="company">{item.Company}</div>
                <div className="position">{item["Role Name"]}</div>
                <div className="industry">{item["Primary Industry"]}</div>
              </S.Section>
            </S.Wrapper>
          </button>
        );
      })}
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
      <CardDetails
        openModal={cardModal}
        setOpenModal={setCardModal}
        data={cardData}
      />
    </>
  );
};

export default Card;
