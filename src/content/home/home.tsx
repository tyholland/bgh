import Card from "@/components/card/card";
import * as S from "./home.style";

interface HomeProps {
  jobs: any;
}

const Home = ({ jobs }: HomeProps) => {
  return (
    <S.Wrapper>
      {jobs.map((item: any) => {
        return <Card job={item} />;
      })}
    </S.Wrapper>
  );
};

export default Home;
