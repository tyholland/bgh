"use client";

import * as S from "./list.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { trackEvent } from "@/functions/mixpanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

const List = () => {
  const jobData = useAtomValue(jobAtom);
  dayjs.extend(relativeTime);

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
          <div>
            <strong>Link</strong>
          </div>
        </S.Section>
      </S.Wrapper>
      {jobData?.data.map((item: CsvData, index: number) => {
        const openNewTab = () => {
          window.open(item.Link);

          trackEvent("See Role", {
            type: "card",
            item,
          });
        };

        const currentDate = dayjs(item.Scrape_Date).format("YYYYMMDD");
        const postedTime = dayjs(currentDate, "YYYYMMDD").fromNow();

        return (
          <S.Wrapper key={index}>
            <S.Section>
              <div className="position">{item["Role Name"]}</div>
              <div className="company">{item.Company}</div>
              <div className="industry">{item["Primary Industry"]}</div>
              <div className="posted">{postedTime}</div>
              <button onClick={openNewTab}>See Role</button>
            </S.Section>
          </S.Wrapper>
        );
      })}
    </>
  );
};

export default List;
