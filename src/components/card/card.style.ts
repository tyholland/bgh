import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  padding: 2%;
  flex-direction: column;
  border: 1px solid #000;
  width: 23%;
  border-radius: 10px;
  box-shadow: 5px 5px 5px #ddd;
  overflow-wrap: break-word;

  @media only screen and (max-width: 800px) {
    width: 100%;
  }
`;
