import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;

  .empty {
    color: #666;
  }

  .error {
    color: #c0392b;
  }
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 15px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px 16px;
  background: #fff;

  @media only screen and (max-width: 950px) {
    flex-direction: column;
    align-items: flex-start;
  }

  .details {
    display: flex;
    flex-direction: column;
    gap: 4px;

    .name {
      font-weight: 700;
    }

    .summary {
      color: #555;
      font-size: 13px;
    }

    .date {
      color: #999;
      font-size: 12px;
    }
  }

  .actions {
    display: flex;
    gap: 8px;
    flex-shrink: 0;

    a,
    button {
      border: none;
      padding: 6px 12px;
      font-size: 12px;
      border-radius: 10px;
      background: #1439e6;
      color: #fff;
      text-decoration: none;
      cursor: pointer;

      &.delete {
        background: transparent;
        color: #c0392b;
        text-decoration: underline;
        padding: 6px 0;
      }

      &:disabled {
        color: #999;
        background: #ddd;
        cursor: no-drop;
      }
    }
  }
`;
