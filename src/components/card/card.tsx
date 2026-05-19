"use client";

import moment from "moment";
import * as S from "./card.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { trackEvent } from "@/functions/mixpanel";

const Card = () => {
  const jobData = useAtomValue(jobAtom);

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

        const currentDate = moment(item.Scrape_Date).format("YYYYMMDD");
        const postedTime = moment(currentDate, "YYYYMMDD").fromNow();

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
