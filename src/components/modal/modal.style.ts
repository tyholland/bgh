import styled from "styled-components";

export const CloseButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  border-radius: 50%;
  background: transparent;
  font-size: 20px;
  line-height: 1;
  color: #000;

  &:hover {
    cursor: pointer;
    background: rgba(0, 0, 0, 0.08);
  }
`;
