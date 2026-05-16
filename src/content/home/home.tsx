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

interface HomeProps {
  csvData: AllSearchData;
}

const Home = ({ csvData }: HomeProps) => {
  const [jobData, setJobData] = useAtom(jobAtom);
  const [isListView, setIsListView] = useState<boolean>(false);

  const getAllJobInfo = () => {
    setJobData(csvData);
  };

  useEffect(() => {
    !jobData && getAllJobInfo();
  }, [jobData]);

  return (
    <S.Wrapper>
      <img src="/bgh-logo.png" width="200" />
      {!jobData && <div>Loading...</div>}
      {!!jobData && (
        <>
          <Search />
          <S.ResultsWrapper>
            <Filter
              companies={jobData.companies}
              scrapDates={jobData.scrapDates}
              industries={jobData.industries}
            />
            <div>
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
              <Pagination
                page={jobData.page}
                totalPages={jobData.totalPages}
                total={jobData.total}
              />
              <S.CardWrapper className={isListView ? "list" : ""}>
                {isListView ? <List /> : <Card />}
              </S.CardWrapper>
              <Pagination
                page={jobData.page}
                totalPages={jobData.totalPages}
                total={jobData.total}
              />
            </div>
          </S.ResultsWrapper>
        </>
      )}
    </S.Wrapper>
  );
};

export default Home;
