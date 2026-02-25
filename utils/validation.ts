/**
 * 이메일 검증
 * @param email 이메일 주소
 * @returns 유효 여부
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * 비밀번호 검증 (8자 이상, 영문+숫자 조합)
 * @param password 비밀번호
 * @returns 유효 여부
 */
export const isValidPassword = (password: string): boolean => {
  if (password.length < 8) return false;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  return hasLetter && hasNumber;
};

/**
 * 전화번호 검증
 * @param phone 전화번호
 * @returns 유효 여부
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /^01[0-9]-?[0-9]{3,4}-?[0-9]{4}$/;
  return phoneRegex.test(phone);
};

/**
 * 사업자등록번호 검증
 * @param businessNumber 사업자등록번호 (10자리 숫자)
 * @returns 유효 여부
 */
export const isValidBusinessNumber = (businessNumber: string): boolean => {
  const cleaned = businessNumber.replace(/[^0-9]/g, "");
  if (cleaned.length !== 10) return false;

  const weights = [1, 3, 7, 1, 3, 7, 1, 3, 5];
  let sum = 0;

  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleaned[i]) * weights[i];
  }

  sum += Math.floor((parseInt(cleaned[8]) * 5) / 10);
  const checkDigit = (10 - (sum % 10)) % 10;

  return checkDigit === parseInt(cleaned[9]);
};

/**
 * 빈 문자열 검증
 * @param value 값
 * @returns 비어있지 않으면 true
 */
export const isNotEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * 최소 길이 검증
 * @param value 값
 * @param minLength 최소 길이
 * @returns 유효 여부
 */
export const isMinLength = (value: string, minLength: number): boolean => {
  return value.length >= minLength;
};

/**
 * 최대 길이 검증
 * @param value 값
 * @param maxLength 최대 길이
 * @returns 유효 여부
 */
export const isMaxLength = (value: string, maxLength: number): boolean => {
  return value.length <= maxLength;
};

/**
 * 숫자만 포함 검증
 * @param value 값
 * @returns 유효 여부
 */
export const isNumericOnly = (value: string): boolean => {
  return /^\d+$/.test(value);
};

/**
 * URL 검증
 * @param url URL
 * @returns 유효 여부
 */
export const isValidUrl = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * 배열이 비어있는지 검증
 * @param value 배열
 * @returns 비어있으면 true
 */
export { isEmpty } from "lodash";
