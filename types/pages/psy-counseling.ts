import type {
  SortDirection,
  HeaderConfig,
  RowData,
  DonutChartData,
} from "@/types/common";
import type { ProgressBarItem } from "@/types/common";
export type PsyCounselingSortDirection = SortDirection;

export interface TopicRatioItem {
  topic: string;
  value: number;
}

export interface TopicRatioChartProps {
  data: TopicRatioItem[];
}

export interface MonthlyTrendItem {
  month: string;
  firstValue: number;
  firstTopicName: string;
  secondValue: number;
  secondTopicName: string;
}

export interface MonthlyTrendChartProps {
  data: MonthlyTrendItem[];
}

export interface PsyCounselingTableRow extends Record<string, unknown> {
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

export type PsyCounselingHeaders<
  T extends PsyCounselingTableRow = PsyCounselingTableRow,
> = HeaderConfig<T>[];

export type PsyCounselingTableData<
  T extends PsyCounselingTableRow = PsyCounselingTableRow,
> = RowData<T>[];

export interface PsyCounselingPageState extends Record<string, unknown> {
  currentPage: number;
  searchValue: string;
  sortKey: keyof PsyCounselingTableRow;
  sortDirection: PsyCounselingSortDirection;
}

export type PsyCounselingSortHandler<
  T extends PsyCounselingTableRow = PsyCounselingTableRow,
> = (key: keyof T, direction: PsyCounselingSortDirection) => void;

export type PsyCounselingPageChangeHandler = (page: number) => void;

export type PsyCounselingSearchHandler = (value: string) => void;
export type PsyCounselingSearchChangeHandler = (value: string) => void;

export interface PsyCounselingStatsCardData {
  label: string;
  value: number;
  hasAlert?: boolean;
}

export interface PsyCounselingSatisfactionData {
  score: number;
  maxScore: number;
  totalCounseling: number;
  totalResponse: number;
  responseRate: string;
}

export interface PsyCounselingViewProps<
  T extends PsyCounselingTableRow = PsyCounselingTableRow,
> extends Record<string, unknown> {
  selectedDate: string;
  startDate: string;
  endDate: string;
  currentPage: number;
  totalPages: number;
  searchValue: string;
  sortKey: keyof T;
  sortDirection: PsyCounselingSortDirection;
  headers: HeaderConfig<T>[];
  data: RowData<T>[];
  statsCards: PsyCounselingStatsCardData[];
  xAxisData: string[];
  seriesData: number[];
  satisfactionData: PsyCounselingSatisfactionData;
  satisfactionProgressData: ProgressBarItem[];
  topicRatioData: TopicRatioItem[];
  monthlyTrendData: MonthlyTrendItem[];
  counselingTypeData: DonutChartData[];
  isCounselingTypeDataEmpty: boolean;
  isTopicRatioDataEmpty: boolean;
  isMonthlyTrendDataEmpty: boolean;
  isDepartmentTableEmpty: boolean;
  isSearchActive: boolean;
  onDateChange: (pickedValue: string) => void;
  onSort: PsyCounselingSortHandler<T>;
  onPageChange: PsyCounselingPageChangeHandler;
  onSearchChange: PsyCounselingSearchChangeHandler;
  onSearch: PsyCounselingSearchHandler;
}
