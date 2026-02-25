import type { SortDirection, HeaderConfig, RowData } from "@/types/common";
import type { ProgressBarItem } from "@/types/common";

export interface CoachingTableRow extends Record<string, unknown> {
  id: string;
  rank: number;
  departmentName: string;
  usageCount: number;
  cancelCount: number;
  noShowCount: number;
  newUserCount: number;
  revisitCount: number;
  monthOverMonth: number;
  comparisonDirection?: "UP" | "DOWN" | "SAME";
}

export type CoachingTableHeader = HeaderConfig<CoachingTableRow>;
export type CoachingTableData = RowData<CoachingTableRow>;

export type CoachingSortKey = keyof Omit<CoachingTableRow, "id" | "monthOverMonth"> | "monthOverMonth";
export type CoachingSortDirection = SortDirection;

export interface CoachingMonthlyTrendItem extends Record<string, number | string> {
  month: string;
  firstValue: number;
  firstTopicName: string;
  secondValue: number;
  secondTopicName: string;
}

export interface CoachingStatsCardData {
  label: string;
  value: number;
  hasAlert?: boolean;
}

export interface CoachingDonutChartData {
  label: string;
  value: number;
  color: string;
  textColor: string;
  percentage?: number;
}

export interface CoachingSatisfactionData {
  score: number;
  maxScore: number;
  totalCoaching: number;
  totalResponse: number;
  responseRate: string;
}

export interface CoachingViewProps {
  selectedDate: string;
  startDate: string;
  endDate: string;
  headers: CoachingTableHeader[];
  data: CoachingTableData[];
  currentPage: number;
  totalPages: number;
  searchValue: string;
  sortKey: CoachingSortKey;
  sortDirection: CoachingSortDirection;
  statsCards: CoachingStatsCardData[];
  xAxisData: string[];
  seriesData: number[];
  donutChartData: CoachingDonutChartData[];
  satisfactionData: CoachingSatisfactionData;
  satisfactionProgressData: ProgressBarItem[];
  mostSelectedTopicsProgressData: ProgressBarItem[];
  monthlyTrendData: CoachingMonthlyTrendItem[];
  isCoachingTypeDataEmpty: boolean;
  isMostSelectedTopicsDataEmpty: boolean;
  isMonthlyTrendDataEmpty: boolean;
  isDepartmentTableEmpty: boolean;
  isSearchActive: boolean;
  onDateChange: (pickedValue: string) => void;
  onSort: (key: CoachingSortKey, direction: CoachingSortDirection) => void;
  onPageChange: (page: number) => void;
  onSearchChange: (value: string) => void;
  onSearch: (value: string) => void;
}
