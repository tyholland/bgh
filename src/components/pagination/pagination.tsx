"use client";

import { useRouter } from "next/navigation";
import * as S from "./pagination.style";
import ReactPaginate from "react-paginate";
import { PaginationClick } from "@/types";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
}

const Pagination = ({ page, totalPages, total }: PaginationProps) => {
  const router = useRouter();

  const goToNewPage = (pageNum: PaginationClick) => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("page", `${pageNum.selected + 1}`);
    const updatedQuery = `?${params.toString()}`;

    router.push(updatedQuery);
  };

  return (
    <S.Wrapper>
      <ReactPaginate
        breakLabel="..."
        nextLabel=">"
        onPageChange={goToNewPage}
        pageRangeDisplayed={3}
        pageCount={totalPages}
        previousLabel="<"
        renderOnZeroPageCount={null}
      />
    </S.Wrapper>
  );
};

export default Pagination;
