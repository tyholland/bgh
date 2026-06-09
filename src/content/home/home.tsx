"use client";

import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";
import Search from "@/components/search/search";
import Filter from "@/components/filter/filter";
import { AllSearchData } from "@/types";
import { useAtom } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { useEffect, useState } from "react";
import List from "@/components/list/list";
import ToggleButton from "react-toggle-button";
import { userAtom } from "@/caches/UserAtom";
import { getUserCreds } from "@/functions/userState";
import Loader from "@/components/loader/loader";

interface HomeProps {
  csvData?: AllSearchData;
}

const Home = ({ csvData }: HomeProps) => {
  const [user, setUser] = useAtom(userAtom);
  const [jobData, setJobData] = useAtom(jobAtom);
  const [isListView, setIsListView] = useState<boolean>(false);

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

  if (!jobData) {
    return <Loader />;
  }

  return (
    <S.Wrapper>
      <Search />
      <S.ResultsWrapper>
        <Filter
          companies={jobData.companies}
          scrapDates={jobData.scrapDates}
          industries={jobData.industries}
        />
        <S.JobResultsWrapper>
          <S.Section>
            <div>Results: {jobData.total} jobs</div>
            <S.ListSection>
              <strong>List View</strong>
              <ToggleButton
                value={isListView}
                onToggle={(value: boolean) => {
                  setIsListView(!value);
                }}
              />
            </S.ListSection>
          </S.Section>
          <Pagination totalPages={jobData.totalPages} />
          <S.CardWrapper className={isListView ? "list" : ""}>
            {isListView ? <List /> : <Card />}
          </S.CardWrapper>
          <Pagination totalPages={jobData.totalPages} />
        </S.JobResultsWrapper>
      </S.ResultsWrapper>
    </S.Wrapper>
  );
};

export default Home;
