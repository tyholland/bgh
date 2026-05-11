import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 15px;

  @media only screen and (max-width: 800px) {
    flex-direction: column;
  }
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
`;

export const FilterContent = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;

  button {
    with: 100%;
    border: none;
    padding: 5px 10px;
    font-size: 12px;
    border-radius: 10px;

    &.reset {
      color: #000;
      background: transparent;

      &:hover {
        text-decoration: underline;
        cursor: pointer;
      }
    }

    &:hover {
      cursor: pointer;
    }
  }
`;
