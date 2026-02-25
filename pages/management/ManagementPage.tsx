import { useState, useEffect, useRef, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useFilterState, useModalState, usePagination } from "@/hooks";
import { BaseLoader, BaseTooltip, BaseIcon } from "@/components/common";
import { managementApi } from "@/api";
import { useToastStore } from "@/stores/toastStore";
import { getCompanyId, formatDate } from "@/utils";
import ManagementView from "./ManagementView";
import type {
  ManagementDepartment,
  ManagementEmployeeRow,
  ManagementNewEmployee,
  ManagementPermission,
  ManagementStatus,
  ManagementTableData,
  ManagementTableHeaders,
} from "@/types/pages/management";
import type {
  EmployeeListItem,
  OrganizationFilterItem,
  OrganizationApiResponse,
} from "@/types";

const ManagementPage = () => {
  const { t } = useTranslation("pages/management");

  // Toast store
  const { showToast } = useToastStore();

  // Filter states using custom hook
  const allOption = t("filter.options.all");
  const { filters, setFilter } = useFilterState({
    department: allOption,
    status: allOption,
    permission: allOption,
  });
  const [searchValue, setSearchValue] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");
  const [selectedRows, setSelectedRows] = useState<number[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<
    number | undefined
  >(undefined);

  // 정렬 상태 관리
  const [sortBy, setSortBy] = useState<"name" | "organization" | "usageCount">(
    "name"
  );
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // API 관련 states
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [employees, setEmployees] = useState<EmployeeListItem[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [totalEmployees, setTotalEmployees] = useState(0);
  const [totalMemberCount, setTotalMemberCount] = useState(0);
  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationFilterItem[]
  >([]);
  const [departments, setDepartments] = useState<ManagementDepartment[]>([]);
  const [inactiveCount, setInactiveCount] = useState(0);
  const [activeTab, setActiveTab] = useState<"active" | "inactive">("active");
  const [activeEmployeesCount, setActiveEmployeesCount] = useState(0);
  const [addEmployeeApiErrors, setAddEmployeeApiErrors] = useState<{
    employeeNumber?: string;
    email?: string;
    phone?: string;
  }>();

  // Pagination using custom hook
  const {
    currentPage,
    handlePageChange,
    reset: resetPagination,
  } = usePagination();

  // Modal states using custom hooks
  const addModal = useModalState();
  const deleteModal = useModalState();
  const permissionModal = useModalState();
  const departmentSelectModal = useModalState();

  // 임직원 추가 모달 닫기 핸들러 (API 에러 초기화 포함)
  const handleCloseAddModal = () => {
    setAddEmployeeApiErrors(undefined);
    addModal.close();
  };

  const statusOptions: ManagementStatus[] = useMemo(
    () => [allOption, t("filter.options.active"), t("filter.options.inactive")] as ManagementStatus[],
    [t, allOption]
  );
  const permissionOptions: ManagementPermission[] = useMemo(
    () => [allOption, t("permission.admin"), t("permission.user")] as ManagementPermission[],
    [t, allOption]
  );

  // 중복 호출 방지를 위한 ref
  const lastFetchKeyRef = useRef<string | null>(null);
  const organizationOptionsFetchedRef = useRef(false);
  const totalMemberCountFetchedRef = useRef(false);
  const departmentsFetchedRef = useRef(false);
  const activeEmployeesCountFetchedRef = useRef(false);
  const inactiveCountFetchedRef = useRef(false);

  // 활성화/비활성화 탭 변경 핸들러
  const handleTabChange = (tab: "active" | "inactive") => {
    lastFetchKeyRef.current = null; // 중복 호출 방지 키 초기화
    setActiveTab(tab);
    setSelectedRows([]);
    resetPagination();

    // 탭이 활성화로 변경되면 totalEmployees 업데이트
    if (tab === "active") {
      setTotalEmployees(activeEmployeesCount);
    }
    // 데이터 fetch는 useEffect에서 자동으로 실행됨 (activeTab이 dependency)
  };

  // 필터값을 API 파라미터로 변환
  const convertStatusToApi = (status: string): boolean | undefined => {
    if (!status || status === allOption) return undefined;
    if (status === t("filter.options.active")) return true;
    if (status === t("filter.options.inactive")) return false;
    return undefined;
  };

  const convertRoleToApi = (role: string): "USER" | "ADMIN" | undefined => {
    if (!role || role === allOption) return undefined;
    if (role === t("permission.admin")) return "ADMIN";
    if (role === t("permission.user")) return "USER";
    return undefined;
  };

  // 테이블 헤더 정의
  const headers: ManagementTableHeaders<ManagementEmployeeRow> = useMemo(
    () => [
      {
        key: "name",
        label: t("table.header.name"),
        width: "10%",
        sortable: true,
        align: "left",
      },
      {
        key: "department",
        label: (
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <span>{t("table.header.department")}</span>
            <BaseTooltip content={t("table.header.departmentTooltip")}>
              <BaseIcon name="tooltip" size={16} color="#9CA3AF" />
            </BaseTooltip>
          </div>
        ),
        width: "15%",
        sortable: false,
        align: "left",
      },
      { key: "jobPosition", label: t("table.header.jobPosition"), width: "8%", align: "left" },
      { key: "birthDate", label: t("table.header.birthDate"), width: "10%", align: "left" },
      { key: "gender", label: t("table.header.gender"), width: "6%", align: "left" },
      { key: "phone", label: t("table.header.phone"), width: "11%", align: "left" },
      {
        key: "usageCount",
        label: t("table.header.usageCount"),
        width: "7%",
        sortable: true,
        align: "left",
      },
      { key: "joinDate", label: t("table.header.joinDate"), width: "8%", align: "left" },
      {
        key: "lastUsedDate",
        label: t("table.header.lastUsedDate"),
        width: "8%",
        align: "left",
      },
      { key: "role", label: t("table.header.role"), width: "7%", align: "left" },
      {
        key: "status",
        label: activeTab === "inactive" ? "" : t("table.header.status"),
        width: "10%",
        align: "left",
      },
    ],
    [t, activeTab]
  );

  // 임직원 목록 조회
  const fetchEmployeeList = async () => {
    // 중복 호출 방지 (activeTab도 포함하여 탭 변경 시 항상 다시 fetch)
    const fetchKey = `active-employees-${searchTrigger}-${
      selectedDepartmentId ?? "all"
    }-${filters.status}-${
      filters.permission
    }-${sortBy}-${sortDirection}-${currentPage}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    setIsLoading(true);
    try {
      const response = await managementApi.getEmployeeList({
        searchKeyword: searchTrigger !== "" ? searchTrigger : undefined,
        organizationId: selectedDepartmentId,
        status: convertStatusToApi(filters.status),
        role: convertRoleToApi(filters.permission),
        sortBy: sortBy,
        sortDirection: sortDirection,
        page: currentPage - 1,
        size: 15,
      });

      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalEmployees(response.data.totalElements);

      // 최초 한 번만 전체 인원수 설정
      if (!activeEmployeesCountFetchedRef.current) {
        setActiveEmployeesCount(response.data.totalElements);
        activeEmployeesCountFetchedRef.current = true;
      }
      if (!inactiveCountFetchedRef.current) {
        setInactiveCount(response.data.inactiveMemberCount);
        inactiveCountFetchedRef.current = true;
      }
    } catch (error) {
      console.error("임직원 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  // 비활성 임직원 목록 조회
  const fetchInactiveEmployeeList = async () => {
    // 중복 호출 방지
    const fetchKey = `inactive-employees-${searchTrigger}-${
      selectedDepartmentId ?? "all"
    }-${filters.permission}-${sortBy}-${sortDirection}-${currentPage}`;
    if (lastFetchKeyRef.current === fetchKey) {
      return;
    }
    lastFetchKeyRef.current = fetchKey;

    setIsLoading(true);
    try {
      const response = await managementApi.getInactiveEmployeeList({
        searchKeyword: searchTrigger !== "" ? searchTrigger : undefined,
        organizationId: selectedDepartmentId,
        role: convertRoleToApi(filters.permission),
        sortBy: sortBy,
        sortDirection: sortDirection,
        page: currentPage - 1,
        size: 15,
      });

      setEmployees(response.data.content);
      setTotalPages(response.data.totalPages);
      setTotalEmployees(response.data.totalElements);

      // 최초 한 번만 비활성 인원수 설정
      if (!inactiveCountFetchedRef.current) {
        setInactiveCount(response.data.inactiveMemberCount);
        inactiveCountFetchedRef.current = true;
      }
    } catch (error) {
      console.error("비활성 임직원 목록 조회 실패:", error);
    } finally {
      setIsLoading(false);
      setIsInitialLoad(false);
    }
  };

  // 소속 필터 옵션 조회
  const fetchOrganizationOptions = async () => {
    // 중복 호출 방지 (초기 로드 시 한 번만)
    if (organizationOptionsFetchedRef.current) {
      return;
    }
    organizationOptionsFetchedRef.current = true;

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        console.error("회사 ID를 찾을 수 없습니다.");
        organizationOptionsFetchedRef.current = false;
        return;
      }

      const response = await managementApi.getOrganizationsForFilter({
        companyId,
        searchKeyword: undefined,
      });

      setOrganizationOptions(response.data);
    } catch (error) {
      console.error("소속 옵션 조회 실패:", error);
      organizationOptionsFetchedRef.current = false;
    }
  };

  // 전체 멤버 수 조회
  const fetchTotalMemberCount = async () => {
    // 중복 호출 방지 (초기 로드 시 한 번만)
    if (totalMemberCountFetchedRef.current) {
      return;
    }
    totalMemberCountFetchedRef.current = true;

    try {
      const response = await managementApi.getTotalMemberCount();
      setTotalMemberCount(response.data);
    } catch (error) {
      console.error("전체 멤버 수 조회 실패:", error);
      totalMemberCountFetchedRef.current = false;
    }
  };

  // 소속 조직 데이터 조회
  const fetchDepartments = async () => {
    // 중복 호출 방지 (초기 로드 시 한 번만)
    if (departmentsFetchedRef.current) {
      return;
    }
    departmentsFetchedRef.current = true;

    try {
      const companyId = getCompanyId();
      if (!companyId) {
        console.error("회사 ID를 찾을 수 없습니다.");
        departmentsFetchedRef.current = false;
        return;
      }

      const response = await managementApi.getOrganizations(companyId);

      // API 응답을 ManagementDepartment 형식으로 변환
      // orgLevel 1 (본부) > orgLevel 2 (부서) > orgLevel 3 (팀) 구조로 변환
      const convertedDepartments: ManagementDepartment[] = response.data
        .filter((org: OrganizationApiResponse) => org.orgLevel === 1) // 1depth만 필터
        .map((org1: OrganizationApiResponse) => ({
          id: org1.id,
          organizationId: org1.companyId,
          name: org1.orgName,
          subDepartments: org1.children
            .filter((org2: OrganizationApiResponse) => org2.orgLevel === 2) // 2depth 필터
            .map((org2: OrganizationApiResponse) => ({
              id: org2.id,
              organizationId: org2.companyId,
              name: org2.orgName,
              teams: org2.children
                .filter((org3: OrganizationApiResponse) => org3.orgLevel === 3) // 3depth 필터
                .map((org3: OrganizationApiResponse) => ({
                  id: org3.id,
                  organizationId: org3.companyId,
                  name: org3.orgName,
                })),
            })),
        }));

      setDepartments(convertedDepartments);
    } catch (error) {
      console.error("소속 조직 데이터 조회 실패:", error);
      departmentsFetchedRef.current = false;
    }
  };

  // API 데이터를 테이블 데이터로 변환
  const tableData: ManagementTableData<ManagementEmployeeRow> = employees.map(
    (employee) => {
      const isAdmin = employee.role === "ADMIN";
      const isSuperAdmin = employee.role === "SUPER_ADMIN";
      const showTag = isAdmin || isSuperAdmin;

      return {
        id: employee.id,
        name: showTag
          ? {
              type: "custom" as const,
              value: employee.name,
              render: (value: unknown) => (
                <div
                  style={{
                    position: "relative",
                    width: "100%",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: 400,
                      lineHeight: "150%",
                      color: "#000000",
                      display: "block",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {String(value)}
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "calc(100% + 8px)",
                      transform: "translateY(-50%)",
                      display: "inline-flex",
                      alignItems: "center",
                      justifyContent: "center",
                      height: "19px",
                      borderRadius: "16px",
                      fontSize: "11px",
                      fontWeight: 400,
                      lineHeight: "140%",
                      padding: "0 4px",
                      backgroundColor: "#F6F7F8",
                      color: "#333333",
                      flexShrink: 0,
                      whiteSpace: "nowrap",
                    }}
                  >
                    {t("permission.admin")}
                  </span>
                </div>
              ),
            }
          : employee.name,
        department: employee.organization,
        jobPosition: employee.jobPosition ?? "-",
        birthDate: employee.birthDate
          ? formatDate(employee.birthDate, "YYYY.MM.DD")
          : "-",
        gender: employee.gender ?? "-",
        phone: employee.phone,
        usageCount: employee.usageCount,
        joinDate: formatDate(employee.joinDate, "YYYY.MM.DD"),
        lastUsedDate: employee.lastUsedDate
          ? formatDate(employee.lastUsedDate, "YYYY.MM.DD")
          : "-",
        role: (isSuperAdmin
          ? t("permission.superAdmin")
          : isAdmin
          ? t("permission.admin")
          : t("permission.user")) as ManagementPermission,
        status:
          activeTab === "inactive" && !employee.status
            ? {
                type: "tag",
                value: t("status.deactivated"),
                variant: "inactive",
              }
            : {
                type: "tag",
                value: employee.status ? t("status.active") : t("status.inactive"),
                variant: employee.status ? "active" : "inactive",
              },
      };
    }
  );

  // 소속 옵션을 이름 배열로 변환 (화면 표시용)
  const departmentOptions = [
    allOption,
    ...organizationOptions.map((org) => org.orgName),
  ];

  // 초기 로드
  useEffect(() => {
    fetchOrganizationOptions();
    fetchTotalMemberCount();
    fetchDepartments();
  }, []);

  // 필터 변경 시 데이터 재조회
  useEffect(() => {
    if (activeTab === "inactive") {
      fetchInactiveEmployeeList();
    } else {
      fetchEmployeeList();
    }
  }, [currentPage, filters, searchTrigger, sortBy, sortDirection, activeTab]);

  // 페이지 변경 시 체크박스 초기화
  useEffect(() => {
    setSelectedRows([]);
  }, [currentPage]);

  // Modal action handlers
  const handleAddEmployee = async (employee: ManagementNewEmployee) => {
    // API 에러 초기화
    setAddEmployeeApiErrors(undefined);

    try {
      await managementApi.createEmployee({
        name: employee.name,
        employeeNumber: employee.employeeNumber,
        organizationId: employee.organizationId,
        phone: employee.phone,
        jobPosition: employee.jobPosition,
        birthDate: employee.birthDate,
        gender: employee.gender,
      });

      showToast(t("toast.addEmployeeSuccess"), "success");

      // 목록 새로고침을 위해 fetchKey 초기화
      lastFetchKeyRef.current = null;
      await fetchEmployeeList();

      // 모달 닫기 (handleCloseAddModal을 통해 에러도 초기화됨)
      handleCloseAddModal();
    } catch (error: unknown) {
      console.error("임직원 추가 실패:", error);

      // API 에러 응답 파싱
      if (error && typeof error === "object" && "response" in error) {
        const axiosError = error as {
          response?: {
            data?: {
              message?: string;
              errors?: Array<{
                field: string;
                value: string;
                reason: string;
              }>;
            };
          };
        };

        const responseData = axiosError.response?.data;

        // errors 배열이 있으면 필드별 에러 메시지 설정
        if (responseData?.errors && responseData.errors.length > 0) {
          const fieldErrors: {
            employeeNumber?: string;
            email?: string;
            phone?: string;
          } = {};

          responseData.errors.forEach((error) => {
            if (error.field === "employeeNumber") {
              fieldErrors.employeeNumber = error.reason;
            } else if (error.field === "email") {
              fieldErrors.email = error.reason;
            } else if (error.field === "phone") {
              fieldErrors.phone = error.reason;
            }
          });

          setAddEmployeeApiErrors(fieldErrors);
          return;
        }

        // errors 배열이 없으면 일반 에러 메시지 토스트로 표시
        const errorMessage =
          responseData?.message || t("toast.addEmployeeFailed");
        showToast(errorMessage, "error");
      } else {
        showToast(t("toast.addEmployeeFailed"), "error");
      }
    }
  };

  const handleDeleteEmployee = async () => {
    try {
      // selectedRows는 인덱스 배열이므로, 실제 ID로 변환 필요
      const selectedIds = selectedRows.map((index) => employees[index].id);

      for (const id of selectedIds) {
        await managementApi.deleteMember(id);
      }

      showToast(t("toast.deleteEmployeeSuccess"), "success");
      setSelectedRows([]);
      deleteModal.close();

      // 목록 새로고침을 위해 fetchKey 초기화
      lastFetchKeyRef.current = null;
      await fetchEmployeeList();
    } catch (error) {
      console.error("임직원 삭제 실패:", error);
      showToast(t("toast.deleteEmployeeFailed"), "error");
    }
  };

  const handleChangePermission = async (permission: ManagementPermission) => {
    try {
      // "전체"는 권한 변경 불가
      if (permission === allOption) {
        console.error("유효하지 않은 권한입니다.");
        return;
      }

      // selectedRows는 인덱스 배열이므로, 실제 ID로 변환 필요
      const selectedIds = selectedRows.map((index) => employees[index].id);

      const role = permission === "관리자" ? "ADMIN" : "USER";

      for (const id of selectedIds) {
        await managementApi.updateMemberRole(id, { role });
      }

      showToast(t("toast.changePermissionSuccess"), "success");
      setSelectedRows([]);
      permissionModal.close();

      // 목록 새로고침을 위해 fetchKey 초기화
      lastFetchKeyRef.current = null;
      await fetchEmployeeList();
    } catch (error) {
      console.error("권한 변경 실패:", error);
      showToast(t("toast.changePermissionFailed"), "error");
    }
  };

  const handleDepartmentFilterChange = (value: string) => {
    setSearchTrigger(searchValue);
    setFilter("department", value);
    // "전체" 선택 시 organizationId를 undefined로 설정
    if (value === allOption) {
      setSelectedDepartmentId(undefined);
    }
  };

  const handleSelectDepartment = (
    departmentName: string,
    departmentId: number
  ) => {
    setSearchTrigger(searchValue);
    setFilter("department", departmentName);
    setSelectedDepartmentId(departmentId);
    departmentSelectModal.close();
  };

  const handleResetDepartment = () => {
    setFilter("department", allOption);
    setSelectedDepartmentId(undefined);
    setSearchTrigger(searchValue);
    departmentSelectModal.close();
  };

  const handleStatusFilterChange = (value: string) => {
    setSearchTrigger(searchValue);
    setFilter("status", value);
  };

  const handlePermissionFilterChange = (value: string) => {
    setSearchTrigger(searchValue);
    setFilter("permission", value);
  };

  const handleSearchChange = (value: string) => {
    setSearchValue(value);
  };

  const handleSearch = (value: string) => {
    setSearchTrigger(value);
    // 검색 실행 시 첫 페이지로 이동 (페이지는 1부터 시작)
    handlePageChange(1);
  };

  const handleFilterReset = () => {
    setFilter("department", allOption);
    setFilter("status", allOption);
    setFilter("permission", allOption);
    setSelectedDepartmentId(undefined);
    setSearchValue("");
    setSearchTrigger("");
    handlePageChange(1);
  };

  // 테이블 정렬 핸들러
  const handleSort = (
    key: keyof ManagementEmployeeRow,
    direction: "asc" | "desc"
  ) => {
    // ManagementEmployeeRow의 key를 API의 sortBy 타입으로 변환
    const sortByMap: Record<string, "name" | "organization" | "usageCount"> = {
      name: "name",
      department: "organization",
      usageCount: "usageCount",
    };

    const apiSortBy = sortByMap[String(key)];
    if (apiSortBy) {
      setSortBy(apiSortBy);
      setSortDirection(direction);
      // 정렬 변경 시 첫 페이지로 이동
      handlePageChange(1);
    }
  };

  if (isLoading && isInitialLoad) {
    return <BaseLoader />;
  }

  return (
    <ManagementView
      // Filter states
      selectedDepartment={filters.department}
      selectedStatus={filters.status}
      selectedPermission={filters.permission}
      searchValue={searchValue}
      onDepartmentChange={handleDepartmentFilterChange}
      onStatusChange={handleStatusFilterChange}
      onPermissionChange={handlePermissionFilterChange}
      onSearchChange={handleSearchChange}
      onSearch={handleSearch}
      onFilterReset={handleFilterReset}
      // Table
      headers={headers}
      data={tableData}
      selectedRows={selectedRows}
      onSelectRow={setSelectedRows}
      onSort={handleSort}
      // Pagination
      currentPage={currentPage}
      totalPages={totalPages}
      totalEmployees={totalEmployees}
      totalMemberCount={totalMemberCount}
      onPageChange={handlePageChange}
      // Modal states
      isAddModalOpen={addModal.isOpen}
      isDeleteModalOpen={deleteModal.isOpen}
      isPermissionModalOpen={permissionModal.isOpen}
      isDepartmentSelectModalOpen={departmentSelectModal.isOpen}
      onOpenAddModal={addModal.open}
      onOpenDeleteModal={deleteModal.open}
      onOpenPermissionModal={permissionModal.open}
      onOpenDepartmentSelectModal={departmentSelectModal.open}
      onCloseAddModal={handleCloseAddModal}
      onCloseDeleteModal={deleteModal.close}
      onClosePermissionModal={permissionModal.close}
      onCloseDepartmentSelectModal={departmentSelectModal.close}
      // Modal actions
      onAddEmployee={handleAddEmployee}
      onDeleteEmployee={handleDeleteEmployee}
      onChangePermission={handleChangePermission}
      onSelectDepartment={handleSelectDepartment}
      onResetDepartment={handleResetDepartment}
      // Data
      departments={departments}
      departmentOptions={departmentOptions}
      statusOptions={statusOptions}
      permissionOptions={permissionOptions}
      employees={employees}
      selectedDepartmentId={selectedDepartmentId}
      // Tab states
      activeTab={activeTab}
      inactiveCount={inactiveCount}
      activeEmployeesCount={activeEmployeesCount}
      onTabChange={handleTabChange}
      // API errors
      addEmployeeApiErrors={addEmployeeApiErrors}
    />
  );
};

export default ManagementPage;
