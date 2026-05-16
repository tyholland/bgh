"use client";

import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";
import Search from "@/components/search/search";
import Filter from "@/components/filter/filter";
import { AllSearchData, CsvData } from "@/types";
import { useAtom } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { useEffect } from "react";

interface HomeProps {
  csvData: AllSearchData;
}

const Home = ({ csvData }: HomeProps) => {
  const [jobData, setJobData] = useAtom(jobAtom);

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
              <div>Results: {jobData.total} jobs</div>
              <Pagination
                page={jobData.page}
                totalPages={jobData.totalPages}
                total={jobData.total}
              />
              <S.CardWrapper>
                {jobData.data.map((item: CsvData, index: number) => {
                  return <Card job={item} key={index} />;
                })}
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
