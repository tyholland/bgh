"use client";

import { ChangeEvent, useMemo, useState } from "react";
import * as S from "./filter.style";
import { useRouter, useSearchParams } from "next/navigation";
import { trackEvent } from "@/functions/mixpanel";
import SignInModal from "../signIn-modal/signIn-modal";
import { useAtomValue } from "jotai";
import { userAtom } from "@/caches/UserAtom";
import { Facet } from "@/types";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

interface FilterProps {
  companies: Facet[];
  industries: Facet[];
  scrapDates: string[];
}

const splitParam = (value: string | null) =>
  value ? value.split(",").filter(Boolean) : [];

const Filter = ({ companies, industries, scrapDates }: FilterProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAtomValue(userAtom);

  const selectedCompanies = splitParam(searchParams.get("company"));
  const selectedIndustries = splitParam(searchParams.get("industry"));
  const postedDate = searchParams.get("date") || "";
  const exactDate = searchParams.get("exact") || "";

  const [openModal, setOpenModal] = useState<boolean>(false);
  const [companyQuery, setCompanyQuery] = useState<string>("");
  const [industryQuery, setIndustryQuery] = useState<string>("");
  const [companyArr, setCompanyArr] = useState<string[]>(selectedCompanies);
  const [industryArr, setIndustryArr] = useState<string[]>(selectedIndustries);
  const [showExactDate, setShowExactDate] = useState<boolean>(
    exactDate.length > 0,
  );

  // Re-seed the checkbox drafts from the URL whenever the committed selection
  // changes underneath us (Apply, reset elsewhere, browser back) — the React
  // "adjust state during render" pattern, no effect needed.
  const committedKey = `${searchParams.get("company") ?? ""}|${
    searchParams.get("industry") ?? ""
  }|${exactDate}`;
  const [syncedKey, setSyncedKey] = useState<string>(committedKey);

  if (syncedKey !== committedKey) {
    setSyncedKey(committedKey);
    setCompanyArr(selectedCompanies);
    setIndustryArr(selectedIndustries);
    setShowExactDate(exactDate.length > 0);
  }

  const companyList = useMemo(
    () =>
      companies.filter((item) =>
        item.value.toLowerCase().includes(companyQuery.toLowerCase()),
      ),
    [companies, companyQuery],
  );

  const industryList = useMemo(
    () =>
      industries.filter((item) =>
        item.value.toLowerCase().includes(industryQuery.toLowerCase()),
      ),
    [industries, industryQuery],
  );

  const requireUser = () => {
    if (user) return true;
    setOpenModal(true);
    return false;
  };

  const pushParams = (mutate: (params: URLSearchParams) => void) => {
    const params = new URLSearchParams(searchParams.toString());
    mutate(params);
    params.set("page", "1");
    router.push(`/?${params.toString()}`, { scroll: false });
  };

  const toggleCheckbox = (
    e: ChangeEvent<HTMLInputElement>,
    type: "company" | "industry",
  ) => {
    const { value, checked } = e.target;
    const setter = type === "company" ? setCompanyArr : setIndustryArr;

    setter((prev) =>
      checked ? [...prev, value] : prev.filter((entry) => entry !== value),
    );
  };

  const applyCheckboxes = (type: "company" | "industry") => {
    if (!requireUser()) return;

    const values = type === "company" ? companyArr : industryArr;
    pushParams((params) => params.set(type, values.join(",")));

    trackEvent(user, "Filter", { type, value: values.join(",") });
  };

  const handleDateFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!requireUser()) return;

    const choice = e.target.value;

    if (choice === "open") {
      setShowExactDate(true);
      return;
    }

    if (!choice) {
      pushParams((params) => {
        params.delete("date");
        params.delete("exact");
      });
      return;
    }

    const start = dayjs().subtract(Number(choice), "day");
    pushParams((params) => {
      params.set("date", start.format("YYYY-MM-DD"));
      params.delete("exact");
    });

    trackEvent(user, "Filter", {
      type: "date",
      value: start.format("YYYY-MM-DD"),
      amountOfDays: choice,
    });
  };

  const handleExactDateFilter = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!requireUser()) return;

    const choice = e.target.value;
    pushParams((params) => {
      params.delete("date");
      if (choice) {
        params.set("exact", choice);
      } else {
        params.delete("exact");
      }
    });

    trackEvent(user, "Filter", { type: "exact date", value: choice });
  };

  const handleReset = (filter: "company" | "industry" | "date") => {
    pushParams((params) => {
      params.delete(filter);
      if (filter === "company") setCompanyArr([]);
      if (filter === "industry") setIndustryArr([]);
      if (filter === "date") {
        params.delete("exact");
        setShowExactDate(false);
      }
    });

    trackEvent(user, "Filter", { type: "reset", value: filter });
  };

  return (
    <>
      <S.Wrapper>
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
              value={
                postedDate ? `${dayjs().diff(dayjs(postedDate), "day")}` : ""
              }
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
              name="exactDateSelect"
              onChange={handleExactDateFilter}
              value={exactDate}
            >
              <option value="">Select Specific Date</option>
              {scrapDates.map((item: string) => (
                <option value={item} key={item}>
                  {dayjs(item).format("MM-DD-YYYY")}
                </option>
              ))}
            </S.Select>
          )}
        </div>
        {companies.length > 0 && (
          <div>
            <S.FilterContent>
              <div>Company</div>
              <S.Input
                type="text"
                placeholder="Search company..."
                name="companySearch"
                value={companyQuery}
                onChange={(e) => setCompanyQuery(e.target.value)}
              />
            </S.FilterContent>
            <S.CheckboxWrapper>
              {companyList.map((item: Facet) => (
                <S.CheckedSection key={item.value}>
                  <div>
                    <input
                      type="checkbox"
                      name="companyCheckbox"
                      checked={companyArr.includes(item.value)}
                      onChange={(e) => toggleCheckbox(e, "company")}
                      value={item.value}
                    />
                    {item.value}
                  </div>
                  <div>({item.count})</div>
                </S.CheckedSection>
              ))}
            </S.CheckboxWrapper>
            <S.FilterContent className="apply">
              <button
                onClick={() => applyCheckboxes("company")}
                disabled={companyArr.length === 0}
              >
                Apply
              </button>
              {selectedCompanies.length > 0 && (
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
        {industries.length > 0 && (
          <div>
            <S.FilterContent>
              <div>Industry</div>
              <S.Input
                type="text"
                placeholder="Search industry..."
                name="industrySearch"
                value={industryQuery}
                onChange={(e) => setIndustryQuery(e.target.value)}
              />
            </S.FilterContent>
            <S.CheckboxWrapper>
              {industryList.map((item: Facet) => (
                <S.CheckedSection key={item.value}>
                  <div>
                    <input
                      type="checkbox"
                      name="industryCheckbox"
                      checked={industryArr.includes(item.value)}
                      onChange={(e) => toggleCheckbox(e, "industry")}
                      value={item.value}
                    />
                    {item.value}
                  </div>
                  <div>({item.count})</div>
                </S.CheckedSection>
              ))}
            </S.CheckboxWrapper>
            <S.FilterContent className="apply">
              <button
                onClick={() => applyCheckboxes("industry")}
                disabled={industryArr.length === 0}
              >
                Apply
              </button>
              {selectedIndustries.length > 0 && (
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
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
    </>
  );
};

export default Filter;
