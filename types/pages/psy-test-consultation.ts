import type {
  DonutChartData,
  HeaderConfig,
  ProgressBarItem,
  RowData,
  SortDirection,
} from "@/types/common";

export type PsyTestConsultationSortDirection = SortDirection;

export interface PsyTestConsultationTableRow extends Record<string, unknown> {
  id: string;
  rank: number;
  department: string;
  usage: number;
  cancel: number;
  noShow: number;
  newUser: number;
  revisit: number;
  monthlyChange: number;
  comparisonDirection?: "UP" | "DOWN" | "SAME";
}

export type PsyTestConsultationHeaders<
  T extends PsyTestConsultationTableRow = PsyTestConsultationTableRow,
> = HeaderConfig<T>[];

export type PsyTestConsultationTableData<
  T extends PsyTestConsultationTableRow = PsyTestConsultationTableRow,
> = RowData<T>[];

export interface PsyTestConsultationPageState extends Record<string, unknown> {
  currentPage: number;
  searchValue: string;
  sortKey: keyof PsyTestConsultationTableRow;
  sortDirection: PsyTestConsultationSortDirection;
}

export type PsyTestConsultationSortHandler<
  T extends PsyTestConsultationTableRow = PsyTestConsultationTableRow,
> = (key: keyof T, direction: PsyTestConsultationSortDirection) => void;

export type PsyTestConsultationPageChangeHandler = (page: number) => void;

export type PsyTestConsultationSearchHandler = (value: string) => void;
export type PsyTestConsultationSearchChangeHandler = (value: string) => void;

export interface PsyTestConsultationStatsCardData {
  label: string;
  value: number;
  hasAlert?: boolean;
}

export interface PsyTestConsultationSatisfactionData {
  score: number;
  maxScore: number;
  totalTests: number;
  totalResponse: number;
  responseRate: string;
}

export interface PsyTestConsultationViewProps<
  T extends PsyTestConsultationTableRow = PsyTestConsultationTableRow,
> extends Record<string, unknown> {
  selectedDate: string;
  startDate: string;
  endDate: string;
  headers: HeaderConfig<T>[];
  data: RowData<T>[];
  currentPage: number;
  totalPages: number;
  searchValue: string;
  sortKey: keyof T;
  sortDirection: PsyTestConsultationSortDirection;
  statsCards: PsyTestConsultationStatsCardData[];
  xAxisData: string[];
  seriesData: number[];
  satisfactionData: PsyTestConsultationSatisfactionData;
  satisfactionProgressData: ProgressBarItem[];
  mostUsedTestsProgressData: ProgressBarItem[];
  testTypeData: DonutChartData[];
  isTestTypeDataEmpty: boolean;
  isMostUsedTestsDataEmpty: boolean;
  isDepartmentTableEmpty: boolean;
  isSearchActive: boolean;
  isMostUsedTestsLoading: boolean;
  mostUsedTestsCurrentPage: number;
  mostUsedTestsTotalPages: number;
  onMostUsedTestsPageChange: PsyTestConsultationPageChangeHandler;
  onDateChange: (pickedValue: string) => void;
  onSort: PsyTestConsultationSortHandler<T>;
  onPageChange: PsyTestConsultationPageChangeHandler;
  onSearchChange: PsyTestConsultationSearchChangeHandler;
  onSearch: PsyTestConsultationSearchHandler;
}

