import { useEffect, useRef, useState } from "react";
import type { BaseTooltipProps, TooltipPosition } from "@/types";
import styles from "./BaseTooltip.module.scss";

const BaseTooltip = ({ content, children }: BaseTooltipProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<TooltipPosition>({
    top: 0,
    left: 0,
    arrowLeft: 0,
  });
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isVisible || !triggerRef.current || !tooltipRef.current) {
      return;
    }

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();

    const padding = 16;
    const arrowLeft = triggerRect.left + triggerRect.width / 2;

    let top = triggerRect.top - tooltipRect.height - 8;
    let left = triggerRect.left + triggerRect.width / 2 - tooltipRect.width / 2;

    const viewportWidth = window.innerWidth;

    if (left + tooltipRect.width > viewportWidth - padding) {
      left = viewportWidth - tooltipRect.width - padding;
    }

    if (left < padding) {
      left = padding;
    }

    if (top < padding) {
      top = triggerRect.bottom + 8;
    }

    setPosition({ top, left, arrowLeft });
  }, [isVisible]);

  return (
    <div className={styles.tooltipWrapper}>
      <div
        ref={triggerRef}
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className={styles.trigger}
      >
        {children}
      </div>
      {isVisible && (
        <div
          ref={tooltipRef}
          className={styles.tooltip}
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
          }}
        >
          <div className={styles.content}>{content}</div>
          <div
            className={styles.arrow}
            style={{
              left: `${position.arrowLeft - position.left}px`,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default BaseTooltip;
