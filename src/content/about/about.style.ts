import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 5%;

  button {
    background: #000;
    color: yellow;
    border: none;
    border-radius: 10px;
    padding: 6px 12px;
    cursor: pointer;
    width: fit-content;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  ul {
    margin: 10px 14px;

    li {
      margin-left: 20px;
    }
  }

  a {
    text-decoration: underline;
  }
`;
