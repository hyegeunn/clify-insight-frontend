import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { paymentsApi } from "@/api";
import { BaseLoader } from "@/components/common";
import { usePagination, useDateRange } from "@/hooks";
import { toTextCell, toCurrencyCell, formatDate } from "@/utils";
import TeamUsageView from "./TeamUsageView";
import type {
  TeamUsageHeaders,
  TeamUsageRow,
  TeamUsageTableData,
} from "@/types/pages/team-usage";
import type {
  SortDirection,
  TeamUsagePaymentsRequest,
  TeamUsageExcelRequest,
  TeamUsagePaymentsResponse,
} from "@/types";

const SORT_FIELD_MAP: Record<keyof TeamUsageRow, string> = {
  teamId: "teamId",
  teamName: "teamName",
  teamSize: "teamSize",
  usedEmployees: "usedEmployees",
  participationRate: "participationRate",
  usageCount: "usageCount",
  totalAmount: "totalAmount",
  pointAmount: "pointAmount",
  cardAmount: "cardAmount",
  representativeProduct: "representativeProduct",
  recentUsedAt: "recentUsedAt",
};

const DEFAULT_SORT_KEY: keyof TeamUsageRow = "usageCount";
const DEFAULT_SORT_DIRECTION: SortDirection = "desc";

const formatMonthParam = (startDate: string): string => {
  if (!startDate) return "";
  const [year, month] = startDate.split(".");
  if (!year || !month) return "";
  return `${year}-${month.padStart(2, "0")}`;
};

const formatParticipationRate = (rate: number): string => {
  return Number.isFinite(rate) ? `${Number(rate).toFixed(1)}%` : "-";
};

const downloadBlobAsFile = (blob: Blob, fileName: string): void => {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
};

const transformTeamUsageResponse = (
  items: TeamUsagePaymentsResponse["items"]
): TeamUsageTableData<TeamUsageRow> => {
  return items.map((item) => ({
    teamId: item.teamId,
    teamName: toTextCell(item.teamName),
    teamSize: toTextCell(item.teamSize),
    usedEmployees: toTextCell(item.usedEmployees),
    participationRate: toTextCell(formatParticipationRate(item.participationRate)),
    usageCount: toTextCell(item.usageCount),
    totalAmount: toCurrencyCell(item.totalAmount),
    pointAmount: toCurrencyCell(item.pointAmount),
    cardAmount: toCurrencyCell(item.cardAmount),
    representativeProduct: toTextCell(item.representativeProduct),
    recentUsedAt: toTextCell(
      item.recentUsedAt ? formatDate(item.recentUsedAt, "YYYY.MM.DD") : "-"
    ),
  }));
};

