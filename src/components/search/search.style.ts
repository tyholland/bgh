import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  gap: 15px;
  justify-content: center;
  background: #0b1144;
  color: #fff;
  flex-direction: column;
  padding: 3%;
  border-radius: 10px;

  .header {
    font-weight: 700;
    font-size: 30px;
  }

  button {
    border: none;
    padding: 12px 16px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;
    color: #fff;
    width: 140px;

    &.reset {
      text-decoration: underline;
      background: transparent;
      color: #000;
      padding: 0;
    }

    &:hover {
      cursor: pointer;
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
  width: 100%;
`;

export const Section = styled.div`
  background: #fff;
  display: flex;
  gap: 8px;
  padding: 1%;
  border-radius: 10px;
  justify-content: space-between;
`;
