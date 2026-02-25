import type { HeaderConfig, RowData, SortDirection } from "@/types/common";

export type PartnerSortDirection = SortDirection;

export interface PartnerDepartmentRow extends Record<string, unknown> {
  id: string;
  rank: number;
  department: string;
  usage: number;
  ratio: string;
}

export interface PartnerServiceRow extends Record<string, unknown> {
  id: string;
  rank: number;
  serviceName: string;
  userCount: number;
  purchaseCount: number;
  totalAmount: string;
  repurchaseRate: string;
}

export type PartnerDepartmentHeaders<
  T extends PartnerDepartmentRow = PartnerDepartmentRow,
> = HeaderConfig<T>[];

export type PartnerDepartmentData<
  T extends PartnerDepartmentRow = PartnerDepartmentRow,
> = RowData<T>[];

export type PartnerServiceHeaders<
  T extends PartnerServiceRow = PartnerServiceRow,
> = HeaderConfig<T>[];

export type PartnerServiceData<
  T extends PartnerServiceRow = PartnerServiceRow,
> = RowData<T>[];

export interface PartnerStatsCardData {
  label: string;
  value: number;
}

export interface PartnerViewProps<
  D extends PartnerDepartmentRow = PartnerDepartmentRow,
  S extends PartnerServiceRow = PartnerServiceRow,
> extends Record<string, unknown> {
  selectedDate: string;
  startDate: string;
  endDate: string;
  currentDeptPage: number;
  totalDeptPages: number;
  currentServicePage: number;
  totalServicePages: number;
  searchValue: string;
  deptSortKey: keyof D;
  deptSortDirection: PartnerSortDirection;
  serviceSortKey: keyof S;
  serviceSortDirection: PartnerSortDirection;
  statsCards: PartnerStatsCardData[];
  xAxisData: string[];
  seriesData: number[];
  departmentHeaders: HeaderConfig<D>[];
  departmentData: RowData<D>[];
  serviceHeaders: HeaderConfig<S>[];
  serviceData: RowData<S>[];
  isDepartmentTableEmpty: boolean;
  isSearchActive: boolean;
  onDateChange: (pickedValue: string) => void;
  onDeptSort: (key: keyof D, direction: PartnerSortDirection) => void;
  onServiceSort: (key: keyof S, direction: PartnerSortDirection) => void;
  onDeptPageChange: (page: number) => void;
  onServicePageChange: (page: number) => void;
  onDeptSearchChange: (value: string) => void;
  onDeptSearch: (value: string) => void;
}

export interface PartnerPageState extends Record<string, unknown> {
  currentDeptPage: number;
  currentServicePage: number;
  searchValue: string;
  deptSortKey: keyof PartnerDepartmentRow;
  deptSortDirection: PartnerSortDirection;
  serviceSortKey: keyof PartnerServiceRow;
  serviceSortDirection: PartnerSortDirection;
}
