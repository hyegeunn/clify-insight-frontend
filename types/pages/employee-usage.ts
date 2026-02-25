import type {
  HeaderConfig,
  RowData,
  SortDirection,
} from "@/types/common";
import type { ManagementDepartment } from "@/types/pages/management";

export interface EmployeeUsageRecord extends Record<string, string | number> {
  memberId: number;
  employeeNumber: string;
  memberName: string;
  organizationName: string;
  usageCount: number;
  totalAmount: number;
  pointAmount: number;
  cardAmount: number;
  representativeSolutionName: string;
  lastUsedDate: string;
}

export type EmployeeUsageTableHeader = HeaderConfig<EmployeeUsageRecord>;
export type EmployeeUsageTableRow = RowData<EmployeeUsageRecord>;

export interface EmployeeUsageData {
  memberId: number;
  employeeNumber: string;
  memberName: string;
  organizationName: string; 
  usageCount: number;
  totalAmount: number;
  pointAmount: number;
  cardAmount: number;
  representativeSolutionName: string;
  lastUsedDate: string;
}

export interface EmployeeDetailHistoryItem {
  title: string;
  paidAt: string;
  amount: string;
  paymentType: string;
}

export interface EmployeeUsageViewProps {
  selectedDate: string;
  startDate: string;
  endDate: string;
  headers: EmployeeUsageTableHeader[];
  tableData: EmployeeUsageTableRow[];
  currentPage: number;
  totalPages: number;
  selectedDepartment: string;
  departmentOptions: string[];
  employeeTotalCount: number;
  isModalOpen: boolean;
  selectedEmployee: EmployeeUsageData | null;
  detailHistory: EmployeeDetailHistoryItem[];
  detailHistoryCount: number;
  detailHistoryLoading: boolean;
  isExcelDownloading: boolean;
  sortKey: keyof EmployeeUsageRecord;
  sortDirection: SortDirection;
  onSortChange: (
    key: keyof EmployeeUsageRecord,
    direction: SortDirection
  ) => void;
  onDateChange: (pickedValue: string) => void;
  onPageChange: (page: number) => void;
  onFilterReset: () => void;
  onRowClick: (row: EmployeeUsageTableRow, rowIndex: number) => void;
  onDownloadExcel: () => void;
  onCloseModal: () => void;
  isDepartmentSelectModalOpen: boolean;
  onOpenDepartmentSelectModal: () => void;
  onCloseDepartmentSelectModal: () => void;
  onSelectDepartment: (departmentName: string, departmentId: number) => void;
  onResetDepartment: () => void;
  departments: ManagementDepartment[];
  selectedDepartmentId?: number;
}
