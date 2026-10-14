import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: #fff;
  border: 2px solid #020e3f;
  border-radius: 10px;
  padding: 3%;
  margin-bottom: 15px;

  .header {
    font-weight: 700;
    font-size: 18px;
  }

  .sub {
    font-size: 13px;
    color: #555;
  }
`;

export const Section = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 600px) {
    flex-direction: column;
  }
`;

export const Input = styled.input`
  flex: 1;
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 12px 10px;
  min-width: 0;
`;

export const SubmitButton = styled.button`
  border: none;
  padding: 12px 16px;
  font-size: 12px;
  border-radius: 10px;
  background: #1439e6;
  color: #fff;
  width: 160px;
  flex-shrink: 0;

  &:hover {
    cursor: pointer;
  }

  &:disabled {
    color: #999;
    background: #ddd;
    cursor: no-drop;
  }
`;

export const Notice = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
  background: #eef2ff;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;

  &.error {
    background: #fdecea;
    color: #611a15;
  }

  ul {
    margin: 4px 0 0 18px;
    padding: 0;
  }

  button {
    border: none;
    background: transparent;
    font-weight: 700;
    cursor: pointer;
    flex-shrink: 0;
  }
`;