const TeamUsagePage = () => {
  const { t } = useTranslation("pages/teamUsage");
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const { currentPage, itemsPerPage, handlePageChange, reset } =
    usePagination();

  const [searchValue, setSearchValue] = useState("");
  const [searchTrigger, setSearchTrigger] = useState("");

  const [tableData, setTableData] = useState<TeamUsageTableData<TeamUsageRow>>([]);
  const [totalTeams, setTotalTeams] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [sortKey, setSortKey] = useState<keyof TeamUsageRow>(DEFAULT_SORT_KEY);
  const [sortDirection, setSortDirection] = useState<SortDirection>(
    DEFAULT_SORT_DIRECTION
  );

  const [isExcelDownloading, setIsExcelDownloading] = useState(false);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  const inFlightRequestKeyRef = useRef<string | null>(null);
  const latestRequestKeyRef = useRef<string | null>(null);
  const isComponentMountedRef = useRef(true);
  const shouldShowLoadingRef = useRef(false);

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  const headers: TeamUsageHeaders<TeamUsageRow> = useMemo(
    () => [
      { key: "teamName", label: t("table.header.teamName"), width: "18%", sortable: true },
      { key: "teamSize", label: t("table.header.teamSize"), width: "6%" },
      { key: "usedEmployees", label: t("table.header.usedEmployees"), width: "6%" },
      { key: "participationRate", label: t("table.header.participationRate"), width: "10%", sortable: true },
      { key: "usageCount", label: t("table.header.usageCount"), width: "10%", sortable: true },
      { key: "totalAmount", label: t("table.header.totalAmount"), width: "13%", sortable: true },
      { key: "pointAmount", label: t("table.header.pointAmount"), width: "13%" },
      { key: "cardAmount", label: t("table.header.cardAmount"), width: "13%" },
      { key: "recentUsedAt", label: t("table.header.lastUsedDate"), width: "10%", sortable: true },
    ],
    [t]
  );

  const monthParam = useMemo(() => formatMonthParam(startDate), [startDate]);

  const teamNameParam = useMemo(() => {
    const teamName = searchTrigger?.trim();
    return teamName || undefined;
  }, [searchTrigger]);

  const sortField = useMemo(
    () => SORT_FIELD_MAP[sortKey] ?? SORT_FIELD_MAP[DEFAULT_SORT_KEY],
    [sortKey]
  );

  const sortDirectionParam = useMemo(
    () => (sortDirection === "asc" ? "ASC" : "DESC"),
    [sortDirection]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
  }, []);

  const handleSearch = useCallback(
    (value: string) => {
      shouldShowLoadingRef.current = true;
      setSearchTrigger(value);
      setIsInitialLoading(true);
      handlePageChange(1);
    },
    [handlePageChange]
  );

  const handleFilterReset = useCallback(() => {
    setSearchValue("");
    setSearchTrigger("");
    reset();
  }, [reset]);

  const handleDateRangeChange = useCallback(
    (value: string) => {
      handleDateChange(value);
      reset();
    },
    [handleDateChange, reset]
  );

  const handleSort = useCallback(
    (key: keyof TeamUsageRow, direction: SortDirection) => {
      setSortKey(key);
      setSortDirection(direction);
      reset();
    },
    [reset]
  );

  const handleExcelDownload = useCallback(async () => {
    if (!monthParam || isExcelDownloading) {
      return;
    }

    setIsExcelDownloading(true);

    try {
      const requestParams: TeamUsageExcelRequest = {
        month: monthParam,
        sortBy: sortField,
        direction: sortDirectionParam,
        ...(teamNameParam && { teamName: teamNameParam }),
      };

      const blob = await paymentsApi.downloadTeamUsageExcel(requestParams);
      downloadBlobAsFile(blob, t("excelFileName", { month: monthParam }));
    } catch (error) {
      console.error("Failed to download team usage excel:", error);
    } finally {
      setIsExcelDownloading(false);
    }
  }, [isExcelDownloading, monthParam, sortField, sortDirectionParam, teamNameParam]);

  const resetTableData = useCallback(() => {
    setTableData([]);
    setTotalTeams(0);
    setTotalPages(1);
    inFlightRequestKeyRef.current = null;
    latestRequestKeyRef.current = null;
  }, []);

  const updateLoadingState = useCallback(
    (shouldShowLoading: boolean, wasInitialLoading: boolean, loading: boolean) => {
      if (shouldShowLoading || wasInitialLoading) {
        setIsInitialLoading(loading);
      }
      shouldShowLoadingRef.current = false;
    },
    []
  );

  useEffect(() => {
    if (!monthParam) {
      resetTableData();
      return;
    }

    const requestParams: TeamUsagePaymentsRequest = {
      month: monthParam,
      sortBy: sortField,
      direction: sortDirectionParam,
      page: Math.max(currentPage - 1, 0),
      size: itemsPerPage,
      ...(teamNameParam && { teamName: teamNameParam }),
    };

    const requestKey = JSON.stringify(requestParams);

    if (
      inFlightRequestKeyRef.current === requestKey ||
      latestRequestKeyRef.current === requestKey
    ) {
      return;
    }

    latestRequestKeyRef.current = requestKey;
    inFlightRequestKeyRef.current = requestKey;

    const fetchTeamUsage = async () => {
      const shouldShowLoading = shouldShowLoadingRef.current;
      const wasInitialLoading = isInitialLoading;

      if (shouldShowLoading) {
        setIsInitialLoading(true);
      }

      try {
        const response = await paymentsApi.getTeamUsage(requestParams);

        if (!isComponentMountedRef.current) {
          updateLoadingState(shouldShowLoading, wasInitialLoading, false);
          return;
        }

        if (latestRequestKeyRef.current !== requestKey) {
          updateLoadingState(shouldShowLoading, wasInitialLoading, false);
          return;
        }

        if (!response.success || !response.data) {
          throw new Error(response.message || "Failed to load team usage");
        }

        const payload = response.data;
        const rows = transformTeamUsageResponse(payload.items);
        const nextTotalPages = Math.max(payload.totalPages, 1);

        setTableData(rows);
        setTotalTeams(payload.totalCount);
        setTotalPages(nextTotalPages);

        updateLoadingState(shouldShowLoading, wasInitialLoading, false);

        if (currentPage > nextTotalPages && nextTotalPages > 0) {
          reset();
        }
      } catch (error) {
        if (!isComponentMountedRef.current) {
          updateLoadingState(shouldShowLoading, wasInitialLoading, false);
          return;
        }

        console.error("Failed to fetch team usage data:", error);

        if (latestRequestKeyRef.current === requestKey) {
          resetTableData();
        }

        updateLoadingState(shouldShowLoading, wasInitialLoading, false);
      } finally {
        if (inFlightRequestKeyRef.current === requestKey) {
          inFlightRequestKeyRef.current = null;
        }
      }
    };

    fetchTeamUsage();

    return () => {
      if (inFlightRequestKeyRef.current === requestKey) {
        inFlightRequestKeyRef.current = null;
      }
    };
  }, [
    monthParam,
    teamNameParam,
    sortField,
    sortDirectionParam,
    currentPage,
    itemsPerPage,
    isInitialLoading,
    reset,
    resetTableData,
    updateLoadingState,
  ]);

  if (isInitialLoading && tableData.length === 0) {
    return <BaseLoader />;
  }

  return (
    <TeamUsageView
      headers={headers}
      tableData={tableData}
      currentPage={currentPage}
      totalPages={totalPages}
      totalTeams={totalTeams}
      isExcelDownloading={isExcelDownloading}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      onPageChange={handlePageChange}
      onSort={handleSort}
      onDateChange={handleDateRangeChange}
      searchKeyword={searchValue}
      onSearchKeywordChange={handleSearchChange}
      onSearchKeywordSubmit={handleSearch}
      onFilterReset={handleFilterReset}
      onExcelDownload={handleExcelDownload}
    />
  );
};

export default TeamUsagePage;
