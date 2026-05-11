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

  @media only screen and (max-width: 800px) {
    width: 100%;
  }

  button {
    width: 50%;
    padding: 10px;
    border-radius: 20px;
    border: none;

    &:hover {
      cursor: pointer;
    }
  }

  .company {
    font-size: 14px;
  }

  .position {
    font-size: 18px;
    font-weight: 700;
  }

  .posted {
    font-size: 12px;
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
