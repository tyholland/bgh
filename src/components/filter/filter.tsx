"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./filter.style";
import { handleSearchParams } from "@/functions/search";
import { jobAtom } from "@/caches/JobsAtom";
import { useAtom, useAtomValue } from "jotai";
import { trackEvent } from "@/functions/mixpanel";
import SignInModal from "../signIn-modal/signIn-modal";
import { userAtom } from "@/caches/UserAtom";

interface FilterProps {
  companies: string[];
  scrapDates: string[];
  industries: string[];
}

const Filter = ({ companies, scrapDates, industries }: FilterProps) => {
  const user = useAtomValue(userAtom);
  const [jobData, setJobData] = useAtom(jobAtom);
  const [keyword, setKeyword] = useState<string>("");
  const [companyReset, setCompanyReset] = useState<boolean>(false);
  const [industryReset, setIndustryReset] = useState<boolean>(false);
  const [keywordBubble, setKeywordBubble] = useState<string>("");
  const [companyArr, setCompanyArr] = useState<string[]>([]);
  const [industryArr, setIndustryArr] = useState<string[]>([]);
  const [openModal, setOpenModal] = useState<boolean>(false);
  const disabledAll =
    keywordBubble.length === 0 && !companyReset && !industryReset;

  const handleFilter = (e: ChangeEvent<HTMLSelectElement>, type: string) => {
    const filterChoice = Array.from(
      e.target.selectedOptions,
      (option) => option.value,
    );

    type === "company" && setCompanyArr(filterChoice);
    type === "industry" && setIndustryArr(filterChoice);
  };

  const handleCompanyApply = () => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const query = window.location.search;
    const params = new URLSearchParams(query);
    setCompanyReset(companyArr.length > 0);

    params.set("company", companyArr.toString());
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "company",
      value: companyArr.join(","),
    });
  };

  const handleIndustryApply = () => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const query = window.location.search;
    const params = new URLSearchParams(query);
    setIndustryReset(industryArr.length > 0);

    params.set("industry", industryArr.toString());
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "industry",
      value: industryArr,
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
      setCompanyReset(false);
      setCompanyArr([]);
      params.set("date", "");
      params.set("industry", "");
      setIndustryReset(false);
      setIndustryArr([]);
      params.set("keyword", "");
      setKeyword("");
      setKeywordBubble("");
    } else {
      params.set(filter, "");

      if (filter === "company") {
        setCompanyReset(false);
        setCompanyArr([]);
      }

      if (filter === "industry") {
        setIndustryReset(false);
        setIndustryArr([]);
      }

      if (filter === "keyword") {
        setKeyword("");
        setKeywordBubble("");
      }
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
    const choosen = e.target.value;
    setKeyword(choosen);

    if (choosen === "") {
      const query = window.location.search;
      const params = new URLSearchParams(query);
      params.set("keyword", "");
      setKeywordBubble("");

      const updatedQuery = `?${params.toString()}`;
      window.history.pushState({}, "", updatedQuery);

      jobData && handleSearchParams(jobData, params, setJobData);
    }
  };

  const handleKeywordSearch = () => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const query = window.location.search;
    const params = new URLSearchParams(query);
    setKeywordBubble(keyword);

    params.set("keyword", keyword);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent("Filter", {
      type: "keyword",
      value: keyword,
    });
  };

  return (
    <>
      <S.Wrapper>
        <div>
          <S.FilterContent>
            <div>Keyword Search</div>
          </S.FilterContent>
          <S.Section>
            <S.Input
              type="text"
              name="keyword"
              placeholder="Enter multiple keywords"
              value={keyword}
              onChange={handleKeyword}
            />
            <button
              onClick={handleKeywordSearch}
              disabled={keyword.length === 0}
            >
              Search
            </button>
          </S.Section>
          <S.Disclaimer>
            Separate keywords with a comma.
            <br />
            Ex: service, care, sales
          </S.Disclaimer>
          {keywordBubble && (
            <S.KeywordBubble>
              {keywordBubble.split(",").map((item: string, index: number) => (
                <div className="bubble" key={index}>
                  {item}
                </div>
              ))}
            </S.KeywordBubble>
          )}
        </div>
        {!!companies && companies.length > 0 && (
          <div>
            <S.FilterContent>
              <div>
                Company <span className="multi">(multi-select)</span>
              </div>
            </S.FilterContent>
            <S.Select
              name="companySelect"
              onChange={(e: any) => handleFilter(e, "company")}
              multiple
              className="multi"
              value={companyArr}
            >
              {companies.map((item: string, index: number) => (
                <option value={item} key={index}>
                  {item}
                </option>
              ))}
            </S.Select>
            <S.FilterContent className="apply">
              <button
                onClick={handleCompanyApply}
                disabled={companyArr.length === 0}
              >
                Apply
              </button>
              {companyReset && (
                <button
                  className="reset"
                  onClick={() => handleReset("company")}
                >
                  reset
                </button>
              )}
            </S.FilterContent>
          </div>
        )}
        {!!industries && industries.length > 0 && (
          <div>
            <S.FilterContent>
              <div>
                Industry <span className="multi">(multi-select)</span>
              </div>
            </S.FilterContent>
            <S.Select
              name="industrySelect"
              onChange={(e: any) => handleFilter(e, "industry")}
              multiple
              className="multi"
              value={industryArr}
            >
              {industries.map((item: string, index: number) => (
                <option value={item} key={index}>
                  {item}
                </option>
              ))}
            </S.Select>
            <S.FilterContent className="apply">
              <button
                onClick={handleIndustryApply}
                disabled={industryArr.length === 0}
              >
                Apply
              </button>
              {industryReset && (
                <button
                  className="reset"
                  onClick={() => handleReset("industry")}
                >
                  reset
                </button>
              )}
            </S.FilterContent>
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
        <button
          className="resetAll"
          onClick={() => handleReset("all")}
          disabled={disabledAll}
        >
          Reset All Filters
        </button>
      </S.Wrapper>

      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Filter;
