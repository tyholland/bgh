"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import * as S from "./companies.style";
import { Facet } from "@/types";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { trackPage } from "@/functions/mixpanel";

interface CompaniesProps {
  companies: Facet[];
}

const Companies = ({ companies }: CompaniesProps) => {
  const user = useAtomValue(userAtom);
  const [query, setQuery] = useState<string>("");

  useEffect(() => {
    trackPage(user, "Companies", window.location.href);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(
    () =>
      companies.filter((item) =>
        item.value.toLowerCase().includes(query.toLowerCase()),
      ),
    [companies, query],
  );

  return (
    <S.Wrapper>
      <h1>Companies</h1>
      <div className="count">
        <strong>{companies.length}</strong> companies with open roles
      </div>
      <S.Input
        type="text"
        placeholder="Search companies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      {filtered.length === 0 ? (
        <S.Empty>No companies match &quot;{query}&quot;.</S.Empty>
      ) : (
        <S.List>
          {filtered.map((company) => (
            <S.Item
              as={Link}
              key={company.value}
              href={`/companies/${encodeURIComponent(company.value)}`}
            >
              <div className="name">{company.value}</div>
              <div className="count">{company.count}</div>
            </S.Item>
          ))}
        </S.List>
      )}
    </S.Wrapper>
  );
};

export default Companies;
