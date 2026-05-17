"use client";

import * as S from "./pagination.style";
import ReactPaginate from "react-paginate";
import { PaginationClick } from "@/types";
import { useAtom } from "jotai";
import { jobAtom } from "@/caches/JobsAtom";
import { filterJobSearch } from "@/functions/search";

interface PaginationProps {
  totalPages: number;
}

const Pagination = ({ totalPages }: PaginationProps) => {
  const [jobData, setJobData] = useAtom(jobAtom);

  const goToNewPage = (pageNum: PaginationClick) => {
    const query = window.location.search;
    const params = new URLSearchParams(query);

    params.set("page", `${pageNum.selected + 1}`);
    const updatedQuery = `?${params.toString()}`;
    window.history.pushState({}, "", updatedQuery);

    jobData && filterJobSearch(jobData, params, setJobData);
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
