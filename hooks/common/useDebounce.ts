import { useEffect, useState } from "react";

/**
 * 디바운스 훅 - 입력값 변경 후 일정 시간 대기
 * @param value 디바운스할 값
 * @param delay 지연 시간 (ms, 기본값: 300)
 */
export const useDebounce = <T,>(value: T, delay = 300): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};
