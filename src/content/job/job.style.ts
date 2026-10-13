import styled from "styled-components";

export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 5%;
  width: 100%;

  .title {
    font-weight: 700;
  }

  .blur {
    filter: blur(3px);
  }
`;

export const Back = styled.div`
  a {
    color: #1439e6;
  }
`;

export const Heading = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  h1 {
    margin: 0;
  }

  .company {
    font-size: 16px;
    font-weight: 700;
  }

  .viewCount {
    font-size: 13px;
    color: #666;
  }
`;

export const ApplyBtn = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;

  a {
    display: inline-block;
    width: fit-content;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    background: #1439e6;
    color: #fff;

    &:hover {
      cursor: pointer;
      color: #fff;
    }
  }

  .saveJob {
    width: fit-content;
    padding: 10px 20px;
    border-radius: 20px;
    border: 1px solid #1439e6;
    background: #fff;
    color: #1439e6;

    &:hover {
      cursor: pointer;
      background: #eef1fd;
    }

    &:disabled {
      cursor: default;
      opacity: 0.6;
    }
  }
`;

export const ShareBtns = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  .label {
    font-size: 12px;
    color: #666;
  }

  button {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid #d9d9d9;
    background: #fff;
    color: #444;

    &:hover {
      cursor: pointer;
      background: #f2f2f2;
    }
  }

  .copied {
    font-size: 12px;
    color: #1439e6;
  }
`;

export const SimilarJobs = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;

  .title {
    font-weight: 700;
  }

  .list {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .item {
    display: flex;
    flex-direction: column;
    gap: 4px;
    border: 1px solid #ddd;
    border-radius: 10px;
    padding: 12px 16px;
    background: #fff;
    color: inherit;
    text-decoration: none;

    &:hover {
      border-color: #1439e6;
    }

    .role {
      font-weight: 700;
    }

    .meta {
      font-size: 13px;
      color: #666;
    }
  }
`;

export const AdditionalBtn = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  button {
    width: fit-content;
    padding: 10px 20px;
    border-radius: 20px;
    border: none;
    background: #6ad5b5;
    color: #fff;

    @media only screen and (max-width: 950px) {
      width: 90%;
    }

    &:hover {
      cursor: pointer;
    }
  }
`;
