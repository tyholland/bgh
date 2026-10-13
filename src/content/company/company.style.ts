import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 2%;

  h1 {
    margin: 0;
  }
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  .count {
    color: #666;
  }

  a {
    color: #1439e6;
    width: fit-content;
  }
`;

export const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  margin: 10px 0;
`;

export const Empty = styled.div`
  color: #666;
`;
