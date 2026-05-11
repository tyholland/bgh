import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 50px;
  margin-top: 3%;
  padding: 0 2%;

  @media only screen and (max-width: 800px) {
    padding: 2%;
  }
`;

export const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
`;

export const ResultsWrapper = styled.div`
  display: flex;
  gap: 30px;
`;
