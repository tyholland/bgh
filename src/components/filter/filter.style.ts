import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  gap: 10px;

  @media only screen and (max-width: 800px) {
    flex-direction: column;
  }
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
`;
