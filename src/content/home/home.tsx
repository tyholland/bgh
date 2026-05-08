import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";
import Search from "@/components/search/search";
import Filter from "@/components/filter/filter";

interface HomeProps {
  csvData: any;
}

const Home = ({ csvData }: HomeProps) => {
  const { data, page, totalPages, companies, scrapDates } = csvData;

  return (
    <S.Wrapper>
      <Search />
      <Filter companies={companies} scrapDates={scrapDates} />
      <S.CardWrapper>
        {data.map((item: any, index: number) => {
          return <Card job={item} key={index} />;
        })}
      </S.CardWrapper>
      <Pagination page={page} totalPages={totalPages} />
    </S.Wrapper>
  );
};

export default Home;
