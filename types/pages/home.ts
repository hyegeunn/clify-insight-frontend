export type HomeRiskLevel = "good" | "warning" | "high";

export interface HomeDepartmentData extends Record<string, unknown> {
  rank?: number;
  department: string;
  riskLevel?: HomeRiskLevel | null;
  totalEmployees: number;
  participatedEmployees: number;
  participationRate: number;
  favScore?: number | null;
}

export interface HomeSolutionUsageData extends Record<string, unknown> {
  solutionName: string;
  usageCount: number;
  participantCount: number;
  amount: number;
  ratio: string;
}

export interface HomeSummaryCardData {
  title: string;
  value: string | React.ReactNode;
  subValue?: React.ReactNode;
  description: string;
  icon: React.ReactNode;
  tag?: { type: "warning" | "success" | "error"; text: string };
}

export interface HomeSettlementCardData {
  title: string;
  mainContent: string;
  trendData?: { type: "up" | "down"; value: number };
  tag?: { type: "warning" | "success" | "error"; text: string };
  percentage?: string;
  subContent?: string;
  tooltip?: string;
  mainContentColor?: string;
  percentageColor?: string;
}

export interface HomeViewProps extends Record<string, unknown> {
  selectedDate: string;
  startDate: string;
  endDate: string;
  chartXAxisData: string[];
  chartSeriesData: number[];
  solutionUsageData: HomeSolutionUsageData[];
  departmentData: HomeDepartmentData[];
  summaryCards: HomeSummaryCardData[];
  settlementCards: HomeSettlementCardData[];
  onDateChange: (pickedValue: string) => void;
  onNavigateToFavDiagnosis: () => void;
  onNavigateToRiskDepartments: () => void;
}

export type HomeDepartmentTableProps<
  T extends HomeDepartmentData = HomeDepartmentData
> = {
  data: T[];
};

export type HomeSolutionUsageTableProps<
  T extends HomeSolutionUsageData = HomeSolutionUsageData
> = {
  data: T[];
  className?: string;
};

export type HomeDepartmentTableRow = {
  department: string;
  riskLevel: HomeRiskLevel | null;
  totalEmployees: number;
  participatedEmployees: number;
  participationRate: number;
};

export type HomeSolutionUsageTableRow = {
  solutionName: string;
  usageCount: string;
  participantCount: string;
  amount: string;
  ratio: string;
};
