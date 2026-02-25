import type {
  DonutChartData,
  HeaderConfig,
  ProgressBarItem,
  RowData,
  SortDirection,
} from "@/types/common";
import type { MonthlyTrendItem } from "@/types/pages/psy-counseling";

export type PsyTestSortDirection = SortDirection;

export interface PsyTestTableRow extends Record<string, unknown> {
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

export type PsyTestHeaders<
  T extends PsyTestTableRow = PsyTestTableRow,
> = HeaderConfig<T>[];

export type PsyTestTableData<
  T extends PsyTestTableRow = PsyTestTableRow,
> = RowData<T>[];

export interface PsyTestPageState extends Record<string, unknown> {
  currentPage: number;
  searchValue: string;
  sortKey: keyof PsyTestTableRow;
  sortDirection: PsyTestSortDirection;
}

export type PsyTestSortHandler<
  T extends PsyTestTableRow = PsyTestTableRow,
> = (key: keyof T, direction: PsyTestSortDirection) => void;

export type PsyTestPageChangeHandler = (page: number) => void;

export type PsyTestSearchHandler = (value: string) => void;
export type PsyTestSearchChangeHandler = (value: string) => void;

export type AssessmentUsageSortHandler = (
  key: keyof AssessmentUsageRow,
  direction: PsyTestSortDirection
) => void;

// 검사별 이용 현황 관련 타입
export interface AssessmentUsageRow extends Record<string, unknown> {
  id: string;
  rank: number;
  solutionId: number;
  solutionName: string;
  usageCount: number;
}

export interface AssessmentUsageDetail {
  title: string;
  description: string;
  questions: number;
  recommended: string;
}

export interface PsyTestStatsCardData {
  label: string;
  value: number;
  hasAlert?: boolean;
}

export interface PsyTestSatisfactionData {
  score: number;
  maxScore: number;
  totalTests: number;
  totalResponse: number;
  responseRate: string;
}

export interface PsyTestViewProps<
  T extends PsyTestTableRow = PsyTestTableRow,
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
  sortDirection: PsyTestSortDirection;
  statsCards: PsyTestStatsCardData[];
  xAxisData: string[];
  seriesData: number[];
  satisfactionData?: PsyTestSatisfactionData; // TODO:: 검사 만족도 - 추후 사용 예정
  satisfactionProgressData?: ProgressBarItem[]; // TODO:: 검사 만족도 - 추후 사용 예정
  mostUsedTestsProgressData: ProgressBarItem[];
  testTypeData: DonutChartData[];
  monthlyTrendData: MonthlyTrendItem[];
  isTestTypeDataEmpty: boolean;
  isMostUsedTestsDataEmpty: boolean;
  isMonthlyTrendDataEmpty: boolean;
  isDepartmentTableEmpty: boolean;
  isSearchActive: boolean;
  assessmentHeaders: HeaderConfig<AssessmentUsageRow>[];
  assessmentData: RowData<AssessmentUsageRow>[];
  assessmentCurrentPage: number;
  assessmentTotalPages: number;
  assessmentSortKey: keyof AssessmentUsageRow;
  assessmentSortDirection: PsyTestSortDirection;
  isAssessmentTableEmpty: boolean;
  onDateChange: (pickedValue: string) => void;
  onSort: PsyTestSortHandler<T>;
  onPageChange: PsyTestPageChangeHandler;
  onSearchChange: PsyTestSearchChangeHandler;
  onSearch: PsyTestSearchHandler;
  onAssessmentSort: AssessmentUsageSortHandler;
  onAssessmentPageChange: PsyTestPageChangeHandler;
  onAssessmentRowClick: (row: RowData<AssessmentUsageRow>, rowIndex: number) => void;
}
