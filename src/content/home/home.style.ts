import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  padding: 0 2%;

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
`;

export const ListSection = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;
