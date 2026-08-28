"use client";

import { useMemo, useState } from "react";

const DEFAULT_PAGE_SIZE = 8;

export function usePagination<T>(items: T[], pageSize = DEFAULT_PAGE_SIZE) {
  const [page, setPage] = useState(1);
  const pageCount = Math.max(1, Math.ceil(items.length / pageSize));

  const currentPage = Math.min(page, pageCount);

  const visibleItems = useMemo(
    () => items.slice((currentPage - 1) * pageSize, currentPage * pageSize),
    [items, currentPage, pageSize],
  );

  const setCurrentPage = (nextPage: number) => {
    setPage(Math.max(1, Math.min(nextPage, pageCount)));
  };

  return {
    page: currentPage,
    pageCount,
    setPage: setCurrentPage,
    visibleItems,
  };
}

export function Pagination({
  page,
  pageCount,
  onPageChange,
}: {
  page: number;
  pageCount: number;
  onPageChange: (page: number) => void;
}) {
  return (
    <nav
      className="flex items-center justify-between border-t border-[#e9e8e5] px-4 py-3 text-xs text-[#777]"
      aria-label="Pagination"
    >
      <span className="tabular-nums">
        Page {page} of {pageCount}
      </span>
      <div>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-md text-lg text-[#777] transition hover:bg-[#f1f1ed] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          aria-label="Previous page"
        >
          ‹
        </button>
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-md text-lg text-[#777] transition hover:bg-[#f1f1ed] disabled:cursor-not-allowed disabled:opacity-40"
          disabled={page === pageCount}
          onClick={() => onPageChange(page + 1)}
          aria-label="Next page"
        >
          ›
        </button>
      </div>
    </nav>
  );
}
