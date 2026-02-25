import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import dayjs from "dayjs";
import "dayjs/locale/en";
import "dayjs/locale/ko";
import type { BaseDatePickerProps, ViewMode, YearDirection } from "@/types";
import { COLORS } from "@/constants/colors";
import BaseIcon from "./BaseIcon";
import styles from "./BaseDatePicker.module.scss";

const VISIBLE_YEAR_COUNT = 12;
const YEAR_LIST_PADDING = 11;

const BaseDatePicker = ({ value, onChange }: BaseDatePickerProps) => {
  const { i18n } = useTranslation();
  const currentLanguage = i18n.language;
  const now = dayjs();
  // NOTE: 요구사항 - 모든 화면 "처음 진입" 기본 월을 2025년 12월로 고정
  const fixedDefault = dayjs("2025-12-01");
  const [isOpen, setIsOpen] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedYear, setSelectedYear] = useState(fixedDefault.year());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    fixedDefault.month() + 1
  );
  const [yearRangeStart, setYearRangeStart] = useState(
    fixedDefault.year() - YEAR_LIST_PADDING
  );
  const containerRef = useRef<HTMLDivElement>(null);

  const formatYearMonth = (year: number, month: number) => {
    if (currentLanguage === "ko") {
      return `${year}년 ${month}월`;
    }
    return dayjs(`${year}-${String(month).padStart(2, "0")}-01`).locale("en").format("YYYY MMM");
  };

  const formatYear = (year: number) => {
    if (currentLanguage === "ko") {
      return `${year}년`;
    }
    return `${year}`;
  };

  const MONTH_OPTIONS = useMemo(() => {
    if (currentLanguage === "ko") {
      return Array.from({ length: 12 }, (_, index) => {
        const month = index + 1;
        return { label: `${month}월`, value: month };
      });
    }
    return Array.from({ length: 12 }, (_, index) => {
      const month = index + 1;
      const monthLabel = dayjs().month(index).locale("en").format("MMM");
      return { label: monthLabel, value: month };
    });
  }, [currentLanguage]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const toggleDropdown = () => {
    setIsOpen((prev) => !prev);
  };

  const handleYearChange = (direction: YearDirection) => {
    setSelectedYear((prev) => (direction === "prev" ? prev - 1 : prev + 1));
  };

  const handleMonthSelect = (month: number) => {
    const currentMonth = now.month() + 1;
    const isFutureMonth =
      selectedYear > currentYear ||
      (selectedYear === currentYear && month > currentMonth);

    if (isFutureMonth) {
      return;
    }

    setSelectedMonth(month);
    onChange?.(formatYearMonth(selectedYear, month));
    setIsOpen(false);
  };

  const currentYear = now.year();
  const currentMonth = now.month() + 1;

  const years = useMemo(() => {
    return Array.from(
      { length: VISIBLE_YEAR_COUNT },
      (_, index) => yearRangeStart + index
    );
  }, [yearRangeStart]);

  const handleYearRangeChange = (direction: YearDirection) => {
    setYearRangeStart((prev) =>
      direction === "prev" ? prev - VISIBLE_YEAR_COUNT : prev + VISIBLE_YEAR_COUNT
    );
  };

  const handleYearSelect = (year: number) => {
    setSelectedYear(year);
    setViewMode("month");
  };

  const getDisplayValue = () => {
    if (value) {
      const match = value.match(/(\d{4})년\s*(\d{1,2})월/);
      if (match) {
        const [, yearText, monthText] = match;
        return formatYearMonth(Number(yearText), Number(monthText));
      }
      return value;
    }
    return selectedMonth !== null
      ? formatYearMonth(selectedYear, selectedMonth)
      : formatYear(selectedYear);
  };

  const displayValue = getDisplayValue();

  return (
    <div className={styles.datePicker} ref={containerRef}>
      <button type="button" className={styles.input} onClick={toggleDropdown}>
        <BaseIcon
          name="period"
          size={16}
          color={COLORS.textMuted}
        />
        <span className={styles.text}>{displayValue}</span>
        <BaseIcon
          name="chevronRight"
          size={16}
          color={COLORS.textPrimary}
        />
      </button>

      {isOpen && (
        <div className={styles.dropdown}>
          <div className={styles.header}>
            <div className={styles.yearSelector}>
              <button
                type="button"
                className={styles.yearBtn}
                onClick={() =>
                  setViewMode((prev) => (prev === "year" ? "month" : "year"))
                }
              >
                {formatYear(selectedYear)}
              </button>
              <BaseIcon
                name="chevronDown"
                size={16}
                color={COLORS.textMuted}
              />
            </div>
            <div className={styles.navBtns}>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() =>
                  viewMode === "month"
                    ? handleYearChange("prev")
                    : handleYearRangeChange("prev")
                }
              >
                <BaseIcon
                  name="chevronLeft"
                  size={16}
                  color={COLORS.textTertiary}
                />
              </button>
              <button
                type="button"
                className={styles.navBtn}
                onClick={() =>
                  viewMode === "month"
                    ? handleYearChange("next")
                    : handleYearRangeChange("next")
                }
              >
                <BaseIcon
                  name="chevronRight"
                  size={16}
                  color={COLORS.textTertiary}
                />
              </button>
            </div>
          </div>

          {viewMode === "month" && (
            <div className={styles.months}>
              {MONTH_OPTIONS.map((month) => {
                const isFutureMonth =
                  selectedYear > currentYear ||
                  (selectedYear === currentYear && month.value > currentMonth);

                return (
                  <button
                    type="button"
                    key={month.value}
                    className={`${styles.monthBtn} ${
                      selectedMonth === month.value ? styles.monthBtnSelected : ""
                    } ${isFutureMonth ? styles.monthBtnDisabled : ""}`}
                    onClick={() => handleMonthSelect(month.value)}
                    disabled={isFutureMonth}
                  >
                    {month.label}
                  </button>
                );
              })}
            </div>
          )}

          {viewMode === "year" && (
            <div className={styles.years}>
              {years.map((year) => {
                const isFutureYear = year > currentYear;

                return (
                  <button
                    type="button"
                    key={year}
                    className={`${styles.yearItem} ${
                      selectedYear === year ? styles.yearItemSelected : ""
                    } ${isFutureYear ? styles.yearItemDisabled : ""}`}
                    onClick={() => handleYearSelect(year)}
                    disabled={isFutureYear}
                  >
                    {year}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BaseDatePicker;
