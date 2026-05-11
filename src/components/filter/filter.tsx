"use client";

import { ChangeEvent } from "react";
import * as S from "./filter.style";
import { useRouter } from "next/navigation";

interface FilterProps {
  companies: any;
  scrapDates: any;
}

const Filter = ({ companies, scrapDates }: FilterProps) => {
  const router = useRouter();

  const handleCompanyFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    const filterChoice = e.target.value;
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("company", filterChoice);
    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  const handleDateFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    const filterChoice = e.target.value;
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("date", filterChoice);
    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  const handleReset = (filter: string) => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    if (filter === "all") {
      params.set("company", "");
      params.set("date", "");
      params.set("industry", "");
      params.set("keyword", "");
    } else {
      params.set(filter, "");
    }

    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  return (
    <S.Wrapper>
      <S.FilterContent>
        <S.Input type="text" name="keyword" placeholder="Enter keywords" />
        <button onClick={() => handleReset("company")}>Search</button>
        <button className="reset" onClick={() => handleReset("company")}>
          reset
        </button>
      </S.FilterContent>
      {!!companies && companies.length > 0 && (
        <div>
          <S.FilterContent>
            <div>Company</div>
            <button className="reset" onClick={() => handleReset("company")}>
              reset
            </button>
          </S.FilterContent>
          <select onChange={handleCompanyFilter}>
            <option value="">Select Company</option>
            {companies.map((item: any, index: number) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}
      {!!scrapDates && scrapDates.length > 0 && (
        <div>
          <S.FilterContent>
            <div>Posted Date</div>
            <button className="reset" onClick={() => handleReset("date")}>
              reset
            </button>
          </S.FilterContent>
          <select onChange={handleDateFilter}>
            <option value="">Select Posted Date</option>
            {scrapDates.map((item: any, index: number) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </select>
        </div>
      )}
      <button onClick={() => handleReset("all")}>Reset All Filters</button>
    </S.Wrapper>
  );
};

export default Filter;
