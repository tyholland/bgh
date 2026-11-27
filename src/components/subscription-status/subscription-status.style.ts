import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  button {
    align-self: flex-start;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    background: #1439e6;
    color: #fff;

    &:hover {
      cursor: pointer;
      background: #6faeff;
    }
  }
`;
