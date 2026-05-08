"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
}

const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();
  const params = useSearchParams();
  const nextPage = Number(page) + 1;
  const prevPage = Number(page) - 1;

  const goToNewPage = (pageNum: number) => {
    const searchParam = params.get("search") || null;

    router.push(
      searchParam
        ? `/?page=${pageNum}&search=${searchParam}`
        : `/?page=${pageNum}`,
    );
  };

  return (
    <div>
      <button onClick={() => goToNewPage(prevPage)}>
        Previous Page ({prevPage})
      </button>
      <button onClick={() => goToNewPage(nextPage)}>
        Next Page ({Math.round(nextPage)})
      </button>
      <div>Total Pages: {totalPages}</div>
    </div>
  );
};

export default Pagination;
