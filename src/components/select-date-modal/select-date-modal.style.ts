import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 12px 10px;
  width: 100%;
`;

export const ModalBtn = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 4px;

  button {
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    background: #1439e6;
    color: #fff;

    &:hover {
      cursor: pointer;
    }

    &:disabled {
      cursor: no-drop;
      background: #ddd;
      color: #999;
    }
  }
`;
