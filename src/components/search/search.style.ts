import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  gap: 10px;
  justify-content: center;

  button {
    border: none;
    padding: 12px 16px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;
    color: #fff;

    &.reset {
      text-decoration: underline;
      background: transparent;
      color: #000;
      padding: 0;
    }

    &:hover {
      cursor: pointer;
      color: #fff;
    }

    &:disabled {
      color: #999;
      background: #ddd;
      cursor: no-drop;
    }
  }
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 12px 10px;
  width: 400px;
`;
