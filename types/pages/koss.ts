import type { HeaderConfig, RowData } from "@/types/common";
import type { ProgressBarItem } from "@/types/common";

export interface KossEmployeeRow extends Record<string, unknown> {
  name: string;
  department: string;
  email: string;
  status: string;
  responseDate: string;
}

export type KossEmployeeHeaders<
  T extends KossEmployeeRow = KossEmployeeRow,
> = HeaderConfig<T>[];

export type KossEmployeeTableData<
  T extends KossEmployeeRow = KossEmployeeRow,
> = RowData<T>[];

export interface KossSummaryCardData {
  title: string;
  value: string;
  subValue?: React.ReactNode;
  description: string;
}

export interface KossFilterOptions {
  departments: string[];
  statuses: string[];
}

export interface KossViewProps<
  T extends KossEmployeeRow = KossEmployeeRow,
> extends Record<string, unknown> {
  selectedDate: string;
  startDate: string;
  endDate: string;
  currentPage: number;
  totalPages: number;
  progressItems: ProgressBarItem[];
  employeeHeaders: HeaderConfig<T>[];
  employeeData: RowData<T>[];
  summaryCards: KossSummaryCardData[];
  filterOptions: KossFilterOptions;
  onDateChange: (pickedValue: string) => void;
  onPageChange: (page: number) => void;
}
