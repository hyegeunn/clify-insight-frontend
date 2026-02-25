import { useState, useCallback } from "react";

interface UseFormErrorsReturn<T extends Record<string, string>> {
  errors: T;
  setError: (field: keyof T, message: string) => void;
  clearError: (field: keyof T) => void;
  clearAllErrors: () => void;
}

/**
 * 폼 에러 관리 훅
 * 폼 필드별 에러 메시지 상태 관리
 * @param initialErrors 초기 에러 상태
 * @returns 에러 상태 및 관리 함수
 */
export const useFormErrors = <T extends Record<string, string>>(
  initialErrors: T
): UseFormErrorsReturn<T> => {
  const [errors, setErrors] = useState<T>(initialErrors);

  const setError = useCallback((field: keyof T, message: string) => {
    setErrors((prev) => {
      if (prev[field] === message) return prev;
      return { ...prev, [field]: message };
    });
  }, []);

  const clearError = useCallback((field: keyof T) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      return { ...prev, [field]: "" as T[keyof T] };
    });
  }, []);

  const clearAllErrors = useCallback(() => {
    setErrors(initialErrors);
  }, [initialErrors]);

  return { errors, setError, clearError, clearAllErrors };
};
