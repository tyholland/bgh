import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";
import Search from "@/components/search/search";
import Filter from "@/components/filter/filter";

interface HomeProps {
  csvData: any;
}

const Home = ({ csvData }: HomeProps) => {
  const { data, page, totalPages, companies, scrapDates, total } = csvData;

  return (
    <S.Wrapper>
      <Search />
      <S.ResultsWrapper>
        <Filter companies={companies} scrapDates={scrapDates} />
        <div>
          <S.CardWrapper>
            {data.map((item: any, index: number) => {
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
