"use client";

import * as S from "./pagination.style";
import ReactPaginate from "react-paginate";
import { PaginationClick } from "@/types";
import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  totalPages: number;
  page: number;
  // Defaults to the home page — the company profile page (/companies/[company])
  // passes its own path so paging stays on that page instead of bouncing to "/".
  basePath?: string;
}

const Pagination = ({ totalPages, page, basePath = "/" }: PaginationProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const goToNewPage = ({ selected }: PaginationClick) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", `${selected + 1}`);
    router.push(`${basePath}?${params.toString()}`, { scroll: false });
  };

  if (totalPages <= 1) {
    return null;
  }

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
        forcePage={Math.min(Math.max(page, 1), totalPages) - 1}
      />
    </S.Wrapper>
  );
};

export default Pagination;
