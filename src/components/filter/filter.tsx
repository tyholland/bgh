"use client";

import { ChangeEvent, useState } from "react";
import * as S from "./filter.style";
import { getItemTotalCount, handleSearchParams } from "@/functions/search";
import { jobAtom } from "@/caches/JobsAtom";
import { useAtom, useAtomValue } from "jotai";
import { trackEvent } from "@/functions/mixpanel";
import SignInModal from "../signIn-modal/signIn-modal";
import { userAtom } from "@/caches/UserAtom";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

interface FilterProps {
  companies: string[];
  scrapDates: string[];
  industries: string[];
}

const Filter = ({ companies, industries, scrapDates }: FilterProps) => {
  dayjs.extend(customParseFormat);
  const query = window.location.search;
  const defaultParams = new URLSearchParams(query);
  const defaultCompany = defaultParams?.get("company");
  const defaultIndustry = defaultParams?.get("indursty");
  const defaultKeyword = defaultParams?.get("keyword");
  const defaultDate = defaultParams?.get("date");
  const defaultExactDate = defaultParams?.get("exact");
  const user = useAtomValue(userAtom);
  const [jobData, setJobData] = useAtom(jobAtom);
  const [companyList, setCompanyList] = useState<string[]>(companies);
  const [industryList, setIndustryList] = useState<string[]>(industries);
  const [showExactDate, setShowExactDate] = useState<boolean>(
    (defaultExactDate && defaultExactDate.length > 0) || false,
  );
  const [keyword, setKeyword] = useState<string>(defaultKeyword || "");
  const [keywordBubble, setKeywordBubble] = useState<string[]>(
    defaultKeyword && defaultKeyword.length > 0
      ? defaultKeyword.split(",")
      : [],
  );
  const [companyArr, setCompanyArr] = useState<string[]>(
    defaultCompany && defaultCompany.length > 0
      ? defaultCompany.split(",")
      : [],
  );
  const [industryArr, setIndustryArr] = useState<string[]>(
    defaultIndustry && defaultIndustry.length > 0
      ? defaultIndustry.split(",")
      : [],
  );
  const [postedDate, setPostedDate] = useState<string>(
    defaultDate && defaultDate.length > 0 ? defaultDate : "",
  );
  const [exactDate, setExactDate] = useState<string>(
    defaultExactDate && defaultExactDate.length > 0 ? defaultExactDate : "",
  );
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [companyReset, setCompanyReset] = useState<boolean>(
    companyArr.length > 0 || false,
  );
  const [industryReset, setIndustryReset] = useState<boolean>(
    industryArr.length > 0 || false,
  );
  const disabledAll =
    keywordBubble.length === 0 &&
    !companyReset &&
    !industryReset &&
    postedDate.length === 0 &&
    exactDate.length === 0;

  const handleFilter = (e: ChangeEvent<HTMLInputElement>, type: string) => {
    if (e.target.checked) {
      type === "company"
        ? setCompanyArr((prev) => [...prev, e.target.value])
        : setIndustryArr((prev) => [...prev, e.target.value]);
    } else {
      type === "company"
        ? setCompanyArr((prev) =>
            prev.filter((fruit) => fruit !== e.target.value),
          )
        : setIndustryArr((prev) =>
            prev.filter((fruit) => fruit !== e.target.value),
          );
    }
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
    params.set("page", "1");
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Filter", {
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
    params.set("page", "1");
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Filter", {
      type: "industry",
      value: industryArr,
    });
  };

  const handleDateFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const filterChoice = e.target.value;

    if (filterChoice === "open") {
      setShowExactDate(true);
      return;
    }

    const searchDate = dayjs().subtract(Number(filterChoice), "day");
    setPostedDate(searchDate.format("YYYYMMDD"));
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("date", searchDate.format("MM-DD-YYYY"));
    params.set("exact", "");
    params.set("page", "1");
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Filter", {
      type: "date",
      value: searchDate.format("MM-DD-YYYY"),
      amountOfDays: filterChoice,
    });
  };

  const handleExactDateFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const filterChoice = e.target.value;
    setExactDate(filterChoice);
    setPostedDate("");
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("exact", filterChoice);
    params.set("date", "");
    params.set("page", "1");
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Filter", {
      type: "exact date",
      value: filterChoice,
    });
  };

  const handleReset = (filter: string) => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    if (filter === "all") {
      // Company
      params.set("company", "");
      setCompanyReset(false);
      setCompanyArr([]);

      // Dates
      params.set("date", "");
      setPostedDate("");
      params.set("exact", "");
      setExactDate("");
      setShowExactDate(false);

      // Industry
      params.set("industry", "");
      setIndustryReset(false);
      setIndustryArr([]);

      // Keyword
      params.set("keyword", "");
      setKeyword("");
      setKeywordBubble([]);

      // Pagination
      params.set("page", "");
    } else {
      params.set(filter, "");
      params.set("page", "");

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
        setKeywordBubble([]);
      }

      if (filter === "date") {
        params.set("exact", "");
        setPostedDate("");
        setExactDate("");
        setShowExactDate(false);
      }
    }

    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Filter", {
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
      setKeywordBubble([]);

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
    keywordBubble.push(keyword);
    setKeywordBubble(keywordBubble);

    params.set("keyword", keywordBubble.join(","));
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Filter", {
      type: "keyword",
      value: keyword,
    });
  };

  const handleRemoveKeyword = (item: string) => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const query = window.location.search;
    const params = new URLSearchParams(query);
    const updated = keywordBubble.filter((key) => key !== item);
    setKeywordBubble(updated);

    params.set("keyword", updated.join(","));
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Filter", {
      type: "remove keyword",
      value: item,
      keywords: updated.join(","),
    });
  };

  const handleSearchFields = (
    e: ChangeEvent<HTMLInputElement>,
    val: string,
  ) => {
    const item = e.target.value;

    val === "company"
      ? setCompanyList(
          companies.filter((company: string) =>
            company.toLowerCase().includes(item),
          ),
        )
      : setIndustryList(
          industries.filter((industry: string) =>
            industry.toLowerCase().includes(item),
          ),
        );
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
              placeholder="Enter multiple keywords..."
              onChange={handleKeyword}
            />
            <button
              onClick={handleKeywordSearch}
              disabled={keyword.length === 0}
              className="search"
            >
              Search
            </button>
          </S.Section>
          {keywordBubble.length > 0 && (
            <S.KeywordBubble>
              {keywordBubble.map((item: string, index: number) => (
                <button
                  className="bubble"
                  onClick={() => handleRemoveKeyword(item)}
                  key={index}
                >
                  {item} <span>x</span>
                </button>
              ))}
            </S.KeywordBubble>
          )}
        </div>
        <div>
          <S.FilterContent className="posted">
            <div>Posted Date</div>
            {(postedDate || exactDate) && (
              <button className="reset" onClick={() => handleReset("date")}>
                reset
              </button>
            )}
          </S.FilterContent>
          {!showExactDate && (
            <S.Select
              name="dateSelect"
              onChange={handleDateFilter}
              value={postedDate ? dayjs().diff(postedDate, "day") : ""}
            >
              <option value="">Select Posted Date</option>
              <option value="1">24 Hours</option>
              <option value="3">3 Days</option>
              <option value="7">1 Week</option>
              <option value="30">1 Month</option>
              <option value="open">Specific Date</option>
            </S.Select>
          )}
          {showExactDate && (
            <S.Select
              name="dateSelect"
              onChange={handleExactDateFilter}
              value={dayjs(exactDate).format("MM-DD-YYYY") || ""}
            >
              <option value="">Select Specific Date</option>
              {scrapDates.map((item: string, index: number) => (
                <option value={dayjs(item).format("MM-DD-YYYY")} key={index}>
                  {dayjs(item).format("MM-DD-YYYY")}
                </option>
              ))}
            </S.Select>
          )}
        </div>
        {!!companies && companies.length > 0 && (
          <div>
            <S.FilterContent>
              <div>Company</div>
              <S.Input
                type="text"
                placeholder="Search company..."
                name="companySearch"
                onChange={(e) => handleSearchFields(e, "company")}
              />
            </S.FilterContent>
            <S.CheckboxWrapper>
              {companyList.map((item: string, index: number) => (
                <S.CheckedSection key={index}>
                  <div>
                    <input
                      type="checkbox"
                      name="companyCheckbox"
                      checked={companyArr.some((company) => company === item)}
                      onChange={(e: any) => handleFilter(e, "company")}
                      value={item}
                    />
                    {item}
                  </div>
                  <div>
                    ({getItemTotalCount(item, "company", jobData?.allData)})
                  </div>
                </S.CheckedSection>
              ))}
            </S.CheckboxWrapper>
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
              <div>Industry</div>
              <S.Input
                type="text"
                placeholder="Search industry..."
                name="industrySearch"
                onChange={(e) => handleSearchFields(e, "industry")}
              />
            </S.FilterContent>
            <S.CheckboxWrapper>
              {industryList.map((item: string, index: number) => (
                <S.CheckedSection key={index}>
                  <div>
                    <input
                      type="checkbox"
                      name="industryCheckbox"
                      checked={industryArr.some(
                        (industry) => industry === item,
                      )}
                      onChange={(e: any) => handleFilter(e, "industry")}
                      value={item}
                    />
                    {item}
                  </div>
                  <div>
                    ({getItemTotalCount(item, "industry", jobData?.allData)})
                  </div>
                </S.CheckedSection>
              ))}
            </S.CheckboxWrapper>
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
