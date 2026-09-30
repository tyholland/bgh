import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  label {
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
  }

  input[type="checkbox"] {
    width: 16px;
    height: 16px;
    cursor: pointer;

    &:disabled {
      cursor: no-drop;
    }
  }

  .error {
    color: #c0392b;
  }
`;
