import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/ko";
import type { HomeDashboardResponse } from "@/types";
import type { HomeRiskLevel } from "@/types/pages/home";
import { BaseIcon, BaseLoader } from "@/components/common";
import { useDateRange } from "@/hooks";
import { dashboardApi } from "@/api";
import {
  formatCurrency,
  formatNumber,
  formatPercent,
  formatUsageRatio,
  formatTrimmedPercent,
  formatDateForDisplay,
  parseYearMonthFromSelectedDate,
} from "@/utils";
import HomeView from "./HomeView";
import styles from "./HomeView.module.scss";

const ICON_COLOR = "#2F6C46";
const ICON_SIZE = 36;
const ERROR_COLOR = "#EA1D1D";

/**
 * 숫자 값이 유효한지 확인
 */
const isValidNumber = (value: unknown): value is number => {
  return typeof value === "number" && !Number.isNaN(value) && Number.isFinite(value);
};

/**
 * 점수로부터 위험도 레벨 도출
 */
const deriveRiskLevelFromScore = (score?: number | null): HomeRiskLevel | null => {
  if (score === null || score === undefined || Number.isNaN(score)) {
    return null;
  }

  if (score < 40) {
    return "high";
  }

  if (score < 60) {
    return "warning";
  }

  return "good";
};

/**
 * 위험도 텍스트와 점수를 정규화하여 위험도 레벨 반환
 */
const normalizeRiskLevel = (
  riskLevelText?: string | null,
  score?: number | null
): HomeRiskLevel | null => {
  if (riskLevelText) {
    if (riskLevelText.includes("위험")) {
      return "high";
    }
    if (riskLevelText.includes("주의")) {
      return "warning";
    }
    if (riskLevelText.includes("양호")) {
      return "good";
    }
  }

  return deriveRiskLevelFromScore(score);
};

