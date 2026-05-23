"use client";

import Link from "next/link";
import * as S from "./nav.style";
import { trackEvent } from "@/functions/mixpanel";

const Nav = () => {
  return (
    <S.Wrapper>
      <Link href="/">
        <img src="/bgh-logo.png" width="200" />
      </Link>
      <S.Section>
        <button>Feedback</button>
        <S.LinksWrapper>
          <div>Sign In / Logged In</div>
        </S.LinksWrapper>
      </S.Section>
    </S.Wrapper>
  );
};

export default Nav;
