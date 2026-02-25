import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import FavListView from "./FavListView";
import type { FavListTableRow } from "@/types/pages/fav";
import type { HeaderConfig, RowData, HealthStatus } from "@/types";
import type { FavOrganizationsResponse } from "@/types";
import { useDateRange } from "@/hooks";
import { favApi } from "@/api";
import { convertToYearMonthFormat } from "@/utils";
import { BaseLoader } from "@/components/common";

const getFavListHeaders = (t: (key: string) => string): HeaderConfig<FavListTableRow>[] => [
  { key: "rank", label: t("list.header.rank"), width: "11.11%", align: "left" },
  {
    key: "departmentName",
    label: t("list.header.department"),
    width: "11.11%",
    align: "left",
    sortable: true,
  },
  {
    key: "score",
    label: t("list.header.score"),
    width: "11.11%",
    align: "left",
    sortable: true,
  },
  {
    key: "previousPeriod",
    label: t("list.header.previousPeriod"),
    width: "11.11%",
    align: "left",
  },
  { key: "stressStatus", label: t("list.header.stress"), width: "11.11%", align: "left" },
  { key: "anxietyStatus", label: t("list.header.anxiety"), width: "11.11%", align: "left" },
  { key: "depressionStatus", label: t("list.header.depression"), width: "11.11%", align: "left" },
  {
    key: "attentionIndicator",
    label: t("list.header.attentionIndicator"),
    width: "11.11%",
    align: "left",
    tooltip: t("list.tooltip.attentionIndicator"),
    tooltipIconSize: 16,
  },
  { key: "employeeCount", label: t("list.header.employeeCount"), width: "11.11%", align: "left" },
];

