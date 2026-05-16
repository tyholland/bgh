import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  padding: 1%;
  border-bottom: 1px solid #000;
  border-left: 1px solid #000;
  border-right: 1px solid #000;
  width: 100%;
  overflow-wrap: break-word;
  align-items: center;

  &:first-child {
    border-top: 1px solid #000;
  }

  @media only screen and (max-width: 950px) {
    width: 100%;
  }

  button {
    width: 100px;
    padding: 5px 10px;
    border-radius: 20px;
    border: none;
    background: #1439e6;

    &:hover {
      cursor: pointer;
    }
  }

  .grid {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .company {
    width: 190px;
  }

  .industry {
    width: 190px;
  }

  .position {
    width: 300px;
  }

  .posted {
    width: 120px;
  }
`;

export const Section = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;
