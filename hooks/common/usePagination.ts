import { useState, useCallback } from "react";
import type { UsePaginationReturn } from "@/types";

/**
 * 페이지네이션 상태 관리 훅
 * @param initialPage 초기 페이지 (기본값: 1)
 * @param itemsPerPage 페이지당 아이템 수 (기본값: 15)
 */
export const usePagination = (
  initialPage = 1,
  itemsPerPage = 15
): UsePaginationReturn => {
  const [currentPage, setCurrentPage] = useState(initialPage);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const reset = useCallback(() => {
    setCurrentPage(initialPage);
  }, [initialPage]);

  return {
    currentPage,
    itemsPerPage,
    handlePageChange,
    reset,
  };
};
