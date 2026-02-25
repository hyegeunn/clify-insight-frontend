import { useMemo, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import PsyTestConsultationView from "./PsyTestConsultationView";
import { BaseLoader } from "@/components/common";
import { solutionApi } from "@/api";
import { convertToYearMonthFormat } from "@/utils/date";
import { isEmpty } from "@/utils/validation";
import type { ProgressBarItem, DonutChartData } from "@/types";
import type {
  PsyTestConsultationHeaders,
  PsyTestConsultationSatisfactionData,
  PsyTestConsultationSortHandler,
  PsyTestConsultationStatsCardData,
  PsyTestConsultationTableData,
  PsyTestConsultationTableRow,
} from "@/types/pages/psy-test-consultation";
import { useDateRange, usePageState, useChartData, useTableData } from "@/hooks";

const CATEGORY_CODE = "ASSESSMENT_COUNSELING";

const PsyTestConsultationPage = () => {
  const { t } = useTranslation("pages/psyTestConsultation");
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const {
    currentPage,
    searchValue,
    sortKey,
    sortDirection,
    handlePageChange,
    handleSearch,
    handleSort,
  } = usePageState<
    | "rank"
    | "department"
    | "usage"
    | "cancel"
    | "noShow"
    | "newUser"
    | "revisit"
    | "monthlyChange"
  >("rank", "desc");

  const [searchTrigger, setSearchTrigger] = useState("");

  // 중복 호출 방지를 위한 ref
  const lastDashboardFetchKeyRef = useRef<string | null>(null);
  const lastTableFetchKeyRef = useRef<string | null>(null);
  const lastMostUsedTestsFetchKeyRef = useRef<string | null>(null);

  // Custom Hook을 사용한 차트 데이터 관리
  const testTypeChart = useChartData<DonutChartData>();
  const mostUsedTestsChart = useChartData<ProgressBarItem>();

  // Custom Hook을 사용한 테이블 데이터 관리
  const departmentTable = useTableData<PsyTestConsultationTableRow>();

  // API 관련 states
  const [isLoading, setIsLoading] = useState(true);
  const [chartXAxisData, setChartXAxisData] = useState<string[]>([]);
  const [chartSeriesData, setChartSeriesData] = useState<number[]>([]);
  const [statsCards, setStatsCards] = useState<PsyTestConsultationStatsCardData[]>([]);
  const [satisfactionData, setSatisfactionData] =
    useState<PsyTestConsultationSatisfactionData>({
      score: 0,
      maxScore: 5,
      totalTests: 0,
      totalResponse: 0,
      responseRate: "0%",
    });
  const [satisfactionProgressData, setSatisfactionProgressData] = useState<
    ProgressBarItem[]
  >([]);
  const [mostUsedTestsProgressData, setMostUsedTestsProgressData] = useState<
    ProgressBarItem[]
  >([]);
  const [testTypeData, setTestTypeData] = useState<DonutChartData[]>([]);
  const [tableRows, setTableRows] = useState<PsyTestConsultationTableRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [mostUsedTestsCurrentPage, setMostUsedTestsCurrentPage] = useState(1);
  const [mostUsedTestsTotalPages, setMostUsedTestsTotalPages] = useState(1);

  // 테이블 헤더 정의
  const headers: PsyTestConsultationHeaders<PsyTestConsultationTableRow> = useMemo(
    () => [
      {
        key: "rank",
        label: t("table.header.rank"),
        width: "12.5%",
        align: "left",
        sortable: true,
      },
      {
        key: "department",
        label: t("table.header.department"),
        width: "12.5%",
        align: "left",
        sortable: true,
      },
      {
        key: "usage",
        label: t("table.header.usage"),
        width: "12.5%",
        align: "left",
      },
      {
        key: "cancel",
        label: t("table.header.cancel"),
        width: "12.5%",
        align: "left",
      },
      {
        key: "noShow",
        label: t("table.header.noShow"),
        width: "12.5%",
        align: "left",
      },
      {
        key: "newUser",
        label: t("table.header.newUser"),
        width: "12.5%",
        align: "left",
      },
      {
        key: "revisit",
        label: t("table.header.revisit"),
        width: "12.5%",
        align: "left",
      },
      {
        key: "monthlyChange",
        label: t("table.header.monthlyChange"),
        width: "12.5%",
        align: "left",
      },
    ],
    [t]
  );

  // 1. 대시보드 데이터 조회 (라인차트 + 통계카드)
  const fetchDashboardData = async (month: string) => {
    try {
      const response = await solutionApi.getDashboard({
        categoryCode: CATEGORY_CODE,
        month,
      });

      if (response.success && response.data) {
        const {
          weeklyData,
          totalUsageCount,
          totalUserCount,
          newUserCount,
          newUserUsageCount,
        } = response.data;

        // 라인차트 데이터 변환
        setChartXAxisData(weeklyData.map((item) => item.weekLabel));
        setChartSeriesData(weeklyData.map((item) => item.totalUsage));

        // 통계카드 데이터 변환
        setStatsCards([
          { label: t("card.totalUsage"), value: totalUsageCount },
          { label: t("card.totalUsers"), value: totalUserCount },
          { label: t("card.newUsers"), value: newUserCount, hasAlert: true },
          {
            label: t("card.newUsersUsage"),
            value: newUserUsageCount,
            hasAlert: true,
          },
        ]);
      }
    } catch (error) {
      console.error("대시보드 데이터 조회 실패:", error);
    }
  };

  // 2. 검사 유형별 분포 조회 (도넛차트)
  const fetchTestTypeData = async (month: string) => {
    testTypeChart.setLoading(true);

    try {
      const response = await solutionApi.getConsultationTypeDistribution({
        categoryCode: CATEGORY_CODE,
        month,
      });

      if (response.success && response.data) {
        // 빈 데이터 체크
        if (isEmpty(response.data)) {
          testTypeChart.setData([], true);
          return;
        }

        // 도넛차트 데이터 변환
        const colors = ["#2F6C46", "#70B78B", "#D0EDDB"];
        const textColors = ["#FFFFFF", "#FFFFFF", "#000000"];

        // 검사 유형 번역 함수
        const translateConsultationType = (type: string): string => {
          const typeMap: Record<string, string> = {
            "대면": t("consultationType.faceToFace"),
            "비대면": t("consultationType.nonFaceToFace"),
            "화상": t("consultationType.video"),
            "전화": t("consultationType.phone"),
            "온라인": t("consultationType.online"),
            "비대면: 전화": t("consultationType.nonFaceToFacePhone"),
            "비대면: 화상": t("consultationType.nonFaceToFaceVideo"),
            // 주제 이름 번역 (하이픈으로 구분된 형태)
            "정서-기분": t("topic.emotionMood"),
            "성격-성향": t("topic.personalityTendency"),
            "관계-적응": t("topic.relationshipAdaptation"),
            // 주제 이름 번역 (공백과 점으로 구분된 형태)
            "정서 · 기분": t("topic.emotionMood"),
            "성격 · 성향": t("topic.personalityTendency"),
            "관계 · 적응": t("topic.relationshipAdaptation"),
          };
          // 하이픈으로 구분된 경우 처리 (예: "대면-비대면" -> "Face-to-Face · Non-Face-to-Face")
          // 단, typeMap에 직접 매핑이 있는 경우는 그대로 사용
          if (typeMap[type]) {
            return typeMap[type];
          }
          if (type.includes("-")) {
            return type
              .split("-")
              .map((t) => typeMap[t] || t)
              .join(" · ");
          }
          return typeMap[type] || type;
        };

        const sortedData = [...response.data].sort((a, b) => 
          a.consultationType.localeCompare(b.consultationType)
        );
        const uniqueTypes = [...new Set(sortedData.map((item) => item.consultationType))];
        const typeColorMap = new Map<string, { color: string; textColor: string }>();
        uniqueTypes.forEach((type, index) => {
          typeColorMap.set(type, {
            color: colors[index % colors.length],
            textColor: textColors[index % textColors.length],
          });
        });

        const donutData: DonutChartData[] = sortedData.map((item) => {
          const colorInfo = typeColorMap.get(item.consultationType) || {
            color: colors[0],
            textColor: textColors[0],
          };
          return {
            label: translateConsultationType(item.consultationType),
            value: item.count,
            color: colorInfo.color,
            textColor: colorInfo.textColor,
          };
        });

        setTestTypeData(donutData);
        testTypeChart.setData(donutData, false);
      }
    } catch (error) {
      console.error("검사 유형별 분포 조회 실패:", error);
      testTypeChart.setLoading(false);
    }
  };

  // 3. 만족도 조회
  const fetchSatisfactionData = async (month: string) => {
    try {
      const response = await solutionApi.getSatisfaction({
        categoryCode: CATEGORY_CODE,
        month,
      });

      if (response.success && response.data) {
        const { averageRating, summary, distributions } = response.data;

        // 만족도 데이터 변환
        setSatisfactionData({
          score: averageRating,
          maxScore: 5,
          totalTests: summary.totalConsultations,
          totalResponse: summary.respondedCount,
          responseRate: `${Math.round(summary.responseRate)}%`,
        });

        // 만족도 분포 데이터 변환 (5점부터 1점까지 정렬)
        const sortedDistributions = [...distributions].sort(
          (a, b) => b.rating - a.rating
        );
        const maxCount = Math.max(...distributions.map((d) => d.count)) || 1;
        const progressData: ProgressBarItem[] = sortedDistributions.map(
          (dist) => ({
            label: `${dist.rating}${t("unit.point")}`,
            value: dist.count,
            maxValue: maxCount,
            percentage: dist.percentage,
          })
        );

        setSatisfactionProgressData(progressData);
      }
    } catch (error) {
      console.error("만족도 데이터 조회 실패:", error);
    }
  };

  // 4. 가장 많이 사용된 검사 비율 조회
  const fetchMostUsedTestsData = async (month: string, page: number = 1) => {
    mostUsedTestsChart.setLoading(true);

    try {
      const response = await solutionApi.getTopicRatios({
        categoryCode: CATEGORY_CODE,
        month,
        page: page - 1, 
        size: 8,
      });

      if (response.success && response.data) {
        const { topics, pagination } = response.data;

        if (pagination) {
          setMostUsedTestsTotalPages(pagination.totalPages);
        }

        // 빈 데이터 체크
        if (isEmpty(topics)) {
          mostUsedTestsChart.setData([], true);
          return;
        }

        // 가장 많이 사용된 검사 데이터 변환
        const maxCount = Math.max(...topics.map((item) => item.count)) || 1;
        const testData: ProgressBarItem[] = topics.map((item) => {
          const label = item.topicName.includes("_COUNSEL")
            ? item.topicName.replace("_COUNSEL", "")
            : item.topicName;
          
          return {
            label,
            value: item.count,
            maxValue: maxCount,
            percentage: item.percentage,
          };
        });
        setMostUsedTestsProgressData(testData);
        mostUsedTestsChart.setData(testData, false);
      }
    } catch (error) {
      console.error("가장 많이 사용된 검사 데이터 조회 실패:", error);
      mostUsedTestsChart.setLoading(false);
    }
  };

  // 5. 부서별 이용현황 조회 (테이블)
  const fetchDepartmentUsageData = async (
    month: string,
    page: number,
    searchKeyword?: string
  ) => {
    try {
      const response = await solutionApi.getDepartmentUsageStatus({
        categoryCode: CATEGORY_CODE,
        month,
        departmentSearch: searchKeyword !== "" ? searchKeyword : undefined,
        page: page - 1, // API는 0부터 시작
        size: 10,
        sortBy: sortKey === "department" ? "departmentName" : "usageCount",
        sortDirection: sortDirection === "asc" ? "ASC" : "DESC",
      });

      if (response.success && response.data) {
        const { departments, totalPages: apiTotalPages } = response.data;

        // 빈 데이터 체크
        if (isEmpty(departments)) {
          departmentTable.setData([], true);
          setTotalPages(apiTotalPages);
          return;
        }

        // 테이블 데이터 변환
        const rows: PsyTestConsultationTableRow[] = departments.map((dept) => ({
          id: `dept-${dept.rank}`,
          rank: dept.rank,
          department: dept.departmentName,
          usage: dept.usageCount,
          cancel: dept.cancellationCount,
          noShow: dept.noShowCount,
          newUser: dept.newUserCount,
          revisit: dept.revisitUserCount,
          monthlyChange: dept.previousMonthComparison,
          comparisonDirection: dept.comparisonDirection,
        }));

        setTableRows(rows);
        departmentTable.setData(rows, false);
        setTotalPages(apiTotalPages);
      }
    } catch (error) {
      console.error("부서별 이용현황 조회 실패:", error);
    }
  };

  // 날짜가 변경될 때만 차트 및 카드 데이터 조회
  useEffect(() => {
    const month = convertToYearMonthFormat(selectedDate);
    if (!month) return;

    // 중복 호출 방지
    const fetchKey = `dashboard-${month}`;
    if (lastDashboardFetchKeyRef.current === fetchKey) {
      return;
    }
    lastDashboardFetchKeyRef.current = fetchKey;

    setIsLoading(true);
    setMostUsedTestsCurrentPage(1);
    lastMostUsedTestsFetchKeyRef.current = null;
    Promise.all([
      fetchDashboardData(month),
      fetchTestTypeData(month),
      fetchSatisfactionData(month),
      fetchMostUsedTestsData(month, 1),
    ]).finally(() => setIsLoading(false));
  }, [selectedDate]);

  // 날짜, 페이지, 검색, 소팅이 변경될 때 테이블 데이터만 조회
  useEffect(() => {
    const month = convertToYearMonthFormat(selectedDate);
    if (!month) return;

    // 중복 호출 방지
    const fetchKey = `table-${month}-${currentPage}-${searchTrigger}-${sortKey}-${sortDirection}`;
    if (lastTableFetchKeyRef.current === fetchKey) {
      return;
    }
    lastTableFetchKeyRef.current = fetchKey;

    fetchDepartmentUsageData(month, currentPage, searchTrigger);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, currentPage, searchTrigger, sortKey, sortDirection]);

  useEffect(() => {
    const month = convertToYearMonthFormat(selectedDate);
    if (!month) return;

    const fetchKey = `mostUsedTests-${month}-${mostUsedTestsCurrentPage}`;
    if (lastMostUsedTestsFetchKeyRef.current === fetchKey) {
      return;
    }
    lastMostUsedTestsFetchKeyRef.current = fetchKey;

    fetchMostUsedTestsData(month, mostUsedTestsCurrentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, mostUsedTestsCurrentPage]);

  // 테이블 데이터 변환 (monthlyChange를 trend 형식으로)
  const tableData: PsyTestConsultationTableData<PsyTestConsultationTableRow> = useMemo(
    () =>
      tableRows.map((row) => {
        // comparisonDirection이 SAME이면 "-"로 표시
        if (row.comparisonDirection?.toUpperCase() === "SAME") {
          return {
            ...row,
            monthlyChange: {
              type: "custom",
              value: "-",
              render: () => <span>-</span>,
            },
          };
        }

        const trend =
          row.comparisonDirection?.toLowerCase() === "down"
            ? "down"
            : row.comparisonDirection?.toLowerCase() === "up"
            ? "up"
            : row.monthlyChange >= 0
            ? "up"
            : "down";
        return {
          ...row,
          monthlyChange: {
            type: "trend",
            value: Math.abs(row.monthlyChange),
            trend: trend as "up" | "down",
          },
        };
      }),
    [tableRows]
  );

  const handleSearchTrigger = (value: string) => {
    setSearchTrigger(value);
    handlePageChange(1);
  };

  // 차트 및 카드 데이터 메모이제이션 (날짜가 변경될 때만 업데이트)
  const memoizedChartXAxisData = useMemo(
    () => chartXAxisData,
    [chartXAxisData]
  );
  const memoizedChartSeriesData = useMemo(
    () => chartSeriesData,
    [chartSeriesData]
  );
  const memoizedStatsCards = useMemo(() => statsCards, [statsCards]);
  const memoizedSatisfactionData = useMemo(
    () => satisfactionData,
    [satisfactionData]
  );
  const memoizedSatisfactionProgressData = useMemo(
    () => satisfactionProgressData,
    [satisfactionProgressData]
  );
  const memoizedMostUsedTestsProgressData = useMemo(
    () => mostUsedTestsProgressData,
    [mostUsedTestsProgressData]
  );
  const memoizedTestTypeData = useMemo(() => testTypeData, [testTypeData]);

  if (isLoading && chartXAxisData.length === 0 && statsCards.length === 0) {
    return <BaseLoader />;
  }

  return (
    <PsyTestConsultationView
      headers={headers}
      data={tableData}
      currentPage={currentPage}
      totalPages={totalPages}
      searchValue={searchValue}
      sortKey={sortKey as keyof PsyTestConsultationTableRow}
      sortDirection={sortDirection}
      statsCards={memoizedStatsCards}
      xAxisData={memoizedChartXAxisData}
      seriesData={memoizedChartSeriesData}
      satisfactionData={memoizedSatisfactionData}
      satisfactionProgressData={memoizedSatisfactionProgressData}
      mostUsedTestsProgressData={memoizedMostUsedTestsProgressData}
      testTypeData={memoizedTestTypeData}
      isTestTypeDataEmpty={testTypeChart.isEmpty}
      isMostUsedTestsDataEmpty={mostUsedTestsChart.isEmpty}
      isDepartmentTableEmpty={departmentTable.isEmpty}
      isSearchActive={searchTrigger !== ""}
      isMostUsedTestsLoading={mostUsedTestsChart.isLoading}
      mostUsedTestsCurrentPage={mostUsedTestsCurrentPage}
      mostUsedTestsTotalPages={mostUsedTestsTotalPages}
      onMostUsedTestsPageChange={setMostUsedTestsCurrentPage}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      onSort={handleSort as PsyTestConsultationSortHandler}
      onPageChange={handlePageChange}
      onSearchChange={handleSearch}
      onSearch={handleSearchTrigger}
      onDateChange={handleDateChange}
    />
  );
};

export default PsyTestConsultationPage;

