import { useMemo, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import PsyTestView from "./PsyTestView";
import AssessmentDetailModal from "./components/AssessmentDetailModal";
import { BaseLoader } from "@/components/common";
import { solutionApi, paymentsApi } from "@/api";
import { convertToYearMonthFormat } from "@/utils/date";
import { isEmpty } from "@/utils/validation";
import type { ProgressBarItem, DonutChartData, HeaderConfig, RowData, SortDirection } from "@/types";
import type { MonthlyTrendItem } from "@/types/pages/psy-counseling";
import type {
  PsyTestHeaders,
  // PsyTestSatisfactionData,
  PsyTestSortHandler,
  PsyTestStatsCardData,
  PsyTestTableData,
  PsyTestTableRow,
  AssessmentUsageRow,
  AssessmentUsageDetail,
} from "@/types/pages/psy-test";
import { useDateRange, usePageState, useChartData, useTableData } from "@/hooks";

const CATEGORY_CODE = "ASSESSMENT";

const PsyTestPage = () => {
  const { t } = useTranslation("pages/psyTest");
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();

  // 부서별 이용 현황 테이블 상태
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

  // 검사별 이용 현황 테이블 상태
  const {
    currentPage: assessmentCurrentPage,
    sortKey: assessmentSortKey,
    sortDirection: assessmentSortDirection,
    handlePageChange: handleAssessmentPageChange,
    handleSort: handleAssessmentSortInternal,
  } = usePageState<"rank" | "solutionName" | "usageCount">("usageCount", "desc");

  // 중복 호출 방지를 위한 ref
  const lastDashboardFetchKeyRef = useRef<string | null>(null);
  const lastTableFetchKeyRef = useRef<string | null>(null);
  const lastAssessmentTableFetchKeyRef = useRef<string | null>(null);

  // Custom Hook을 사용한 차트 데이터 관리
  const mostUsedTestsChart = useChartData<ProgressBarItem>();

  // Custom Hook을 사용한 테이블 데이터 관리
  const departmentTable = useTableData<PsyTestTableRow>();
  const assessmentTable = useTableData<AssessmentUsageRow>();

  // API 관련 states
  const [isLoading, setIsLoading] = useState(true);
  const [chartXAxisData, setChartXAxisData] = useState<string[]>([]);
  const [chartSeriesData, setChartSeriesData] = useState<number[]>([]);
  const [statsCards, setStatsCards] = useState<PsyTestStatsCardData[]>([]);
  // TODO:: 검사 만족도 - 추후 사용 예정
  // const [satisfactionData, setSatisfactionData] =
  //   useState<PsyTestSatisfactionData>({
  //     score: 0,
  //     maxScore: 5,
  //     totalTests: 0,
  //     totalResponse: 0,
  //     responseRate: "0%",
  //   });
  // const [satisfactionProgressData, setSatisfactionProgressData] = useState<
  //   ProgressBarItem[]
  // >([]);
  const [mostUsedTestsProgressData, setMostUsedTestsProgressData] = useState<
    ProgressBarItem[]
  >([]);
  const [testTypeData, setTestTypeData] = useState<DonutChartData[]>([]);
  const [isTestTypeDataEmpty, setIsTestTypeDataEmpty] = useState(false);
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrendItem[]>(
    []
  );
  const [isMonthlyTrendDataEmpty, setIsMonthlyTrendDataEmpty] = useState(false);
  const [tableRows, setTableRows] = useState<PsyTestTableRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // 검사별 이용 현황 테이블 관련 상태
  const [assessmentRows, setAssessmentRows] = useState<AssessmentUsageRow[]>([]);
  const [assessmentTotalPages, setAssessmentTotalPages] = useState(1);
  const [isAssessmentTableEmpty, setIsAssessmentTableEmpty] = useState(false);

  // 검사 상세 모달 관련 상태
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAssessmentDetail, setSelectedAssessmentDetail] =
    useState<AssessmentUsageDetail | null>(null);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  // 부서별 테이블 헤더 정의
  const headers: PsyTestHeaders<PsyTestTableRow> = useMemo(
    () => [
      {
        key: "rank",
        label: t("table.header.rank"),
        width: "16.67%",
        align: "left",
        sortable: true,
      },
      {
        key: "department",
        label: t("table.header.department"),
        width: "16.67%",
        align: "left",
        sortable: true,
      },
      {
        key: "usage",
        label: t("table.header.usage"),
        width: "16.67%",
        align: "left",
      },
      {
        key: "newUser",
        label: t("table.header.newUser"),
        width: "16.67%",
        align: "left",
      },
      {
        key: "revisit",
        label: t("table.header.revisit"),
        width: "16.67%",
        align: "left",
      },
      {
        key: "monthlyChange",
        label: t("table.header.monthlyChange"),
        width: "16.67%",
        align: "left",
      },
    ],
    [t]
  );

  // 검사별 이용 현황 테이블 헤더 정의
  const assessmentHeaders: HeaderConfig<AssessmentUsageRow>[] = useMemo(
    () => [
      {
        key: "rank",
        label: t("table.header.rank"),
        width: "20%",
        align: "left",
        sortable: true,
      },
      {
        key: "solutionName",
        label: t("table.header.testName"),
        width: "60%",
        align: "left",
        sortable: false,
      },
      {
        key: "usageCount",
        label: t("table.header.usageCount"),
        width: "20%",
        align: "left",
        sortable: true,
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

        // 통계카드 데이터 변환 (번역은 View에서 수행)
        setStatsCards([
          { label: "totalUsage", value: totalUsageCount },
          { label: "totalUsers", value: totalUserCount },
          { label: "newUsers", value: newUserCount, hasAlert: true },
          {
            label: "newUserUsage",
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
    try {
      const response = await solutionApi.getConsultationTypeDistribution({
        categoryCode: CATEGORY_CODE,
        month,
      });

      if (response.success && response.data) {
        // 빈 데이터 체크
        if (isEmpty(response.data)) {
          setIsTestTypeDataEmpty(true);
          setTestTypeData([]);
          return;
        }

        setIsTestTypeDataEmpty(false);

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
          if (type.includes("-") && !typeMap[type]) {
            return type
              .split("-")
              .map((t) => typeMap[t] || t)
              .join(" · ");
          }
          return typeMap[type] || type;
        };

        const donutData: DonutChartData[] = response.data.map(
          (item, index) => ({
            label: translateConsultationType(item.consultationType),
            value: item.count,
            color: colors[index % colors.length],
            textColor: textColors[index % textColors.length],
          })
        );

        setTestTypeData(donutData);
      }
    } catch (error) {
      console.error("검사 유형별 분포 조회 실패:", error);
    }
  };

  // TODO:: 검사 만족도 - 추후 사용 예정
  // 3. 만족도 조회
  // const fetchSatisfactionData = async (month: string) => {
  //   try {
  //     const response = await solutionApi.getSatisfaction({
  //       categoryCode: CATEGORY_CODE,
  //       month,
  //     });

  //     if (response.success && response.data) {
  //       const { averageRating, summary, distributions } = response.data;

  //       // 만족도 데이터 변환
  //       setSatisfactionData({
  //         score: averageRating,
  //         maxScore: 5,
  //         totalTests: summary.totalConsultations,
  //         totalResponse: summary.respondedCount,
  //         responseRate: `${Math.round(summary.responseRate)}%`,
  //       });

  //       // 만족도 분포 데이터 변환 (5점부터 1점까지 정렬)
  //       const sortedDistributions = [...distributions].sort(
  //         (a, b) => b.rating - a.rating
  //       );
  //       const maxCount = Math.max(...distributions.map((d) => d.count)) || 1;
  //       const progressData: ProgressBarItem[] = sortedDistributions.map(
  //         (dist) => ({
  //           label: `${dist.rating}점`,
  //           value: dist.count,
  //           maxValue: maxCount,
  //           percentage: dist.percentage,
  //         })
  //       );

  //       setSatisfactionProgressData(progressData);
  //     }
  //   } catch (error) {
  //     console.error("만족도 데이터 조회 실패:", error);
  //   }
  // };

  // 4. 가장 많이 사용된 검사 비율 조회 + 월별 트렌드
  const fetchMostUsedTestsData = async (month: string) => {
    mostUsedTestsChart.setLoading(true);

    try {
      const response = await solutionApi.getTopicRatios({
        categoryCode: CATEGORY_CODE,
        month,
      });

      if (response.success && response.data) {
        const { topics, monthlyTrends } = response.data;

        // 빈 데이터 체크
        if (isEmpty(topics)) {
          mostUsedTestsChart.setData([], true);
          setMostUsedTestsProgressData([]);
        } else {
          // 가장 많이 사용된 검사 데이터 변환
          const maxCount = Math.max(...topics.map((item) => item.count)) || 1;
          const testData: ProgressBarItem[] = topics.map((item, index) => ({
            label: `${index + 1}. ${item.topicName}`,
            value: item.count,
            maxValue: maxCount,
            percentage: item.percentage,
          }));
          setMostUsedTestsProgressData(testData);
          mostUsedTestsChart.setData(testData, false);
        }

        // 월별 트렌드 데이터 변환
        if (isEmpty(monthlyTrends)) {
          setIsMonthlyTrendDataEmpty(true);
          setMonthlyTrendData([]);
        } else {
          setIsMonthlyTrendDataEmpty(false);
          const trendData: MonthlyTrendItem[] = monthlyTrends.map((trend) => ({
            month: trend.month,
            firstValue: trend.firstRank?.percentage || 0,
            firstTopicName: trend.firstRank?.topicName || "",
            secondValue: trend.secondRank?.percentage || 0,
            secondTopicName: trend.secondRank?.topicName || "",
          }));
          setMonthlyTrendData(trendData);
        }
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
        const rows: PsyTestTableRow[] = departments.map((dept) => ({
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

  // 6. 검사별 이용 현황 조회 (테이블)
  const fetchAssessmentUsageData = async (month: string, page: number) => {
    try {
      const response = await paymentsApi.getAssessmentUsage({
        month,
        page: page - 1, // API는 0부터 시작
        size: 8,
        sortBy: assessmentSortKey === "rank" ? "rank" : "usageCount",
        sortDirection: assessmentSortDirection === "asc" ? "ASC" : "DESC",
      });

      if (response.success && response.data) {
        const { assessments, totalPages: apiTotalPages } = response.data;

        // 빈 데이터 체크
        if (isEmpty(assessments)) {
          assessmentTable.setData([], true);
          setIsAssessmentTableEmpty(true);
          setAssessmentTotalPages(apiTotalPages);
          return;
        }

        // 테이블 데이터 변환
        const rows: AssessmentUsageRow[] = assessments.map((item) => ({
          id: `assessment-${item.solutionId}`,
          rank: item.rank,
          solutionId: item.solutionId,
          solutionName: item.solutionName,
          usageCount: item.usageCount,
        }));

        setAssessmentRows(rows);
        assessmentTable.setData(rows, false);
        setIsAssessmentTableEmpty(false);
        setAssessmentTotalPages(apiTotalPages);
      }
    } catch (error) {
      console.error("검사별 이용 현황 조회 실패:", error);
      assessmentTable.setLoading(false);
    }
  };

  // 7. 검사 상세 정보 조회
  const fetchAssessmentDetail = async (solutionId: number) => {
    setIsDetailLoading(true);
    try {
      const response = await paymentsApi.getAssessmentUsageDetail(solutionId);

      if (response.success && response.data) {
        setSelectedAssessmentDetail(response.data);
      }
    } catch (error) {
      console.error("검사 상세 정보 조회 실패:", error);
      setSelectedAssessmentDetail(null);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // 검사별 이용 현황 정렬 핸들러 (타입 호환성을 위한 wrapper)
  const handleAssessmentSort = (
    key: keyof AssessmentUsageRow,
    direction: SortDirection
  ) => {
    // AssessmentUsageRow의 정렬 가능한 키만 허용
    if (key === "rank" || key === "solutionName" || key === "usageCount") {
      handleAssessmentSortInternal(key, direction);
    }
  };

  // 검사 row 클릭 핸들러
  const handleAssessmentRowClick = (row: RowData<AssessmentUsageRow>) => {
    setIsModalOpen(true);
    const solutionId = typeof row.solutionId === 'object' && 'value' in row.solutionId
      ? Number(row.solutionId.value)
      : Number(row.solutionId);
    fetchAssessmentDetail(solutionId);
  };

  // 모달 닫기 핸들러
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedAssessmentDetail(null);
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
    Promise.all([
      fetchDashboardData(month),
      fetchTestTypeData(month),
      // fetchSatisfactionData(month), // TODO:: 검사 만족도 - 추후 사용 예정
      fetchMostUsedTestsData(month),
    ]).finally(() => setIsLoading(false));
  }, [selectedDate]);

  // 날짜, 페이지, 검색, 소팅이 변경될 때 부서별 테이블 데이터만 조회
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

  // 날짜, 페이지, 소팅이 변경될 때 검사별 이용 현황 테이블 데이터 조회
  useEffect(() => {
    const month = convertToYearMonthFormat(selectedDate);
    if (!month) return;

    // 중복 호출 방지
    const fetchKey = `assessment-${month}-${assessmentCurrentPage}-${assessmentSortKey}-${assessmentSortDirection}`;
    if (lastAssessmentTableFetchKeyRef.current === fetchKey) {
      return;
    }
    lastAssessmentTableFetchKeyRef.current = fetchKey;

    fetchAssessmentUsageData(month, assessmentCurrentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDate, assessmentCurrentPage, assessmentSortKey, assessmentSortDirection]);

  // 테이블 데이터 변환 (monthlyChange를 trend 형식으로)
  const tableData: PsyTestTableData<PsyTestTableRow> = useMemo(
    () =>
      tableRows.map((row) => ({
        ...row,
        monthlyChange:
          row.comparisonDirection === "SAME"
            ? {
                type: "text",
                value: "-",
              }
            : {
                type: "trend",
                value: Math.abs(row.monthlyChange),
                trend:
                  row.comparisonDirection === "UP"
                    ? "up"
                    : row.comparisonDirection === "DOWN"
                    ? "down"
                    : row.monthlyChange >= 0
                    ? "up"
                    : "down",
              },
      })),
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
  // TODO:: 검사 만족도 - 추후 사용 예정
  // const memoizedSatisfactionData = useMemo(
  //   () => satisfactionData,
  //   [satisfactionData]
  // );
  // const memoizedSatisfactionProgressData = useMemo(
  //   () => satisfactionProgressData,
  //   [satisfactionProgressData]
  // );
  const memoizedMostUsedTestsProgressData = useMemo(
    () => mostUsedTestsProgressData,
    [mostUsedTestsProgressData]
  );
  const memoizedTestTypeData = useMemo(() => testTypeData, [testTypeData]);
  const memoizedMonthlyTrendData = useMemo(
    () => monthlyTrendData,
    [monthlyTrendData]
  );

  // 검사별 이용 현황 테이블 데이터 메모이제이션
  const assessmentTableData = useMemo(() => assessmentRows, [assessmentRows]);

  if (isLoading && chartXAxisData.length === 0 && statsCards.length === 0) {
    return <BaseLoader />;
  }

  return (
    <>
      <PsyTestView
        headers={headers}
        data={tableData}
        currentPage={currentPage}
        totalPages={totalPages}
        searchValue={searchValue}
        sortKey={sortKey as keyof PsyTestTableRow}
        sortDirection={sortDirection}
        statsCards={memoizedStatsCards}
        xAxisData={memoizedChartXAxisData}
        seriesData={memoizedChartSeriesData}
        // TODO:: 검사 만족도 - 추후 사용 예정
        // satisfactionData={memoizedSatisfactionData}
        // satisfactionProgressData={memoizedSatisfactionProgressData}
        mostUsedTestsProgressData={memoizedMostUsedTestsProgressData}
        testTypeData={memoizedTestTypeData}
        monthlyTrendData={memoizedMonthlyTrendData}
        isTestTypeDataEmpty={isTestTypeDataEmpty}
        isMostUsedTestsDataEmpty={mostUsedTestsChart.isEmpty}
        isMonthlyTrendDataEmpty={isMonthlyTrendDataEmpty}
        isDepartmentTableEmpty={departmentTable.isEmpty}
        isSearchActive={searchTrigger !== ""}
        assessmentHeaders={assessmentHeaders}
        assessmentData={assessmentTableData}
        assessmentCurrentPage={assessmentCurrentPage}
        assessmentTotalPages={assessmentTotalPages}
        assessmentSortKey={assessmentSortKey as keyof AssessmentUsageRow}
        assessmentSortDirection={assessmentSortDirection}
        isAssessmentTableEmpty={isAssessmentTableEmpty}
        onAssessmentSort={handleAssessmentSort}
        onAssessmentPageChange={handleAssessmentPageChange}
        onAssessmentRowClick={handleAssessmentRowClick}
        selectedDate={selectedDate}
        startDate={startDate}
        endDate={endDate}
        onSort={handleSort as PsyTestSortHandler}
        onPageChange={handlePageChange}
        onSearchChange={handleSearch}
        onSearch={handleSearchTrigger}
        onDateChange={handleDateChange}
      />
      <AssessmentDetailModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        detail={selectedAssessmentDetail}
        isLoading={isDetailLoading}
      />
    </>
  );
};

export default PsyTestPage;
