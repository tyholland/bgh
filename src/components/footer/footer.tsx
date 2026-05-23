"use client";

import * as S from "./footer.style";
import dayjs from "dayjs";

const Footer = () => {
  const year = dayjs().format("YYYY");

  return (
    <S.Wrapper>
      <div>&copy; {year} BGH Scout.</div>
      <div>
        Site by{" "}
        <a href="https://heiprodigital.com" target="_blank">
          HeiPro Digital
        </a>
      </div>
    </S.Wrapper>
  );
};

export default Footer;
