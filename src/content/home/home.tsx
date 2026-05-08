import Card from "@/components/card/card";
import * as S from "./home.style";
import Pagination from "@/components/pagination/pagination";

interface HomeProps {
  csvData: any;
}

const Home = ({ csvData }: HomeProps) => {
  const { data, page, totalPages } = csvData;

  return (
    <>
      <S.Wrapper>
        {data.map((item: any, index: number) => {
          return <Card job={item} key={index} />;
        })}
      </S.Wrapper>
      <Pagination page={page} totalPages={totalPages} />
    </>
  );
};

export default Home;
