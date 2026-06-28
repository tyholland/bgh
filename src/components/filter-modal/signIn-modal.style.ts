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
  margin-top: 20px;

  button {
    width: 100px;
    padding: 10px;
    border-radius: 20px;
    border: none;
    background: #1439e6;

    @media only screen and (max-width: 950px) {
      width: 90%;
    }

    &:hover {
      cursor: pointer;
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
