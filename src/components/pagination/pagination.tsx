"use client";

import { useRouter } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
}

const Pagination = ({ page, totalPages }: PaginationProps) => {
  const router = useRouter();

  const goToNewPage = (page: number) => {
    router.push(`?page=${page}`);
  };

  return (
    <div>
      <button onClick={() => goToNewPage(page - 1)}>
        Previous Page ({page - 1})
      </button>
      <button onClick={() => goToNewPage(page + 1)}>
        Next Page ({page + 1})
      </button>
      <div>Total Pages: {totalPages}</div>
    </div>
  );
};

export default Pagination;
