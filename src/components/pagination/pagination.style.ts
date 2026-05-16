import styled from "styled-components";

export const Wrapper = styled.div`
  padding: 10px 0;
  margin: 30px 0;

  ul {
    display: flex;
    gap: 30px;
    align-items: center;
    list-style: none;
    justify-content: center;

    @media only screen and (max-width: 950px) {
      gap: 15px;
    }

    li {
      color: #1439e6;
      padding: 3px 0;
      border-radius: 5px;

      &.selected {
        background: #1439e6;
        color: #fff;

        a:hover {
          background: transparent;
        }
      }
    }

    a {
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 5px;

      &:hover {
        background: #ededed;
      }
    }
  }
`;

export const BtnWrapper = styled.div`
  display: flex;
  gap: 10px;
`;
