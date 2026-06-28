"use client";

import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";
import Search from "@/components/search/search";
import Filter from "@/components/filter/filter";
import { AllSearchData } from "@/types";
import { useAtom } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { ChangeEvent, useEffect, useState } from "react";
import List from "@/components/list/list";
import ToggleButton from "react-toggle-button";
import { userAtom } from "@/caches/UserAtom";
import { getUserCreds } from "@/functions/userState";
import Loader from "@/components/loader/loader";
import dayjs from "dayjs";
import { trackEvent, trackPage } from "@/functions/mixpanel";
import { handleSearchParams } from "@/functions/search";
import SignInModal from "@/components/signIn-modal/signIn-modal";
import FilterModal from "@/components/filter-modal/filter-modal";

interface HomeProps {
  csvData?: AllSearchData;
}

const Home = ({ csvData }: HomeProps) => {
  const query = typeof window !== "undefined" && window.location.search;
  const params = query ? new URLSearchParams(query) : null;
  const [user, setUser] = useAtom(userAtom);
  const [jobData, setJobData] = useAtom(jobAtom);
  const [isListView, setIsListView] = useState<boolean>(false);
  const [sortWord, setSortWord] = useState<string>(
    params?.get("sort") || "most",
  );
  const [openModal, setOpenModal] = useState<boolean>(false);
  const [openFilterModal, setOpenFilterModal] = useState<boolean>(false);

  const getAllJobInfo = () => {
    csvData && setJobData(csvData);
  };

  useEffect(() => {
    !jobData && getAllJobInfo();
  }, [jobData]);

  useEffect(() => {
    getUserCreds(user, setUser);
  }, []);

  if (
    !jobData &&
    typeof window !== "undefined" &&
    window.location.pathname === "/home"
  ) {
    window.location.href = "/";
  }

  useEffect(() => {
    trackPage(user, "Home", window.location.href);
  }, []);

  if (!jobData) {
    return <Loader />;
  }

  const sortMap = (val: string) => {
    switch (val) {
      case "a":
        return "A-Z";
      case "z":
        return "Z-A";
      case "most":
        return "Most Recent";
      case "least":
        return "Least Recent";
      default:
        return "Most Recent";
    }
  };

  const handledSort = (e: ChangeEvent<HTMLSelectElement>) => {
    if (!user) {
      setOpenModal(true);
      return;
    }

    const query = window.location.search;
    const params = new URLSearchParams(query);
    setSortWord(e.target.value);

    params.set("sort", e.target.value);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && handleSearchParams(jobData, params, setJobData);

    trackEvent(user, "Sort", {
      type: "select",
      value: sortMap(sortWord),
    });
  };

  return (
    <>
      <S.Wrapper>
        <S.ResultsWrapper>
          <div className="filter">
            <Filter
              companies={jobData.companies}
              scrapDates={jobData.scrapDates}
              industries={jobData.industries}
            />
          </div>
          <S.JobResultsWrapper>
            <Search />
            <S.Section className="wrapper">
              <div className="jobs">
                <div>{jobData.total} jobs found</div>
                <div>
                  <strong>Opportunity Refresh:</strong>{" "}
                  {dayjs(jobData?.allData[0].Scrape_DateTime).format(
                    "MM-DD-YYYY hh:mmA",
                  )}
                </div>
              </div>
              <div className="options">
                <button
                  className="btnFilter"
                  onClick={() => setOpenFilterModal(true)}
                >
                  Filter Items
                </button>
                <S.Select
                  name="sortSelect"
                  onChange={handledSort}
                  value={sortWord}
                >
                  <option value="">Sort Items</option>
                  <option value="a">A-Z</option>
                  <option value="z">Z-A</option>
                </S.Select>
                <S.ListSection>
                  <strong>List View</strong>
                  <ToggleButton
                    value={isListView}
                    onToggle={(value: boolean) => {
                      setIsListView(!value);
                    }}
                  />
                </S.ListSection>
              </div>
            </S.Section>
            <Pagination totalPages={jobData.totalPages} />
            <S.CardWrapper className={isListView ? "list" : ""}>
              {isListView ? <List /> : <Card />}
            </S.CardWrapper>
            <Pagination totalPages={jobData.totalPages} />
          </S.JobResultsWrapper>
        </S.ResultsWrapper>
        <S.Banner>
          <S.BannerSection>
            <img
              src="/trusted-icon.png"
              alt="Trusted Opportunities"
              width="50"
              height="50"
            />
            <div className="content">
              <div className="title">Trusted Opportunities</div>
              <div>Curated roles from top companies</div>
            </div>
          </S.BannerSection>
          <S.BannerSection>
            <img
              src="/bolt-icon.png"
              alt="Real-time Updates"
              width="50"
              height="50"
            />
            <div className="content">
              <div className="title">Real-time Updates</div>
              <div>New jobs posted every day</div>
            </div>
          </S.BannerSection>
          <S.BannerSection>
            <img
              src="/loader-img.png"
              alt="Real-time Updates"
              width="50"
              height="50"
            />
            <div className="content">
              <div className="title">Easy to Explore</div>
              <div>Search, filter, and discover with ease.</div>
            </div>
          </S.BannerSection>
        </S.Banner>
      </S.Wrapper>
      <SignInModal openModal={openModal} setOpenModal={setOpenModal} />
      <FilterModal
        openModal={openFilterModal}
        setOpenModal={setOpenFilterModal}
        companies={jobData.companies}
        scrapDates={jobData.scrapDates}
        industries={jobData.industries}
      />
    </>
  );
};

export default Home;
