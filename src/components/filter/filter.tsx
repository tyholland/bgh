"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./filter.style";
import { handleSearchParams } from "@/functions/search";
import { jobAtom } from "@/caches/JobsAtom";
import { useAtom } from "jotai";
import { trackEvent } from "@/functions/mixpanel";

interface FilterProps {
  companies: string[];
  scrapDates: string[];
  industries: string[];
}

const Filter = ({ companies, scrapDates, industries }: FilterProps) => {
  const [jobData, setJobData] = useAtom(jobAtom);
  const [keyword, setKeyword] = useState<string>("");

  const handleCompanyFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    const filterChoice = e.target.value;
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("company", filterChoice);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "company",
      value: filterChoice,
    });
  };

  const handleIndustryFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    const filterChoice = e.target.value;
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("industry", filterChoice);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "industry",
      value: filterChoice,
    });
  };

  const handleDateFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    const filterChoice = e.target.value;
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("date", filterChoice);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "date",
      value: filterChoice,
    });
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

    if (filter === "keyword") {
      setKeyword("");
    }

    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "reset",
      value: filter === "all" ? "all filters" : filter,
    });
  };

  const handleKeyword = (e: ChangeEvent<HTMLInputElement>) => {
    setKeyword(e.target.value);
  };

  const handleKeywordSearch = () => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("keyword", keyword);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "keyword",
      value: keyword,
    });
  };

  const handleSelectedOption = (val: string) => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    return params.get(val);
  };

  return (
    <S.Wrapper>
      <div>
        <S.FilterContent>
          <div>Keyword Search</div>
          <button className="reset" onClick={() => handleReset("keyword")}>
            reset
          </button>
        </S.FilterContent>
        <S.Section>
          <S.Input
            type="text"
            name="keyword"
            placeholder="Enter multiple keywords"
            value={keyword}
            onChange={handleKeyword}
          />
          <button onClick={handleKeywordSearch}>Search</button>
        </S.Section>
        <S.Disclaimer>
          Separate keywords with a comma.
          <br />
          Ex: service, care, sales
        </S.Disclaimer>
      </div>
      {!!companies && companies.length > 0 && (
        <div>
          <S.FilterContent>
            <div>Company</div>
            <button className="reset" onClick={() => handleReset("company")}>
              reset
            </button>
          </S.FilterContent>
          <S.Select
            name="companySelect"
            onChange={handleCompanyFilter}
            value={
              companies.filter(
                (item: string) => item === handleSelectedOption("company"),
              )[0] || ""
            }
          >
            <option value="">Select Company</option>
            {companies.map((item: string, index: number) => (
              <option value={item} key={index}>
                {item}
              </option>
            ))}
          </S.Select>
        </div>
      )}
      {!!industries && industries.length > 0 && (
        <div>
          <S.FilterContent>
            <div>Industry</div>
            <button className="reset" onClick={() => handleReset("industry")}>
              reset
            </button>
          </S.FilterContent>
          <S.Select
            name="industrySelect"
            onChange={handleIndustryFilter}
            value={
              industries.filter(
                (item: string) => item === handleSelectedOption("industry"),
              )[0] || ""
            }
          >
            <option value="">Select Industry</option>
            {industries.map((item: string, index: number) => (
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
      <button className="resetAll" onClick={() => handleReset("all")}>
        Reset All Filters
      </button>
    </S.Wrapper>
  );
};

export default Filter;
