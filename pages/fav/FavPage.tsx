import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/ko";
import type {
  FavChangeRateItem,
  FavRankingItem,
  FavSlideDirection,
  FavTab,
  FavCompanyScoreData,
  FavOrganizationData,
  FavStatusCardData,
  FavDonutChartDataItem,
  FavDetailClassificationCardData,
  FavAttentionIndicator,
  FavDetailCompanyScoreData,
  FavDetailScoreComparisonData,
  FavUsageStatusItem,
} from "@/types/pages/fav";
import type {
  FavDashboardResponse,
  FavScoreType,
  HealthStatus,
  FavStatusSummaryResponse,
  FavStatusDetailResponse,
  FavStatusCategory,
} from "@/types";
import { favApi } from "@/api";
import { BaseLoader } from "@/components/common";
import FavView from "./FavView";
import FavDetailView from "./FavDetailView";
import { useDateRange } from "@/hooks";
import { convertToYearMonthFormat } from "@/utils";

// 색상 정의만 남기고 레이블은 i18n에서 가져옴
const CLASSIFICATION_COLORS = {
  critical: {
    dot: "#EA1D1D",
    tagBg: "#FFEDED",
    tagText: "#DC2626",
  },
  caution: {
    dot: "#F59E0B",
    tagBg: "#FFF5D7",
    tagText: "#F59E0B",
  },
  good: {
    dot: "#16A34A",
    tagBg: "#DEFFEA",
    tagText: "#16A34A",
  },
} as const;

const DONUT_COLORS = {
  good: "#AFEFB6",
  caution: "#FAE18F",
  critical: "#FEAFAF",
} as const;

const MASK_THRESHOLD = 3;

// Mock 부서별 이용 현황 데이터
const MOCK_USAGE_STATUS_DATA: FavUsageStatusItem[] = [
  {
    rank: 1,
    departmentName: "인사팀",
    parentDepartment: "인사본부",
    totalMembers: 7,
    participatedMembers: 6,
    participationRate: 86,
    avgParticipationCount: 2.4,
    nonParticipatedMembers: 1,
    lastParticipationDate: "2025.12.05",
  },
  {
    rank: 2,
    departmentName: "UX팀",
    parentDepartment: "디자인본부",
    totalMembers: 10,
    participatedMembers: 8,
    participationRate: 80,
    avgParticipationCount: 2.2,
    nonParticipatedMembers: 2,
    lastParticipationDate: "2025.12.04",
  },
  {
    rank: 3,
    departmentName: "개발1팀",
    parentDepartment: "개발본부",
    totalMembers: 28,
    participatedMembers: 19,
    participationRate: 68,
    avgParticipationCount: 1.7,
    nonParticipatedMembers: 9,
    lastParticipationDate: "2025.12.04",
  },
  {
    rank: 4,
    departmentName: "개발2팀",
    parentDepartment: "개발본부",
    totalMembers: 24,
    participatedMembers: 12,
    participationRate: 50,
    avgParticipationCount: 1.3,
    nonParticipatedMembers: 12,
    lastParticipationDate: null,
  },
  {
    rank: 5,
    departmentName: "영업1팀",
    parentDepartment: "영업본부",
    totalMembers: 14,
    participatedMembers: 7,
    participationRate: 49,
    avgParticipationCount: 0.7,
    nonParticipatedMembers: 7,
    lastParticipationDate: "2025.12.04",
  },
  {
    rank: 6,
    departmentName: "개발3팀",
    parentDepartment: "개발본부",
    totalMembers: 22,
    participatedMembers: 10,
    participationRate: 45,
    avgParticipationCount: 1.1,
    nonParticipatedMembers: 12,
    lastParticipationDate: null,
  },
  {
    rank: 7,
    departmentName: "브랜딩팀",
    parentDepartment: "디자인본부",
    totalMembers: 8,
    participatedMembers: 3,
    participationRate: 37,
    avgParticipationCount: 0.9,
    nonParticipatedMembers: 5,
    lastParticipationDate: "2025.12.04",
  },
  {
    rank: 8,
    departmentName: "교육지원팀",
    parentDepartment: "인사본부",
    totalMembers: 6,
    participatedMembers: 2,
    participationRate: 33,
    avgParticipationCount: 0.8,
    nonParticipatedMembers: 4,
    lastParticipationDate: "2025.12.01",
  },
  {
    rank: 9,
    departmentName: "영업2팀",
    parentDepartment: "영업본부",
    totalMembers: 12,
    participatedMembers: 4,
    participationRate: 30,
    avgParticipationCount: 1.0,
    nonParticipatedMembers: 8,
    lastParticipationDate: null,
  },
  {
    rank: 10,
    departmentName: "CS팀",
    parentDepartment: "운영본부",
    totalMembers: 18,
    participatedMembers: 5,
    participationRate: 28,
    avgParticipationCount: 0.6,
    nonParticipatedMembers: 13,
    lastParticipationDate: "2025.12.04",
  },
  {
    rank: 11,
    departmentName: "품질관리팀",
    parentDepartment: "운영본부",
    totalMembers: 11,
    participatedMembers: 3,
    participationRate: 27,
    avgParticipationCount: 0.5,
    nonParticipatedMembers: 8,
    lastParticipationDate: null,
  },
  {
    rank: 12,
    departmentName: "UI팀",
    parentDepartment: "디자인본부",
    totalMembers: 9,
    participatedMembers: 2,
    participationRate: 22,
    avgParticipationCount: 0.4,
    nonParticipatedMembers: 7,
    lastParticipationDate: null,
  },
  {
    rank: 13,
    departmentName: "백엔드팀",
    parentDepartment: "개발본부",
    totalMembers: 16,
    participatedMembers: 3,
    participationRate: 19,
    avgParticipationCount: 0.5,
    nonParticipatedMembers: 13,
    lastParticipationDate: "2025.12.04",
  },
  {
    rank: 14,
    departmentName: "프론트엔드팀",
    parentDepartment: "개발본부",
    totalMembers: 17,
    participatedMembers: 2,
    participationRate: 12,
    avgParticipationCount: 0.3,
    nonParticipatedMembers: 15,
    lastParticipationDate: null,
  },
  {
    rank: 15,
    departmentName: "총무팀",
    parentDepartment: "인사본부",
    totalMembers: 13,
    participatedMembers: 1,
    participationRate: 7,
    avgParticipationCount: 0.2,
    nonParticipatedMembers: 12,
    lastParticipationDate: null,
  },
];

