import type { CellData, TrendDirection } from "@/types/common";
import { formatCurrency } from "./format";

/**
 * 텍스트 셀 데이터 생성
 * @param value 표시할 값
 * @returns TextCellData 객체
 */
export const toTextCell = (value: string | number): CellData => ({
  type: "text",
  value: typeof value === "number" ? value.toString() : value,
});

/**
 * 통화 셀 데이터 생성
 * @param amount 금액
 * @returns TextCellData 객체 (포맷된 통화 값)
 */
export const toCurrencyCell = (amount: number): CellData => ({
  type: "text",
  value: formatCurrency(amount),
});

/**
 * 트렌드 셀 데이터 생성
 * @param value 트렌드 값
 * @param trend 트렌드 방향 (기본값: value가 양수면 up, 음수면 down)
 * @returns TrendCellData 객체
 */
export const toTrendCell = (
  value: number,
  trend?: TrendDirection
): CellData => ({
  type: "trend",
  value: Math.abs(value),
  trend: trend || (value >= 0 ? "up" : "down"),
});

/**
 * 변화량 셀 데이터 생성
 * @param value 변화량 값
 * @returns ChangeCellData 객체
 */
export const toChangeCell = (value: number): CellData => ({
  type: "change",
  value,
});

/**
 * 지표 셀 데이터 생성
 * @param value 지표 값
 * @returns IndicatorCellData 객체
 */
export const toIndicatorCell = (value: string): CellData => ({
  type: "indicator",
  value,
});
