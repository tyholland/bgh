import styled from "styled-components";

export const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ModalBtn = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 20px;

  button {
    width: 30%;
    padding: 10px;
    border-radius: 20px;
    border: none;
    background: #1439e6;
    color: #fff;

    @media only screen and (max-width: 950px) {
      width: 45%;
    }

    &:hover {
      cursor: pointer;
      box-shadow: 5px 5px 5px #999;
    }

    &.submit {
      background: #ddd;
      color: #000;

      &:hover {
        background: #6faeff;
        color: #fff;
      }
    }

    &.resetAll {
      background: #ff6b6b;
    }

    &.save {
      background: #6ad5b5;
      color: #000;
    }

    &:disabled {
      cursor: no-drop;
      background: #ddd;
      color: #999;
    }
  }
`;
