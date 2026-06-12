import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 5%;
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

export const BtnWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const Button = styled.button`
  width: fit-content;
  padding: 10px 15px;
  border-radius: 20px;
  border: none;
  background: #1439e6;
  color: #fff;

  @media only screen and (max-width: 950px) {
    width: 90%;
  }

  &:hover {
    cursor: pointer;
    color: #fff;
  }

  &:disabled {
    background: #ddd;
    color: #000;
    cursor: no-drop;
  }
`;
