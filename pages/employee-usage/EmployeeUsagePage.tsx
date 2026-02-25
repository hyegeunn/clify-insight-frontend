import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { managementApi, paymentsApi } from "@/api";
import { BaseLoader } from "@/components/common";
import {
  usePagination,
  useFilterState,
  useModalState,
  useDateRange,
} from "@/hooks";
import { toTextCell, toCurrencyCell, formatCurrency, getCompanyId } from "@/utils";
import type {
  EmployeeDetailHistoryItem,
  EmployeeUsageData,
  EmployeeUsageRecord,
  EmployeeUsageTableHeader,
  EmployeeUsageTableRow,
} from "@/types/pages/employee-usage";
import type {
  EmployeeUsagePaymentsItem,
  MemberFilterOptionsResponse,
  SortDirection,
  OrganizationApiResponse,
} from "@/types";
import type { ManagementDepartment } from "@/types/pages/management";
import EmployeeUsageView from "./EmployeeUsageView";

type EmployeeUsageSortKey = Extract<keyof EmployeeUsageRecord, string>;

const DEFAULT_SORT_FIELD: EmployeeUsageSortKey = "";
const DEFAULT_SORT_DIRECTION: SortDirection = "desc";

const formatDateDisplay = (value: string): string =>
  value ? value.replaceAll("-", ".") : "";

const formatDetailAmountValue = (value: unknown): string => {
  if (typeof value === "number") {
    return formatCurrency(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return "";
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return formatCurrency(numeric);
    }

    const numericFromDigits = Number(trimmed.replace(/[^0-9.-]/g, ""));
    if (!Number.isNaN(numericFromDigits) && trimmed.replace(/[^0-9.-]/g, "") !== "") {
      return formatCurrency(numericFromDigits);
    }

    return trimmed;
  }

  if (typeof value === "bigint") {
    return formatCurrency(Number(value));
  }

  return "";
};

const formatDetailDateValue = (value: unknown, weekdayLabels: readonly string[]): string => {
  if (typeof value !== "string" || !value) {
    return "";
  }

  if (value.includes("(") && value.includes(".")) {
    return value;
  }

  const normalizedValue = value.replace(" ", "T");
  let date = new Date(normalizedValue);

  if (Number.isNaN(date.getTime())) {
    const [datePart] = value.split("T");
    if (!datePart) {
      return "";
    }

    const [year, month, day] = datePart.split("-");
    if (!year || !month || !day) {
      return "";
    }

    date = new Date(Number(year), Number(month) - 1, Number(day));
    if (Number.isNaN(date.getTime())) {
      return "";
    }
  }

  const year = String(date.getFullYear());
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const weekday = weekdayLabels[date.getDay()];

  return `${year}.${month}.${day}(${weekday})`;
};

const convertOrganizationsToDepartments = (
  organizations: OrganizationApiResponse[]
): ManagementDepartment[] => {
  return organizations
    .filter((org) => org.orgLevel === 1)
    .map((org1) => ({
      id: org1.id,
      organizationId: org1.companyId,
      name: org1.orgName,
      subDepartments: org1.children
        .filter((org2) => org2.orgLevel === 2)
        .map((org2) => ({
          id: org2.id,
          organizationId: org2.companyId,
          name: org2.orgName,
          teams: org2.children
            .filter((org3) => org3.orgLevel === 3)
            .map((org3) => ({
              id: org3.id,
              organizationId: org3.companyId,
              name: org3.orgName,
            })),
        })),
    }));
};

const formatMonthParam = (startDate: string): string => {
  if (!startDate) {
    return "";
  }
  const parts = startDate.split(".");
  if (parts.length < 2) {
    return "";
  }
  const [year, month] = parts;
  if (!year || !month) {
    return "";
  }
  return `${year}-${month.padStart(2, "0")}`;
};

