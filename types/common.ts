import type {
  ReactNode,
  InputHTMLAttributes,
  ButtonHTMLAttributes,
  SVGProps,
} from "react";
import type { IconName } from "@/utils/icons";

// ============================================
// BaseIcon
// ============================================
export interface BaseIconProps extends Omit<SVGProps<SVGSVGElement>, "name"> {
  name: IconName;
  size?: number;
  color?: string;
  tooltip?: string;
}

// ============================================
// BaseTooltip
// ============================================
export interface BaseTooltipProps {
  content: string;
  children: ReactNode;
}

export interface TooltipPosition {
  top: number;
  left: number;
  arrowLeft: number;
}

// ============================================
// BaseInput
// ============================================
export interface BaseInputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

// ============================================
// BaseCheckbox
// ============================================
export interface BaseCheckboxProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "type" | "size"> {
  label?: string;
  /** sm: 16px, md: 20px, lg: 24px, 또는 숫자(px) */
  size?: "sm" | "md" | "lg" | number;
}

// ============================================
// BaseButton
// ============================================
export interface BaseButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "download" | "custom";
  size?: "small" | "medium" | "large";
  icon?: IconName;
  iconPosition?: "left" | "right";
  iconGap?: number;
  iconSize?: number;
  iconColor?: string;
  width?: string | number;
  height?: string | number;
  backgroundColor?: string;
  hoverBackgroundColor?: string;
  textColor?: string;
  fontSize?: string | number;
  fontWeight?: number;
  borderRadius?: string | number;
}

// ============================================
// BaseToggle
// ============================================
export interface BaseToggleProps<T extends string> {
  tabs: T[];
  defaultTab?: T;
  value?: number;
  height?: number;
  onChange?: (tab: T, index: number) => void;
  disabled?: boolean;
}

// ============================================
// BaseSelectBox
// ============================================
export interface BaseSelectBoxProps {
  options: string[];
  defaultValue?: string;
  width?: number;
  height?: number;
  hoverBackgroundColor?: string;
  hoverTextColor?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

// ============================================
// BaseDatePicker
// ============================================
export interface BaseDatePickerProps {
  value?: string;
  onChange?: (value: string) => void;
}

export type ViewMode = "month" | "year" | "yearRange";
export type YearDirection = "prev" | "next";

// ============================================
// BaseDateRangeSelector
// ============================================
export interface BaseDateRangeSelectorProps {
  selectedDate: string;
  startDate: string;
  endDate: string;
  onDateChange: (pickedValue: string) => void;
}

// ============================================
// BaseSearchInput
// ============================================
export interface BaseSearchInputProps {
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
  onSearch?: (value: string) => void;
  height?: number;
  disabled?: boolean;
}

// ============================================
// BaseFilterSelect
// ============================================
export interface BaseFilterSelectProps {
  label: string;
  placeholder: string;
  options: string[];
  defaultValue?: string;
  width?: number;
  height?: number;
  onChange?: (value: string) => void;
  onButtonClick?: () => void;
}

export interface DropdownPosition {
  top: number;
  left: number;
  width: number;
}

// ============================================
// BasePageHeader
// ============================================
export interface BasePageHeaderProps {
  title: string | ReactNode;
  action?: ReactNode;
}

// ============================================
// BaseCardHeader
// ============================================
export interface BaseCardHeaderProps {
  title: string;
  subtitle?: string;
  onMoreClick?: () => void;
  tooltip?: string;
  tag?: SettlementTag;
}

// ============================================
// BaseFavCardHeader
// ============================================
export interface BaseFavCardHeaderProps {
  title: string;
  description?: string;
  tooltip?: string;
  rightContent?: ReactNode;
  descriptionRightContent?: ReactNode;
}

// ============================================
// BaseSummaryCard
// ============================================
export interface BaseSummaryCardProps {
  title: string;
  onMoreClick?: () => void;
  value: string | number | ReactNode;
  subValue?: ReactNode;
  description: string;
  icon?: ReactNode;
  tag?: SettlementTag;
}

// ============================================
// BaseModal
// ============================================
export interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  content?: ReactNode;
  footer?: ReactNode;
  width?: number;
  height?: number;
  padding?: number;
  headerPadding?: number | string;
  contentPadding?: number | string;
  footerPadding?: number | string;
  headerBorder?: boolean;
  footerBorder?: boolean;
  footerBorderColor?: string;
}

