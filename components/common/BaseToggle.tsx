import { useState } from "react";
import type { BaseToggleProps } from "@/types";
import styles from "./BaseToggle.module.scss";

const TAB_WIDTH = 54;
const TOGGLE_PADDING = 4;
const TAB_GAP = 0.5;

const BaseToggle = <T extends string,>({
  tabs,
  defaultTab,
  value,
  height = 34,
  onChange,
  disabled = false,
}: BaseToggleProps<T>) => {
  const getDefaultIndex = () => {
    if (value !== undefined) {
      return value;
    }
    if (defaultTab) {
      const index = tabs.indexOf(defaultTab);
      return index >= 0 ? index : 0;
    }
    return 0;
  };

  const [activeIndex, setActiveIndex] = useState<number>(getDefaultIndex());

  const currentIndex = value !== undefined ? value : activeIndex;

  const handleTabChange = (tab: T, index: number) => {
    if (disabled) {
      return;
    }
    if (value === undefined) {
      setActiveIndex(index);
    }
    onChange?.(tab, index);
  };

  return (
    <div className={styles.toggleContainer}>
      <div
        className={styles.slider}
        style={{
          width: `${TAB_WIDTH}px`,
          height: `${height - TOGGLE_PADDING * 2}px`,
          transform: `translateX(${currentIndex * (TAB_WIDTH + TAB_GAP)}px)`,
        }}
      />

      {tabs.map((tab, index) => (
        <button
          type="button"
          key={index}
          onClick={() => handleTabChange(tab, index)}
          disabled={disabled}
          className={`${styles.tab} ${currentIndex === index ? styles.active : ""} ${
            disabled ? styles.disabled : ""
          }`}
          style={{
            width: `${TAB_WIDTH}px`,
            height: `${height - TOGGLE_PADDING * 2}px`,
          }}
        >
          {tab}
        </button>
      ))}
    </div>
  );
}

export default BaseToggle;

