import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 2%;

  @media only screen and (max-width: 950px) {
    padding: 2%;
  }
`;

export const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  &.list {
    gap: 0;
  }
`;

export const ResultsWrapper = styled.div`
  display: flex;
  gap: 30px;

  > div:first-child {
    min-width: 300px;
  }

  @media only screen and (max-width: 950px) {
    flex-direction: column;
  }
`;

export const Section = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  &.wrapper {
    justify-content: space-between;
    margin-top: 30px;
  }

  .jobs {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .sorting {
    display: flex;
    gap: 10px;
    align-items: center;
  }
`;

export const ListSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media only screen and (max-width: 950px) {
    display: none;
  }
`;

export const JobResultsWrapper = styled.div`
  width: 100%;
`;

export const Select = styled.select`
  border: 1px solid #000;
  border-radius: 10px;
  background: #fff;
  color: #000;
  padding: 5px 10px;
  width: 60%;
`;
