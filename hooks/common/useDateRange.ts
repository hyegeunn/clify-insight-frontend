import { useState, useCallback, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { getDefaultDateRange, parseDateRangeFromPicker, formatSelectedDateByLanguage } from "@/utils";

interface UseDateRangeReturn {
  selectedDate: string;
  startDate: string;
  endDate: string;
  handleDateChange: (pickedValue: string) => void;
}

/**
 * 날짜 범위 관리 훅
 * BaseDateRangeSelector와 함께 사용하는 날짜 상태 관리
 * @returns 날짜 상태 및 변경 핸들러
 */
export const useDateRange = (): UseDateRangeReturn => {
  const { i18n } = useTranslation();
  const defaultDateRange = getDefaultDateRange(i18n.language);
  const [selectedDate, setSelectedDate] = useState(defaultDateRange.selectedDate);
  const [startDate, setStartDate] = useState(defaultDateRange.startDate);
  const [endDate, setEndDate] = useState(defaultDateRange.endDate);
  const prevLanguageRef = useRef(i18n.language);

  // 언어 변경 시 현재 선택된 날짜를 유지하면서 포맷만 변환
  useEffect(() => {
    if (prevLanguageRef.current !== i18n.language) {
      // 현재 선택된 startDate를 기준으로 새로운 언어 포맷으로 변환
      const newSelectedDate = formatSelectedDateByLanguage(startDate, i18n.language);
      setSelectedDate(newSelectedDate);
      prevLanguageRef.current = i18n.language;
    }
  }, [i18n.language, startDate]);

  const handleDateChange = useCallback((pickedValue: string) => {
    setSelectedDate(pickedValue);
    const result = parseDateRangeFromPicker(pickedValue);
    if (result) {
      setStartDate(result.startDate);
      setEndDate(result.endDate);
    }
  }, []);

  return {
    selectedDate,
    startDate,
    endDate,
    handleDateChange,
  };
};
