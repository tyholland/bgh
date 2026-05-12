"use client";

import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";
import Search from "@/components/search/search";
import Filter from "@/components/filter/filter";
import { AllSearchData, CsvData } from "@/types";
import ReactPaginate from "react-paginate";

interface HomeProps {
  csvData: AllSearchData;
}

const Home = ({ csvData }: HomeProps) => {
  const { data, page, totalPages, companies, scrapDates, total } = csvData;

  return (
    <S.Wrapper>
      <Search />
      <S.ResultsWrapper>
        <Filter companies={companies} scrapDates={scrapDates} />
        <div>
          <div>Results: {total} jobs</div>
          <Pagination page={page} totalPages={totalPages} total={total} />
          <S.CardWrapper>
            {data.map((item: CsvData, index: number) => {
              return <Card job={item} key={index} />;
            })}
          </S.CardWrapper>
          <Pagination page={page} totalPages={totalPages} total={total} />
        </div>
      </S.ResultsWrapper>
    </S.Wrapper>
  );
};

export default Home;
