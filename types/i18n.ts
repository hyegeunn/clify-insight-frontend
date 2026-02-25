import { NAMESPACES, LANGUAGES } from "@/i18n/config";

/**
 * i18n 네임스페이스 타입
 */
export type TranslationNamespace = (typeof NAMESPACES)[keyof typeof NAMESPACES];

/**
 * 지원하는 언어 타입
 */
export type SupportedLanguage = (typeof LANGUAGES)[keyof typeof LANGUAGES];

/**
 * 번역 키 타입 정의
 * 각 네임스페이스별로 자주 사용되는 키들을 타입으로 정의
 */

// Common 네임스페이스 주요 키
export type CommonTranslationKey =
  | "button.save"
  | "button.cancel"
  | "button.confirm"
  | "button.close"
  | "button.edit"
  | "button.delete"
  | "button.reset"
  | "button.search"
  | "button.download"
  | "button.add"
  | "button.prev"
  | "button.next"
  | "button.more"
  | "message.loading"
  | "message.noData"
  | "message.error"
  | "message.success"
  | "message.emptyTable"
  | "dateRange.today"
  | "dateRange.thisWeek"
  | "dateRange.thisMonth"
  | "dateRange.lastMonth"
  | "dateRange.custom"
  | "pagination.page"
  | "pagination.of"
  | "pagination.rowsPerPage";

// Layout 네임스페이스 주요 키
export type LayoutTranslationKey =
  | "header.logout"
  | "sidebar.home"
  | "sidebar.organizationDiagnosis"
  | "sidebar.fav"
  | "sidebar.koss"
  | "sidebar.solutionUsage"
  | "sidebar.psyCounseling"
  | "sidebar.psyTest"
  | "sidebar.psyTestConsultation"
  | "sidebar.coaching"
  | "sidebar.partner"
  | "sidebar.usageHistory"
  | "sidebar.employeeUsage"
  | "sidebar.teamUsage"
  | "sidebar.billing"
  | "sidebar.management";

// Validation 네임스페이스 주요 키
export type ValidationTranslationKey =
  | "required"
  | "email"
  | "password"
  | "passwordConfirm"
  | "phone"
  | "number"
  | "minLength"
  | "maxLength";

/**
 * 번역 함수 옵션 타입
 */
export interface TranslationOptions {
  [key: string]: string | number | boolean | Date | null | undefined;
}

/**
 * 다국어 지원 데이터 타입
 */
export interface LocalizedData<T> {
  ko: T;
  en: T;
}

/**
 * 번역 가능한 필드를 가진 객체 타입
 */
export interface TranslatableField {
  key: string;
  translationKey?: string;
  params?: TranslationOptions;
}
