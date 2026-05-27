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
  background: #fff;

  @media only screen and (max-width: 950px) {
    flex-direction: column;
  }

  .resetAll {
    width: 50%;
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #ddd;
    color: #999;
    cursor: pointer;

    &:hover {
      color: #000;
    }
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
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;

    &.reset {
      background: #ddd;
      color: #999;

      &:hover {
        cursor: pointer;
        color: #000;
      }
    }

    &:hover {
      cursor: pointer;
    }
  }
`;

export const KeywordBubble = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  margin-top: 5px;

  .bubble {
    background: #6faeff;
    border-radius: 10px;
    padding: 2px 6px;
    color: #fff;
    width: fit-content;
  }
`;

export const Section = styled.div`
  display: flex;
  gap: 8px;

  button {
    width: 100%;
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;

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

export const Disclaimer = styled.div`
  font-size: 12px;
  margin-top: 8px;
  color: #999;
`;
