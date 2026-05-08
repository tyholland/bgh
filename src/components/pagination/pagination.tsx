"use client";

import { useRouter } from "next/navigation";
import * as S from "./pagination.style";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

const Pagination = ({ page, totalPages, total }: PaginationProps) => {
  const router = useRouter();
  const nextPage = Number(page) + 1;
  const prevPage = Number(page) - 1;

  const goToNewPage = (pageNum: number) => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("page", `${pageNum}`);
    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  return (
    <S.Wrapper>
      <S.BtnWrapper>
        <button onClick={() => goToNewPage(prevPage)}>
          Previous Page ({prevPage})
        </button>
        <button onClick={() => goToNewPage(nextPage)}>
          Next Page ({Math.round(nextPage)})
        </button>
      </S.BtnWrapper>
      <div>Total Results: {total}</div>
      <div>Total Pages: {totalPages}</div>
    </S.Wrapper>
  );
};

export default Pagination;
