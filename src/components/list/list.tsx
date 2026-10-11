"use client";

import * as S from "./list.style";
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

interface ListProps {
  jobs: CsvData[];
}

const List = ({ jobs }: ListProps) => {
  const user = useAtomValue(userAtom);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [cardModal, setCardModal] = useState<boolean>(false);
  const [cardData, setCardData] = useState<CsvData | null>(null);

  return (
    <>
      <S.Wrapper>
        <S.Section>
          <div className="position">
            <strong>Role</strong>
          </div>
          <div className="company">
            <strong>Company</strong>
          </div>
          <div className="industry">
            <strong>Industry</strong>
          </div>
          <div className="posted">
            <strong>Posted</strong>
          </div>
        </S.Section>
      </S.Wrapper>
      {jobs.map((item: CsvData) => {
        // See card.tsx for why this is a real <a href> rather than a plain
        // onClick div: crawlers and ctrl/cmd-click need a genuine link to
        // the public /jobs/[id] page even though a plain click still opens
        // the quick-preview modal.
        const href = jobHref(item);

        const openJobDetails = (e: React.MouseEvent) => {
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();

          if (!user) {
            setOpenModal(true);
            return;
          }

          trackEvent(user, "Job Listing", {
            type: "list",
            ...item,
          });

          setCardData(item);
          setCardModal(true);
        };

        const postedTime = dayjs(item.Scrape_DateTime).fromNow();
        const content = (
          <S.Section>
            <div className="position">{item["Role Name"]}</div>
            <div className="company">{item.Company}</div>
            <div className="industry">{item["Primary Industry"]}</div>
            <div className="posted">{postedTime}</div>
          </S.Section>
        );

        return href ? (
          <S.Wrapper
            as={Link}
            href={href}
            onClick={() =>
              trackEvent(user, "Job Listing", {
                type: "list",
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

export default List;
