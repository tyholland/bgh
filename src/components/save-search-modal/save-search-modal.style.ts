import styled from "styled-components";

export const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;

  .success {
    background: #6ad5b5;
    width: fit-content;
    padding: 10px;
    border-radius: 10px;
    font-weight: 700;
    color: #fff;
  }

  .error {
    color: #c0392b;
  }
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
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;

  button {
    width: 100px;
    padding: 10px;
    border-radius: 20px;
    border: none;
    background: #1439e6;
    color: #fff;

    @media only screen and (max-width: 950px) {
      width: 90%;
    }

    &:hover {
      cursor: pointer;
    }

    &:disabled {
      cursor: no-drop;
      background: #ddd;
      color: #999;
    }

    &.submit {
      background: #ddd;
      color: #000;

      &:hover {
        background: #6faeff;
        color: #fff;
      }
    }
  }
`;
