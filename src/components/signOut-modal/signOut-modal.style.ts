import styled from "styled-components";

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
