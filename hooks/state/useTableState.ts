import { useState, useMemo, useCallback } from "react";
import type { SortDir, UseTableStateReturn } from "@/types";

function isNumber(v: unknown): v is number {
  return typeof v === "number" && !Number.isNaN(v);
}
function isString(v: unknown): v is string {
  return typeof v === "string";
}
function isDate(v: unknown): v is Date {
  return v instanceof Date;
}
function isBoolean(v: unknown): v is boolean {
  return typeof v === "boolean";
}

/**
 * 테이블 정렬 상태 관리 훅
 * @param data 원본 데이터 배열
 * @param initialSortKey 초기 정렬 키
 * @param initialSortDirection 초기 정렬 방향
 */
export const useTableState = <
  T extends Record<string | number | symbol, unknown>,
  K extends keyof T = keyof T
>(
  data: readonly T[],
  initialSortKey?: K,
  initialSortDirection: SortDir = "asc"
): UseTableStateReturn<T, K> => {
  const [sortKey, setSortKey] = useState<K | undefined>(initialSortKey);
  const [sortDirection, setSortDirection] =
    useState<SortDir>(initialSortDirection);

  const sortedData = useMemo(() => {
    if (!sortKey) return [...data];

    const dir = sortDirection === "asc" ? 1 : -1;

    return [...data].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      // null/undefined는 항상 끝으로
      const aNil = aVal == null;
      const bNil = bVal == null;
      if (aNil && bNil) return 0;
      if (aNil) return 1;
      if (bNil) return -1;

      // 숫자
      if (isNumber(aVal) && isNumber(bVal)) {
        return (aVal - bVal) * dir;
      }

      // 날짜
      if (isDate(aVal) && isDate(bVal)) {
        return (aVal.getTime() - bVal.getTime()) * dir;
      }

      // 불리언: false < true
      if (isBoolean(aVal) && isBoolean(bVal)) {
        return (Number(aVal) - Number(bVal)) * dir;
      }

      // 문자열
      if (isString(aVal) && isString(bVal)) {
        return aVal.localeCompare(bVal) * dir;
      }

      // 타입이 다르면 문자열로 변환해 비교(안전한 폴백)
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
  }, [data, sortKey, sortDirection]);

  const handleSort = useCallback((key: K, direction: SortDir) => {
    setSortKey(key);
    setSortDirection(direction);
  }, []);

  return {
    sortedData,
    sortKey,
    sortDirection,
    handleSort,
  };
};
