import type { TrendData, SettlementTag } from "@/types/common";

export interface SettlementCardData {
  title: string;
  tooltip?: string;
  mainContent: string;
  trendData?: TrendData;
  tag?: SettlementTag;
  percentage?: string;
  subContent: string;
  mainContentColor?: string;
  percentageColor?: string;
}

export interface BillingSolutionUsageData {
  productName: string;
  usageCount: number;
  usageUsers: number;
  totalAmount: number;
  ratio: string;
}

export interface BillingSolutionUsageRow extends Record<string, string> {
  productName: string;
  usageCount: string;
  usageUsers: string;
  totalAmount: string;
  ratio: string;
}

export interface BillingMonthlyHistoryRow extends Record<string, string> {
  period: string;
  usageCount: string;
  totalAmount: string;
  corporateSettlement: string;
  personalPayment: string;
  monthOverMonth: string;
}

export interface BillingViewProps {
  selectedDate: string;
  startDate: string;
  endDate: string;
  settlementData: SettlementCardData[];
  solutionUsageData: BillingSolutionUsageData[];
  solutionUsageHeaders: import("@/types/common").HeaderConfig<BillingSolutionUsageRow>[];
  monthlyHistoryHeaders: import("@/types/common").HeaderConfig<BillingMonthlyHistoryRow>[];
  formattedMonthlyData: import("@/types/common").RowData<BillingMonthlyHistoryRow>[];
  yearOptions: string[];
  selectedYear: string;
  setSelectedYear: (year: string) => void;
  currentPage: number;
  setCurrentPage: (page: number) => void;
  totalPages: number;
  onDateChange: (pickedValue: string) => void;
  onSolutionUsageExcelDownload: () => void;
  isSolutionUsageExcelDownloading: boolean;
  onMonthlyHistoryExcelDownload: () => void;
  isMonthlyHistoryExcelDownloading: boolean;
}
