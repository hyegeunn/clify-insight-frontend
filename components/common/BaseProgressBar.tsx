import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { BaseProgressBarProps } from "@/types";
import styles from "./BaseProgressBar.module.scss";

const ANIMATION_DELAY_MS = 100;

const formatPercentage = (value: number) => `${Math.round(value)}%`;

const BaseProgressBar = ({
  items,
  labelWidth,
  valueSectionWidth,
  valueFormat = "default",
  layout = "horizontal",
  itemGap = "20px",
  innerGap = "12px",
  labelFontSize = "14px",
  labelFontWeight = 500,
  labelLineHeight = "150%",
  labelColor,
}: BaseProgressBarProps) => {
  const { t } = useTranslation("common");
  const [animatedWidths, setAnimatedWidths] = useState<number[]>(() =>
    items.map(() => 0)
  );
  const [prevItemsLength, setPrevItemsLength] = useState(items.length);

  // items 길이가 변경되면 즉시 동기적으로 리셋
  if (items.length !== prevItemsLength) {
    setPrevItemsLength(items.length);
    setAnimatedWidths(items.map(() => 0));
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setAnimatedWidths(
        items.map((item) => {
          if (item.percentage !== undefined) {
            return item.percentage;
          }
          if (item.maxValue === 0) {
            return 0;
          }
          return (item.value / item.maxValue) * 100;
        })
      );
    }, ANIMATION_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [items]);

  const renderValue = (value: number, maxValue: number, percentage: number) => {
    if (valueFormat === "default") {
      return (
        <span className={styles.value}>
          <span className={styles.current}>{value}</span>
          <span className={styles.divider}>/</span>
          <span className={styles.max}>{maxValue}</span>
        </span>
      );
    }

    if (valueFormat === "count") {
      return <span className={styles.countValue}>({value}{t("unit.person")})</span>;
    }

    return (
      <span className={styles.countWithPercentage}>
        <span className={styles.count}>{value}{t("unit.count")}</span>{" "}
        <span className={styles.percentageText}>
          ({formatPercentage(percentage)})
        </span>
      </span>
    );
  };

  return (
    <div className={styles.container} style={{ gap: itemGap }}>
      {items.map((item, index) => {
        // percentage가 있으면 그것을 사용, 없으면 maxValue로 계산
        const percentage =
          item.percentage !== undefined
            ? item.percentage
            : item.maxValue === 0
            ? 0
            : (item.value / item.maxValue) * 100;
        const labelStyle = {
          width: layout === "horizontal" ? labelWidth : undefined,
          fontSize: labelFontSize,
          fontWeight: labelFontWeight,
          lineHeight: labelLineHeight,
          color: labelColor,
        };
        const valueSectionStyle = valueSectionWidth
          ? { width: valueSectionWidth }
          : undefined;

        if (layout === "vertical") {
          return (
            <div
              key={item.label}
              className={`${styles.progressItem} ${styles.vertical}`}
            >
              <div className={styles.label} style={labelStyle}>
                {item.label}
              </div>
              <div className={styles.barValueWrapper} style={{ gap: innerGap }}>
                <div className={styles.barContainer}>
                  <div
                    className={styles.bar}
                    style={{ width: `${animatedWidths[index] ?? 0}%` }}
                  />
                </div>
                <div className={styles.valueSection} style={valueSectionStyle}>
                  {valueFormat !== "countWithPercentage" && (
                    <span className={styles.percentage}>
                      {formatPercentage(percentage)}
                    </span>
                  )}
                  {renderValue(item.value, item.maxValue, percentage)}
                </div>
              </div>
            </div>
          );
        }

        return (
          <div
            key={item.label}
            className={styles.progressItem}
            style={{ gap: innerGap }}
          >
            <div className={styles.label} style={labelStyle}>
              {item.label}
            </div>
            <div className={styles.barContainer}>
              <div
                className={styles.bar}
                style={{ width: `${animatedWidths[index] ?? 0}%` }}
              />
            </div>
            <div className={styles.valueSection} style={valueSectionStyle}>
              {valueFormat !== "countWithPercentage" && (
                <span className={styles.percentage}>
                  {formatPercentage(percentage)}
                </span>
              )}
              {renderValue(item.value, item.maxValue, percentage)}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default BaseProgressBar;
