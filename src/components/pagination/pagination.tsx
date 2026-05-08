"use client";

import { useRouter } from "next/navigation";

interface PaginationProps {
  page: number;
  totalPages: number;
}

const Pagination = ({ page, totalPages }: PaginationProps) => {
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
