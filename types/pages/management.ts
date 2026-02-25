import type { ChangeEvent, FormEvent } from "react";
import type { HeaderConfig, RowData } from "@/types/common";
import type { EmployeeListItem } from "@/types/api";

export type ManagementFilterKey = "department" | "status" | "permission";

export type ManagementPermission = "전체" | "관리자" | "일반" | "최고관리자";

export type ManagementStatus =
  | "전체"
  | "정상"
  | "이용 중"
  | "이용 종료"
  | "이용 전";

export interface ManagementTeam extends Record<string, unknown> {
  id: number;
  organizationId: number;
  name: string;
}

export interface ManagementSubDepartment extends Record<string, unknown> {
  id: number;
  organizationId: number;
  name: string;
  teams: ManagementTeam[];
}

export interface ManagementDepartment extends Record<string, unknown> {
  id: number;
  organizationId: number;
  name: string;
  subDepartments: ManagementSubDepartment[];
}

export interface ManagementEmployeeRow extends Record<string, unknown> {
  name: string;
  department: string;
  jobPosition: string;
  birthDate: string;
  gender: string;
  phone: string;
  usageCount: number;
  joinDate: string;
  lastUsedDate: string;
  role: ManagementPermission;
  status: ManagementStatus;
}

export type ManagementTableHeaders<
  T extends ManagementEmployeeRow = ManagementEmployeeRow
> = HeaderConfig<T>[];

export type ManagementTableData<
  T extends ManagementEmployeeRow = ManagementEmployeeRow
> = RowData<T>[];

export type ManagementRowSelectionHandler = (rows: number[]) => void;

export type ManagementPaginationHandler = (page: number) => void;

export interface ManagementNewEmployee extends Record<string, unknown> {
  name: string;
  department: string;
  organizationId: number;
  employeeNumber: string;
  phone: string;
  jobPosition: string;
  birthDate: string;
  gender: string;
}

export type ManagementPermissionChangeHandler = (
  permission: ManagementPermission
) => void;

export type ManagementEmployeeSubmitHandler = (
  employee: ManagementNewEmployee
) => Promise<void>;

export type ManagementSearchHandler = (value: string) => void;

export interface ManagementViewProps<
  T extends ManagementEmployeeRow = ManagementEmployeeRow
> extends Record<string, unknown> {
  selectedDepartment: string;
  selectedStatus: string;
  selectedPermission: string;
  searchValue: string;
  onDepartmentChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onPermissionChange: (value: string) => void;
  onSearchChange: ManagementSearchHandler;
  onSearch: ManagementSearchHandler;
  onFilterReset: () => void;
  headers: HeaderConfig<T>[];
  data: RowData<T>[];
  selectedRows: number[];
  onSelectRow: ManagementRowSelectionHandler;
  onSort?: (key: keyof T, direction: "asc" | "desc") => void;
  currentPage: number;
  totalPages: number;
  totalEmployees: number;
  totalMemberCount: number;
  onPageChange: ManagementPaginationHandler;
  isAddModalOpen: boolean;
  isDeleteModalOpen: boolean;
  isPermissionModalOpen: boolean;
  isDepartmentSelectModalOpen: boolean;
  onOpenAddModal: () => void;
  onOpenDeleteModal: () => void;
  onOpenPermissionModal: () => void;
  onOpenDepartmentSelectModal: () => void;
  onCloseAddModal: () => void;
  onCloseDeleteModal: () => void;
  onClosePermissionModal: () => void;
  onCloseDepartmentSelectModal: () => void;
  onAddEmployee: ManagementEmployeeSubmitHandler;
  onDeleteEmployee: () => void;
  onChangePermission: ManagementPermissionChangeHandler;
  onSelectDepartment: (departmentName: string, departmentId: number) => void;
  onResetDepartment: () => void;
  departments: ManagementDepartment[];
  departmentOptions: string[];
  statusOptions: ManagementStatus[];
  permissionOptions: ManagementPermission[];
  employees: EmployeeListItem[];
  selectedDepartmentId?: number;
  activeTab: "active" | "inactive";
  inactiveCount: number;
  activeEmployeesCount: number;
  onTabChange: (tab: "active" | "inactive") => void;
  addEmployeeApiErrors?: {
    employeeNumber?: string;
    email?: string;
    phone?: string;
  };
}

export interface ChangePermissionModalProps extends Record<string, unknown> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: ManagementPermissionChangeHandler;
  employeeName?: string;
  employeeDepartment?: string;
  employeeEmail?: string;
  currentPermission?: ManagementPermission;
}

export interface DeleteEmployeeModalProps extends Record<string, unknown> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employees: EmployeeListItem[];
}

export interface AddEmployeeModalProps extends Record<string, unknown> {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: ManagementEmployeeSubmitHandler;
  departments: ManagementDepartment[];
  apiErrors?: {
    employeeNumber?: string;
    email?: string;
    phone?: string;
  };
}

export type ManagementInputChangeHandler = (
  event: ChangeEvent<HTMLInputElement>
) => void;

export type ManagementFormSubmitHandler = (
  event: FormEvent<HTMLFormElement>
) => void;

export interface DepartmentSelectModalProps extends Record<string, unknown> {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (departmentName: string, departmentId: number) => void;
  onReset: () => void;
  selectedDepartment: string;
  selectedDepartmentId?: number;
  departments: ManagementDepartment[];
}
