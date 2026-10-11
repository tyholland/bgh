"use client";

import * as S from "./list.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { trackEvent } from "@/functions/mixpanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import { userAtom } from "@/caches/UserAtom";
import Link from "next/link";
import { jobHref } from "@/functions/jobHref";

dayjs.extend(relativeTime);

interface ListProps {
  jobs: CsvData[];
}

const List = ({ jobs }: ListProps) => {
  const user = useAtomValue(userAtom);

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
        // the public /jobs/[id] page.
        const href = jobHref(item);

        const postedTime = dayjs(item.Scrape_DateTime).fromNow();
        const content = (
          <S.Section>
            <div className="position">{item["Role Name"]}</div>
            <div className="company">{item.Company}</div>
            <div className="industry">{item["Primary Industry"]}</div>
            <div className="posted">{postedTime}</div>
          </S.Section>
        );

        return (
          <S.Wrapper
            as={Link}
            href={href || "#"}
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
        );
      })}
    </>
  );
};

export default List;
