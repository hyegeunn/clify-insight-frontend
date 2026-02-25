import { useMemo, useEffect, useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import PsyCounselingView from "./PsyCounselingView";
import { BaseLoader } from "@/components/common";
import { solutionApi } from "@/api";
import { convertToYearMonthFormat } from "@/utils/date";
import { isEmpty } from "@/utils/validation";
import type { DonutChartData, ProgressBarItem } from "@/types";
import type {
  MonthlyTrendItem,
  PsyCounselingHeaders,
  PsyCounselingSatisfactionData,
  PsyCounselingSortHandler,
  PsyCounselingTableData,
  PsyCounselingTableRow,
  TopicRatioItem,
} from "@/types/pages/psy-counseling";
import {
  useDateRange,
  usePageState,
  useChartData,
  useTableData,
} from "@/hooks";

const CATEGORY_CODE = "COUNSELING";

const PsyCounselingPage = () => {
  const { t } = useTranslation("pages/psyCounseling");
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

  // Custom Hook을 사용한 차트 데이터 관리
  const counselingTypeChart = useChartData<DonutChartData>();
  const topicRatioChart = useChartData<TopicRatioItem>();
  const monthlyTrendChart = useChartData<MonthlyTrendItem>();

  // Custom Hook을 사용한 테이블 데이터 관리
  const departmentTable = useTableData<PsyCounselingTableRow>();

  // API 관련 states
  const [isLoading, setIsLoading] = useState(true);
  const [chartXAxisData, setChartXAxisData] = useState<string[]>([]);
  const [chartSeriesData, setChartSeriesData] = useState<number[]>([]);
  const [dashboardRawData, setDashboardRawData] = useState<{
    totalUsageCount: number;
    totalUserCount: number;
    newUserCount: number;
    newUserUsageCount: number;
  } | null>(null);
  const [satisfactionData, setSatisfactionData] =
    useState<PsyCounselingSatisfactionData>({
      score: 0,
      maxScore: 5,
      totalCounseling: 0,
      totalResponse: 0,
      responseRate: "0%",
    });
  const [satisfactionProgressData, setSatisfactionProgressData] = useState<
    ProgressBarItem[]
  >([]);
  const [topicRatioData, setTopicRatioData] = useState<TopicRatioItem[]>([]);
  const [monthlyTrendData, setMonthlyTrendData] = useState<MonthlyTrendItem[]>(
    []
  );
  const [counselingTypeData, setCounselingTypeData] = useState<
    DonutChartData[]
  >([]);
  const [tableRows, setTableRows] = useState<PsyCounselingTableRow[]>([]);
  const [totalPages, setTotalPages] = useState(1);

  // 테이블 헤더 정의
  const headers: PsyCounselingHeaders<PsyCounselingTableRow> = useMemo(
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
        label: t("table.header.new"),
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
        label: t("table.header.previousComparison"),
        width: "12.5%",
        align: "left",
      },
    ],
    [t]
  );

  // 통계카드 데이터 변환 (언어 변경 시 자동 업데이트)
  const statsCards = useMemo(() => {
    if (!dashboardRawData) return [];

    return [
      { label: t("label.totalUsage"), value: dashboardRawData.totalUsageCount },
      { label: t("label.totalUsers"), value: dashboardRawData.totalUserCount },
      { label: t("label.newUsers"), value: dashboardRawData.newUserCount, hasAlert: true },
      {
        label: t("label.newUserUsage"),
        value: dashboardRawData.newUserUsageCount,
        hasAlert: true,
      },
    ];
  }, [dashboardRawData, t]);

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

        // 통계카드 원본 데이터 저장
        setDashboardRawData({
          totalUsageCount,
          totalUserCount,
          newUserCount,
          newUserUsageCount,
        });
      }
    } catch (error) {
      console.error("대시보드 데이터 조회 실패:", error);
    }
  };

  // 2. 상담 유형별 분포 조회 (도넛차트)
  const fetchConsultationTypeData = async (month: string) => {
    counselingTypeChart.setLoading(true);

    try {
      const response = await solutionApi.getConsultationTypeDistribution({
        categoryCode: CATEGORY_CODE,
        month,
      });

      if (response.success && response.data) {
        // 빈 데이터 체크
        if (isEmpty(response.data)) {
          counselingTypeChart.setData([], true);
          return;
        }

        const sortedData = [...response.data].sort((a, b) => {
          if (a.consultationType === "대면") return -1;
          if (b.consultationType === "대면") return 1;
          return 0;
        });

        const colors = ["#2F6C46", "#70B78B", "#D0EDDB"];
        const textColors = ["#FFFFFF", "#111111", "#111111"];

        // 상담 유형 번역 함수
        const translateConsultationType = (type: string): string => {
          const typeMap: Record<string, string> = {
            "대면": t("consultationType.faceToFace"),
            "비대면": t("consultationType.nonFaceToFace"),
            "화상": t("consultationType.video"),
            "전화": t("consultationType.phone"),
            "온라인": t("consultationType.online"),
            "비대면: 전화": t("consultationType.nonFaceToFacePhone"),
            "비대면: 화상": t("consultationType.nonFaceToFaceVideo"),
          };
          return typeMap[type] || type;
        };

        const donutData: DonutChartData[] = sortedData.map((item, index) => ({
          label: translateConsultationType(item.consultationType) + t("consultationType.suffix"),
          value: item.count,
          color: colors[index % colors.length],
          textColor: textColors[index % textColors.length],
        }));

        setCounselingTypeData(donutData);
        counselingTypeChart.setData(donutData, false);
      }
    } catch (error) {
      console.error("상담 유형별 분포 조회 실패:", error);
      counselingTypeChart.setLoading(false);
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
          totalCounseling: summary.totalConsultations,
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

  // 4. 주제 비율 조회
  const fetchTopicRatiosData = async (month: string) => {
    topicRatioChart.setLoading(true);
    monthlyTrendChart.setLoading(true);

    try {
      const response = await solutionApi.getTopicRatios({
        categoryCode: CATEGORY_CODE,
        month,
      });

      if (response.success && response.data) {
        const { topics, monthlyTrends } = response.data;

        // 주제 비율 데이터 변환 및 빈 데이터 체크
        if (isEmpty(topics)) {
          topicRatioChart.setData([], true);
        } else {
          // 주제 이름 번역 함수
          const translateTopicName = (topicName: string): string => {
            const topicMap: Record<string, string> = {
              "정서 · 기분": t("topic.emotionMood"),
              "성격 · 성향": t("topic.personalityTendency"),
              "관계 · 적응": t("topic.relationshipAdaptation"),
            };
            return topicMap[topicName] || topicName;
          };

          const topicData: TopicRatioItem[] = topics.map((item) => ({
            topic: translateTopicName(item.topicName),
            value: item.percentage,
          }));
          setTopicRatioData(topicData);
          topicRatioChart.setData(topicData, false);
        }

        // 월별 트렌드 데이터 변환 및 빈 데이터 체크
        if (isEmpty(monthlyTrends)) {
          monthlyTrendChart.setData([], true);
        } else {
          // 주제 이름 번역 함수
          const translateTopicName = (topicName: string): string => {
            const topicMap: Record<string, string> = {
              "정서 · 기분": t("topic.emotionMood"),
              "성격 · 성향": t("topic.personalityTendency"),
              "관계 · 적응": t("topic.relationshipAdaptation"),
            };
            return topicMap[topicName] || topicName;
          };

          const trendData: MonthlyTrendItem[] = monthlyTrends.map((item) => ({
            month: item.month,
            firstValue: item.firstRank?.percentage || 0,
            firstTopicName: item.firstRank?.topicName ? translateTopicName(item.firstRank.topicName) : "",
            secondValue: item.secondRank?.percentage || 0,
            secondTopicName: item.secondRank?.topicName ? translateTopicName(item.secondRank.topicName) : "",
          }));
          setMonthlyTrendData(trendData);
          monthlyTrendChart.setData(trendData, false);
        }
      }
    } catch (error) {
      console.error("주제 비율 데이터 조회 실패:", error);
      topicRatioChart.setLoading(false);
      monthlyTrendChart.setLoading(false);
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
        sortBy: sortKey === "rank" ? "usageCount" : sortKey === "department" ? "departmentName" : "usageCount",
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
        const rows: PsyCounselingTableRow[] = departments.map((dept) => ({
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
    Promise.all([
      fetchDashboardData(month),
      fetchConsultationTypeData(month),
      fetchSatisfactionData(month),
      fetchTopicRatiosData(month),
    ]).finally(() => setIsLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
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

  // 테이블 데이터 변환 (monthlyChange를 trend 형식으로)
  const data: PsyCounselingTableData<PsyCounselingTableRow> = useMemo(
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
                trend: row.comparisonDirection === "UP" ? "up" : "down",
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
  const memoizedSatisfactionData = useMemo(
    () => satisfactionData,
    [satisfactionData]
  );
  const memoizedSatisfactionProgressData = useMemo(
    () => satisfactionProgressData,
    [satisfactionProgressData]
  );
  const memoizedTopicRatioData = useMemo(
    () => topicRatioData,
    [topicRatioData]
  );
  const memoizedMonthlyTrendData = useMemo(
    () => monthlyTrendData,
    [monthlyTrendData]
  );
  const memoizedCounselingTypeData = useMemo(
    () => counselingTypeData,
    [counselingTypeData]
  );

  if (isLoading && chartXAxisData.length === 0 && statsCards.length === 0) {
    return <BaseLoader />;
  }

  return (
    <PsyCounselingView
      currentPage={currentPage}
      totalPages={totalPages}
      searchValue={searchValue}
      sortKey={sortKey as keyof PsyCounselingTableRow}
      sortDirection={sortDirection}
      headers={headers}
      data={data}
      statsCards={statsCards}
      xAxisData={memoizedChartXAxisData}
      seriesData={memoizedChartSeriesData}
      satisfactionData={memoizedSatisfactionData}
      satisfactionProgressData={memoizedSatisfactionProgressData}
      topicRatioData={memoizedTopicRatioData}
      monthlyTrendData={memoizedMonthlyTrendData}
      counselingTypeData={memoizedCounselingTypeData}
      isCounselingTypeDataEmpty={counselingTypeChart.isEmpty}
      isTopicRatioDataEmpty={topicRatioChart.isEmpty}
      isMonthlyTrendDataEmpty={monthlyTrendChart.isEmpty}
      isDepartmentTableEmpty={departmentTable.isEmpty}
      isSearchActive={searchTrigger !== ""}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      onSort={handleSort as PsyCounselingSortHandler}
      onPageChange={handlePageChange}
      onSearchChange={handleSearch}
      onSearch={handleSearchTrigger}
      onDateChange={handleDateChange}
    />
  );
};

export default PsyCounselingPage;
