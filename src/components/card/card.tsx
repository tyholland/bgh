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

const Card = () => {
  const user = useAtomValue(userAtom);
  const jobData = useAtomValue(jobAtom);
  dayjs.extend(relativeTime);
  const [openModal, setOpenModal] = useState<boolean>(false);

  return (
    <>
      {jobData?.data.map((item: CsvData, index: number) => {
        const openNewTab = () => {
          if (!user) {
            setOpenModal(true);
            return;
          }

          window.open(item.Link);

          trackEvent(user, "See Role", {
            type: "card",
            ...item,
          });
        };

        const currentDate = dayjs(item.Scrape_DateTime);
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
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Card;
