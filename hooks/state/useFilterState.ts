import { useState, useCallback } from "react";
import type { FilterState, UseFilterStateReturn } from "@/types";

/**
 * 필터 상태 관리 훅
 * @param initialFilters 초기 필터 상태
 */
export const useFilterState = (
  initialFilters: FilterState = {}
): UseFilterStateReturn => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  }, []);

  const resetFilter = useCallback((key: string) => {
    setFilters((prev) => {
      const newFilters = { ...prev };
      delete newFilters[key];
      return newFilters;
    });
  }, []);

  const resetAllFilters = useCallback(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  return {
    filters,
    setFilter,
    resetFilter,
    resetAllFilters,
  };
};
