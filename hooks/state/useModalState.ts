import { useState, useCallback } from "react";
import type { UseModalStateReturn } from "@/types";

/**
 * 모달 상태 관리 훅
 * @param initialState 초기 열림/닫힘 상태 (기본값: false)
 */
export const useModalState = (
  initialState = false
): UseModalStateReturn => {
  const [isOpen, setIsOpen] = useState(initialState);

  const open = useCallback(() => {
    setIsOpen(true);
  }, []);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggle = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  return {
    isOpen,
    open,
    close,
    toggle,
  };
};
