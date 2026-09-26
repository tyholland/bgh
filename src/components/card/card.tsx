"use client";

import * as S from "./card.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { trackEvent } from "@/functions/mixpanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SignInModal from "../signIn-modal/signIn-modal";
import { useState } from "react";
import { userAtom } from "@/caches/UserAtom";
import CardDetails from "../cardDetails-modal/cardDetails-modal";

dayjs.extend(relativeTime);

interface CardProps {
  jobs: CsvData[];
}

const Card = ({ jobs }: CardProps) => {
  const user = useAtomValue(userAtom);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [cardModal, setCardModal] = useState<boolean>(false);
  const [cardData, setCardData] = useState<CsvData | null>(null);

  return (
    <>
      {jobs.map((item: CsvData) => {
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

        const postedTime = dayjs(item.Scrape_DateTime).fromNow();

        return (
          <S.Wrapper onClick={openJobDetails} key={item.Link}>
            <div className="topLayer">
              <div className="company">{item.Company}</div>
              <div className="posted">Posted: {postedTime}</div>
            </div>
            <div className="position">{item["Role Name"]}</div>
            <div className="industry">{item["Primary Industry"]}</div>
          </S.Wrapper>
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
