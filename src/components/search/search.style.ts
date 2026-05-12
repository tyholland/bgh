import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  gap: 10px;

  button {
    with: 100%;
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;

    &.reset {
      color: #fff;
      background: #ff6b6b;

      &:hover {
        cursor: pointer;
      }
    }

    &:hover {
      cursor: pointer;
    }
  }
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 5px 10px;
`;
