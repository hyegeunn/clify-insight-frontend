// ============================================
// usePagination
// ============================================
export interface UsePaginationReturn {
  currentPage: number;
  itemsPerPage: number;
  handlePageChange: (page: number) => void;
  reset: () => void;
}

// ============================================
// useTableState
// ============================================
export type SortDir = "asc" | "desc";

export interface UseTableStateReturn<T, K extends keyof T> {
  sortedData: T[];
  sortKey: K | undefined;
  sortDirection: SortDir;
  handleSort: (key: K, direction: SortDir) => void;
}

// ============================================
// useModalState
// ============================================
export interface UseModalStateReturn {
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;
}

// ============================================
// useFilterState
// ============================================
export interface FilterState {
  [key: string]: string;
}

export interface UseFilterStateReturn {
  filters: FilterState;
  setFilter: (key: string, value: string) => void;
  resetFilter: (key: string) => void;
  resetAllFilters: () => void;
}
