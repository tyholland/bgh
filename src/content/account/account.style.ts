import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 5%;

  button {
    background: #1439e6;
    color: #fff;
    border: none;
    border-radius: 10px;
    padding: 6px 12px;
    cursor: pointer;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 8px;

    &:disabled {
      cursor: no-drop;
      background: #ddd;
      color: #999;
      box-shadow: none;
    }
  }
`;

export const Input = styled.input`
  background: #fff;
  height: 30px;
  width: 200px;
  border: 1px solid #000;
  padding-left: 5px;
  color: #000;
  border-radius: 10px;

  @media only screen and (max-width: 950px) {
    width: 90%;
  }
`;

export const Pwd = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .success {
    background: #6ad5b5;
    width: fit-content;
    padding: 10px;
    border-radius: 10px;
    font-weight: 700;
    color: #fff;
  }
`;
