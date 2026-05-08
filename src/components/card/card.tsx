"use client";

import * as S from "./card.style";

interface CardProps {
  job: any;
}

const Card = ({ job }: CardProps) => {
  const openNewTab = () => {
    window.open(job.Link);
  };

  return (
    <S.Wrapper>
      <div>Company Name: {job.Company}</div>
      <div>Position: {job["Role Name"]}</div>
      <div>Date posted: {job.Scrape_Date}</div>
      <button onClick={openNewTab}>Apply Now</button>
    </S.Wrapper>
  );
};

export default Card;
