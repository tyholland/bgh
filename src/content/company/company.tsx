"use client";

import { useEffect } from "react";
import Link from "next/link";
import * as S from "./company.style";
import Card from "@/components/card/card";
import Pagination from "@/components/pagination/pagination";
import { AllSearchData } from "@/types";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { trackPage } from "@/functions/mixpanel";

interface CompanyProps {
  company: string;
  // URL-encoded company name, reused as-is for the pagination basePath and
  // the "back to companies" link so it never needs re-encoding here.
  companyPath: string;
  data: AllSearchData;
}

const Company = ({ company, companyPath, data }: CompanyProps) => {
  const user = useAtomValue(userAtom);

  useEffect(() => {
    trackPage(user, "Company Page", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <S.Wrapper>
      <S.Heading>
        <Link href="/companies">&larr; All companies</Link>
        <h1>{company}</h1>
        <div className="count">
          <strong>{data.total}</strong> open{" "}
          {data.total === 1 ? "role" : "roles"}
        </div>
        <Link href={`/?company=${encodeURIComponent(company)}`}>
          Search &amp; filter {company}&apos;s roles &rarr;
        </Link>
      </S.Heading>
      {data.data.length === 0 ? (
        <S.Empty>{company} has no open roles right now.</S.Empty>
      ) : (
        <>
          <Pagination
            totalPages={data.totalPages}
            page={data.page}
            basePath={`/companies/${companyPath}`}
          />
          <S.CardWrapper>
            <Card jobs={data.data} />
          </S.CardWrapper>
          <Pagination
            totalPages={data.totalPages}
            page={data.page}
            basePath={`/companies/${companyPath}`}
          />
        </>
      )}
    </S.Wrapper>
  );
};

export default Company;