// ============================================
// BasePagination
// ============================================
export interface BasePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  maxVisiblePages?: number;
}

// ============================================
// BaseStatusCard
// ============================================
export interface BaseStatusCardProps {
  data: StatusCardData;
}

export interface StatusCardData {
  label: string;
  scoreRange: string;
  teamCount: number;
  totalMembers: number;
  monthlyChange: number;
  dotColor: string;
  tagBgColor: string;
  tagTextColor: string;
  tagText: string;
}

// ============================================
// BaseSettlementCard
// ============================================
export type TagType = "warning" | "error" | "success";

export interface SettlementTag {
  type: TagType;
  text: string;
}

export type TrendType = "up" | "down";

export interface TrendData {
  type: TrendType;
  value: number;
}

export interface BaseSettlementCardProps {
  title: string;
  tooltip?: string;
  tag?: SettlementTag;
  mainContent: string | ReactNode;
  trendData?: TrendData;
  percentage?: string | ReactNode;
  subContent: string;
  mainContentColor?: string;
  percentageColor?: string;
}

// ============================================
// BaseOrganizationCard
// ============================================
export interface OrganizationCardData {
  label: string;
  organizationName: string;
  score: number;
  diff: number;
  employees: number;
  attentionIndicator: string | null;
  comparisonText: string;
}

export interface BaseOrganizationCardProps {
  label: string;
  organizationName: string;
  organizationId?: number;
  score: number;
  diff: number;
  employees: number;
  attentionIndicator: string | null;
  comparisonText: string;
  onClick?: (organizationId: number) => void;
}

// ============================================
// BaseStatCard
// ============================================
export interface BaseStatCardProps {
  label: string;
  value: number | string;
  hasAlert?: boolean;
}

// ============================================
// BaseProgressBar
// ============================================
export interface ProgressBarItem {
  label: string;
  value: number;
  maxValue: number;
  percentage?: number; // percentage가 있으면 maxValue 대신 사용
}

export interface BaseProgressBarProps {
  items: ProgressBarItem[];
  labelWidth?: string;
  valueSectionWidth?: string;
  valueFormat?: "default" | "count" | "countWithPercentage";
  layout?: "horizontal" | "vertical";
  itemGap?: string;
  innerGap?: string;
  labelFontSize?: string;
  labelFontWeight?: number;
  labelLineHeight?: string;
  labelColor?: string;
}

// ============================================
// BaseCircularProgress
// ============================================
export type HealthStatus = "healthy" | "good" | "caution" | "vulnerable" | "critical";
export type IndicatorType = "stress" | "anxiety" | "depression";

export interface CircularProgressProps {
  value: number;
  status?: HealthStatus;
  indicatorType?: IndicatorType;
  label?: string;
  tooltipContent?: string;
  customSize?: number;
  customColor?: string;
  customBackgroundColor?: string;
  showStatus?: boolean;
  showPercentage?: boolean;
  customStatusLabel?: string;
}

export interface CircularProgressColorConfig {
  stroke: string;
  background: string;
  text: string;
  tagBackground: string;
  gradient?: {
    start: string;
    end: string;
  };
}

export const STATUS_COLORS: Record<HealthStatus, CircularProgressColorConfig> =
  {
    healthy: {
      stroke: "#4ECB71",
      background: "#F6F7F8",
      text: "#4ECB71",
      tagBackground: "#E8F5EC",
      gradient: { start: "#D1FAE5", end: "#10B981" },
    },
    good: {
      stroke: "#4FC3E0",
      background: "#F6F7F8",
      text: "#4FC3E0",
      tagBackground: "#E8F7FB",
      gradient: { start: "#CFFAFE", end: "#06B6D4" },
    },
    caution: {
      stroke: "#FFB84D",
      background: "#F6F7F8",
      text: "#FFB84D",
      tagBackground: "#FFF5E8",
      gradient: { start: "#FFE3B3", end: "#F59E0B" },
    },
    vulnerable: {
      stroke: "#FF8A5C",
      background: "#F6F7F8",
      text: "#FF8A5C",
      tagBackground: "#FFEDE8",
      gradient: { start: "#FFEDD5", end: "#F97316" },
    },
    critical: {
      stroke: "#FF6B7A",
      background: "#F6F7F8",
      text: "#FF6B7A",
      tagBackground: "#FFE8EB",
      gradient: { start: "#FEE2E2", end: "#EF4444" },
    },
  };

