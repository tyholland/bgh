import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 2%;

  @media only screen and (max-width: 950px) {
    padding: 2%;
  }
`;

export const CardWrapper = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;

  &.list {
    gap: 0;
  }
`;

export const ResultsWrapper = styled.div`
  display: flex;
  gap: 30px;

  > div:first-child {
    min-width: 300px;
  }

  @media only screen and (max-width: 950px) {
    flex-direction: column;
  }
`;

export const Section = styled.div`
  display: flex;
  align-items: center;
  gap: 15px;

  &.wrapper {
    justify-content: space-between;
    margin-top: 30px;
  }

  .options {
    display: flex;
    gap: 10px;
  }

  .jobs {
    display: flex;
    flex-direction: column;
    gap: 10px;

    @media only screen and (max-width: 950px) {
      width: 35%;
    }
  }

  .btnFilter {
    display: block;
    border: none;
    padding: 6px 12px;
    font-size: 16px;
    border-radius: 10px;
    background: #1439e6;
    color: #fff;
    width: 60%;
    cursor: pointer;
  }
`;

export const ListSection = styled.div`
  display: flex;
  align-items: center;
  border: 1px solid #000;
  border-radius: 10px;
  background: #fff;

  button {
    border: none;
    border-radius: 10px;
    background: #fff;
    cursor: pointer;
    height: 30px;

    &:disabled {
      img {
        cursor: no-drop;
      }
    }

    img {
      border-radius: 10px;
    }
  }
`;

export const JobResultsWrapper = styled.div`
  width: 100%;
`;

export const Select = styled.select`
  border: 1px solid #000;
  border-radius: 10px;
  background: #fff;
  color: #000;
  padding: 5px 10px;
  width: 60%;
`;

export const Banner = styled.div`
  background: #e7ecfb;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  border-radius: 10px;

  @media only screen and (max-width: 950px) {
    flex-direction: column;
    gap: 20px;
    align-items: flex-start;
    justify-content: center;
    width: auto;
  }
`;

export const BannerSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  font-size: 14px;

  @media only screen and (max-width: 950px) {
    width: 300px;
    margin: 0 auto;
  }

  .content {
    display: flex;
    flex-direction: column;
    gap: 5px;

    .title {
      font-weight: bold;
      font-size: 18px;
      color: #1439e6;
    }
  }

  img {
    border-radius: 40px;
  }
`;
