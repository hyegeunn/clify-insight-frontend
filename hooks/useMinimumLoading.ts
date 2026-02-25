import { useEffect, useState } from "react";

/**
 * 최소 로딩 시간을 보장하는 커스텀 훅
 * @param isLoading - 실제 로딩 상태
 * @param minimumTime - 최소 로딩 시간 (ms, 기본값: 500ms)
 * @returns 최소 시간이 보장된 로딩 상태
 */
const useMinimumLoading = (
  isLoading: boolean,
  minimumTime: number = 500
): boolean => {
  const [isMinimumLoading, setIsMinimumLoading] = useState(false);

  useEffect(() => {
    let timer: number | undefined;

    if (isLoading) {
      // 로딩이 시작되면 즉시 true로 설정
      setIsMinimumLoading(true);
    } else if (isMinimumLoading) {
      // 로딩이 끝났을 때 최소 시간을 보장
      timer = window.setTimeout(() => {
        setIsMinimumLoading(false);
      }, minimumTime);
    }

    return () => {
      if (timer) {
        window.clearTimeout(timer);
      }
    };
  }, [isLoading, minimumTime, isMinimumLoading]);

  return isMinimumLoading;
};

export default useMinimumLoading;
