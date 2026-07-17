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
import CardDetails from "../cardDetails-modal/cardDetails-modal";

const List = () => {
  const user = useAtomValue(userAtom);
  const jobData = useAtomValue(jobAtom);
  dayjs.extend(relativeTime);
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
      {jobData?.data.map((item: CsvData, index: number) => {
        const openJobDetails = () => {
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

        const currentDate = dayjs(item.Scrape_DateTime);
        const postedTime = dayjs(currentDate).fromNow();

        return (
          <S.Wrapper onClick={openJobDetails} key={index}>
            <S.Section>
              <div className="position">{item["Role Name"]}</div>
              <div className="company">{item.Company}</div>
              <div className="industry">{item["Primary Industry"]}</div>
              <div className="posted">{postedTime}</div>
            </S.Section>
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
