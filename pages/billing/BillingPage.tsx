import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type { TFunction } from "i18next";
import BillingView from "./BillingView";
import { BaseIcon, BaseTooltip, BaseLoader } from "@/components/common";
import type {
  BillingMonthlyHistoryRow,
  BillingSolutionUsageData,
  BillingSolutionUsageRow,
  SettlementCardData,
} from "@/types/pages/billing";
import type {
  HeaderConfig,
  RowData,
  SettlementSummaryResponse,
  ProductUsageStatusApiData,
  ProductUsageStatusItem,
  ProductUsageStatusRequest,
  MonthlyUsageRequest,
  MonthlyUsageItem,
  MonthlyUsageExcelRequest,
} from "@/types";
import { useDateRange } from "@/hooks";
import { paymentsApi } from "@/api";
import {
  formatCurrency,
  formatDate,
  formatCount,
  toTextCell,
  getToday,
} from "@/utils";
import dayjs from "dayjs";
import "dayjs/locale/ko";
import "dayjs/locale/en";

const MONTHLY_USAGE_PAGE_SIZE = 10;
const DEFAULT_TEXT_VALUE = "-";
const COLUMN_WIDTH_PERCENT = 100 / 6;

const PRODUCT_USAGE_LIST_KEYS = [
  "items",
  "productUsageStatusList",
  "productUsageStatuses",
  "data",
] as const;


type NormalizedProductUsageItem = {
  productName: string;
  usageCount: number;
  usageUsers: number;
  totalAmount: number;
  ratio: number | null;
  isTotal: boolean;
};

const parseFiniteNumber = (value: unknown): number | null => {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === "string") {
    const sanitized = value.replace(/[%\s,]/g, "");
    if (!sanitized) {
      return null;
    }

    const parsed = Number.parseFloat(sanitized);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const parsePercentValue = (value: unknown): number | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (typeof value === "string" && value.trim().endsWith("%")) {
    return parseFiniteNumber(value);
  }

  const numeric = parseFiniteNumber(value);
  if (numeric === null) {
    return null;
  }

  if (numeric > 1 || numeric < -1) {
    return numeric;
  }

  return numeric * 100;
};

const formatTrimmedPercent = (value?: number | null): string | null => {
  if (value === null || value === undefined) {
    return null;
  }

  if (!Number.isFinite(value)) {
    return null;
  }

  const rounded = Math.round(value * 10) / 10;
  const decimalDigit = Math.abs(Math.round((rounded * 10) % 10));

  return decimalDigit === 0 ? String(Math.round(rounded)) : rounded.toFixed(1);
};

