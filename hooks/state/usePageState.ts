import { useState, useCallback } from "react";
import type { SortDirection } from "@/types";

interface UsePageStateReturn<T extends string> {
  currentPage: number;
  searchValue: string;
  sortKey: T;
  sortDirection: SortDirection;
  handlePageChange: (page: number) => void;
  handleSearch: (value: string) => void;
  handleSort: (key: T, direction: SortDirection) => void;
}

/**
 * 페이지 상태 관리 훅
 * 정렬, 검색, 페이징 상태를 통합 관리
 * @param initialSortKey 초기 정렬 키
 * @param initialSortDirection 초기 정렬 방향 (기본값: "asc")
 * @returns 페이지 상태 및 핸들러
 */
export const usePageState = <T extends string>(
  initialSortKey: T,
  initialSortDirection: SortDirection = "asc"
): UsePageStateReturn<T> => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchValue, setSearchValue] = useState("");
  const [sortKey, setSortKey] = useState<T>(initialSortKey);
  const [sortDirection, setSortDirection] = useState<SortDirection>(initialSortDirection);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleSearch = useCallback((value: string) => {
    setSearchValue(value);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  }, []);

  const handleSort = useCallback((key: T, direction: SortDirection) => {
    setSortKey(key);
    setSortDirection(direction);
  }, []);

  return {
    currentPage,
    searchValue,
    sortKey,
    sortDirection,
    handlePageChange,
    handleSearch,
    handleSort,
  };
};
