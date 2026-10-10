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
import Link from "next/link";
import { jobHref } from "@/functions/jobHref";

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
        // The card always has a real href to the public /jobs/[id] page
        // (once the API provides `id` — see jobHref) so crawlers, ctrl/cmd-
        // click, and "copy link" all reach a real, shareable URL. A plain
        // left-click still opens the quick-preview modal instead, same as
        // before — only intercept the click when no modifier/new-tab intent
        // is present.
        const href = jobHref(item);

        const openJobDetails = (e: React.MouseEvent) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();

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
        const content = (
          <>
            <div className="topLayer">
              <div className="company">{item.Company}</div>
              <div className="posted">Posted: {postedTime}</div>
            </div>
            <div className="position">{item["Role Name"]}</div>
            <div className="industry">{item["Primary Industry"]}</div>
          </>
        );

        return href ? (
          <S.Wrapper
            as={Link}
            href={href}
            onClick={() =>
              trackEvent(user, "Job Listing", {
                type: "card",
                ...item,
              })
            }
            key={item.Link}
          >
            {content}
          </S.Wrapper>
        ) : (
          <S.Wrapper onClick={openJobDetails} key={item.Link}>
            {content}
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
