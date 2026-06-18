"use client";

import * as S from "./list.style";
import { CsvData } from "@/types";
import { useAtomValue } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { trackEvent } from "@/functions/mixpanel";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import SignInModal from "../signIn-modal/signIn-modal";
import { useState } from "react";
import { userAtom } from "@/caches/UserAtom";

const List = () => {
  const user = useAtomValue(userAtom);
  const jobData = useAtomValue(jobAtom);
  dayjs.extend(relativeTime);
  const [openModal, setOpenModal] = useState<boolean>(false);

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
          if (!user) {
            setOpenModal(true);
            return;
          }

          window.open(item.Link);

          trackEvent(user, "See Role", {
            type: "list",
            item,
          });
        };

        const currentDate = dayjs(item.Scrape_DateTime);
        const postedTime = dayjs(currentDate).fromNow();

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
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default List;
