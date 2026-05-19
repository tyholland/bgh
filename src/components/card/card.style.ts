import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  padding: 2%;
  border: 1px solid #000;
  width: 31%;
  border-radius: 10px;
  box-shadow: 5px 5px 5px #ddd;
  overflow-wrap: break-word;
  align-items: center;
  background: #fff;
  gap: 25px;
  flex-direction: column;
  min-height: 250px;

  &:hover {
    background: #6ad5b5;
  }

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

  .grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .company,
  .industry {
    font-size: 14px;
    background: #514c4c;
    border-radius: 10px;
    padding: 6px 10px;
    width: fit-content;
    color: #fff;
  }

  .industry {
    background: #6fd8b8;
    color: #000;
  }

  .position {
    font-size: 18px;
    font-weight: 700;
  }

  .posted {
    font-size: 12px;
    width: 100%;
    text-align: right;
  }
`;

export const Section = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;

  &.first {
    width: 100%;
    min-height: 160px;
  }

  &.second {
    width: 100%;
    justify-content: flex-end;
    flex-direction: row;
  }
`;
