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
    background: #ff6b6b;
    color: #fff;
    cursor: pointer;

    &:hover {
      box-shadow: 5px 5px 5px #ddd;
    }

    &:disabled {
      cursor: no-drop;
      background: #ddd;
      color: #999;
      box-shadow: none;
    }
  }

  .react-datepicker-wrapper {
    input {
      background: #fff;
      color: #000;
      border: 1px solid #000;
      border-radius: 10px;
      padding: 5px 10px;
      margin-top: 10px;
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

  &.multi {
    height: 120px;
  }
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 5px 10px;
  width: 100%;
`;

export const FilterContent = styled.div`
  display: flex;
  gap: 8px;
  align-items: flex-start;
  margin-bottom: 5px;
  flex-direction: column;

  &.posted {
    flex-direction: row;
    align-items: center;
  }

  &.apply {
    margin-top: 5px;
  }

  button {
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;
    background: #1439e6;
    color: #fff;

    &.reset {
      text-decoration: underline;
      background: transparent;
      color: #000;
      padding: 0;

      &:hover {
        cursor: pointer;
      }
    }

    &:hover {
      cursor: pointer;
    }

    &:disabled {
      cursor: no-drop;
      background: #ddd;
      color: #999;
    }
  }

  .multi {
    color: #999;
    font-size: 12px;
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

    &.search {
      width: 100px;
    }
  }
`;

export const Disclaimer = styled.div`
  font-size: 12px;
  margin-top: 8px;
  color: #999;
`;

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

  &.referral button {
    height: auto;
    flex-direction: column;
    font-size: 24px;
  }
`;

export const CheckedSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2px 0;

  input[type="checkbox"] {
    margin-right: 5px;
    appearance: none;
    width: 13px;
    height: 13px;
    border: 1px solid #000;
    border-radius: 3px;

    &:checked {
      accent-color: #6faeff;
      appearance: auto;
    }
  }
`;

export const CheckboxWrapper = styled.div`
  height: 200px;
  overflow-y: scroll;
  box-shadow: 0px 2px 15px #ddd;
  padding: 5px;
`;
