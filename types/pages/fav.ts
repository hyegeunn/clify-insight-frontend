import type { CellData, HeaderConfig, RowData } from "@/types/common";

export type FavTab = "dashboard" | "status" | "usage";
export type FavSlideDirection = "left" | "right";
export type FavAttentionIndicator = "stress" | "anxiety" | "depression";

export interface FavRankingItem {
  rank: number;
  departmentName: string;
  organizationId?: number;
  score: number;
  diff: number;
  attentionIndicator: FavAttentionIndicator | null;
}

export interface FavChangeRateItem {
  rank: number;
  departmentName: string;
  organizationId?: number;
  changeRate: number;
  beforeAfter: string;
}

export interface FavListTableRow extends Record<string, string | number | CellData> {
  id: string;
  rank: number;
  departmentName: string;
  score: CellData;
  previousPeriod: CellData;
  stressStatus: string;
  anxietyStatus: string;
  depressionStatus: string;
  attentionIndicator: CellData;
  employeeCount: string;
}

export interface FavDetailClassificationItem {
  departmentName: string;
  organizationId?: number;
  score: number;
  monthlyChange: number;
  participationRate: number;
  isMasked?: boolean;
}

export interface FavDetailClassificationTableRow extends Record<string, CellData> {
  departmentName: CellData;
  score: CellData;
  monthlyChange: CellData;
  participationRate: CellData;
}

export interface FavRankingTableProps {
  data: FavRankingItem[];
  sortKey?: string;
  sortDirection?: "asc" | "desc";
  onSort?: (key: string, direction: "asc" | "desc") => void;
  onRowClick?: (row: FavRankingItem) => void;
}

export interface FavChangeRateTableProps {
  data: FavChangeRateItem[];
  onRowClick?: (row: FavChangeRateItem) => void;
}

export interface FavDetailClassificationTableProps {
  data: FavDetailClassificationItem[];
  emptyMessage?: string;
  emptyHeight?: number;
  onRowClick?: (organizationId: number) => void;
}

export interface FavDetailClassificationCardProps {
  label: string;
  scoreRange: string;
  dotColor: string;
  data: FavDetailClassificationItem[];
  onRowClick?: (organizationId: number) => void;
}

export interface FavCompanyScoreData {
  totalCount: number;
  participatedCount: number;
  participationRate: string;
  score: number;
  scoreDiff: number;
  comparisonText: string;
  stressValue: number;
  stressStatus: "healthy" | "good" | "caution" | "vulnerable" | "critical";
  anxietyValue: number;
  anxietyStatus: "healthy" | "good" | "caution" | "vulnerable" | "critical";
  depressionValue: number;
  depressionStatus: "healthy" | "good" | "caution" | "vulnerable" | "critical";
  isMasked?: boolean;
}

export interface FavOrganizationData {
  label: string;
  organizationName: string;
  organizationId?: number;
  score: number;
  diff: number;
  employees: number;
  attentionIndicator: FavAttentionIndicator | null;
  comparisonText: string;
}

export interface FavStatusCardData {
  label: string;
  scoreRange: string;
  teamCount: number;
  totalMembers: number;
  monthlyChange: number;
  dotColor: string;
  tagBgColor: string;
  tagTextColor: string;
  tagText: string;
}

export interface FavDonutChartDataItem {
  label: string;
  value: number;
  color: string;
  teamCount?: number;
}

export interface FavDetailClassificationCardData {
  label: string;
  scoreRange: string;
  dotColor: string;
  data: FavDetailClassificationItem[];
}

