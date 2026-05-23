"use client";

import * as S from "./card.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { trackEvent } from "@/functions/mixpanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const Card = () => {
  const jobData = useAtomValue(jobAtom);
  dayjs.extend(relativeTime);

  return (
    <>
      {jobData?.data.map((item: CsvData, index: number) => {
        const openNewTab = () => {
          window.open(item.Link);

          trackEvent("See Role", {
            type: "list",
            item,
          });
        };

        const currentDate = dayjs(item.Scrape_Date).format("YYYYMMDD");
        const postedTime = dayjs(currentDate).fromNow();

        return (
          <S.Wrapper key={index}>
            <div className="posted">Posted: {postedTime}</div>
            <S.Section className="first">
              <div className="company">{item.Company}</div>
              <div className="position">{item["Role Name"]}</div>
              {/* <div className="industry">{item["Primary Industry"]}</div> */}
            </S.Section>
            <S.Section className="second">
              <button onClick={openNewTab}>See Role</button>
            </S.Section>
          </S.Wrapper>
        );
      })}
    </>
  );
};

export default Card;
