import styled from "styled-components";

export const ModalWrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const ModalBtn = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;

  button {
    min-width: fit-content;
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

export const Input = styled.input`
  background: #fff;
  height: 30px;
  width: 100%;
  border: 1px solid #000;
  padding-left: 5px;
  color: #000;
  border-radius: 10px;

  @media only screen and (max-width: 950px) {
    width: 90%;
  }
`;
