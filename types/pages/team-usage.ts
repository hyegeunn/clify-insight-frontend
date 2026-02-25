import type {
  HeaderConfig,
  RowData,
  SortDirection,
  TableSortHandler,
} from "@/types/common";

export type TeamUsageSortDirection = SortDirection;

export interface TeamUsageRow extends Record<string, unknown> {
  teamId: number;
  teamName: string;
  teamSize: number;
  usedEmployees: number;
  participationRate: number;
  usageCount: number;
  totalAmount: number;
  pointAmount: number;
  cardAmount: number;
  representativeProduct: string;
  recentUsedAt: string;
}

export type TeamUsageHeaders<
  T extends TeamUsageRow = TeamUsageRow,
> = HeaderConfig<T>[];

export type TeamUsageTableData<
  T extends TeamUsageRow = TeamUsageRow,
> = RowData<T>[];

export interface TeamUsageViewProps<
  T extends TeamUsageRow = TeamUsageRow,
> extends Record<string, unknown> {
  selectedDate: string;
  startDate: string;
  endDate: string;
  headers: HeaderConfig<T>[];
  tableData: RowData<T>[];
  currentPage: number;
  totalPages: number;
  totalTeams: number;
  isExcelDownloading: boolean;
  onDateChange: (pickedValue: string) => void;
  onPageChange: (page: number) => void;
  searchKeyword: string;
  onSearchKeywordChange: (keyword: string) => void;
  onSearchKeywordSubmit: (keyword: string) => void;
  onFilterReset: () => void;
  onExcelDownload: () => void;
  onSort?: TableSortHandler<T>;
}
