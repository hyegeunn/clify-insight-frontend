import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import "dayjs/locale/ko";
import "dayjs/locale/en";

dayjs.extend(relativeTime);
// TODO: dayjs locale은 i18n 언어 변경 시 동적으로 설정됩니다.
// 각 함수에서 필요 시 .locale() 메서드를 사용하여 언어를 지정합니다.

/**
 * 날짜 포맷팅
 * @param date 날짜
 * @param format 포맷 (기본값: YYYY-MM-DD)
 * @returns 포맷된 날짜 문자열
 */
export const formatDate = (
  date: string | Date,
  format = "YYYY-MM-DD"
): string => {
  return dayjs(date).format(format);
};

/**
 * 상대적 시간 표시
 * @param date 날짜
 * @returns "3일 전", "2시간 전" 등
 */
export const formatRelativeTime = (date: string | Date): string => {
  return dayjs(date).fromNow();
};

/**
 * 날짜 범위 생성
 * @param type 기간 타입
 * @returns { startDate, endDate }
 */
export const getDateRange = (
  type: "week" | "month" | "quarter" | "year"
): { startDate: string; endDate: string } => {
  const end = dayjs();
  let start;

  switch (type) {
    case "week":
      start = end.subtract(7, "day");
      break;
    case "month":
      start = end.subtract(1, "month");
      break;
    case "quarter":
      start = end.subtract(3, "month");
      break;
    case "year":
      start = end.subtract(1, "year");
      break;
  }

  return {
    startDate: start.format("YYYY-MM-DD"),
    endDate: end.format("YYYY-MM-DD"),
  };
};

/**
 * 오늘 날짜 가져오기
 * @param format 포맷 (기본값: YYYY-MM-DD)
 * @returns 오늘 날짜
 */
export const getToday = (format = "YYYY-MM-DD"): string => {
  return dayjs().format(format);
};

/**
 * 두 날짜 간의 차이 계산
 * @param startDate 시작 날짜
 * @param endDate 종료 날짜
 * @param unit 단위 (day, month, year 등)
 * @returns 차이
 */
export const getDiffBetweenDates = (
  startDate: string | Date,
  endDate: string | Date,
  unit: "day" | "month" | "year" = "day"
): number => {
  return dayjs(endDate).diff(dayjs(startDate), unit);
};

const YEAR_MONTH_PATTERN = /(\d{4})년\s*(\d{1,2})월/;
const YEAR_MONTH_PATTERN_KO = /(\d{4})년\s*(\d{1,2})월/;
const YEAR_MONTH_PATTERN_EN = /(\d{4})\s+([A-Za-z]+)/;

/**
 * BaseDateRangeSelector에서 사용할 기본 날짜값 생성
 * @param language 현재 언어 (ko 또는 en)
 * @returns { selectedDate, startDate, endDate }
 */
export const getDefaultDateRange = (language = "ko"): {
  selectedDate: string;
  startDate: string;
  endDate: string;
} => {
  // NOTE: 요구사항 - 모든 화면 "처음 진입" 기본 월을 2025년 12월로 고정
  // (대부분 화면에서 useDateRange -> getDefaultDateRange 를 사용)
  const fixedBase = dayjs("2025-12-01").locale(language === "ko" ? "ko" : "en");
  const dateFormat = language === "ko" ? "YYYY년 M월" : "YYYY MMM";
  return {
    selectedDate: fixedBase.format(dateFormat),
    startDate: fixedBase.startOf("month").format("YYYY.MM.DD"),
    endDate: fixedBase.endOf("month").format("YYYY.MM.DD"),
  };
};

/**
 * "YYYY년 M월" 형식의 날짜를 파싱하여 시작일/종료일 계산
 * @param pickedValue 선택된 날짜 문자열 (예: "2025년 1월")
 * @returns { startDate, endDate } 또는 null (파싱 실패시)
 */