const FavListPage = () => {
  const { t } = useTranslation("pages/fav");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const [currentPage, setCurrentPage] = useState(1);
  const [sortKey, setSortKey] = useState<keyof FavListTableRow>("score");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [organizationsData, setOrganizationsData] = useState<FavOrganizationsResponse | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // 중복 호출 방지를 위한 ref
  const lastFetchKeyRef = useRef<string | null>(null);

  // URL에서 organizationId 추출
  const organizationId = searchParams.get("organizationId")
    ? Number(searchParams.get("organizationId"))
    : null;

  // 년월 추출
  const yearMonth = convertToYearMonthFormat(selectedDate);
  // NOTE: 요구사항 - 첫 진입 기본 월을 2025년 12월로 고정 (파싱 실패 fallback 포함)
  const year = yearMonth ? parseInt(yearMonth.split("-")[0]) : 2025;
  const month = yearMonth ? parseInt(yearMonth.split("-")[1]) : 12;

  // 조직 목록 조회
  const fetchOrganizations = useCallback(async () => {
    try {
      // 중복 호출 방지
      const fetchKey = `organizations-${year}-${String(month).padStart(2, "0")}-${organizationId ?? "all"}-${currentPage}-${sortKey}-${sortDirection}`;
      if (lastFetchKeyRef.current === fetchKey) {
        return;
      }
      lastFetchKeyRef.current = fetchKey;

      // sortKey를 API 파라미터로 변환
      let apiSortBy: string | undefined;
      if (sortKey === "departmentName") {
        apiSortBy = "organizationName";
      } else if (sortKey === "score") {
        apiSortBy = "totalScore";
      }

      const response = await favApi.getFavOrganizations({
        year,
        month,
        parentOrgId: organizationId, // null이면 전사의 1뎁스 부서 조회, 있으면 해당 조직의 하위 부서 조회
        page: currentPage - 1, // API는 0부터 시작
        size: 20,
        sortBy: apiSortBy,
        sortDirection: sortDirection,
      });
      setOrganizationsData(response);

      // 조직명 설정
      // - 전사(parentOrgName이 없을 때): "조직 전체보기"
      // - 특정 부서(parentOrgName이 있을 때): "조직명 전체보기"
      if (response.parentOrgName) {
        setOrganizationName(t("list.organizationViewAll", { name: response.parentOrgName }));
      } else {
        setOrganizationName(t("list.allOrganizations"));
      }

      // 초기 로딩 완료
      setIsInitialLoading(false);
    } catch (error) {
      console.error("조직 목록 조회 실패:", error);
      setOrganizationName(t("list.allOrganizations"));
      setIsInitialLoading(false);
    }
  }, [year, month, currentPage, organizationId, sortKey, sortDirection, t]);

  useEffect(() => {
    fetchOrganizations();
  }, [fetchOrganizations]);

  const headers = useMemo(() => getFavListHeaders(t), [t]);

  // 상태에 따른 HealthStatus 변환
  const getHealthStatus = useCallback((score: number): HealthStatus => {
    if (score >= 80) return "healthy";    // 80~100점: 건강
    if (score >= 60) return "good";       // 60~79점: 양호
    if (score >= 40) return "caution";    // 40~59점: 주의
    if (score >= 20) return "vulnerable"; // 20~39점: 취약
    return "critical";                    // 0~19점: 심각
  }, []);

  // API 데이터를 테이블 형식으로 변환
  const data = useMemo(() => {
    if (!organizationsData || organizationsData.organizations.content.length === 0) {
      return [];
    }

    // API에서 정렬된 데이터를 받아오므로 추가 정렬 불필요
    return organizationsData.organizations.content.map((org, index: number) => {
      // null 체크 추가: null인 경우 "-"로 표시
      const stressStatus = org.stressScore !== null ? getHealthStatus(org.stressScore) : null;
      const anxietyStatus = org.anxietyScore !== null ? getHealthStatus(org.anxietyScore) : null;
      const depressionStatus = org.depressionScore !== null ? getHealthStatus(org.depressionScore) : null;

      // 주의지표 변환 - totalScore와 riskIndicator 둘 다 null일 때만 "-"로 표시
      let attentionIndicatorCell;
      if (org.totalScore === null && org.riskIndicator === null) {
        attentionIndicatorCell = {
          type: "custom" as const,
          value: "-",
          render: () => <span>-</span>,
        };
      } else {
        let attentionIndicatorValue: "stress" | "anxiety" | "depression" | "none" = "none";

        // API에서 한글로 오므로 한글 기준으로 매칭
        if (org.riskIndicator === "스트레스") {
          attentionIndicatorValue = "stress";
        } else if (org.riskIndicator === "불안") {
          attentionIndicatorValue = "anxiety";
        } else if (org.riskIndicator === "우울") {
          attentionIndicatorValue = "depression";
        }
        attentionIndicatorCell = {
          type: "indicator" as const,
          value: attentionIndicatorValue,
        };
      }

      // 이전 대비 값이 0이면 "-"로 표시
      const scoreChange = org.scoreChange ?? 0;
      const previousPeriodCell = scoreChange === 0
        ? {
            type: "custom" as const,
            value: "-",
            render: () => <span>-</span>,
          }
        : {
            type: "trend" as const,
            value: Math.abs(scoreChange),
            trend: scoreChange >= 0 ? ("up" as const) : ("down" as const),
          };

      // 점수 변환 - totalScore가 null이면 "-"로 표시
      const scoreCell = org.totalScore === null
        ? {
            type: "custom" as const,
            value: "-",
            render: () => <span>-</span>,
          }
        : {
            type: "custom" as const,
            value: Math.round(org.totalScore),
            render: () => <span>{t("unit.score", { count: Math.round(org.totalScore) })}</span>,
          };

      return {
        id: org.organizationId.toString(),
        rank: index + 1 + (currentPage - 1) * 20,
        departmentName: org.organizationName,
        score: scoreCell,
        previousPeriod: previousPeriodCell,
        stressStatus: stressStatus !== null ? t(`status.${stressStatus}`) : "-",
        anxietyStatus: anxietyStatus !== null ? t(`status.${anxietyStatus}`) : "-",
        depressionStatus: depressionStatus !== null ? t(`status.${depressionStatus}`) : "-",
        attentionIndicator: attentionIndicatorCell,
        employeeCount: t("unit.people", { count: org.memberCount }),
      } as RowData<FavListTableRow>;
    });
  }, [organizationsData, currentPage, getHealthStatus, t]);

  const handleSort = useCallback((
    key: keyof FavListTableRow,
    direction: "asc" | "desc"
  ) => {
    setSortKey(key);
    setSortDirection(direction);
    setCurrentPage(1); // 정렬 시 첫 페이지로 이동
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleRowClick = useCallback((row: RowData<FavListTableRow>) => {
    const orgId = row.id as string;
    navigate(`/fav?organizationId=${orgId}`);
  }, [navigate]);

  const totalPages = organizationsData?.organizations.totalPages ?? 1;

  // 초기 로딩 중이거나 organizationId가 있는데 organizationName이 없으면 로딩 화면 표시
  if (isInitialLoading || (organizationId && !organizationName)) {
    return <BaseLoader />;
  }

  return (
    <FavListView
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      currentPage={currentPage}
      totalPages={totalPages}
      sortKey={sortKey}
      sortDirection={sortDirection}
      headers={headers}
      data={data}
      organizationName={organizationName ?? t("list.allOrganizations")}
      onDateChange={handleDateChange}
      onSort={handleSort}
      onPageChange={handlePageChange}
      onRowClick={handleRowClick}
    />
  );
};

export default FavListPage;
