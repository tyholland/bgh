"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./filter.style";
import { useRouter } from "next/navigation";

interface FilterProps {
  companies: string[];
  scrapDates: string[];
}

const Filter = ({ companies, scrapDates }: FilterProps) => {
  const router = useRouter();
  const [keyword, setKeyword] = useState<string>("");

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

  const handleKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeywordSearch = () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("keyword", keyword);
    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  return (
    <S.Wrapper>
      <div>
        <S.FilterContent>
          <div>Keyword Search</div>
          <button className="reset" onClick={() => handleReset("company")}>
            reset
          </button>
        </S.FilterContent>
        <S.Section>
          <S.Input
            type="text"
            name="keyword"
            placeholder="Enter keywords"
            onChange={handleKeyword}
          />
          <button onClick={handleKeywordSearch}>Search</button>
        </S.Section>
      </div>
      {!!companies && companies.length > 0 && (
        <div>
          <S.FilterContent>
            <div>Company</div>
            <button className="reset" onClick={() => handleReset("company")}>
              reset
            </button>
          </S.FilterContent>
          <S.Select name="companySelect" onChange={handleCompanyFilter}>
            <option value="">Select Company</option>
            {companies.map((item: string, index: number) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </S.Select>
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
          <S.Select name="dateSelect" onChange={handleDateFilter}>
            <option value="">Select Posted Date</option>
            {scrapDates.map((item: string, index: number) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </S.Select>
        </div>
      )}
      <div>
        <S.FilterContent>
          <div>Industry</div>
          {/* <button className="reset" onClick={() => handleReset("date")}>
            reset
          </button> */}
        </S.FilterContent>
        TBD
      </div>
      <button className="resetAll" onClick={() => handleReset("all")}>
        Reset All Filters
      </button>
    </S.Wrapper>
  );
};

export default Filter;