export const parseDateRangeFromPicker = (
  pickedValue: string
): { startDate: string; endDate: string } | null => {
  // 한국어 포맷 시도
  const koMatch = pickedValue.match(YEAR_MONTH_PATTERN_KO);
  if (koMatch) {
    const [, yearText, monthText] = koMatch;
    const year = Number(yearText);
    const month = Number(monthText);

    if (Number.isNaN(year) || Number.isNaN(month)) {
      return null;
    }

    const selectedMonth = dayjs()
      .year(year)
      .month(month - 1);
    const now = dayjs();

    const startDate = selectedMonth.startOf("month").format("YYYY.MM.DD");
    const endDate = selectedMonth.isSame(now, "month")
      ? now.format("YYYY.MM.DD")
      : selectedMonth.endOf("month").format("YYYY.MM.DD");

    return { startDate, endDate };
  }

  // 영어 포맷 시도
  const enMatch = pickedValue.match(YEAR_MONTH_PATTERN_EN);
  if (enMatch) {
    const [, yearText, monthText] = enMatch;
    const year = Number(yearText);

    if (Number.isNaN(year)) {
      return null;
    }

    const parsedDate = dayjs(`${yearText} ${monthText}`, "YYYY MMM", "en");
    if (!parsedDate.isValid()) {
      return null;
    }

    const selectedMonth = parsedDate;
    const now = dayjs();

    const startDate = selectedMonth.startOf("month").format("YYYY.MM.DD");
    const endDate = selectedMonth.isSame(now, "month")
      ? now.format("YYYY.MM.DD")
      : selectedMonth.endOf("month").format("YYYY.MM.DD");

    return { startDate, endDate };
  }

  return null;
};

/**
 * "YYYY년 M월" 또는 "YYYY MMM" 형식의 날짜를 "YYYY-MM" 형식으로 변환
 * @param pickedValue 선택된 날짜 문자열 (예: "2025년 1월" 또는 "2025 Jan")
 * @returns YYYY-MM 형식 문자열 또는 null (파싱 실패시)
 */
export const convertToYearMonthFormat = (pickedValue: string): string | null => {
  // 한국어 포맷 시도
  const koMatch = pickedValue.match(YEAR_MONTH_PATTERN_KO);
  if (koMatch) {
    const [, yearText, monthText] = koMatch;
    const year = Number(yearText);
    const month = Number(monthText);

    if (Number.isNaN(year) || Number.isNaN(month)) {
      return null;
    }

    return `${year}-${String(month).padStart(2, "0")}`;
  }

  // 영어 포맷 시도
  const enMatch = pickedValue.match(YEAR_MONTH_PATTERN_EN);
  if (enMatch) {
    const [, yearText, monthText] = enMatch;
    const year = Number(yearText);

    if (Number.isNaN(year)) {
      return null;
    }

    const parsedDate = dayjs(`${yearText} ${monthText}`, "YYYY MMM", "en");
    if (!parsedDate.isValid()) {
      return null;
    }

    return parsedDate.format("YYYY-MM");
  }

  return null;
};

/**
 * 날짜를 YYYY.MM.DD 형식으로 포맷팅
 * @param dateString 날짜 문자열
 * @returns YYYY.MM.DD 형식 문자열, 유효하지 않은 경우 "-"
 */
export const formatDateForDisplay = (dateString?: string | null): string => {
  if (!dateString) {
    return "-";
  }

  const date = dayjs(dateString);
  if (!date.isValid()) {
    return "-";
  }

  return date.format("YYYY.MM.DD");
};

/**
 * @deprecated 이 함수는 하드코딩된 한글을 포함하고 있습니다.
 * 대신 각 컴포넌트에서 useTranslation 훅과 common.expiry를 사용하세요.
 *
 * 예시:
 * const { t } = useTranslation("common");
 * if (daysUntilExpiry > 0) return t("expiry.daysUntil", { days: daysUntilExpiry });
 * if (daysUntilExpiry === 0) return t("expiry.today");
 * return t("expiry.daysAfter", { days: Math.abs(daysUntilExpiry) });
 *
 * @param daysUntilExpiry 만료일까지 남은 일수 (양수: 남음, 0: 오늘, 음수: 지남)
 * @returns 만료 라벨 문자열
 */