const FavPage = () => {
  const { t, i18n } = useTranslation("pages/fav");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const locationState = (location.state ?? null) as {
    activeTab?: FavTab;
  } | null;
  const initialActiveTab = locationState?.activeTab ?? "dashboard";
  const [activeTab, setActiveTab] = useState<FavTab>(initialActiveTab);
  const [direction, setDirection] = useState<FavSlideDirection>("right");
  const [dashboardData, setDashboardData] =
    useState<FavDashboardResponse | null>(null);
  const [statusSummaryData, setStatusSummaryData] =
    useState<FavStatusSummaryResponse | null>(null);
  const [statusDetailData, setStatusDetailData] = useState<{
    highRisk: FavStatusDetailResponse | null;
    caution: FavStatusDetailResponse | null;
    good: FavStatusDetailResponse | null;
  }>({
    highRisk: null,
    caution: null,
    good: null,
  });

  // URL에서 organizationId 추출
  const organizationId = searchParams.get("organizationId")
    ? Number(searchParams.get("organizationId"))
    : null;

  // 필터 상태 관리
  const [selectedScoreType, setSelectedScoreType] =
    useState<FavScoreType>("total");
  const [selectedWeeks, setSelectedWeeks] = useState<1 | 4 | 8>(4);

  // 중복 호출 방지를 위한 ref
  const lastDashboardFetchKeyRef = useRef<string | null>(null);
  const lastTrendFetchKeyRef = useRef<string | null>(null);
  const lastStatusFetchKeyRef = useRef<string | null>(null);
  const activeTabRef = useRef<FavTab>(initialActiveTab);

  // 정렬 상태 관리 (점수만 정렬 가능)
  const [sortBy, setSortBy] = useState<"score" | "diff" | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // 부서별 이용 현황 상태 관리
  const [usageCurrentPage, setUsageCurrentPage] = useState(1);
  const usageItemsPerPage = 15;

  useEffect(() => {
    activeTabRef.current = activeTab;
  }, [activeTab]);

  useEffect(() => {
    const state = (location.state ?? null) as { activeTab?: FavTab } | null;
    const nextTab = state?.activeTab;
    if (!nextTab || nextTab === activeTabRef.current) {
      return;
    }

    const tabOrder: FavTab[] = ["dashboard", "status", "usage"];
    const currentIndex = tabOrder.indexOf(activeTabRef.current);
    const nextIndex = tabOrder.indexOf(nextTab);

    if (currentIndex !== -1 && nextIndex !== -1) {
      setDirection(nextIndex > currentIndex ? "right" : "left");
    }

    setActiveTab(nextTab);
  }, [location.state]);

  // 년월 추출 (selectedDate는 "YYYY년 M월" 형식의 문자열)
  const yearMonth = convertToYearMonthFormat(selectedDate);
  const year = yearMonth
    ? parseInt(yearMonth.split("-")[0])
    : 2025;
  const month = yearMonth
    ? parseInt(yearMonth.split("-")[1])
    : 12;

  // FAV 대시보드 데이터 조회 (weeklyTrends 제외)
  const fetchDashboardData = useCallback(async () => {
    try {
      // 중복 호출 방지
      const fetchKey = `dashboard-${year}-${String(month).padStart(2, "0")}-${
        organizationId ?? "company"
      }`;
      if (lastDashboardFetchKeyRef.current === fetchKey) {
        return null;
      }
      lastDashboardFetchKeyRef.current = fetchKey;

      const dashboardResponse = await favApi.getFavDashboard({
        year,
        month,
        ...(organizationId && { organizationId }),
      });

      // weeklyTrends는 trends API에서 가져오므로 빈 배열로 초기화
      const dataWithEmptyTrends = {
        ...dashboardResponse,
        weeklyTrends: [],
      };

      setDashboardData(dataWithEmptyTrends);

      // 대시보드 데이터 반환 (trends API에서 사용)
      return dataWithEmptyTrends;
    } catch (error) {
      console.error("FAV 대시보드 조회 실패:", error);
      return null;
    }
  }, [year, month, organizationId]);

  // 마음 건강 추이 데이터 조회 (최초 로드 및 필터 변경 시)
  const fetchTrendData = useCallback(
    async (baseData?: FavDashboardResponse | null) => {
      try {
        // 중복 호출 방지 (scoreType도 포함)
        const fetchKey = `trend-${year}-${String(month).padStart(
          2,
          "0"
        )}-${selectedWeeks}-${selectedScoreType}-${
          organizationId ?? "company"
        }`;
        if (lastTrendFetchKeyRef.current === fetchKey) {
          return;
        }
        lastTrendFetchKeyRef.current = fetchKey;

        const trendsData = await favApi.getFavTrends({
          year,
          month,
          weeks: selectedWeeks,
          scoreType: selectedScoreType,
          ...(organizationId && { organizationId }),
        });

        // weeklyTrends만 업데이트
        setDashboardData((prevData) => {
          const targetData = baseData || prevData;

          if (!targetData) {
            return null;
          }

          const updatedData = {
            ...targetData,
            weeklyTrends: trendsData.map((trend) => ({
              weekLabel: trend.weekLabel,
              weekStartDate: trend.weekStartDate,
              weekEndDate: trend.weekEndDate,
              totalScore: trend.score,
              anxietyScore: trend.score,
              depressionScore: trend.score,
              stressScore: trend.score,
              daysAnalyzed: trend.daysAnalyzed,
            })),
          };
          return updatedData;
        });
      } catch (error) {
        console.error("FAV 추이 데이터 조회 실패:", error);
      }
    },
    [year, month, selectedWeeks, selectedScoreType, organizationId]
  );

  // 초기 로드: 대시보드 데이터 먼저 로드 후 trends API 호출
  useEffect(() => {
    const loadData = async () => {
      const dashboardData = await fetchDashboardData();
      if (dashboardData) {
        await fetchTrendData(dashboardData);
      }
    };
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year, month, organizationId]);

  // weeks 또는 scoreType 필터 변경 시 추이 데이터 재조회
  useEffect(() => {
    if (dashboardData) {
      fetchTrendData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedWeeks, selectedScoreType]);

  // 상태별 분류 데이터 조회
  const fetchStatusData = useCallback(async () => {
    try {
      // 중복 호출 방지
      const fetchKey = `status-${year}-${String(month).padStart(2, "0")}`;
      if (lastStatusFetchKeyRef.current === fetchKey) {
        return;
      }
      lastStatusFetchKeyRef.current = fetchKey;

      // 4. 상태별 분류 요약 조회
      const summaryResponse = await favApi.getFavStatusSummary({
        year,
        month,
      });
      setStatusSummaryData(summaryResponse);

      // 5. 상태별 분류 상세 조회 (3개 카테고리)
      const [highRiskResponse, cautionResponse, goodResponse] =
        await Promise.all([
          favApi.getFavStatusDetail({
            year,
            month,
            statusCategory: "HIGH_RISK" as FavStatusCategory,
            page: 0,
            size: 100,
          }),
          favApi.getFavStatusDetail({
            year,
            month,
            statusCategory: "CAUTION" as FavStatusCategory,
            page: 0,
            size: 100,
          }),
          favApi.getFavStatusDetail({
            year,
            month,
            statusCategory: "GOOD" as FavStatusCategory,
            page: 0,
            size: 100,
          }),
        ]);

      setStatusDetailData({
        highRisk: highRiskResponse,
        caution: cautionResponse,
        good: goodResponse,
      });
    } catch (error) {
      console.error("FAV 상태별 분류 조회 실패:", error);
    }
  }, [year, month]);

  // 상태별 분류 탭 진입 시 데이터 조회
  useEffect(() => {
    if (activeTab === "status") {
      fetchStatusData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, year, month]);

  // 점수 타입 변경 핸들러
  const handleScoreTypeChange = useCallback(
    (value: string) => {
      const scoreTypeMap: Record<string, FavScoreType> = {
        [t("select.overall")]: "total",
        [t("select.stress")]: "stress",
        [t("select.anxiety")]: "anxiety",
        [t("select.depression")]: "depression",
      };
      const newScoreType = scoreTypeMap[value] || "total";
      setSelectedScoreType(newScoreType);
    },
    [t]
  );

  // 기간 변경 핸들러
  const handleWeeksChange = useCallback((_tab: string, index: number) => {
    const weeksArray = [1, 4, 8] as const;
    const newWeeks = weeksArray[index] || 4;
    setSelectedWeeks(newWeeks);
  }, []);

  // 정렬 핸들러
  const handleSort = useCallback((key: string, direction: "asc" | "desc") => {
    setSortBy(key as "score" | "diff" | null);
    setSortDirection(direction);
  }, []);

  // 차트 X축 데이터 (주별 라벨)
  const chartXAxisData = useMemo(() => {
    return dashboardData?.weeklyTrends.map((trend) => trend.weekLabel) ?? [];
  }, [dashboardData]);

  // 차트 Y축 데이터 (선택된 점수 타입에 따라 변경)
  const chartSeriesData = useMemo(() => {
    if (!dashboardData || !dashboardData.weeklyTrends.length) {
      return [];
    }

    return dashboardData.weeklyTrends.map((trend) => {
      switch (selectedScoreType) {
        case "stress":
          return trend.stressScore;
        case "anxiety":
          return trend.anxietyScore;
        case "depression":
          return trend.depressionScore;
        case "total":
        default:
          return trend.totalScore;
      }
    });
  }, [dashboardData, selectedScoreType]);

  // 전사 마음 건강 점수 데이터 변환
  const companyScoreData: FavCompanyScoreData = useMemo(() => {
    if (!dashboardData) {
      return {
        totalCount: 0,
        participatedCount: 0,
        participationRate: "-",
        score: 0,
        scoreDiff: 0,
        comparisonText: "",
        stressValue: 0,
        stressStatus: "good",
        anxietyValue: 0,
        anxietyStatus: "good",
        depressionValue: 0,
        depressionStatus: "good",
      };
    }

    const { companyHealthScore } = dashboardData;

    // 점수 기반으로 상태 계산 (5단계, 20점 단위)
    // 0-19: critical (심각), 20-39: vulnerable (취약), 40-59: caution (주의)
    // 60-79: good (양호), 80-100: healthy (건강)
    const getHealthStatusByScore = (score: number): HealthStatus => {
      if (score >= 80) return "healthy";
      if (score >= 60) return "good";
      if (score >= 40) return "caution";
      if (score >= 20) return "vulnerable";
      return "critical";
    };

    const scoreChange = companyHealthScore.scoreChange ?? 0;
    const getComparisonText = (): string => {
      // 최상단 대시보드(organizationId 없음)는 업계 평균 비교
      // 중간/최하위 대시보드(organizationId 있음)는 동일 레벨 조직 비교
      const isTopLevel = !organizationId;
      const comparisonTarget = isTopLevel
        ? t("comparison.industryAverage")
        : t("comparison.sameLevel");

      if (scoreChange > 0)
        return t("comparison.higher", {
          target: comparisonTarget,
          diff: scoreChange,
        });
      if (scoreChange < 0)
        return t("comparison.lower", {
          target: comparisonTarget,
          diff: Math.abs(scoreChange),
        });
      return t("comparison.same", { target: comparisonTarget });
    };

    return {
      totalCount: companyHealthScore.totalEmployees ?? 0,
      participatedCount: companyHealthScore.participatingMembers ?? 0,
      participationRate:
        companyHealthScore.participationRate != null
          ? `${companyHealthScore.participationRate}%`
          : "-",
      score: Math.round(companyHealthScore.totalScore ?? 0),
      scoreDiff: scoreChange,
      comparisonText: getComparisonText(),
      stressValue: Math.round(companyHealthScore.stressScore ?? 0),
      stressStatus: getHealthStatusByScore(companyHealthScore.stressScore ?? 0),
      anxietyValue: Math.round(companyHealthScore.anxietyScore ?? 0),
      anxietyStatus: getHealthStatusByScore(
        companyHealthScore.anxietyScore ?? 0
      ),
      depressionValue: Math.round(companyHealthScore.depressionScore ?? 0),
      depressionStatus: getHealthStatusByScore(
        companyHealthScore.depressionScore ?? 0
      ),
    };
  }, [dashboardData, organizationId, t]);

  // 데이터 없음 여부 확인
  const hasNoData = useMemo(() => {
    return dashboardData?.metaData?.notice === "해당 월의 데이터가 없습니다";
  }, [dashboardData]);

  // 위험 지표 변환 함수
  const getAttentionIndicator = useCallback(
    (riskIndicator: string | null): FavAttentionIndicator | null => {
      if (riskIndicator === "우울") return "depression";
      if (riskIndicator === "불안") return "anxiety";
      if (riskIndicator === "스트레스") return "stress";
      return null;
    },
    []
  );

  // 최고/최저 조직 데이터 변환
  const organizationDataList: FavOrganizationData[] = useMemo(() => {
    if (!dashboardData?.topRiskOrganizations) {
      return [];
    }

    const { high, low } = dashboardData.topRiskOrganizations;
    const result: FavOrganizationData[] = [];

    // 전사 평균과 비교하는 함수
    const getComparisonText = (
      score: number,
      companyAverage: number | null | undefined,
      scoreChange: number | null | undefined
    ): string => {
      // companyAverage가 null/undefined이거나 scoreChange가 null이면 비교 불가
      if (companyAverage == null || scoreChange == null) {
        return "-";
      }
      const diff = Math.round(score - companyAverage);
      if (diff > 0) return t("comparison.higherShort", { diff });
      if (diff < 0) return t("comparison.lowerShort", { diff: Math.abs(diff) });
      return "-";
    };

    // 가장 높은 조직
    if (high) {
      result.push({
        label: t("organization.highest"),
        organizationName: high.organizationName,
        organizationId: high.organizationId,
        score: Math.round(high.totalScore),
        diff: high.scoreChange ?? 0,
        employees: high.memberCount,
        attentionIndicator: getAttentionIndicator(high.riskIndicator),
        comparisonText: getComparisonText(
          high.totalScore,
          high.companyAverage,
          high.scoreChange
        ),
      });
    }

    // 가장 낮은 조직
    if (low) {
      result.push({
        label: t("organization.lowest"),
        organizationName: low.organizationName,
        organizationId: low.organizationId,
        score: Math.round(low.totalScore),
        diff: low.scoreChange ?? 0,
        employees: low.memberCount,
        attentionIndicator: getAttentionIndicator(low.riskIndicator),
        comparisonText: getComparisonText(
          low.totalScore,
          low.companyAverage,
          low.scoreChange
        ),
      });
    }

    return result;
  }, [dashboardData, getAttentionIndicator, t]);

  // 조직 순위 데이터 변환 및 정렬
  const rankingData: FavRankingItem[] = useMemo(() => {
    if (!dashboardData || dashboardData.organizationRankings.length === 0) {
      return [];
    }

    const getAttentionIndicator = (
      riskIndicator: string | null
    ): FavAttentionIndicator | null => {
      if (riskIndicator === "우울") return "depression";
      if (riskIndicator === "불안") return "anxiety";
      if (riskIndicator === "스트레스") return "stress";
      return null;
    };

    const data = dashboardData.organizationRankings.map((org) => ({
      rank: org.rank,
      departmentName: org.organizationName,
      organizationId: org.organizationId,
      score: Math.round(org.totalScore),
      diff: org.scoreChange ?? 0,
      attentionIndicator: getAttentionIndicator(org.riskIndicator),
    }));

    if (!sortBy) {
      return data;
    }

    // 정렬 적용 (점수만 정렬)
    const sortedData = [...data].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case "score":
          comparison = a.score - b.score;
          break;
        case "diff":
          comparison = a.diff - b.diff;
          break;
        default:
          comparison = 0;
      }

      return sortDirection === "asc" ? comparison : -comparison;
    });

    return sortedData;
  }, [dashboardData, sortBy, sortDirection]);

  // 변동률 상위 조직 데이터 변환
  const changeRateData: FavChangeRateItem[] = useMemo(() => {
    if (!dashboardData || dashboardData.topChangeOrganizations.length === 0) {
      return [];
    }

    // 변동폭 절대값 기준으로 내림차순 정렬
    const sortedOrgs = [...dashboardData.topChangeOrganizations].sort(
      (a, b) => {
        const changeA = Math.abs(a.scoreChange ?? 0);
        const changeB = Math.abs(b.scoreChange ?? 0);
        return changeB - changeA;
      }
    );

    return sortedOrgs.map((org, index) => {
      const change = org.scoreChange ?? 0;
      const beforeScore = Math.round(org.totalScore - change);
      const afterScore = Math.round(org.totalScore);

      return {
        rank: index + 1,
        departmentName: org.organizationName,
        organizationId: org.organizationId,
        changeRate: change,
        beforeAfter: `(${beforeScore} → ${afterScore})`,
      };
    });
  }, [dashboardData]);

  // 상태별 분류 요약 카드 데이터 변환
  const statusCardDataList: FavStatusCardData[] = useMemo(() => {
    const defaultData = [
      {
        label: t("classification.critical.label"),
        scoreRange: t("classification.critical.scoreRange"),
        teamCount: 0,
        totalMembers: 0,
        monthlyChange: 0,
        dotColor: CLASSIFICATION_COLORS.critical.dot,
        tagBgColor: CLASSIFICATION_COLORS.critical.tagBg,
        tagTextColor: CLASSIFICATION_COLORS.critical.tagText,
        tagText: t("classification.critical.tag"),
      },
      {
        label: t("classification.caution.label"),
        scoreRange: t("classification.caution.scoreRange"),
        teamCount: 0,
        totalMembers: 0,
        monthlyChange: 0,
        dotColor: CLASSIFICATION_COLORS.caution.dot,
        tagBgColor: CLASSIFICATION_COLORS.caution.tagBg,
        tagTextColor: CLASSIFICATION_COLORS.caution.tagText,
        tagText: t("classification.caution.tag"),
      },
      {
        label: t("classification.good.label"),
        scoreRange: t("classification.good.scoreRange"),
        teamCount: 0,
        totalMembers: 0,
        monthlyChange: 0,
        dotColor: CLASSIFICATION_COLORS.good.dot,
        tagBgColor: CLASSIFICATION_COLORS.good.tagBg,
        tagTextColor: CLASSIFICATION_COLORS.good.tagText,
        tagText: t("classification.good.tag"),
      },
    ];

    if (!statusSummaryData) {
      return defaultData;
    }

    return [
      {
        label: t("classification.critical.label"),
        scoreRange: t("classification.critical.scoreRange"),
        teamCount: statusSummaryData.highRisk.teamCount,
        totalMembers: statusSummaryData.highRisk.memberCount,
        monthlyChange: statusSummaryData.highRisk.changeFromPrevious,
        dotColor: CLASSIFICATION_COLORS.critical.dot,
        tagBgColor: CLASSIFICATION_COLORS.critical.tagBg,
        tagTextColor: CLASSIFICATION_COLORS.critical.tagText,
        tagText: t("classification.critical.tag"),
      },
      {
        label: t("classification.caution.label"),
        scoreRange: t("classification.caution.scoreRange"),
        teamCount: statusSummaryData.caution.teamCount,
        totalMembers: statusSummaryData.caution.memberCount,
        monthlyChange: statusSummaryData.caution.changeFromPrevious,
        dotColor: CLASSIFICATION_COLORS.caution.dot,
        tagBgColor: CLASSIFICATION_COLORS.caution.tagBg,
        tagTextColor: CLASSIFICATION_COLORS.caution.tagText,
        tagText: t("classification.caution.tag"),
      },
      {
        label: t("classification.good.label"),
        scoreRange: t("classification.good.scoreRange"),
        teamCount: statusSummaryData.good.teamCount,
        totalMembers: statusSummaryData.good.memberCount,
        monthlyChange: statusSummaryData.good.changeFromPrevious,
        dotColor: CLASSIFICATION_COLORS.good.dot,
        tagBgColor: CLASSIFICATION_COLORS.good.tagBg,
        tagTextColor: CLASSIFICATION_COLORS.good.tagText,
        tagText: t("classification.good.tag"),
      },
    ];
  }, [statusSummaryData, t]);

  // 구간별 구성비 도넛 차트 데이터 변환
  const donutChartData: FavDonutChartDataItem[] = useMemo(() => {
    const defaultData = [
      {
        label: t("classification.good.label"),
        value: 0,
        color: DONUT_COLORS.good,
      },
      {
        label: t("classification.caution.label"),
        value: 0,
        color: DONUT_COLORS.caution,
      },
      {
        label: t("classification.critical.label"),
        value: 0,
        color: DONUT_COLORS.critical,
      },
    ];

    if (!statusSummaryData) {
      return defaultData;
    }

    return [
      {
        label: t("classification.good.label"),
        value: statusSummaryData.distribution.good.memberCount,
        color: DONUT_COLORS.good,
        teamCount: statusSummaryData.distribution.good.teamCount,
      },
      {
        label: t("classification.caution.label"),
        value: statusSummaryData.distribution.caution.memberCount,
        color: DONUT_COLORS.caution,
        teamCount: statusSummaryData.distribution.caution.teamCount,
      },
      {
        label: t("classification.critical.label"),
        value: statusSummaryData.distribution.highRisk.memberCount,
        color: DONUT_COLORS.critical,
        teamCount: statusSummaryData.distribution.highRisk.teamCount,
      },
    ];
  }, [statusSummaryData, t]);

  const participatingTeams = useMemo(() => {
    if (!statusSummaryData) return 0;
    return statusSummaryData.distribution.participatingTeams;
  }, [statusSummaryData]);

  const participatingMembers = useMemo(() => {
    if (!statusSummaryData) return 0;
    return (
      statusSummaryData.distribution.good.memberCount +
      statusSummaryData.distribution.caution.memberCount +
      statusSummaryData.distribution.highRisk.memberCount
    );
  }, [statusSummaryData]);

  const nonParticipatingTeams = useMemo(() => {
    if (!statusSummaryData?.nonParticipatingOrgs) return 0;
    return statusSummaryData.nonParticipatingOrgs.length;
  }, [statusSummaryData]);

  const nonParticipatingMembers = useMemo(() => {
    if (!statusSummaryData?.nonParticipatingOrgs) return 0;
    return statusSummaryData.nonParticipatingOrgs.reduce(
      (sum, org) => sum + org.memberCount,
      0
    );
  }, [statusSummaryData]);

  // 분류 상세 카드 데이터 변환
  const detailClassificationCards: FavDetailClassificationCardData[] =
    useMemo(() => {
      const defaultData = [
        {
          label: t("classification.critical.label"),
          scoreRange: t("classification.critical.scoreRange"),
          dotColor: "#DC2626",
          data: [],
        },
        {
          label: t("classification.caution.label"),
          scoreRange: t("classification.caution.scoreRange"),
          dotColor: "#F59E0B",
          data: [],
        },
        {
          label: t("classification.good.label"),
          scoreRange: t("classification.good.scoreRange"),
          dotColor: "#16A34A",
          data: [],
        },
      ];

      if (
        !statusDetailData.highRisk ||
        !statusDetailData.caution ||
        !statusDetailData.good
      ) {
        return defaultData;
      }

      return [
        {
          label: t("classification.critical.label"),
          scoreRange: t("classification.critical.scoreRange"),
          dotColor: "#DC2626",
          data: statusDetailData.highRisk.content.map((item) => ({
            departmentName: item.organizationName,
            organizationId: item.organizationId,
            score: Math.round(item.totalScore),
            monthlyChange: item.scoreChange,
            participationRate: Math.round(item.participationRate * 100),
            isMasked: item.totalMembers <= MASK_THRESHOLD,
          })),
        },
        {
          label: t("classification.caution.label"),
          scoreRange: t("classification.caution.scoreRange"),
          dotColor: "#F59E0B",
          data: statusDetailData.caution.content.map((item) => ({
            departmentName: item.organizationName,
            organizationId: item.organizationId,
            score: Math.round(item.totalScore),
            monthlyChange: item.scoreChange,
            participationRate: Math.round(item.participationRate * 100),
            isMasked: item.totalMembers <= MASK_THRESHOLD,
          })),
        },
        {
          label: t("classification.good.label"),
          scoreRange: t("classification.good.scoreRange"),
          dotColor: "#16A34A",
          data: statusDetailData.good.content.map((item) => ({
            departmentName: item.organizationName,
            organizationId: item.organizationId,
            score: Math.round(item.totalScore),
            monthlyChange: item.scoreChange,
            participationRate: Math.round(item.participationRate * 100),
            isMasked: item.totalMembers <= MASK_THRESHOLD,
          })),
        },
      ];
    }, [statusDetailData, t]);

  const handleTabChange = (newTab: FavTab) => {
    if (newTab === activeTab) {
      return;
    }

    const tabOrder: FavTab[] = ["dashboard", "status", "usage"];
    const currentIndex = tabOrder.indexOf(activeTab);
    const newIndex = tabOrder.indexOf(newTab);

    if (currentIndex !== -1 && newIndex !== -1) {
      setDirection(newIndex > currentIndex ? "right" : "left");
    }

    setActiveTab(newTab);
  };

  const handleNavigateToList = () => {
    // organizationId가 있으면 해당 조직의 리스트로, 없으면 전사의 1뎁스 부서 리스트로
    if (organizationId) {
      navigate(`/fav-list?organizationId=${organizationId}`);
    } else {
      navigate("/fav-list");
    }
  };

  // 조직 클릭 핸들러
  const handleOrganizationClick = useCallback(
    (orgId: number) => {
      navigate(`/fav?organizationId=${orgId}`);
    },
    [navigate]
  );

  // 뒤로가기 핸들러
  const handleBackToCompany = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // 부서별 이용 현황 페이지 변경 핸들러
  const handleUsagePageChange = useCallback((page: number) => {
    setUsageCurrentPage(page);
  }, []);

  // 부서별 이용 현황 데이터 페이지네이션
  const usageStatusData = useMemo(() => {
    const startIndex = (usageCurrentPage - 1) * usageItemsPerPage;
    const endIndex = startIndex + usageItemsPerPage;
    return MOCK_USAGE_STATUS_DATA.slice(startIndex, endIndex);
  }, [usageCurrentPage, usageItemsPerPage]);

  const usageTotalPages = Math.ceil(
    MOCK_USAGE_STATUS_DATA.length / usageItemsPerPage
  );

  // 말단 부서 대시보드 여부 확인
  const isEndDepartment = useMemo(() => {
    return dashboardData?.hasChildren === false;
  }, [dashboardData]);

  // 말단 부서 전사 마음 건강 점수 데이터
  const detailCompanyScoreData: FavDetailCompanyScoreData = useMemo(() => {
    if (!dashboardData) {
      return {
        totalCount: 0,
        participatedCount: 0,
        participationRate: "-",
        score: 0,
        scoreDiff: 0,
        comparisonText: "",
        stressValue: 0,
        stressStatus: "good",
        anxietyValue: 0,
        anxietyStatus: "good",
        depressionValue: 0,
        depressionStatus: "good",
      };
    }

    const { companyHealthScore } = dashboardData;

    // 점수 기반으로 상태 계산 (5단계, 20점 단위)
    // 0-19: critical (심각), 20-39: vulnerable (취약), 40-59: caution (주의)
    // 60-79: good (양호), 80-100: healthy (건강)
    const getHealthStatusByScore = (score: number): HealthStatus => {
      if (score >= 80) return "healthy";
      if (score >= 60) return "good";
      if (score >= 40) return "caution";
      if (score >= 20) return "vulnerable";
      return "critical";
    };

    const scoreChange = companyHealthScore.scoreChange ?? 0;

    // 말단 부서: 동일 레벨 조직과 비교 (parentAverage 사용)
    const getComparisonText = (): string => {
      if (dashboardData.scoreComparison) {
        const { differenceFromParent } = dashboardData.scoreComparison;

        // differenceFromParent가 null이면 0으로 처리
        const roundedDiff = Math.round(differenceFromParent ?? 0);
        const comparisonTarget = t("comparison.sameLevel");

        if (roundedDiff > 0)
          return t("comparison.higher", {
            target: comparisonTarget,
            diff: roundedDiff,
          });
        if (roundedDiff < 0)
          return t("comparison.lower", {
            target: comparisonTarget,
            diff: Math.abs(roundedDiff),
          });
        return t("comparison.same", { target: comparisonTarget });
      }

      return t("comparison.same", { target: t("comparison.sameLevel") });
    };

    const isMasked = (companyHealthScore.totalEmployees ?? 0) <= MASK_THRESHOLD;

    return {
      totalCount: companyHealthScore.totalEmployees ?? 0,
      participatedCount: companyHealthScore.participatingMembers ?? 0,
      participationRate:
        companyHealthScore.participationRate != null
          ? `${companyHealthScore.participationRate}%`
          : "-",
      score: Math.round(companyHealthScore.totalScore ?? 0),
      scoreDiff: scoreChange,
      comparisonText: getComparisonText(),
      stressValue: Math.round(companyHealthScore.stressScore ?? 0),
      stressStatus: getHealthStatusByScore(companyHealthScore.stressScore ?? 0),
      anxietyValue: Math.round(companyHealthScore.anxietyScore ?? 0),
      anxietyStatus: getHealthStatusByScore(
        companyHealthScore.anxietyScore ?? 0
      ),
      depressionValue: Math.round(companyHealthScore.depressionScore ?? 0),
      depressionStatus: getHealthStatusByScore(
        companyHealthScore.depressionScore ?? 0
      ),
      isMasked,
    };
  }, [dashboardData, t]);

  // 말단 부서 응답률
  const detailSatisfactionValue = useMemo(() => {
    if (!dashboardData) return 0;
    return dashboardData.companyHealthScore.participationRate;
  }, [dashboardData]);

  // 말단 부서 평균 대비 점수 차이 데이터
  const detailScoreComparisonData: FavDetailScoreComparisonData | null =
    useMemo(() => {
      return dashboardData?.scoreComparison ?? null;
    }, [dashboardData]);

  // 말단 부서 고위험군 비율 추이 데이터
  const detailHighRiskRatioXAxisData = useMemo(() => {
    if (!dashboardData?.highRiskRatioTrends) return [];
    const isKorean = i18n.language === "ko";

    // dayjs locale 설정
    dayjs.locale(isKorean ? "ko" : "en");

    // month를 언어에 따라 변환 (2025-10 => "10월" or "Oct")
    return dashboardData.highRiskRatioTrends.map((item) => {
      const [year, month] = item.month.split("-");
      const monthNum = parseInt(month);

      if (isKorean) {
        return `${monthNum}월`;
      } else {
        // 영어: dayjs를 사용하여 월 약어 표시 (1 => "Jan", 10 => "Oct")
        return dayjs(`${year}-${month}-01`).format("MMM");
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dashboardData?.highRiskRatioTrends, t]);

  const detailHighRiskRatioSeriesData = useMemo(() => {
    if (!dashboardData?.highRiskRatioTrends) return [];
    // 비율을 퍼센트로 변환 (0.25 => 25)
    return dashboardData.highRiskRatioTrends.map((item) =>
      Math.round(item.highRiskRatio * 100)
    );
  }, [dashboardData?.highRiskRatioTrends]);

  // 로딩 중일 때
  if (!dashboardData && activeTab === "dashboard") {
    return <BaseLoader />;
  }

  if (!statusSummaryData && activeTab === "status") {
    return <BaseLoader />;
  }

  // 말단 부서일 경우 FavDetailView 렌더링
  if (isEndDepartment) {
    // organizationId가 있는데 organizationName이 없으면 로딩 중
    if (organizationId && !dashboardData?.organizationName) {
      return <BaseLoader />;
    }

    return (
      <FavDetailView
        selectedDate={selectedDate}
        startDate={startDate}
        endDate={endDate}
        chartXAxisData={chartXAxisData}
        chartSeriesData={chartSeriesData}
        satisfactionValue={detailSatisfactionValue}
        companyScoreData={detailCompanyScoreData}
        scoreComparisonData={detailScoreComparisonData}
        highRiskRatioXAxisData={detailHighRiskRatioXAxisData}
        highRiskRatioSeriesData={detailHighRiskRatioSeriesData}
        organizationName={dashboardData?.organizationName ?? ""}
        hasNoData={hasNoData}
        onDateChange={handleDateChange}
        onSelectChange={handleScoreTypeChange}
        onToggleChange={handleWeeksChange}
        onBackToCompany={handleBackToCompany}
      />
    );
  }

  // 일반 대시보드일 경우 FavView 렌더링
  // URL에 organizationId가 있으면 조직 대시보드, 없으면 전사 대시보드
  const isCompanyDashboard = !organizationId;

  // organizationId가 있는데 organizationName이 없으면 로딩 중
  if (organizationId && !dashboardData?.organizationName) {
    return <BaseLoader />;
  }

  return (
    <FavView
      activeTab={activeTab}
      direction={direction}
      chartXAxisData={chartXAxisData}
      chartSeriesData={chartSeriesData}
      rankingData={rankingData}
      changeRateData={changeRateData}
      companyScoreData={companyScoreData}
      organizationDataList={organizationDataList}
      statusCardDataList={statusCardDataList}
      donutChartData={donutChartData}
      detailClassificationCards={detailClassificationCards}
      participatingTeams={participatingTeams}
      participatingMembers={participatingMembers}
      nonParticipatingTeams={nonParticipatingTeams}
      nonParticipatingMembers={nonParticipatingMembers}
      usageStatusData={usageStatusData}
      usageCurrentPage={usageCurrentPage}
      usageTotalPages={usageTotalPages}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      isCompanyDashboard={isCompanyDashboard}
      organizationName={dashboardData?.organizationName ?? ""}
      hasNoData={hasNoData}
      onTabChange={handleTabChange}
      onNavigateToList={handleNavigateToList}
      onDateChange={handleDateChange}
      onScoreTypeChange={handleScoreTypeChange}
      onWeeksChange={handleWeeksChange}
      sortBy={sortBy}
      sortDirection={sortDirection}
      onSort={handleSort}
      onUsagePageChange={handleUsagePageChange}
      onOrganizationClick={handleOrganizationClick}
      onBackToCompany={handleBackToCompany}
    />
  );
};

export default FavPage;
