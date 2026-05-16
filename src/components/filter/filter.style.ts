import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 15px;
  box-shadow: 5px 5px 5px #ddd;
  height: 100%;

  @media only screen and (max-width: 950px) {
    flex-direction: column;
  }

  .resetAll {
    width: 50%;
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #ff6b6b;
    cursor: pointer;
  }
`;

export const Select = styled.select`
  border: 1px solid #000;
  border-radius: 10px;
  background: #fff;
  color: #000;
  padding: 5px 10px;
  width: 100%;
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 5px 10px;
`;

export const FilterContent = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  margin-bottom: 5px;

  button {
    with: 100%;
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;

    &.reset {
      color: #fff;
      background: #ff6b6b;

      &:hover {
        cursor: pointer;
      }
    }

    &:hover {
      cursor: pointer;
    }
  }
`;

export const Section = styled.div`
  display: flex;
  gap: 8px;

  button {
    with: 100%;
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;

    &:hover {
      cursor: pointer;
    }
  }
`;