const sanitizeTextValue = (value: string | null | undefined): string => {
  if (typeof value !== "string") {
    return DEFAULT_TEXT_VALUE;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : DEFAULT_TEXT_VALUE;
};

const formatUsageCountValue = (value: unknown): string => {
  const numeric = parseFiniteNumber(value);
  if (numeric === null) {
    return DEFAULT_TEXT_VALUE;
  }

  return formatCount(numeric);
};

const formatCurrencyValue = (value: unknown): string => {
  const numeric = parseFiniteNumber(value);
  if (numeric === null) {
    return DEFAULT_TEXT_VALUE;
  }

  return formatCurrency(numeric);
};

const formatPercentDisplay = (value: number | null): string => {
  if (value === null || Number.isNaN(value)) {
    return DEFAULT_TEXT_VALUE;
  }

  const formatted = formatTrimmedPercent(value);
  return formatted ? `${formatted}%` : DEFAULT_TEXT_VALUE;
};

const resolveMonthOverMonthDisplay = (
  value: unknown
): { display: string; color: string } => {
  const numeric = parseFiniteNumber(value);
  if (numeric === null) {
    return { display: DEFAULT_TEXT_VALUE, color: "#000000" };
  }

  const formatted = formatTrimmedPercent(numeric);
  if (!formatted) {
    return { display: DEFAULT_TEXT_VALUE, color: "#000000" };
  }

  const color = numeric > 0 ? "#EA1D1D" : numeric < 0 ? "#1985FF" : "#000000";
  const prefix = numeric > 0 ? "+" : "";

  return { display: `${prefix}${formatted}%`, color };
};

const getPaymentTypeContents = (
  type: string | null | undefined,
  t: TFunction<"pages/billing">
): { label: string; description: string } => {
  if (!type) {
    return {
      label: DEFAULT_TEXT_VALUE,
      description: t("settlementCard.paymentDescription.paymentTypeLoading"),
    };
  }

  switch (type) {
    case "PREPAID":
      return {
        label: t("settlementCard.paymentType.prepaid"),
        description: t("settlementCard.paymentDescription.prepaid"),
      };
    case "POSTPAID":
      return {
        label: t("settlementCard.paymentType.postpaid"),
        description: t("settlementCard.paymentDescription.postpaid"),
      };
    case "HYBRID":
      return {
        label: t("settlementCard.paymentType.hybrid"),
        description: t("settlementCard.paymentDescription.hybrid"),
      };
    default:
      return {
        label: type,
        description: t("settlementCard.paymentDescription.loading"),
      };
  }
};

const extractProductUsageItems = (
  payload: ProductUsageStatusApiData | null | undefined
): ProductUsageStatusItem[] => {
  if (!payload) {
    return [];
  }

  if (Array.isArray(payload)) {
    return payload;
  }

  for (const key of PRODUCT_USAGE_LIST_KEYS) {
    const list = (payload as unknown as Record<string, unknown>)[key];
    if (Array.isArray(list)) {
      return list;
    }
  }

  return [];
};

const normalizeProductUsageItem = (
  item: ProductUsageStatusItem,
  totalText: string
): NormalizedProductUsageItem | null => {
  const nameCandidate =
    typeof item.productName === "string" ? item.productName : null;

  const productName = nameCandidate?.trim();
  if (!productName) {
    return null;
  }

  const usageCount = parseFiniteNumber(item.usageCount) ?? 0;
  const usageUsers = parseFiniteNumber(item.userCount) ?? 0;
  const totalAmount = parseFiniteNumber(item.totalAmount) ?? 0;
  const ratio = item.ratio ?? null;

  return {
    productName,
    usageCount,
    usageUsers,
    totalAmount,
    ratio,
    isTotal: productName === totalText,
  };
};

const calculateAggregatedUsage = (
  items: NormalizedProductUsageItem[]
): { usageCount: number; usageUsers: number; totalAmount: number } => {
  return items.reduce(
    (acc, item) => {
      acc.usageCount += item.usageCount;
      acc.usageUsers += item.usageUsers;
      acc.totalAmount += item.totalAmount;
      return acc;
    },
    { usageCount: 0, usageUsers: 0, totalAmount: 0 }
  );
};

const resolveUsageSummary = (
  payload: ProductUsageStatusApiData | null | undefined,
  aggregated: { usageCount: number; usageUsers: number; totalAmount: number }
) => {
  const summarySource =
    payload && !Array.isArray(payload) ? payload : undefined;

  const hasData =
    aggregated.usageCount > 0 ||
    aggregated.usageUsers > 0 ||
    aggregated.totalAmount > 0;

  return {
    usageCount:
      parseFiniteNumber(summarySource?.total?.totalUsageCount) ??
      aggregated.usageCount,
    usageUsers:
      parseFiniteNumber(summarySource?.total?.totalUserCount) ??
      aggregated.usageUsers,
    totalAmount:
      parseFiniteNumber(summarySource?.total?.totalAmount) ??
      aggregated.totalAmount,
    ratio:
      parsePercentValue(summarySource?.total?.totalRatio) ??
      (hasData ? 100 : null),
  };
};

const normalizeProductUsageData = (
  payload: ProductUsageStatusApiData | null | undefined,
  totalText: string
): BillingSolutionUsageData[] => {
  const rawItems = extractProductUsageItems(payload);

  const normalized = rawItems
    .map((item) => normalizeProductUsageItem(item, totalText))
    .filter((item): item is NormalizedProductUsageItem => item !== null);

  const nonTotalItems = normalized.filter(
    (item) => !item.isTotal && item.productName !== totalText
  );

  const aggregated = calculateAggregatedUsage(nonTotalItems);
  const resolvedSummary = resolveUsageSummary(payload, aggregated);

  const items: NormalizedProductUsageItem[] = normalized.map((item) => {
    if (item.isTotal) {
      return {
        productName: item.productName,
        usageCount: resolvedSummary.usageCount,
        usageUsers: resolvedSummary.usageUsers,
        totalAmount: resolvedSummary.totalAmount,
        ratio: resolvedSummary.ratio,
        isTotal: true,
      };
    }

    return item;
  });

  const hasTotalRow = items.some((item) => item.isTotal);

  if (!hasTotalRow && items.length > 0) {
    items.push({
      productName: totalText,
      usageCount: resolvedSummary.usageCount,
      usageUsers: resolvedSummary.usageUsers,
      totalAmount: resolvedSummary.totalAmount,
      ratio: resolvedSummary.ratio,
      isTotal: true,
    });
  }

  return items.map((item) => ({
    productName: item.productName,
    usageCount: item.usageCount,
    usageUsers: item.usageUsers,
    totalAmount: item.totalAmount,
    ratio: formatPercentDisplay(item.ratio),
  }));
};

const createMonthlyHistoryRows = (
  items: MonthlyUsageItem[]
): RowData<BillingMonthlyHistoryRow>[] => {
  if (!Array.isArray(items)) {
    return [];
  }

  return items.map((item) => {
    const monthOverMonth = resolveMonthOverMonthDisplay(item.monthOverMonth);

    return {
      period: toTextCell(sanitizeTextValue(item.period)),
      usageCount: toTextCell(formatUsageCountValue(item.usageCount)),
      totalAmount: toTextCell(formatCurrencyValue(item.totalAmount)),
      corporateSettlement: toTextCell(formatCurrencyValue(item.pointAmount)),
      personalPayment: toTextCell(formatCurrencyValue(item.cardAmount)),
      monthOverMonth: {
        type: "custom",
        value: monthOverMonth.display,
        render: () => (
          <span style={{ color: monthOverMonth.color }}>
            {monthOverMonth.display}
          </span>
        ),
      },
    };
  });
};

// ============================================================================
// Utility Functions - Settlement Data
// ============================================================================

const getMonthFromDate = (
  dateStr: string | undefined,
  currentLanguage: string
): string => {
  if (!dateStr) return "";
  const parts = dateStr.split(".");
  if (parts.length >= 2) {
    const year = parts[0];
    const month = parts[1];
    if (!year || !month) return "";

    const date = dayjs(`${year}-${month.padStart(2, "0")}-01`);
    if (!date.isValid()) return "";

    if (currentLanguage === "ko") {
      return `${parseInt(month, 10)}월`;
    } else {
      return date.locale("en").format("MMM");
    }
  }
  return "";
};

const formatPeriodPart = (value?: string): string | null => {
  if (!value) {
    return null;
  }
  const formatted = formatDate(value, "YYYY.MM.DD");
  return formatted === "Invalid Date" ? null : formatted;
};

const isCurrentMonth = (startDate: string): boolean => {
  if (!startDate) return false;
  const [year, month] = startDate.split(".");
  if (!year || !month) return false;

  const selectedDate = dayjs(`${year}-${month.padStart(2, "0")}-01`);
  const now = dayjs();
  return selectedDate.isSame(now, "month");
};

const formatPeriod = (
  startDate: string,
  periodStartDate: string | undefined,
  periodEndDate: string | undefined,
  t: TFunction<"pages/billing">
): string => {
  const currentMonth = isCurrentMonth(startDate);

  let formattedStart: string | null;
  let formattedEnd: string | null;

  if (currentMonth) {
    const [year, month] = startDate.split(".");
    if (year && month) {
      formattedStart = `${year}.${month.padStart(2, "0")}.01`;
      formattedEnd = getToday("YYYY.MM.DD");
    } else {
      formattedStart = formatPeriodPart(periodStartDate);
      formattedEnd = formatPeriodPart(periodEndDate);
    }
  } else {
    formattedStart = formatPeriodPart(periodStartDate);
    formattedEnd = formatPeriodPart(periodEndDate);
  }

  return formattedStart && formattedEnd
    ? `${formattedStart} - ${formattedEnd}`
    : t("settlementCard.message.periodLoading");
};

const calculateDepletionRate = (
  prepaymentBudget: number | undefined,
  remainingBudget: number | undefined,
  budgetDepletionRate: number | undefined
): number | null => {
  const hasBudget =
    typeof prepaymentBudget === "number" &&
    Number.isFinite(prepaymentBudget) &&
    prepaymentBudget > 0;
  const hasRemaining =
    typeof remainingBudget === "number" && Number.isFinite(remainingBudget);

  const computedDepletionRate =
    hasBudget && hasRemaining
      ? ((prepaymentBudget - remainingBudget) / prepaymentBudget) * 100
      : null;

  return typeof budgetDepletionRate === "number" &&
    !Number.isNaN(budgetDepletionRate)
    ? budgetDepletionRate
    : computedDepletionRate ?? null;
};

const getRemainingBudgetTag = (
  remainingBudget: number | undefined,
  t: TFunction<"pages/billing">
): { type: "error"; text: string } | undefined => {
  if (
    typeof remainingBudget === "number" &&
    Number.isFinite(remainingBudget) &&
    remainingBudget < 0
  ) {
    return { type: "error", text: t("settlementCard.budgetOverrun") };
  }
  return undefined;
};

const getRemainingBudgetPercentage = (
  resolvedDepletionRate: number | null,
  hasBudget: boolean,
  hasRemaining: boolean
): string => {
  if (
    typeof resolvedDepletionRate !== "number" ||
    Number.isNaN(resolvedDepletionRate)
  ) {
    return DEFAULT_TEXT_VALUE;
  }

  const isOverBudget = resolvedDepletionRate > 100;
  const remainingPercent = 100 - resolvedDepletionRate;

  if (isOverBudget && hasBudget && hasRemaining) {
    const overagePercent = resolvedDepletionRate - 100;
    const formatted = formatTrimmedPercent(overagePercent);
    return formatted ? `(-${formatted}%)` : DEFAULT_TEXT_VALUE;
  }

  const formatted = formatTrimmedPercent(remainingPercent);
  return formatted ? `(${formatted}%)` : DEFAULT_TEXT_VALUE;
};

const getRemainingBudgetSubContent = (
  resolvedDepletionRate: number | null,
  t: TFunction<"pages/billing">
): string => {
  if (
    typeof resolvedDepletionRate !== "number" ||
    Number.isNaN(resolvedDepletionRate)
  ) {
    return t("settlementCard.message.budgetDepletionRate", { rate: "-" });
  }

  const formatted = formatTrimmedPercent(resolvedDepletionRate);
  if (!formatted) {
    return t("settlementCard.paymentDescription.budgetLoading");
  }

  if (resolvedDepletionRate > 100) {
    const overagePercent = resolvedDepletionRate - 100;
    const overageFormatted = formatTrimmedPercent(overagePercent);
    return overageFormatted
      ? t("settlementCard.message.budgetExceeded", {
          rate: formatted,
          overage: overageFormatted,
        })
      : t("settlementCard.message.budgetDepletionRate", { rate: formatted });
  }

  return t("settlementCard.message.budgetDepletionRate", { rate: formatted });
};

const createSettlementData = (
  settlementSummary: SettlementSummaryResponse | null,
  startDate: string,
  t: TFunction<"pages/billing">,
  currentLanguage: string
): SettlementCardData[] => {
  const selectedMonth = getMonthFromDate(startDate, currentLanguage);
  const monthTitle = selectedMonth
    ? t("settlementCard.monthUsageAmount", { month: selectedMonth })
    : t("settlementCard.currentMonthUsageAmount");

  if (!settlementSummary) {
    return [
      {
        title: monthTitle,
        tooltip: t("settlementCard.subscriptionIncluded"),
        mainContent: DEFAULT_TEXT_VALUE,
        subContent: t("settlementCard.message.dataLoading"),
      },
      {
        title: t("settlementCard.prepaymentBudget"),
        mainContent: DEFAULT_TEXT_VALUE,
        subContent: t("settlementCard.totalBudget"),
      },
      {
        title: t("settlementCard.remainingBudget"),
        mainContent: DEFAULT_TEXT_VALUE,
        subContent: t("settlementCard.paymentDescription.budgetLoading"),
      },
      {
        title: t("settlementCard.paymentMethod"),
        mainContent: DEFAULT_TEXT_VALUE,
        subContent: t("settlementCard.paymentDescription.paymentTypeLoading"),
      },
      {
        title: t("settlementCard.monthlySubscription"),
        mainContent: DEFAULT_TEXT_VALUE,
        subContent: t("settlementCard.perPersonSubscription"),
      },
      {
        title: selectedMonth
          ? t("settlementCard.personalPaymentAmount", { month: selectedMonth })
          : t("settlementCard.personalPaymentAmountCurrent"),
        mainContent: DEFAULT_TEXT_VALUE,
        subContent: t("settlementCard.totalPersonalPayment"),
      },
    ];
  }

  const {
    currentMonthUsageAmount,
    periodStartDate,
    periodEndDate,
    prepaymentBudget,
    remainingBudget,
    budgetDepletionRate,
    paymentType,
    monthlySubscriptionFee,
    personalPaymentAmount,
  } = settlementSummary;

  const formattedPeriod = formatPeriod(
    startDate,
    periodStartDate,
    periodEndDate,
    t
  );

  const hasBudget =
    typeof prepaymentBudget === "number" &&
    Number.isFinite(prepaymentBudget) &&
    prepaymentBudget > 0;
  const hasRemaining =
    typeof remainingBudget === "number" && Number.isFinite(remainingBudget);

  const resolvedDepletionRate = calculateDepletionRate(
    prepaymentBudget,
    remainingBudget,
    budgetDepletionRate
  );

  const { label: paymentLabel, description: paymentDescription } =
    getPaymentTypeContents(paymentType, t);

  const isOverBudget =
    typeof resolvedDepletionRate === "number" &&
    !Number.isNaN(resolvedDepletionRate) &&
    resolvedDepletionRate > 100;

  return [
    {
      title: monthTitle,
      tooltip: t("settlementCard.subscriptionIncluded"),
      mainContent:
        typeof currentMonthUsageAmount === "number" &&
        !Number.isNaN(currentMonthUsageAmount)
          ? formatCurrency(currentMonthUsageAmount)
          : DEFAULT_TEXT_VALUE,
      subContent: formattedPeriod,
    },
    {
      title: t("settlementCard.prepaymentBudget"),
      mainContent:
        hasBudget && !Number.isNaN(prepaymentBudget)
          ? formatCurrency(prepaymentBudget)
          : DEFAULT_TEXT_VALUE,
      subContent: t("settlementCard.totalBudget"),
    },
    {
      title: t("settlementCard.remainingBudget"),
      tag: getRemainingBudgetTag(remainingBudget, t),
      mainContent:
        hasRemaining && !Number.isNaN(remainingBudget)
          ? formatCurrency(remainingBudget)
          : DEFAULT_TEXT_VALUE,
      mainContentColor:
        hasRemaining &&
        typeof remainingBudget === "number" &&
        remainingBudget < 0
          ? "#EA1D1D"
          : undefined,
      percentage: getRemainingBudgetPercentage(
        resolvedDepletionRate,
        hasBudget,
        hasRemaining
      ),
      percentageColor: isOverBudget ? "#dc2626" : undefined,
      subContent: getRemainingBudgetSubContent(resolvedDepletionRate, t),
    },
    {
      title: t("settlementCard.paymentMethod"),
      mainContent: paymentLabel,
      subContent: paymentDescription,
    },
    {
      title: t("settlementCard.monthlySubscription"),
      mainContent:
        typeof monthlySubscriptionFee === "number" &&
        !Number.isNaN(monthlySubscriptionFee)
          ? formatCurrency(monthlySubscriptionFee)
          : DEFAULT_TEXT_VALUE,
      subContent: t("settlementCard.perPersonSubscription"),
    },
    {
      title: selectedMonth
        ? t("settlementCard.personalPaymentAmount", { month: selectedMonth })
        : t("settlementCard.personalPaymentAmountCurrent"),
      mainContent:
        typeof personalPaymentAmount === "number" &&
        !Number.isNaN(personalPaymentAmount)
          ? formatCurrency(personalPaymentAmount)
          : DEFAULT_TEXT_VALUE,
      subContent: t("settlementCard.totalPersonalPayment"),
    },
  ];
};

const BillingPage = () => {
  const { t, i18n } = useTranslation("pages/billing");
  const { selectedDate, startDate, endDate, handleDateChange } = useDateRange();
  const [selectedYear, setSelectedYear] = useState(`2025${t("year.suffix")}`);
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [settlementSummary, setSettlementSummary] =
    useState<SettlementSummaryResponse | null>(null);
  const [solutionUsageData, setSolutionUsageData] = useState<
    BillingSolutionUsageData[]
  >([]);
  const [monthlyHistoryData, setMonthlyHistoryData] = useState<
    RowData<BillingMonthlyHistoryRow>[]
  >([]);
  const [monthlyHistoryTotalPages, setMonthlyHistoryTotalPages] = useState(1);
  const [
    isSolutionUsageExcelDownloading,
    setIsSolutionUsageExcelDownloading,
  ] = useState(false);
  const [
    isMonthlyHistoryExcelDownloading,
    setIsMonthlyHistoryExcelDownloading,
  ] = useState(false);
  const productUsageLatestRequestKeyRef = useRef<string | null>(null);
  const productUsageInFlightRequestKeyRef = useRef<string | null>(null);
  const monthlyHistoryLatestRequestKeyRef = useRef<string | null>(null);
  const monthlyHistoryInFlightRequestKeyRef = useRef<string | null>(null);
  const isComponentMountedRef = useRef(true);
  const prevLanguageRef = useRef(i18n.language);

  const yearOptions = useMemo(
    () => Array.from({ length: 8 }, (_, index) => `${2025 - index}${t("year.suffix")}`),
    [t]
  );

  useEffect(() => {
    if (prevLanguageRef.current !== i18n.language) {
      const yearDigits = selectedYear.replace(/\D/g, "");
      const newSuffix = t("year.suffix");
      setSelectedYear(`${yearDigits}${newSuffix}`);
      prevLanguageRef.current = i18n.language;
    }
  }, [i18n.language, selectedYear, t]);
  const monthParam = useMemo(() => {
    if (!startDate) {
      return "";
    }
    const [year, month] = startDate.split(".");
    if (!year || !month) {
      return "";
    }
    return `${year}-${month.padStart(2, "0")}`;
  }, [startDate]);

  const solutionUsageHeaders: HeaderConfig<BillingSolutionUsageRow>[] = useMemo(
    () => [
      { key: "productName", label: t("table.header.product"), width: "30%", align: "left" },
      { key: "usageCount", label: t("table.header.usageCount"), width: "15%", align: "left" },
      { key: "usageUsers", label: t("table.header.usageUsers"), width: "15%", align: "left" },
      {
        key: "totalAmount",
        label: (
          <>
            <span>{t("table.header.totalAmount")}</span>
            <BaseTooltip content={t("table.tooltip.totalAmountExcludePersonal")}>
              <BaseIcon name="tooltip" size={16} color="#9095A0" />
            </BaseTooltip>
          </>
        ),
        width: "20%",
        align: "left",
      },
      {
        key: "ratio",
        label: (
          <>
            <span>{t("table.header.ratio")}</span>
            <BaseTooltip content={t("table.tooltip.ratioFormula")}>
              <BaseIcon name="tooltip" size={16} color="#9095A0" />
            </BaseTooltip>
          </>
        ),
        width: "20%",
        align: "left",
      },
    ],
    [t]
  );

  const monthlyHistoryHeaders: HeaderConfig<BillingMonthlyHistoryRow>[] = useMemo(
    () => [
      { key: "period", label: t("table.header.period"), width: `${COLUMN_WIDTH_PERCENT}%`, align: "left" },
      {
        key: "usageCount",
        label: t("table.header.usageCount"),
        width: `${COLUMN_WIDTH_PERCENT}%`,
        align: "left",
      },
      {
        key: "totalAmount",
        label: t("table.header.totalAmount"),
        width: `${COLUMN_WIDTH_PERCENT}%`,
        align: "left",
      },
      {
        key: "corporateSettlement",
        label: t("table.header.corporateSettlement"),
        width: `${COLUMN_WIDTH_PERCENT}%`,
        align: "left",
      },
      {
        key: "personalPayment",
        label: t("table.header.personalPayment"),
        width: `${COLUMN_WIDTH_PERCENT}%`,
        align: "left",
      },
      {
        key: "monthOverMonth",
        label: t("table.header.monthOverMonth"),
        width: `${COLUMN_WIDTH_PERCENT}%`,
        align: "left",
      },
    ],
    [t]
  );

  const settlementData = useMemo<SettlementCardData[]>(
    () => createSettlementData(settlementSummary, startDate, t, i18n.language),
    [settlementSummary, startDate, t, i18n.language]
  );
  const formattedMonthlyData = monthlyHistoryData;

  useEffect(() => {
    isComponentMountedRef.current = true;
    return () => {
      isComponentMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    if (!monthParam) {
      return;
    }

    setIsLoading(true);
    const fetchSettlementSummary = async () => {
      try {
        const response = await paymentsApi.getSettlementSummary({
          month: monthParam,
        });
        if (!isComponentMountedRef.current) {
          return;
        }
        if (response.success) {
          setSettlementSummary(response.data);
        }
      } catch (error) {
        console.error("정산 요약 데이터 조회 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettlementSummary();
  }, [monthParam]);

  useEffect(() => {
    if (!monthParam) {
      setSolutionUsageData([]);
      productUsageLatestRequestKeyRef.current = null;
      productUsageInFlightRequestKeyRef.current = null;
      return;
    }

    const params: ProductUsageStatusRequest = {
      month: monthParam,
    };

    const requestKey = JSON.stringify(params);

    if (
      productUsageInFlightRequestKeyRef.current === requestKey ||
      productUsageLatestRequestKeyRef.current === requestKey
    ) {
      return;
    }

    productUsageLatestRequestKeyRef.current = requestKey;
    productUsageInFlightRequestKeyRef.current = requestKey;

    const fetchProductUsageStatus = async () => {
      try {
        const response = await paymentsApi.getProductUsageStatus(params);

        if (!isComponentMountedRef.current) {
          return;
        }

        if (productUsageLatestRequestKeyRef.current !== requestKey) {
          return;
        }

        if (response.success) {
          setSolutionUsageData(normalizeProductUsageData(response.data, t("total")));
        } else {
          console.error("상품별 사용 내역 조회 실패: success 응답이 false입니다.");
          setSolutionUsageData([]);
        }
      } catch (error) {
        if (isComponentMountedRef.current) {
          console.error("상품별 사용 내역 조회 실패:", error);
        }
        if (productUsageLatestRequestKeyRef.current === requestKey) {
          setSolutionUsageData([]);
          productUsageLatestRequestKeyRef.current = null;
        }
      } finally {
        if (productUsageInFlightRequestKeyRef.current === requestKey) {
          productUsageInFlightRequestKeyRef.current = null;
        }
      }
    };

    fetchProductUsageStatus();

    return () => {
      if (productUsageInFlightRequestKeyRef.current === requestKey) {
        productUsageInFlightRequestKeyRef.current = null;
      }
    };
  }, [monthParam]);

  useEffect(() => {
    const yearDigits = selectedYear.replace(/\D/g, "");

    if (!yearDigits) {
      setMonthlyHistoryData([]);
      setMonthlyHistoryTotalPages(1);
      monthlyHistoryLatestRequestKeyRef.current = null;
      monthlyHistoryInFlightRequestKeyRef.current = null;
      return;
    }

    const parsedYear = Number.parseInt(yearDigits, 10);

    if (Number.isNaN(parsedYear)) {
      setMonthlyHistoryData([]);
      setMonthlyHistoryTotalPages(1);
      monthlyHistoryLatestRequestKeyRef.current = null;
      monthlyHistoryInFlightRequestKeyRef.current = null;
      return;
    }

    const requestPage = Math.max(currentPage - 1, 0);

    const params: MonthlyUsageRequest = {
      year: parsedYear,
      page: requestPage,
      size: MONTHLY_USAGE_PAGE_SIZE,
    };

    const requestKey = JSON.stringify(params);

    if (
      monthlyHistoryInFlightRequestKeyRef.current === requestKey ||
      monthlyHistoryLatestRequestKeyRef.current === requestKey
    ) {
      return;
    }

    monthlyHistoryLatestRequestKeyRef.current = requestKey;
    monthlyHistoryInFlightRequestKeyRef.current = requestKey;

    const fetchMonthlyUsage = async () => {
      try {
        const response = await paymentsApi.getMonthlyUsage(params);

        if (!isComponentMountedRef.current) {
          return;
        }

        if (monthlyHistoryLatestRequestKeyRef.current !== requestKey) {
          return;
        }

        if (!response.success || !response.data) {
          throw new Error(response.message || "월별 사용 내역 조회 실패");
        }

        const content = Array.isArray(response.data.content)
          ? response.data.content
          : [];

        setMonthlyHistoryData(createMonthlyHistoryRows(content));

        const nextTotalPages =
          typeof response.data.totalPages === "number" &&
          response.data.totalPages > 0
            ? response.data.totalPages
            : 1;

        setMonthlyHistoryTotalPages(nextTotalPages);

        const serverPage =
          typeof response.data.currentPage === "number"
            ? response.data.currentPage + 1
            : requestPage + 1;

        const adjustedPage = Math.min(
          Math.max(serverPage, 1),
          nextTotalPages
        );

        if (adjustedPage !== currentPage) {
          setCurrentPage(adjustedPage);
        }
      } catch (error) {
        if (isComponentMountedRef.current) {
          console.error("월별 사용 내역 조회 실패:", error);
          setMonthlyHistoryData([]);
          setMonthlyHistoryTotalPages(1);
          if (currentPage !== 1) {
            setCurrentPage(1);
          }
        }

        if (monthlyHistoryLatestRequestKeyRef.current === requestKey) {
          monthlyHistoryLatestRequestKeyRef.current = null;
        }
      } finally {
        if (monthlyHistoryInFlightRequestKeyRef.current === requestKey) {
          monthlyHistoryInFlightRequestKeyRef.current = null;
        }
      }
    };

    fetchMonthlyUsage();

    return () => {
      if (monthlyHistoryInFlightRequestKeyRef.current === requestKey) {
        monthlyHistoryInFlightRequestKeyRef.current = null;
      }
    };
  }, [selectedYear, currentPage]);

  const downloadExcelFile = (blob: Blob, fileName: string) => {
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
  };

  const handleSolutionUsageExcelDownload = useCallback(async () => {
    if (isSolutionUsageExcelDownloading || !monthParam) {
      return;
    }

    setIsSolutionUsageExcelDownloading(true);

    try {
      const blob = await paymentsApi.downloadProductUsageStatusExcel({
        month: monthParam,
      });

      downloadExcelFile(blob, t("excelFileName.productUsage", { month: monthParam }));
    } catch (error) {
      console.error("상품별 사용 내역 엑셀 다운로드 실패:", error);
    } finally {
      setIsSolutionUsageExcelDownloading(false);
    }
  }, [isSolutionUsageExcelDownloading, monthParam]);

  const handleSelectYear = useCallback((year: string) => {
    setSelectedYear(year);
    setCurrentPage(1);
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (page === currentPage || page < 1 || page > monthlyHistoryTotalPages) {
        return;
      }

      setCurrentPage(page);
    },
    [currentPage, monthlyHistoryTotalPages]
  );

  const handleMonthlyHistoryExcelDownload = useCallback(async () => {
    if (isMonthlyHistoryExcelDownloading) {
      return;
    }

    const yearDigits = selectedYear.replace(/\D/g, "");
    const parsedYear = Number.parseInt(yearDigits, 10);

    const requestYear =
      Number.isFinite(parsedYear) && parsedYear > 0 ? parsedYear : 2024;

    setIsMonthlyHistoryExcelDownloading(true);

    try {
      const blob = await paymentsApi.downloadMonthlyUsageExcel({
        year: requestYear,
      } satisfies MonthlyUsageExcelRequest);

      downloadExcelFile(blob, t("excelFileName.monthlyUsage", { year: requestYear }));
    } catch (error) {
      console.error("월별 사용 내역 엑셀 다운로드 실패:", error);
    } finally {
      setIsMonthlyHistoryExcelDownloading(false);
    }
  }, [isMonthlyHistoryExcelDownloading, selectedYear]);

  if (isLoading && !settlementSummary) {
    return <BaseLoader />;
  }

  return (
    <BillingView
      settlementData={settlementData}
      solutionUsageData={solutionUsageData}
      solutionUsageHeaders={solutionUsageHeaders}
      monthlyHistoryHeaders={monthlyHistoryHeaders}
      formattedMonthlyData={formattedMonthlyData}
      yearOptions={yearOptions}
      selectedYear={selectedYear}
      setSelectedYear={handleSelectYear}
      currentPage={currentPage}
      setCurrentPage={handlePageChange}
      totalPages={monthlyHistoryTotalPages}
      selectedDate={selectedDate}
      startDate={startDate}
      endDate={endDate}
      onDateChange={handleDateChange}
      onSolutionUsageExcelDownload={handleSolutionUsageExcelDownload}
      isSolutionUsageExcelDownloading={isSolutionUsageExcelDownloading}
      onMonthlyHistoryExcelDownload={handleMonthlyHistoryExcelDownload}
      isMonthlyHistoryExcelDownloading={isMonthlyHistoryExcelDownloading}
    />
  );
};

export default BillingPage;
