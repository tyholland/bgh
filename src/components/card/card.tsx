import * as S from "./card.style";

interface CardProps {
  job: any;
}

const Card = ({ job }: CardProps) => {
  return (
    <S.Wrapper>
      <div>Company Name: {job.Company}</div>
      <div>Position: {job["Role Name"]}</div>
      <div>Link to apply: {job.Link}</div>
      <div>Date posted: {job.Scrape_Date}</div>
    </S.Wrapper>
  );
};

export default Card;