export interface FavViewProps {
  selectedDate: string;
  startDate: string;
  endDate: string;
  activeTab: FavTab;
  direction: FavSlideDirection;
  chartXAxisData: string[];
  chartSeriesData: number[];
  rankingData: FavRankingItem[];
  changeRateData: FavChangeRateItem[];
  companyScoreData: FavCompanyScoreData;
  organizationDataList: FavOrganizationData[];
  statusCardDataList: FavStatusCardData[];
  donutChartData: FavDonutChartDataItem[];
  detailClassificationCards: FavDetailClassificationCardData[];
  participatingTeams: number;
  participatingMembers: number;
  nonParticipatingTeams: number;
  nonParticipatingMembers: number;
  usageStatusData: FavUsageStatusItem[];
  usageCurrentPage: number;
  usageTotalPages: number;
  isCompanyDashboard: boolean;
  organizationName?: string | null;
  hasNoData?: boolean;
  onDateChange: (pickedValue: string) => void;
  onTabChange: (newTab: FavTab) => void;
  onNavigateToList: () => void;
  onScoreTypeChange: (value: string) => void;
  onWeeksChange: (tab: string, index: number) => void;
  sortBy: "rank" | "departmentName" | "score" | "diff" | null;
  sortDirection: "asc" | "desc";
  onSort: (key: string, direction: "asc" | "desc") => void;
  onUsagePageChange: (page: number) => void;
  onOrganizationClick: (organizationId: number) => void;
  onBackToCompany: () => void;
}

export interface FavListViewProps {
  selectedDate: string;
  startDate: string;
  endDate: string;
  currentPage: number;
  totalPages: number;
  sortKey: keyof FavListTableRow;
  sortDirection: "asc" | "desc";
  headers: HeaderConfig<FavListTableRow>[];
  data: RowData<FavListTableRow>[];
  organizationName: string;
  onDateChange: (pickedValue: string) => void;
  onSort: (key: keyof FavListTableRow, direction: "asc" | "desc") => void;
  onPageChange: (page: number) => void;
  onRowClick: (row: RowData<FavListTableRow>) => void;
}

export interface FavDetailStatsCardData {
  label: string;
  value: number;
  status: "healthy" | "good" | "caution" | "vulnerable" | "critical";
}

export interface FavDetailCompanyScoreData {
  totalCount: number;
  participatedCount: number;
  participationRate: string;
  score: number;
  scoreDiff: number;
  comparisonText: string;
  stressValue: number;
  stressStatus: "healthy" | "good" | "caution" | "vulnerable" | "critical";
  anxietyValue: number;
  anxietyStatus: "healthy" | "good" | "caution" | "vulnerable" | "critical";
  depressionValue: number;
  depressionStatus: "healthy" | "good" | "caution" | "vulnerable" | "critical";
  isMasked?: boolean;
}

export interface FavDetailScoreComparisonData {
  organizationScore: number;
  companyAverage: number;
  difference: number;
  parentAverage: number | null;
  differenceFromParent: number | null;
}

export interface FavDetailHighRiskTrendData {
  monthLabel: string;
  highRiskRatio: number;
}

export interface FavDetailViewProps {
  selectedDate: string;
  startDate: string;
  endDate: string;
  chartXAxisData: string[];
  chartSeriesData: number[];
  satisfactionValue: number;
  companyScoreData: FavDetailCompanyScoreData;
  scoreComparisonData: FavDetailScoreComparisonData | null;
  highRiskRatioXAxisData: string[];
  highRiskRatioSeriesData: number[];
  organizationName?: string | null;
  hasNoData?: boolean;
  onDateChange: (pickedValue: string) => void;
  onSelectChange: (value: string) => void;
  onToggleChange: (tab: string, index: number) => void;
  onBackToCompany: () => void;
}

export interface FavUsageStatusItem {
  rank: number;
  departmentName: string;
  parentDepartment: string;
  totalMembers: number;
  participatedMembers: number;
  participationRate: number;
  avgParticipationCount: number;
  nonParticipatedMembers: number;
  lastParticipationDate: string | null;
}

export interface FavUsageStatusTableRow
  extends Record<string, string | number | CellData> {
  rank: number;
  departmentName: CellData;
  parentDepartment: CellData;
  totalMembers: string;
  participatedMembers: string;
  participationRate: CellData;
  avgParticipationCount: string;
  nonParticipatedMembers: string;
  lastParticipationDate: string;
}

export interface FavUsageStatusTableProps {
  data: FavUsageStatusItem[];
  onSort?: (
    key: keyof FavUsageStatusTableRow,
    direction: "asc" | "desc"
  ) => void;
}