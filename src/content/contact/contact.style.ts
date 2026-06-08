import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 5%;
`;

export const Input = styled.input`
  background: #fff;
  height: 30px;
  width: 200px;
  border: none;
  padding-left: 5px;
  color: #000;
`;

export const Textarea = styled.textarea`
  background: #fff;
  height: 100px;
  width: 500px;
  border: none;
  padding: 10px;
  color: #000;
  resize: none;
`;

export const Button = styled.button`
  width: fit-content;
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
`;