export const INDICATOR_TOOLTIPS: Record<
  IndicatorType,
  Record<HealthStatus, string>
> = {
  stress: {
    healthy: "스트레스 반응이 거의 없으며 안정적인 상태입니다.",
    good: "전반적으로 안정적이며 일상적 스트레스 수준입니다.",
    caution: "스트레스 수준이 다소 높아 관리가 필요한 시점입니다.",
    vulnerable: "스트레스가 누적되어 긴장도와 피로도가 증가한 상태입니다.",
    critical: "스트레스 수준이 높아 업무 및 정서적 부담이 우려됩니다.",
  },
  anxiety: {
    healthy: "불안 수준이 매우 낮고 정서적 안정이 유지되고 있습니다.",
    good: "안정적인 상태로, 불안 반응이 경미한 수준입니다.",
    caution: "불안이 일시적으로 증가한 상태로, 관찰이 필요합니다.",
    vulnerable: "불안이 지속되어 정서적 안정이 저하된 상태입니다.",
    critical: "불안 수준이 높아 심리적 부담이 큰 상태입니다.",
  },
  depression: {
    healthy: "긍정 정서와 활력이 안정적으로 유지되고 있습니다.",
    good: "일시적 피로는 있으나 전반적으로 안정적인 상태입니다.",
    caution: "활력 저하가 일부 나타나며 정서적 회복이 필요합니다.",
    vulnerable: "우울 경향이 증가하여 동기나 에너지가 감소한 상태입니다.",
    critical: "우울 수준이 높아 일상 기능 저하가 우려됩니다.",
  },
};

// Status display labels (Korean)
export const STATUS_LABELS: Record<HealthStatus, string> = {
  healthy: "건강",
  good: "양호",
  caution: "주의",
  vulnerable: "취약",
  critical: "심각",
};

// Indicator display labels (Korean)
export const INDICATOR_LABELS: Record<IndicatorType, string> = {
  stress: "스트레스",
  anxiety: "불안",
  depression: "우울",
};

// ============================================
// BaseDonutChart
// ============================================
export interface BaseDonutChartProps {
  data: DonutChartData[];
  size?: number;
  legendPosition?: "right" | "bottom";
  textColor?: string;
  legendUnit?: string;
  showPercentageAndCount?: boolean;
  showPercentageOnly?: boolean;
}

export interface DonutChartData {
  label: string;
  value: number;
  color: string;
  textColor?: string;
  teamCount?: number;
  percentage?: number;
}

// ============================================
// BaseLineChart
// ============================================
export interface BaseLineChartProps {
  xAxisData: string[];
  seriesData: number[];
  tooltipId?: string;
}

// ============================================
// BaseTable & TableCell
// ============================================
export type HeaderAlign = "left" | "center" | "right";
export type SortDirection = "asc" | "desc";

// TableCell Constants
export const TREND_ARROW: Record<TrendDirection, string> = {
  up: "↑",
  down: "↓",
};

export const CHANGE_COLOR = {
  increase: "#EA1D1D",
  decrease: "#1985FF",
  neutral: "#666666",
};

export const INDICATOR_COLOR = {
  stress: "#FFA81B",
  anxiety: "#FFA81B",
  depression: "#EA1D1D",
} as const;

export type TableIndicatorLabel = keyof typeof INDICATOR_COLOR;
export const TABLE_INDICATOR_LABELS: readonly TableIndicatorLabel[] = [
  "stress",
  "anxiety",
  "depression",
];

export const INDICATOR_TEXT_COLOR = {
  default: "#333333",
  none: "#A3A3A3",
};

export const DEFAULT_INDICATOR_TEXT = "none";
export const DEFAULT_TAG_VARIANT: TagVariant = "normal";

