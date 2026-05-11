"use client";

import moment from "moment";
import * as S from "./card.style";

interface CardProps {
  job: any;
}

const Card = ({ job }: CardProps) => {
  const openNewTab = () => {
    window.open(job.Link);
  };

  const currentDate = moment(job.Scrape_Date).format("YYYYMMDD");
  const postedTime = moment(currentDate, "YYYYMMDD").fromNow();

  return (
    <S.Wrapper>
      <S.Section className="first">
        <div className="company">{job.Company}</div>
        <div className="position">{job["Role Name"]}</div>
      </S.Section>
      <S.Section className="second">
        <button onClick={openNewTab}>See Position</button>
        <div className="posted">Posted: {postedTime}</div>
      </S.Section>
    </S.Wrapper>
  );
};

export default Card;
