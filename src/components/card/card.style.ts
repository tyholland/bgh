import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  padding: 2%;
  border: 1px solid #000;
  width: 100%;
  border-radius: 10px;
  box-shadow: 5px 5px 5px #ddd;
  overflow-wrap: break-word;
  justify-content: space-between;
  align-items: center;

  @media only screen and (max-width: 950px) {
    width: 100%;
  }

  button {
    width: 50%;
    padding: 10px;
    border-radius: 20px;
    border: none;
    background: #1439e6;

    @media only screen and (max-width: 950px) {
      width: 90%;
    }

    &:hover {
      cursor: pointer;
    }
  }

  .company {
    font-size: 14px;
    background: #6faeff;
    border-radius: 20px;
    padding: 3px 12px;
    width: fit-content;
    color: #000;
  }

  .position {
    font-size: 18px;
    font-weight: 700;
  }

  .posted {
    font-size: 12px;
    width: 50%;
    text-align: center;

    @media only screen and (max-width: 950px) {
      width: 90%;
    }
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  &.first {
    width: 70%;
  }

  &.second {
    width: 30%;
    align-items: flex-end;
  }
`;