const EmployeeUsagePage = () => {
  const { t, i18n } = useTranslation("pages/employeeUsage");
  const weekdayLabels = [
    t("weekday.sunday"),
    t("weekday.monday"),
    t("weekday.tuesday"),
    t("weekday.wednesday"),
    t("weekday.thursday"),
    t("weekday.friday"),
    t("weekday.saturday"),
  ] as const;
  const {
    selectedDate,
    startDate,
    endDate,
    handleDateChange: handleRawDateChange,
  } = useDateRange();
  const { currentPage, itemsPerPage, handlePageChange, reset } = usePagination();
  const { filters, setFilter } = useFilterState({
    department: "",
  });
  const modal = useModalState();
  const departmentSelectModal = useModalState();
  const [selectedEmployee, setSelectedEmployee] =
    useState<EmployeeUsageData | null>(null);
  const [departmentOptions, setDepartmentOptions] = useState<string[]>([]);
  const [departments, setDepartments] = useState<ManagementDepartment[]>([]);
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<number | undefined>(undefined);
  const [employeeUsageItems, setEmployeeUsageItems] = useState<
    EmployeeUsagePaymentsItem[]
  >([]);
  const [employeeTotalCount, setEmployeeTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const filterOptionsFetchedRef = useRef(false);
  const departmentsFetchedRef = useRef(false);
  const lastFetchParamsRef = useRef<string>("");
  const [sortField, setSortField] =
    useState<EmployeeUsageSortKey>(DEFAULT_SORT_FIELD);
  const [sortDirection, setSortDirection] =
    useState<SortDirection>(DEFAULT_SORT_DIRECTION);
  const [detailHistory, setDetailHistory] = useState<EmployeeDetailHistoryItem[]>([]);
  const [detailHistoryCount, setDetailHistoryCount] = useState(0);
  const [detailHistoryLoading, setDetailHistoryLoading] = useState(false);
  const [isExcelDownloading, setIsExcelDownloading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const detailHistoryRequestIdRef = useRef(0);
  const prevLanguageRef = useRef<string>("");

  const resetDetailHistory = useCallback(() => {
    setDetailHistory([]);
    setDetailHistoryCount(0);
    setDetailHistoryLoading(false);
    detailHistoryRequestIdRef.current += 1;
  }, []);

  const resetEmployeeUsageData = useCallback(() => {
    setEmployeeUsageItems([]);
    setEmployeeTotalCount(0);
    setTotalPages(0);
    setSelectedEmployee(null);
    resetDetailHistory();
  }, [resetDetailHistory]);

  const fetchFilterOptions = useCallback(async () => {
    if (filterOptionsFetchedRef.current) {
      return;
    }

    filterOptionsFetchedRef.current = true;

    try {
      const response = await managementApi.getMemberFilterOptions();
      if (!response.success) {
        filterOptionsFetchedRef.current = false;
        return;
      }

      const data: MemberFilterOptionsResponse | undefined = response.data;
      const affiliations = data?.affiliations ?? [];

      setDepartmentOptions([
        t("filter.options.all"),
        ...affiliations.map((item) => item.name),
      ]);
    } catch (error) {
      console.error(error);
      filterOptionsFetchedRef.current = false;
    }
  }, [t]);

  useEffect(() => {
    fetchFilterOptions();
  }, [fetchFilterOptions]);

  useEffect(() => {
    if (filters.department === "") {
      setFilter("department", t("filter.options.all"));
    }
  }, [filters.department, setFilter, t]);

  useEffect(() => {
    const currentLanguage = i18n.language;

    if (prevLanguageRef.current && prevLanguageRef.current !== currentLanguage) {
      const allOption = t("filter.options.all");

      if (filters.department === "전체" || filters.department === "All") {
        setFilter("department", allOption);
      }

      if (departmentOptions.length > 0) {
        const currentFirstOption = departmentOptions[0];
        if (currentFirstOption === "전체" || currentFirstOption === "All") {
          setDepartmentOptions([
            allOption,
            ...departmentOptions.slice(1),
          ]);
        }
      }
    }

    prevLanguageRef.current = currentLanguage;
  }, [i18n.language, t, filters.department, departmentOptions, setFilter]);

  const fetchDepartments = useCallback(async () => {
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
      const convertedDepartments = convertOrganizationsToDepartments(response.data);
      setDepartments(convertedDepartments);
    } catch (error) {
      console.error("소속 조직 데이터 조회 실패:", error);
      departmentsFetchedRef.current = false;
    }
  }, []);

  useEffect(() => {
    fetchDepartments();
  }, [fetchDepartments]);

  const monthParam = useMemo(() => formatMonthParam(startDate), [startDate]);

  const loadDetailHistory = useCallback(
    async (memberId?: number) => {
      if (!memberId || !monthParam) {
        resetDetailHistory();
        return;
      }

      const requestId = detailHistoryRequestIdRef.current + 1;
      detailHistoryRequestIdRef.current = requestId;

      setDetailHistoryLoading(true);
      setDetailHistory([]);
      setDetailHistoryCount(0);

      try {
        const response = await paymentsApi.getEmployeeUsageContract(memberId, monthParam);

        if (detailHistoryRequestIdRef.current !== requestId) {
          return;
        }

        if (!response.success) {
          setDetailHistory([]);
          setDetailHistoryCount(0);
          return;
        }

        const {
          totalCount = 0,
          items: historyItems = [],
        } = response.data ?? {};

        const normalizedHistory: EmployeeDetailHistoryItem[] = historyItems
          .filter(Boolean)
          .map((historyItem) => ({
            title: historyItem?.serviceName || "-",
            paidAt: formatDetailDateValue(historyItem?.paidAt ?? "", weekdayLabels),
            amount: formatDetailAmountValue(historyItem?.amount ?? ""),
            paymentType: historyItem?.paymentMethod ?? "",
          }));

        setDetailHistory(normalizedHistory);
        setDetailHistoryCount(
          typeof totalCount === "number" ? totalCount : normalizedHistory.length
        );
      } catch (error) {
        console.error(error);
        if (detailHistoryRequestIdRef.current === requestId) {
          setDetailHistory([]);
          setDetailHistoryCount(0);
        }
      } finally {
        if (detailHistoryRequestIdRef.current === requestId) {
          setDetailHistoryLoading(false);
        }
      }
    },
    [monthParam, resetDetailHistory]
  );

  const organizationId = selectedDepartmentId;

  const fetchEmployeeUsage = useCallback(async () => {
    if (!monthParam) {
      return;
    }

    const fetchKey = JSON.stringify({
      month: monthParam,
      organizationId: organizationId ?? null,
      sortField,
      sortDirection,
      page: currentPage - 1,
      size: itemsPerPage,
    });

    if (fetchKey === lastFetchParamsRef.current) {
      return;
    }

    lastFetchParamsRef.current = fetchKey;

    if (isInitialLoading) {
      setIsInitialLoading(true);
    }

    try {
      const response = await paymentsApi.getEmployeeUsage({
        month: monthParam,
        organizationId,
        sortField,
        sortDirection,
        page: currentPage - 1,
        size: itemsPerPage,
      });

      if (!response.success) {
        lastFetchParamsRef.current = "";
        resetEmployeeUsageData();
        return;
      }

      const {
        employees,
        totalCount,
        totalPages: pageCount,
      } = response.data;

      setEmployeeUsageItems(employees ?? []);
      setEmployeeTotalCount(totalCount ?? 0);
      setTotalPages(pageCount ?? 0);
      setSelectedEmployee(null);
      resetDetailHistory();
      lastFetchParamsRef.current = fetchKey;
    } catch (error) {
      console.error(error);
      lastFetchParamsRef.current = "";
      resetEmployeeUsageData();
    } finally {
      setIsInitialLoading(false);
    }
  }, [
    currentPage,
    itemsPerPage,
    monthParam,
    organizationId,
    sortField,
    sortDirection,
    isInitialLoading,
    resetEmployeeUsageData,
    resetDetailHistory,
  ]);

  useEffect(() => {
    fetchEmployeeUsage();
  }, [fetchEmployeeUsage]);

  const headers: EmployeeUsageTableHeader[] = useMemo(
    () => [
      {
        key: "employeeNumber",
        label: t("table.header.employeeNumber"),
        width: "14%",
        sortable: true,
        align: "left",
      },
      {
        key: "organizationName",
        label: t("table.header.department"),
        width: "14%",
        sortable: false,
        align: "left",
      },
      {
        key: "usageCount",
        label: t("table.header.usageCount"),
        width: "14%",
        sortable: true,
        align: "left",
      },
      {
        key: "totalAmount",
        label: t("table.header.totalAmount"),
        width: "14%",
        sortable: true,
        align: "left",
      },
      {
        key: "pointAmount",
        label: t("table.header.pointAmount"),
        width: "14%",
        sortable: false,
        align: "left",
      },
      {
        key: "cardAmount",
        label: t("table.header.cardAmount"),
        width: "14%",
        sortable: false,
        align: "left",
      },
      {
        key: "lastUsedDate",
        label: t("table.header.lastUsedDate"),
        width: "14%",
        sortable: true,
        align: "left",
      },
    ],
    [t]
  );

  const tableData: EmployeeUsageTableRow[] = useMemo(
    () =>
      employeeUsageItems.map((item) => ({
        memberId: toTextCell(item.memberId),
        employeeNumber: toTextCell(item.employeeNumber),
        memberName: toTextCell(item.memberName),
        organizationName: toTextCell(item.organizationName),
        usageCount: toTextCell(item.usageCount),
        totalAmount: toCurrencyCell(item.totalAmount),
        pointAmount: toCurrencyCell(item.pointAmount),
        cardAmount: toCurrencyCell(item.cardAmount),
        representativeSolutionName: toTextCell(item.representativeSolutionName),
        lastUsedDate: toTextCell(formatDateDisplay(item.lastUsedDate)),
      })),
    [employeeUsageItems]
  );
  
  const handleSelectDepartment = useCallback(
    (departmentName: string, departmentId: number) => {
      setFilter("department", departmentName);
      setSelectedDepartmentId(departmentId);
      departmentSelectModal.close();
      reset();
    },
    [reset, setFilter, departmentSelectModal]
  );

  const handleResetDepartment = useCallback(() => {
    setFilter("department", t("filter.options.all"));
    setSelectedDepartmentId(undefined);
    departmentSelectModal.close();
    reset();
  }, [reset, setFilter, departmentSelectModal, t]);

  const handleFilterReset = useCallback(() => {
    setFilter("department", t("filter.options.all"));
    setSelectedDepartmentId(undefined);
    reset();
  }, [reset, setFilter, t]);

  const handleDateChange = useCallback(
    (value: string) => {
      handleRawDateChange(value);
      reset();
    },
    [handleRawDateChange, reset]
  );

  const handleRowClick = useCallback(
    (_row: EmployeeUsageTableRow, rowIndex: number) => {
      const target = employeeUsageItems[rowIndex];
      if (!target) {
        setSelectedEmployee(null);
        resetDetailHistory();
        return;
      }

      const employee: EmployeeUsageData = {
        memberId: target.memberId,
        employeeNumber: target.employeeNumber,
        memberName: target.memberName,
        organizationName: target.organizationName,
        usageCount: target.usageCount,
        totalAmount: target.totalAmount,
        pointAmount: target.pointAmount,
        cardAmount: target.cardAmount,
        representativeSolutionName: target.representativeSolutionName,
        lastUsedDate: formatDateDisplay(target.lastUsedDate),
      };

      setSelectedEmployee(employee);
      modal.open();
      loadDetailHistory(target.memberId);
    },
    [employeeUsageItems, loadDetailHistory, modal, resetDetailHistory]
  );

  const handleSortChange = useCallback(
    (key: keyof EmployeeUsageRecord, direction: SortDirection) => {
      setSortField(key as EmployeeUsageSortKey);
      setSortDirection(direction);
      reset();
      lastFetchParamsRef.current = "";
    },
    [reset]
  );

  const handleExcelDownload = useCallback(async () => {
    if (!monthParam || isExcelDownloading) {
      return;
    }

    setIsExcelDownloading(true);

    try {
      const blob = await paymentsApi.downloadEmployeeUsageExcel({
        month: monthParam,
        organizationId,
        sortField,
        sortDirection,
      });

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      const fileName = t("excelFileName", { month: monthParam });
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
    } finally {
      setIsExcelDownloading(false);
    }
  }, [
    isExcelDownloading,
    monthParam,
    sortDirection,
    sortField,
    organizationId,
  ]);

  if (isInitialLoading && employeeUsageItems.length === 0) {
    return <BaseLoader />;
  }

  return (
    <EmployeeUsageView
      headers={headers}
      tableData={tableData}
      currentPage={currentPage}
      totalPages={totalPages}
      selectedDepartment={filters.department}
      departmentOptions={departmentOptions}
      employeeTotalCount={employeeTotalCount}
      isModalOpen={modal.isOpen}
      selectedEmployee={selectedEmployee}
      detailHistory={detailHistory}
      detailHistoryCount={detailHistoryCount}
      detailHistoryLoading={detailHistoryLoading}
      isExcelDownloading={isExcelDownloading}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      sortKey={sortField}
      sortDirection={sortDirection}
      onSortChange={handleSortChange}
      onPageChange={handlePageChange}
      onFilterReset={handleFilterReset}
      onRowClick={handleRowClick}
      onDownloadExcel={handleExcelDownload}
      onCloseModal={modal.close}
      onDateChange={handleDateChange}
      isDepartmentSelectModalOpen={departmentSelectModal.isOpen}
      onOpenDepartmentSelectModal={departmentSelectModal.open}
      onCloseDepartmentSelectModal={departmentSelectModal.close}
      onSelectDepartment={handleSelectDepartment}
      onResetDepartment={handleResetDepartment}
      departments={departments}
      selectedDepartmentId={selectedDepartmentId}
    />
  );
};

export default EmployeeUsagePage;
