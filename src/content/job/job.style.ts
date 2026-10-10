import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 5%;
  max-width: 800px;

  .title {
    font-weight: 700;
  }
`;

export const Back = styled.div`
  a {
    color: #1439e6;
  }
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h1 {
    margin: 0;
  }

  .company {
    font-size: 16px;
    font-weight: 700;
  }
`;

export const ApplyBtn = styled.div`
  a {
    display: inline-block;
    width: fit-content;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    background: #1439e6;
    color: #fff;

    &:hover {
      cursor: pointer;
      color: #fff;
    }
  }
`;
