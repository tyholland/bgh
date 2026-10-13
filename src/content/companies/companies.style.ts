import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 5%;
  width: 100%;

  h1 {
    margin: 0;
  }

  .count {
    color: #666;
  }
`;

export const Input = styled.input`
  background: #fff;
  color: #000;
  border: 1px solid #000;
  border-radius: 10px;
  padding: 10px 12px;
  width: 100%;
  max-width: 400px;
`;

export const List = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 12px;
`;

export const Item = styled.a`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 10px;
  border: 1px solid #ddd;
  border-radius: 10px;
  padding: 12px 16px;
  background: #fff;
  color: inherit;
  text-decoration: none;

  &:hover {
    border-color: #1439e6;
  }

  .name {
    font-weight: 700;
  }

  .count {
    color: #666;
    font-size: 13px;
    flex-shrink: 0;
  }
`;

export const Empty = styled.div`
  color: #666;
`;
