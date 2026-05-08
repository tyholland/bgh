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

  const handleReset = () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("company", "");
    params.set("date", "");
    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  return (
    <S.Wrapper>
      {!!companies && companies.length > 0 && (
        <select onChange={handleCompanyFilter}>
          <option value="">Filter by Company</option>
          {companies.map((item: any, index: number) => (
            <option value={item} key={index}>
              {item}
            </option>
          ))}
        </select>
      )}
      {!!scrapDates && scrapDates.length > 0 && (
        <select onChange={handleDateFilter}>
          <option value="">Filter by Date</option>
          {scrapDates.map((item: any, index: number) => (
            <option value={item} key={index}>
              {item}
            </option>
          ))}
        </select>
      )}
      <button onClick={handleReset}>Reset Filters</button>
    </S.Wrapper>
  );
};

export default Filter;