export const isIndicatorLabel = (value: string): value is TableIndicatorLabel =>
  TABLE_INDICATOR_LABELS.includes(value as TableIndicatorLabel);

export const getIndicatorColor = (value: string): string =>
  isIndicatorLabel(value) ? INDICATOR_COLOR[value] : "#CCCCCC";

export const getIndicatorTextColor = (value: string): string => {
  if (value.trim() === "" || value === DEFAULT_INDICATOR_TEXT) {
    return INDICATOR_TEXT_COLOR.none;
  }
  return INDICATOR_TEXT_COLOR.default;
};

export type TagVariant =
  | "danger"
  | "warning"
  | "success"
  | "normal"
  | "active"
  | "inactive"
  | "error";
export type TrendDirection = "up" | "down";

export type TableCellScalar = string | number | boolean | null | undefined;

export interface TextCellData {
  type: "text";
  value: TableCellScalar;
  align?: HeaderAlign;
}

export interface TagCellData {
  type: "tag";
  value: string;
  variant?: TagVariant;
  align?: HeaderAlign;
}

export interface TrendCellData {
  type: "trend";
  value: string | number;
  trend?: TrendDirection;
  align?: HeaderAlign;
}

export interface ChangeCellData {
  type: "change";
  value: string | number;
  align?: HeaderAlign;
}

export interface IndicatorCellData {
  type: "indicator";
  value: TableCellScalar;
  align?: HeaderAlign;
}

export interface CustomCellData {
  type: "custom";
  value: unknown;
  render: (value: unknown) => ReactNode;
  align?: HeaderAlign;
}

export type CellData =
  | TextCellData
  | TagCellData
  | TrendCellData
  | ChangeCellData
  | IndicatorCellData
  | CustomCellData;

export type CellValue = TableCellScalar | CellData;

export interface TableCellProps {
  cellData: CellData;
  align?: HeaderAlign;
  fontSize?: number;
  lineHeight?: string;
  textColor?: string;
}

export interface HeaderConfig<T extends Record<string, unknown>> {
  key: keyof T;
  label: string | ReactNode;
  width?: string;
  sortable?: boolean;
  icon?: ReactNode;
  align?: HeaderAlign;
  tooltip?: string;
  tooltipIconSize?: number;
}

export type CellType = CellData["type"] | "checkbox";

export type RowData<T extends Record<string, unknown>> = {
  [K in keyof T]: T[K] | CellData;
};

export type TableSortHandler<T extends Record<string, unknown>> = (
  key: keyof T,
  direction: SortDirection
) => void;

export type TableRowClickHandler<T extends Record<string, unknown>> = (
  row: RowData<T>,
  index: number
) => void;

export type TableSelectionHandler = (selectedIndexes: number[]) => void;

export interface BaseTableProps<T extends Record<string, unknown>> {
  headers: HeaderConfig<T>[];
  data: RowData<T>[];
  onSort?: TableSortHandler<T>;
  defaultSortKey?: keyof T;
  defaultSortDirection?: SortDirection;
  className?: string;
  enableRowHover?: boolean;
  enableRowPointer?: boolean;
  onRowClick?: TableRowClickHandler<T>;
  headerHeight?: number;
  rowHeight?: number;
  totalRowIndex?: number;
  totalRowHeight?: number;
  emptyMessage?: string;
  emptyHeight?: number;
  bodyFontSize?: number;
  bodyLineHeight?: string;
  bodyTextColor?: string;
  enableCheckbox?: boolean;
  selectedRows?: number[];
  onSelectRow?: TableSelectionHandler;
  customRowClassName?: string;
}

// ============================================
// BaseReportDownload
// ============================================
export interface BaseReportDownloadProps {
  onDownload?: () => void;
  buttonText?: string;
  iconSize?: number;
  height?: number;
  disabled?: boolean;
  menuName?: string;
  selectedDate?: string;
}

// ============================================
// BaseToast
// ============================================
export type ToastType = "success" | "error" | "warning" | "info";

export interface BaseToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
  iconName?: IconName;
  iconSize?: number;
  onClose: () => void;
}
