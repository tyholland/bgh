"use client";

import * as S from "./card.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { trackEvent } from "@/functions/mixpanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { userAtom } from "@/caches/UserAtom";
import Link from "next/link";
import { jobHref } from "@/functions/jobHref";

dayjs.extend(relativeTime);

interface CardProps {
  jobs: CsvData[];
}

const Card = ({ jobs }: CardProps) => {
  const user = useAtomValue(userAtom);

  return (
    <>
      {jobs.map((item: CsvData) => {
        // Cards link straight through to the public /jobs/[id] page — once
        // the API provides `id` (see jobHref), a real href means crawlers,
        // ctrl/cmd-click, and "copy link" all reach a real, shareable URL.
        const href = jobHref(item);

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

        return (
          <S.Wrapper
            as={Link}
            href={href || "#"}
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
        );
      })}
    </>
  );
};

export default Card;