const HomePage = () => {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("pages/home");
  const { t: tCommon } = useTranslation("common");
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const [dashboardData, setDashboardData] =
    useState<HomeDashboardResponse | null>(null);
  const lastFetchKeyRef = useRef<string | null>(null);

  const currentLanguage = i18n.language;

  const getExpiryLabelTranslated = useCallback((daysUntilExpiry?: number | null): string => {
    if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
      return "";
    }

    if (daysUntilExpiry > 0) {
      return tCommon("expiry.daysUntil", { days: daysUntilExpiry });
    }

    if (daysUntilExpiry === 0) {
      return tCommon("expiry.today");
    }

    return tCommon("expiry.daysAfter", { days: Math.abs(daysUntilExpiry) });
  }, [tCommon]);

  const handleNavigateToFavDiagnosis = useCallback(() => {
    navigate("/fav");
  }, [navigate]);

  const handleNavigateToRiskDepartments = useCallback(() => {
    navigate("/fav", { state: { activeTab: "status" } });
  }, [navigate]);

  useEffect(() => {
    const fetchHomeDashboard = async () => {
      try {
        const parsed = parseYearMonthFromSelectedDate(selectedDate, startDate);
        if (!parsed) {
          return;
        }

        const { year, month } = parsed;
        const fetchKey = `${year}-${String(month).padStart(2, "0")}`;
        if (lastFetchKeyRef.current === fetchKey) {
          return;
        }
        lastFetchKeyRef.current = fetchKey;

        const response = await dashboardApi.getHomeDashboard({ year, month });
        if (response.success) {
          setDashboardData(response.data);
        }
      } catch (error) {
        console.error("홈 대시보드 데이터 조회 실패:", error);
      }
    };

    fetchHomeDashboard();
  }, [selectedDate, startDate]);

  const chartXAxisData = useMemo(
    () => dashboardData?.favDiagnosis?.timeSeriesChart?.labels ?? [],
    [dashboardData]
  );

  const chartSeriesData = useMemo(() => {
    const timeSeries = dashboardData?.favDiagnosis?.timeSeriesChart;

    if (!timeSeries || !timeSeries.labels?.length) {
      return [];
    }

    const { anxietyScores = [], depressionScores = [], stressScores = [] } =
      timeSeries;

    return timeSeries.labels.map((_, index) => {
      const values = [
        anxietyScores[index],
        depressionScores[index],
        stressScores[index],
      ].filter(
        (value): value is number =>
          typeof value === "number" && !Number.isNaN(value)
      );

      if (!values.length) {
        return 0;
      }

      const average = values.reduce((sum, value) => sum + value, 0) / values.length;
      return Math.round(average * 10) / 10;
    });
  }, [dashboardData]);

  const departmentData = useMemo(() => {
    const riskDepartments = dashboardData?.favDiagnosis?.riskDepartments ?? [];

    if (!riskDepartments.length) {
      return [];
    }

    return riskDepartments.map((dept) => {
      const totalEmployeesRaw = dept.totalMembers ?? dept.totalEmployees ?? 0;
      const totalEmployees = isValidNumber(totalEmployeesRaw)
        ? totalEmployeesRaw
        : 0;

      const participantCountRaw =
        dept.participatedMembers ?? dept.participantCount ?? 0;
      const participatedEmployees = isValidNumber(participantCountRaw)
        ? participantCountRaw
        : 0;

      const participationRateSource = isValidNumber(dept.participationRate)
        ? dept.participationRate
        : totalEmployees
          ? (participatedEmployees / totalEmployees) * 100
          : 0;
      const participationRate = Math.round(participationRateSource * 10) / 10;

      const favScoreCandidate = isValidNumber(dept.averageScore)
        ? dept.averageScore
        : isValidNumber(dept.favScore)
          ? dept.favScore
          : undefined;
      const favScore = favScoreCandidate;
      const riskLevel = normalizeRiskLevel(dept.riskLevel, favScore) ?? "good";

      return {
        rank: isValidNumber(dept.rank) ? dept.rank : undefined,
        department: dept.departmentName ?? "-",
        riskLevel,
        totalEmployees,
        participatedEmployees,
        participationRate,
        favScore,
      };
    });
  }, [dashboardData]);

  const solutionUsageData = useMemo(() => {
    const usages = dashboardData?.usageBilling?.solutionUsages ?? [];

    if (!usages.length) {
      return [];
    }

    const mapped = usages.map((usage) => ({
      solutionName: usage.categoryName,
      usageCount: usage.usageCount,
      participantCount: usage.userCount,
      amount: usage.amount,
      ratio: formatUsageRatio(usage.percentage),
    }));

    const totals = usages.reduce(
      (acc, usage) => {
        acc.usageCount += usage.usageCount ?? 0;
        acc.participantCount += usage.userCount ?? 0;
        acc.amount += usage.amount ?? 0;
        acc.percentage += usage.percentage ?? 0;
        return acc;
      },
      { usageCount: 0, participantCount: 0, amount: 0, percentage: 0 }
    );

    mapped.push({
      solutionName: t("table.total"),
      usageCount: totals.usageCount,
      participantCount: totals.participantCount,
      amount: totals.amount,
      ratio: formatUsageRatio(totals.percentage),
    });

    return mapped;
  }, [dashboardData, t]);

  const summaryCards = useMemo(() => {
    const info = dashboardData?.companyInfo;

    const isNegativeBudget =
      info &&
      isValidNumber(info.remainingBudget) &&
      info.remainingBudget < 0;

    return [
      {
        title: t("card.activeUsers"),
        value: info ? `${formatNumber(info.activeUserCount)}${t("unit.people")}` : "-",
        subValue:
          info && info.totalMemberCount
            ? (
                <span className={styles.subValue}>
                  ({formatPercent(
                    (info.activeUserCount / info.totalMemberCount) * 100,
                    0
                  )})
                </span>
              )
            : undefined,
        description: info
          ? t("description.activeUsers", { count: info.totalMemberCount })
          : t("description.contractPeriod"),
        icon: <BaseIcon name="people" size={ICON_SIZE} color={ICON_COLOR} />,
      },
      {
        title: t("card.contractPeriod"),
        value: info
          ? `${formatDateForDisplay(info.contractStartDate)}~${formatDateForDisplay(info.contractEndDate)}`
          : "-",
        description: info
          ? getExpiryLabelTranslated(info.daysUntilExpiry)
          : t("description.contractPeriod"),
        icon: <BaseIcon name="calendar" size={ICON_SIZE} color={ICON_COLOR} />,
      },
      {
        title: t("card.pointsPerEmployee"),
        value:
          info &&
          info.pointsPerEmployee !== null &&
          info.pointsPerEmployee !== undefined
            ? `${formatNumber(info.pointsPerEmployee)}${t("unit.point")}`
            : "-",
        description: info ? t("description.pointsUsage") : t("description.pointsLoading"),
        icon: <BaseIcon name="coinStack" size={ICON_SIZE} color={ICON_COLOR} />,
      },
      {
        title: t("card.remainingBudget"),
        tag: isNegativeBudget
          ? { type: "error" as const, text: t("tag.overBilling") }
          : undefined,
        value: (() => {
          const formattedValue = info
            ? formatCurrency(info.remainingBudget)
            : "-";
          if (isNegativeBudget) {
            return <span style={{ color: ERROR_COLOR }}>{formattedValue}</span>;
          }
          return formattedValue;
        })(),
        subValue:
          info && info.totalBudget
            ? (() => {
                const percentValue = formatPercent(
                  (info.remainingBudget / info.totalBudget) * 100,
                  0
                );
                return (
                  <span
                    className={styles.subValuePrimary}
                    style={isNegativeBudget ? { color: ERROR_COLOR } : undefined}
                  >
                    ({percentValue})
                  </span>
                );
              })()
            : undefined,
        description: (() => {
          if (!info) {
            return t("description.budgetLoading");
          }

          const budgetUsageRate = info.totalBudget
            ? ((info.totalBudget - info.remainingBudget) / info.totalBudget) * 100
            : null;

          if (isValidNumber(budgetUsageRate) && budgetUsageRate > 100) {
            const overagePercent = budgetUsageRate - 100;
            const overageFormatted = formatTrimmedPercent(overagePercent);
            return overageFormatted
              ? t("description.budgetOverage", { amount: formatCurrency(info.totalBudget), percent: overageFormatted })
              : t("description.budgetMonthly", { amount: formatCurrency(info.totalBudget) });
          }

          return t("description.budgetUsage", {
            amount: formatCurrency(info.totalBudget),
            percent: budgetUsageRate !== null ? formatPercent(budgetUsageRate, 0) : "-"
          });
        })(),
        icon: <BaseIcon name="creditCard" size={ICON_SIZE} color={ICON_COLOR} />,
      },
    ];
  }, [dashboardData, t, getExpiryLabelTranslated]);

  const getSelectedMonthLabel = useCallback((
    selectedDate: string,
    startDate?: string
  ): string => {
    const dayjsLocale = currentLanguage === "ko" ? "ko" : "en";
    const monthFormat = currentLanguage === "ko" ? "M월" : "MMM";

    const match = selectedDate.match(/(\d{4})년\s*(\d{1,2})월/);
    if (match) {
      const [, yearText, monthText] = match;
      const monthDate = dayjs().year(Number(yearText)).month(Number(monthText) - 1).locale(dayjsLocale);
      return monthDate.format(monthFormat);
    }

    const selected = dayjs(selectedDate).locale(dayjsLocale);
    if (selected.isValid()) {
      return selected.format(monthFormat);
    }

    if (startDate) {
      const parsedStart = dayjs(startDate, "YYYY.MM.DD").locale(dayjsLocale);
      if (parsedStart.isValid()) {
        return parsedStart.format(monthFormat);
      }
    }

    return currentLanguage === "ko" ? "선택한 월" : "Selected Month";
  }, [currentLanguage]);

  const getPeriodLabel = (
    selectedDate: string,
    startDate?: string,
    endDate?: string
  ): string | null => {
    const selected = dayjs(selectedDate);

    if (selected.isValid()) {
      const isCurrentMonth = selected.isSame(dayjs(), "month");

      if (isCurrentMonth) {
        const start = dayjs().startOf("month");
        const end = dayjs();
        return `${start.format("YYYY.MM.DD")} - ${end.format("YYYY.MM.DD")}`;
      }

      const start = selected.startOf("month");
      const end = selected.endOf("month");
      return `${start.format("YYYY.MM.DD")} - ${end.format("YYYY.MM.DD")}`;
    }

    if (startDate && endDate) {
      return `${dayjs(startDate).format("YYYY.MM.DD")} - ${dayjs(endDate).format("YYYY.MM.DD")}`;
    }

    return null;
  };

  const settlementCards = useMemo(() => {
    const billingInfo = dashboardData?.usageBilling?.billingInfo;
    const selectedMonthLabel = getSelectedMonthLabel(selectedDate, startDate);

    if (!billingInfo) {
      return [
        {
          title: `${selectedMonthLabel} ${t("card.usageAmount")}`,
          mainContent: "-",
          subContent: t("description.settlementLoading"),
        },
      ];
    }

    const contractBudget = billingInfo.contractBudget ?? 0;
    const remainingBudget = billingInfo.remainingBudget ?? 0;
    const hasBudget =
      isValidNumber(contractBudget) && contractBudget > 0;
    const hasRemaining = isValidNumber(remainingBudget);

    const budgetDepletionRate =
      hasBudget && hasRemaining
        ? ((contractBudget - remainingBudget) / contractBudget) * 100
        : null;

    const resolvedDepletionRate = isValidNumber(budgetDepletionRate)
      ? budgetDepletionRate
      : null;

    const periodLabel = getPeriodLabel(selectedDate, startDate, endDate);
    const isNegativeRemaining = hasRemaining && remainingBudget < 0;

    return [
      {
        title: `${selectedMonthLabel} ${t("card.usageAmount")}`,
        tooltip: t("tooltip.usageAmountFormula"),
        mainContent: formatCurrency(billingInfo.expectedBillingAmount ?? 0),
        subContent:
          periodLabel ??
          (billingInfo.billingDate
            ? t("description.billingDate", { date: formatDateForDisplay(billingInfo.billingDate) })
            : undefined),
      },
      {
        title: t("card.prepaidBudget"),
        mainContent: formatCurrency(contractBudget),
        subContent: t("description.contractBudgetTotal"),
      },
      {
        title: t("card.remainingBudget"),
        tag: isNegativeRemaining
          ? { type: "error" as const, text: t("tag.overBilling") }
          : undefined,
        mainContent: formatCurrency(remainingBudget),
        mainContentColor: isNegativeRemaining ? ERROR_COLOR : undefined,
        subContent: (() => {
          if (isValidNumber(resolvedDepletionRate)) {
            const formatted = formatTrimmedPercent(resolvedDepletionRate);
            if (!formatted) {
              return t("description.budgetDepletionLoading");
            }
            return t("description.budgetDepletionRate", { percent: formatted });
          }
          return t("description.budgetDepletionLoading");
        })(),
      },
      {
        title: t("card.paymentMethod"),
        mainContent: billingInfo.paymentMethod ?? "-",
        subContent: t("description.usageBasedBilling"),
      },
      {
        title: t("card.monthlySubscription"),
        mainContent:
          billingInfo.monthlySubscriptionPerAccount !== null &&
          billingInfo.monthlySubscriptionPerAccount !== undefined
            ? formatCurrency(billingInfo.monthlySubscriptionPerAccount)
            : "-",
        subContent: t("description.subscriptionPerPerson"),
      },
      {
        title: `${selectedMonthLabel} ${t("card.personalPayment")}`,
        mainContent: isValidNumber(billingInfo.totalCardPayment)
          ? formatCurrency(billingInfo.totalCardPayment)
          : "-",
        subContent: t("description.monthlyPersonalPaymentTotal"),
      },
    ];
  }, [dashboardData, selectedDate, startDate, endDate, t, getSelectedMonthLabel]);

  if (!dashboardData) {
    return <BaseLoader />;
  }

  return (
    <HomeView
      chartXAxisData={chartXAxisData}
      chartSeriesData={chartSeriesData}
      solutionUsageData={solutionUsageData}
      departmentData={departmentData}
      summaryCards={summaryCards}
      settlementCards={settlementCards}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      onDateChange={handleDateChange}
      onNavigateToFavDiagnosis={handleNavigateToFavDiagnosis}
      onNavigateToRiskDepartments={handleNavigateToRiskDepartments}
    />
  );
};

export default HomePage;