export const getExpiryLabel = (daysUntilExpiry?: number | null): string => {
  // TODO: 이 함수는 deprecated되었습니다. i18n을 지원하지 않습니다.
  // 향후 제거 예정이므로 새로운 코드에서는 사용하지 마세요.
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
    return "";
  }

  if (daysUntilExpiry > 0) {
    return `만료까지 D-${daysUntilExpiry}`;
  }

  if (daysUntilExpiry === 0) {
    return "오늘 만료";
  }

  return `만료 D+${Math.abs(daysUntilExpiry)}`;
};

/**
 * 선택된 날짜 문자열에서 연도와 월 추출
 * @param selectedDate 선택된 날짜 문자열 (예: "2025년 1월" 또는 다른 형식)
 * @param startDate 시작일 (fallback)
 * @returns { year, month } 또는 null
 */
export const parseYearMonthFromSelectedDate = (
  selectedDate: string,
  startDate?: string
): { year: number; month: number } | null => {
  const match = selectedDate.match(YEAR_MONTH_PATTERN);
  if (match) {
    const [, yearText, monthText] = match;
    const parsedYear = Number(yearText);
    const parsedMonth = Number(monthText);
    if (!Number.isNaN(parsedYear) && !Number.isNaN(parsedMonth)) {
      return { year: parsedYear, month: parsedMonth };
    }
  }

  if (startDate) {
    const parsedStart = dayjs(startDate, "YYYY.MM.DD");
    if (parsedStart.isValid()) {
      return {
        year: parsedStart.year(),
        month: parsedStart.month() + 1,
      };
    }
  }

  return null;
};

/**
 * 선택된 날짜 문자열에서 월만 추출하여 현재 언어에 맞게 포맷팅
 * @param selectedDate 선택된 날짜 문자열 (예: "2025년 1월")
 * @param currentLanguage 현재 언어 (ko 또는 en)
 * @param startDate 시작일 (fallback)
 * @returns 포맷된 월 문자열 (ko: "1월", en: "Jan")
 */
export const getSelectedMonthLabel = (
  selectedDate: string,
  currentLanguage: string,
  startDate?: string
): string => {
  const dayjsLocale = currentLanguage === "ko" ? "ko" : "en";
  const monthFormat = currentLanguage === "ko" ? "M월" : "MMM";

  // 한국어 패턴 시도
  const koMatch = selectedDate.match(YEAR_MONTH_PATTERN_KO);
  if (koMatch) {
    const [, yearText, monthText] = koMatch;
    const year = Number(yearText);
    const month = Number(monthText);

    // 정확한 날짜 문자열로 생성한 후 로케일 설정
    const monthDate = dayjs(`${year}-${String(month).padStart(2, "0")}-01`).locale(dayjsLocale);
    return monthDate.format(monthFormat);
  }

  // 영어 패턴 시도
  const enMatch = selectedDate.match(YEAR_MONTH_PATTERN_EN);
  if (enMatch) {
    const [, yearText, monthText] = enMatch;
    const parsedDate = dayjs(`${yearText} ${monthText}`, "YYYY MMM", "en");
    if (parsedDate.isValid()) {
      return parsedDate.locale(dayjsLocale).format(monthFormat);
    }
  }

  // fallback: startDate 사용
  if (startDate) {
    const parsedStart = dayjs(startDate, "YYYY.MM.DD");
    if (parsedStart.isValid()) {
      return parsedStart.locale(dayjsLocale).format(monthFormat);
    }
  }

  return currentLanguage === "ko" ? "선택한 월" : "Selected Month";
};

/**
 * startDate 기준으로 언어에 맞는 날짜 포맷으로 변환
 * @param startDate 시작일 (YYYY.MM.DD 형식)
 * @param language 현재 언어 (ko 또는 en)
 * @returns 언어에 맞는 포맷의 날짜 문자열 (ko: "YYYY년 M월", en: "YYYY MMM")
 */
export const formatSelectedDateByLanguage = (
  startDate: string,
  language = "ko"
): string => {
  const parsedDate = dayjs(startDate, "YYYY.MM.DD");
  if (!parsedDate.isValid()) {
    return getDefaultDateRange(language).selectedDate;
  }

  const locale = language === "ko" ? "ko" : "en";
  const dateFormat = language === "ko" ? "YYYY년 M월" : "YYYY MMM";

  return parsedDate.locale(locale).format(dateFormat);
};
