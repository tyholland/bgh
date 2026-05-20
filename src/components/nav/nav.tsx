"use client";

import * as S from "./nav.style";
import { trackEvent } from "@/functions/mixpanel";

const Nav = () => {
  return (
    <S.Wrapper>
      <img src="/bgh-logo.png" width="200" />
      <S.Section>
        <div>Feedback</div>
        <S.LinksWrapper>
          <div>Sign In / Logged In</div>
        </S.LinksWrapper>
      </S.Section>
    </S.Wrapper>
  );
};

export default Nav;
