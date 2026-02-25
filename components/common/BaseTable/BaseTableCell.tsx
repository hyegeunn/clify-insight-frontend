import { useTranslation } from "react-i18next";
import styles from "./BaseTableCell.module.scss";
import type { TableCellProps } from "@/types";
import {
  TREND_ARROW,
  CHANGE_COLOR,
  DEFAULT_INDICATOR_TEXT,
  DEFAULT_TAG_VARIANT,
  getIndicatorColor,
  getIndicatorTextColor,
} from "@/types";

const BaseTableCell = ({
  cellData,
  align = "left",
  fontSize = 14,
  lineHeight = "150%",
  textColor = "#000000",
}: TableCellProps) => {
  const { t } = useTranslation("pages/fav");

  const getAlignClass = () => {
    const cellAlign = cellData.align || align;
    return styles[`align-${cellAlign}`];
  };

  switch (cellData.type) {
    case "text": {
      return (
        <div
          className={`${styles.text} ${getAlignClass()}`}
          style={{
            fontSize: `${fontSize}px`,
            lineHeight,
            color: textColor,
          }}
        >
          {cellData.value}
        </div>
      );
    }

    case "tag": {
      const variant = cellData.variant ?? DEFAULT_TAG_VARIANT;
      return (
        <div className={`${styles.tagWrapper} ${getAlignClass()}`}>
          <span className={`${styles.tag} ${styles[`tag-${variant}`]}`}>
            {cellData.value}
          </span>
        </div>
      );
    }

    case "trend": {
      const trend = cellData.trend ?? "up";
      return (
        <div className={`${styles.trendWrapper} ${getAlignClass()}`}>
          <span
            className={`${styles.trend} ${styles[`trend-${trend}`]}`}
            style={{
              fontSize: `${fontSize}px`,
              lineHeight,
            }}
          >
            {TREND_ARROW[trend]}
            {cellData.value}
          </span>
        </div>
      );
    }

    case "change": {
      const numericValue =
        typeof cellData.value === "number"
          ? cellData.value
          : Number(cellData.value);
      const isIncrease = numericValue > 0;
      const isDecrease = numericValue < 0;
      const changeColor = isIncrease
        ? CHANGE_COLOR.increase
        : isDecrease
        ? CHANGE_COLOR.decrease
        : CHANGE_COLOR.neutral;
      const symbol = isIncrease ? "↑" : isDecrease ? "↓" : "-";
      const displayValue = numericValue !== 0 ? Math.abs(numericValue) : "";

      return (
        <div className={`${styles.changeWrapper} ${getAlignClass()}`}>
          <span className={styles.change} style={{ color: changeColor }}>
            {symbol} {displayValue}
          </span>
        </div>
      );
    }

    case "indicator": {
      const indicatorText =
        cellData.value === null ||
        cellData.value === undefined ||
        cellData.value === ""
          ? DEFAULT_INDICATOR_TEXT
          : String(cellData.value);

      // indicator 값에 따라 번역 적용
      const getIndicatorLabel = (value: string): string => {
        const labelMap: Record<string, string> = {
          stress: t("table.indicator.stress"),
          anxiety: t("table.indicator.anxiety"),
          depression: t("table.indicator.depression"),
          none: t("table.indicator.none"),
        };
        return labelMap[value] || value;
      };

      const displayText = getIndicatorLabel(indicatorText);

      return (
        <div className={`${styles.indicatorWrapper} ${getAlignClass()}`}>
          <div className={styles.indicator}>
            <div
              className={styles.dot}
              style={{ backgroundColor: getIndicatorColor(indicatorText) }}
            />
            <span
              className={styles.indicatorText}
              style={{ color: getIndicatorTextColor(indicatorText) }}
            >
              {displayText}
            </span>
          </div>
        </div>
      );
    }

    case "custom": {
      return (
        <div className={getAlignClass()}>{cellData.render(cellData.value)}</div>
      );
    }

    default: {
      const exhaustiveCheck: never = cellData;
      return <div className={getAlignClass()}>{String(exhaustiveCheck)}</div>;
    }
  }
};

export default BaseTableCell;
