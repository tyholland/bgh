"use client";

import { useEffect } from "react";
import * as S from "./disclaimer.style";
import { trackPage } from "@/functions/mixpanel";

const Disclaimer = () => {
  useEffect(() => {
    trackPage(null, "Disclaimer", window.location.href);
  }, []);

  return (
    <S.Wrapper>
      <h1>BGH Scout Disclaimer</h1>
      <div>
        BGH Scout is designed to help job seekers discover career opportunities
        more quickly by aggregating job openings from employer career pages and
        other publicly available sources.
      </div>
      <div>
        While we work hard to provide timely and relevant job opportunities, BGH
        Scout does not guarantee interviews, job offers, employment, or any
        specific career outcome. Hiring decisions are made solely by employers
        and are influenced by many factors beyond our control.
      </div>
      <div>
        BGH Scout also does not guarantee that every available job opening will
        be displayed on the platform. Our current search and aggregation
        capabilities are continually expanding, and job coverage may vary by
        employer, industry, location, and technical limitations. Some
        opportunities may not be captured, may appear after they are posted, or
        may be removed by employers without notice.
      </div>
      <div>
        At this time, many of our search processes are optimized to identify
        opportunities located in Massachusetts and remote positions, though
        opportunities from other locations may also appear. Coverage will
        continue to expand as the platform grows.
      </div>
      <div>
        Our goal is to provide earlier visibility into job opportunities that
        users may not otherwise discover, helping them identify and pursue
        opportunities more efficiently. Individual results will vary.
      </div>
      <div>
        By using BGH Scout, you acknowledge that BGH Scout is an informational
        resource and not an employment agency, recruiting firm, or guarantor of
        employment.
      </div>
    </S.Wrapper>
  );
};

export default Disclaimer;
